import type { Register } from 'claude-code'

// The status line text for each skill. `undefined` clears the line.
const STAGES: Record<string, string | undefined> = {
  'sdd:create-spec': 'spec',
  'sdd:create-design': 'design',
  'sdd:create-plan': 'plan',
  'sdd:execute-plan': 'execute',
  'sdd:end-worktree': undefined,
}

export const register: Register = on => {
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
}
