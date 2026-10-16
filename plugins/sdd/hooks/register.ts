import type { EngineInterface, PluginOptions, Register } from 'claude-code'

// The status line text for each skill. `undefined` clears the line.
const STAGES: Record<string, string | undefined> = {
  'sdd:create-spec': 'spec',
  'sdd:create-design': 'design',
  'sdd:create-plan': 'plan',
  'sdd:execute-plan': 'execute',
  'sdd:end-worktree': undefined,
}

// The status line text for each section of `progress.md`.
const SECTIONS: Record<string, string> = {
  Specification: 'spec',
  Design: 'design',
  Plan: 'plan',
}

// Splits a Markdown file into its `## ` sections: the heading and the lines.
const sections = (text: string) =>
  text.split(/^## /m).slice(1).map(part => {
    const [heading, ...lines] = part.split('\n')
    return { heading: heading.trim(), lines }
  })

// Counts the checked items, and names the first unchecked one. A plan's
// checklist item is a link, so only the link text is kept.
const progress = (stage: string, lines: string[]) => {
  const items = lines.filter(line => /^- \[[ x]\] /.test(line))
  const done = items.filter(line => line.startsWith('- [x] ')).length
  const next = items.find(line => line.startsWith('- [ ] '))
  const name = next?.slice(6).replace(/^\[([^\]]*)\]?.*$/, '$1')
  return `${stage} ${done}/${items.length}` + (name ? ` · ${name}` : '')
}

// The status of the stage in progress, from `progress.md`.
const fromProgress = (text: string) => {
  const section = sections(text).find(
    s => s.heading in SECTIONS && s.lines.includes('Status: In progress.'))
  return section && progress(SECTIONS[section.heading], section.lines)
}

// The status of the execution, from the checklist of `plan.md`.
const fromPlan = (text: string) => {
  const section = sections(text).find(s => s.heading === 'Checklist')
  return section && progress('execute', section.lines)
}

// The directory of the feature directories, with `~` expanded.
async function dataDir($: EngineInterface, options: PluginOptions) {
  const dir = String(options.data_dir)
  return dir.startsWith('~/') ? `${await $.env.get('HOME')}${dir.slice(1)}` : dir
}

// The trimmed output of a Git command, or undefined when it fails.
async function git($: EngineInterface, ...args: string[]) {
  const run = await $.process.run(['git', ...args]).catch(() => undefined)
  return run?.exitCode === 0 ? run.stdout.trim() : undefined
}

// The text of a file, or an empty text when it cannot be read.
async function readOrEmpty($: EngineInterface, path: string) {
  return $.fs.read(path).catch(() => '')
}

// The status of a feature directory: the stage in progress, otherwise the
// execution of the plan.
async function featureStatus($: EngineInterface, dir: string) {
  return fromProgress(await readOrEmpty($, `${dir}/progress.md`))
    ?? fromPlan(await readOrEmpty($, `${dir}/plan.md`))
}

export const register: Register = (on, options) => {
  // The model starts a stage through the Skill tool.
  on('tool.call', { tool: 'Skill' }, ($, e, next) => {
    if (e.skill in STAGES) $.ui.status(STAGES[e.skill])
    return next(e)
  })

  // The user starts a stage with a slash command.
  on('command.run', ($, e, next) => {
    if (e.command in STAGES) $.ui.status(STAGES[e.command])
    return next(e)
  })

  // A skill changes `progress.md` or `plan.md` of a feature.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    if ((e.tool !== 'Edit' && e.tool !== 'Write') || result.isError) return result
    const path = e.file_path
    if (!path.startsWith(`${await dataDir($, options)}/`)) return result
    if (!path.endsWith('/progress.md') && !path.endsWith('/plan.md')) return result
    const status = await featureStatus($, path.slice(0, path.lastIndexOf('/')))
    if (status) $.ui.status(status)
    return result
  })

  // A session starts or resumes in a feature worktree. The feature is the
  // branch, and the repository is the directory of the first worktree.
  on('classic.SessionStart', async ($, e, next) => {
    const result = await next(e)
    const list = await git($, 'worktree', 'list', '--porcelain')
    const root = list?.split('\n')[0]?.replace(/^worktree /, '')
    const feature = await git($, 'branch', '--show-current')
    if (!root || !feature) return result
    const dir = `${await dataDir($, options)}/${root.split('/').pop()}/${feature}`
    const status = await featureStatus($, dir)
    if (status) $.ui.status(status)
    return result
  })
}
