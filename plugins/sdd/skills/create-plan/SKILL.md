---
name: create-plan
description: Create or revise an implementation plan from an agreed specification and design. Organize concrete steps using TDD, resolve decisions with the user, and obtain independent plan reviews. Does not implement the plan.
---

# Create an implementation plan

Produce a reviewed plan that an agent can execute one step at a time.

## Read the context

Use the design that the user or the current conversation identified.
Otherwise, ask the user which design to plan. State the selected design.

Read its specification, related TODO files, and relevant code and tests.
Apply the `core:engineering-principles` skill.
Check that the design matches the specification before planning affected work.

## Write the plan

The plan is `${user_config.data_dir}/<repository>/plans/<feature>.md`.
`<feature>` is the design's lowercase kebab-case feature name. Get
`<repository>` with
`basename "$(git worktree list --porcelain | head -1 | cut -d' ' -f2-)"`.

If the plan exists, stop and tell the user. The user chooses one:

- Execute the existing plan with the `sdd:execute-plan` skill.
- Replace the existing plan. Delete it before you continue.

Start one `sdd:plan-proposer` agent. Give it the path of the design,
the path of [assets/template-plan.md](assets/template-plan.md), and the
user's decisions about the plan, in the user's words.

Write the proposed plan to the plan path without changes.

The plan has a linked checklist immediately after the brief. Each checklist
item has a dedicated heading. Below the heading, the step contains:

- Ordered implementation actions.
- Affected files.
- Dependencies.
- Acceptance criteria.
- Verification commands and expected results.
- A `Result: Pending.` field.

Give document links as paths from the repository root. The specification is
`${user_config.specs_dir}/<feature>.md` and the design is
`${user_config.designs_dir}/<feature>.md`. Keep review and reporting
procedures out of the plan.

### Show the plan summary

After you write the plan, show the user a summary. List every step in its
order. For each step, give its name and a brief explanation of what it does.
Show the summary again in the final report if the steps changed.

## Resolve questions and review

Present the proposer's questions and other unclear decisions to the user one at
a time. Explain the alternatives and consequences, wait for an answer, and
clarify it before you continue. Preserve agreed decisions. Use the
`sdd:create-spec` skill for requirement changes. Use the `sdd:create-design`
skill for material technical changes. Resume planning from their agreed,
reviewed results.

Resolve each question, or obtain explicit user approval to record it:

- Behavior or scope question: `${user_config.specs_dir}/<feature>_todo.md`,
  with [../create-spec/assets/template-spec-todo.md](../create-spec/assets/template-spec-todo.md).
- Technical question: `${user_config.designs_dir}/<feature>_todo.md`,
  with [../create-design/assets/template-design-todo.md](../create-design/assets/template-design-todo.md).

Deferred questions continue to block dependent work.

When automated verification is impractical, agree on an alternative with the
user. Skip required tests only with explicit user approval.

Request these independent reviews of the draft. The reviewers work
separately and do not see each other's findings.

- Start two `sdd:plan-correctness-reviewer` agents. Give each agent the path of
  the plan and the user's decisions about the plan, in the user's words.
- Start one `core:quality-reviewer` agent. Give it the path of the plan as
  the output, and the user's decisions about the plan, in the user's words.
- Start one `core:focus-reviewer` agent. Give it the path of the design and
  the user's decisions as the task, the path of the plan as the output, and
  [assets/template-plan.md](assets/template-plan.md) as a rule.

Merge the findings that describe the same problem. Present every finding
and disagreement to the user one at a time. Apply the decisions, revise
affected steps, and obtain rechecks of substantive changes.
Repeat the relevant review when later plan changes alter implementation or
verification. Report the plan path, review outcomes, and any deferred
questions.
Call the plan ready only when required reviews are complete and no unresolved
decision blocks its planned work. If reviewers are unavailable, the review
remains pending.

When the user asks for a preview, show the plan without modifying files.
