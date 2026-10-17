import type { EngineInterface, PluginOptions, Register } from 'claude-code'

// The status line text for each stage skill.
const STAGES: Record<string, string> = {
  'sdd:start-work': 'worktree',
  'sdd:create-spec': 'spec',
  'sdd:create-design': 'design',
  'sdd:create-plan': 'plan',
  'sdd:execute-plan': 'execute',
  'sdd:end-work': 'integrate',
}

// The status line text for each section of `progress.md`.
const SECTIONS: Record<string, string> = {
  Worktree: 'worktree',
  Specification: 'spec',
  Design: 'design',
  Plan: 'plan',
  Integration: 'integrate',
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

// A directory option with `~` expanded and no trailing `/`.
async function expand($: EngineInterface, dir: string) {
  const path = dir.startsWith('~/') ? `${await $.env.get('HOME')}${dir.slice(1)}` : dir
  return path.replace(/\/+$/, '')
}

// The directory of the work directories.
async function dataDir($: EngineInterface, options: PluginOptions) {
  return expand($, String(options.data_dir))
}

// The trimmed output of a Git command, or undefined when it fails. It runs in
// `cwd`, or in the session's working directory.
async function git($: EngineInterface, args: string[], cwd?: string) {
  const run = await $.process.run(['git', ...args], { cwd }).catch(() => undefined)
  return run?.exitCode === 0 ? run.stdout.trim() : undefined
}

// The text of a file, or an empty text when it cannot be read.
async function readOrEmpty($: EngineInterface, path: string) {
  return $.fs.read(path).catch(() => '')
}

// The status of a work directory: the stage in progress, otherwise the
// execution of the plan.
async function workStatus($: EngineInterface, dir: string) {
  return fromProgress(await readOrEmpty($, `${dir}/progress.md`))
    ?? fromPlan(await readOrEmpty($, `${dir}/plan.md`))
}

export const register: Register = (on, options) => {
  // The status line is restored once, at the first prompt of a session.
  let restored = false

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

  // A skill changes `progress.md` or `plan.md` of a work.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    if ((e.tool !== 'Edit' && e.tool !== 'Write') || result.isError) return result
    const path = e.file_path
    if (!path.startsWith(`${await dataDir($, options)}/`)) return result
    if (!path.endsWith('/progress.md') && !path.endsWith('/plan.md')) return result
    const status = await workStatus($, path.slice(0, path.lastIndexOf('/')))
    if (status) $.ui.status(status)
    return result
  })

  // The first prompt of a session in a work worktree. A resumed session
  // enters its worktree after it starts, so this runs at the first prompt.
  // The work is the branch, and the repository is the directory of the
  // first worktree.
  on('prompt.submit', async ($, e, next) => {
    if (restored) return next(e)
    restored = true
    const list = await git($, ['worktree', 'list', '--porcelain'])
    const root = list?.split('\n')[0]?.replace(/^worktree /, '')
    const work = await git($, ['branch', '--show-current'])
    if (root && work) {
      const dir = `${await dataDir($, options)}/${root.split('/').pop()}/${work}`
      const status = await workStatus($, dir)
      if (status) $.ui.status(status)
    }
    return next(e)
  })

  // `EnterWorktree` creates a worktree. A name with a work directory is a
  // work of `sdd:start-work`: its worktree is `<worktrees_dir>/<name>` on the
  // branch `<name>`, from the current commit. Every other worktree is left to
  // Claude Code.
  on('classic.WorktreeCreate', async ($, e, next) => {
    const root = await git($, ['rev-parse', '--show-toplevel'], e.cwd)
    if (!root) return next(e)
    const work = `${await dataDir($, options)}/${root.split('/').pop()}/${e.name}`
    if (!await readOrEmpty($, `${work}/progress.md`)) return next(e)
    const dir = await expand($, String(options.worktrees_dir))
    const path = `${dir.startsWith('/') ? dir : `${root}/${dir}`}/${e.name}`
    const run = await $.process.run(['git', 'worktree', 'add', '-b', e.name, path], { cwd: root })
    if (run.exitCode !== 0) return { block: true, stopReason: run.stderr.trim() }
    return { worktreePath: path }
  })
}
