import type { Register } from 'claude-code'

const STEPS: Record<string, string> = {
  'sdd:create-spec': 'spec',
  'sdd:create-design': 'design',
  'sdd:create-plan': 'plan',
  'sdd:execute-plan': 'execute',
}

export const register: Register = on => {
  // The model starts a step through the Skill tool.
  on('tool.call', { tool: 'Skill' }, ($, e, next) => {
    const step = STEPS[e.skill]
    if (step) $.ui.status(step)
    return next(e)
  })

  // The user starts a step with a slash command.
  on('command.run', ($, e, next) => {
    const step = STEPS[e.command]
    if (step) $.ui.status(step)
    return next(e)
  })
}
