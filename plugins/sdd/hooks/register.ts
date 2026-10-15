import type { Register } from 'claude-code'

// The status line text for each skill. `undefined` clears the line.
const STEPS: Record<string, string | undefined> = {
  'sdd:create-spec': 'spec',
  'sdd:create-design': 'design',
  'sdd:create-plan': 'plan',
  'sdd:execute-plan': 'execute',
  'sdd:end-worktree': undefined,
}

export const register: Register = on => {
  // The model starts a step through the Skill tool.
  on('tool.call', { tool: 'Skill' }, ($, e, next) => {
    if (e.skill in STEPS) $.ui.status(STEPS[e.skill])
    return next(e)
  })

  // The user starts a step with a slash command.
  on('command.run', ($, e, next) => {
    if (e.command in STEPS) $.ui.status(STEPS[e.command])
    return next(e)
  })
}
