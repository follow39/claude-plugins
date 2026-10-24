---
name: create-plan
description: Turns the agreed designs into a plan that implements them. Use when the user asks to plan the implementation of agreed designs. Does not implement the plan.
---

# Create a plan

## Track the progress

The progress file is
`${user_config.data_dir}/<repository>/<work>/progress.md`, where
`<repository>` is the directory name of the original repository. Use the
work that the user or the current conversation identified. Otherwise, ask.
If the file is missing, stop and tell the user. Do not give the file to an
agent. Change the file only with the Edit tool, not with Bash.

When the skill starts, replace the items of the `## Plan` section with this
list, and set `Status: In progress.`:

```text
- [ ] Read the context
- [ ] Start one plan-proposer agent
- [ ] Write the plan
- [ ] Resolve the questions with the user
- [ ] Start the independent reviews
- [ ] Resolve the findings
- [ ] Report
- [ ] The user approves the plan
```

Check off each item as soon as it is complete, before you start the next
item. After the user approves the plan, set `Status: Done.`

## Read the context

The `## Scope` section of the progress file lists the features of this
work. Read the specification, the design, and the TODO files of each of
them, and the relevant code and tests. Apply the
`core:engineering-principles` and `core:testing-principles` skills. Check
that each design matches its specification before you plan the affected work.

## Ask for decisions

Before you ask a set of decisions, show the user the list of all open
decisions, with a short name for each. When an answer settles or changes
other decisions, update the list.

Ask each decision with the `AskUserQuestion` tool, one question for each
call. Give 2 to 4 options. In the description of each option, state its
practical consequences. Put the recommended option first, and add
"(Recommended)" to its label. Use previews to compare alternative step
orders or verification commands.

If a decision has more than 4 options, or no fixed options, ask it in
text.

## Write the plan

The plan is `${user_config.data_dir}/<repository>/<work>/plan.md`. If it
exists, stop and ask the user whether to keep it or to replace it. To
replace it, delete it before you continue.

Start one `sdd:plan-proposer` agent. Give it the paths of the designs of the
features in the scope, the path of
[assets/template-plan.md](assets/template-plan.md), and the user's decisions
about the plan, in the user's words.

Write the proposed plan to the plan path without changes.

The plan has a linked checklist immediately after the brief. Each checklist
item has a dedicated heading. Below the heading, the step contains:

- Ordered implementation actions.
- Affected files.
- Dependencies.
- Acceptance criteria.
- Verification commands and expected results.
- A `Result: Pending.` field.

The plan is outside the worktree. Give each link as a path from the root of
the worktree, for example `${user_config.specs_dir}/<feature>.md`. Link the
specification and the design of each feature in the scope. Keep review and
reporting procedures out of the plan.

## Resolve questions

Ask the proposer's questions and other unclear decisions one at a time, as
[Ask for decisions](#ask-for-decisions) describes. Clarify an ambiguous
answer before you continue. Preserve agreed decisions.

If a decision changes required behavior, set the `## Specification` section
of the progress file to `Status: In progress.` If it changes a design
materially, set the `## Design` section to `Status: In progress.` Then stop,
and tell the user which documents must change first.

Resolve each question, or obtain explicit user approval to record it:

- Behavior or scope question: `${user_config.specs_dir}/<feature>_todo.md`,
  with [../create-spec/assets/template-spec-todo.md](../create-spec/assets/template-spec-todo.md).
- Technical question: `${user_config.designs_dir}/<feature>_todo.md`,
  with [../create-design/assets/template-design-todo.md](../create-design/assets/template-design-todo.md).

Deferred questions continue to block dependent work.

When automated verification is impractical, agree on an alternative with the
user. Skip required tests only with explicit user approval.

## Independent review

Request these independent reviews of the draft. The reviewers work
separately and do not see each other's findings.

- Start two `sdd:plan-correctness-reviewer` agents. Give each agent the path of
  the plan, the user's decisions about the plan, in the user's words, and a
  different focus: coverage or execution.
- Start one `core:quality-reviewer` agent. Give it the path of the plan as
  the output, and the user's decisions about the plan, in the user's words.
- Start one `core:focus-reviewer` agent. Give it the paths of the designs and
  the user's decisions as the task, the path of the plan as the output, and
  [assets/template-plan.md](assets/template-plan.md) as a rule.

Merge the findings that describe the same problem. Present every finding
and disagreement to the user one at a time. Apply the decisions, revise
affected steps, and obtain rechecks of substantive changes. Repeat the
relevant review when later plan changes alter implementation or
verification. If reviewers are unavailable, the review remains pending.

## Report

Show the user a summary of the plan. List every step in its order. For each
step, give its name and a brief explanation of what it does.

Report the plan path, the review outcomes, and the deferred questions. The
plan is ready only when the required reviews are complete and no unresolved
decision blocks its planned work. When the plan is ready, ask the user to
approve it.

When the user asks for a preview, show the plan without modifying files.
