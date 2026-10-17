---
name: execute-plan
description: Executes the plan, and makes sure that everything was done as planned and that the goal of the work is achieved. Use when the user asks to implement or resume an approved plan. Does not create a plan.
---

# Execute a plan

## Check the prerequisite

The progress file is
`${user_config.data_dir}/<repository>/<work>/progress.md`, and the plan is
`plan.md` in the same directory. `<repository>` is the directory name of the
original repository. Use the work that the user or the current conversation
identified. Otherwise, ask. Do not give the progress file to an agent.
Change the progress file only with the Edit tool, not with Bash.

If the plan is missing, or the `## Plan` section of the progress file is not
`Status: Done.`, report that to the user and stop before implementation.

Read the plan, the linked specifications and designs, and the related TODO
files. Inspect the Git status. Confirm that the plan still matches the
current documents and code. When you resume a plan, verify the recorded
progress before you rely on items marked as done.

## Execute each step

1. Select the next unfinished step whose dependencies are complete.
2. Start one `sdd:step-implementer` agent. Give it the path of the plan and the
   step.
3. If the implementer stops, find which document has the problem: the plan,
   a design, or a specification. Present the finding to the user. After the
   decision, update the plan if the decision changes it, and send the
   decision to the same implementer.
4. When the implementer reports the step as complete, request these
   independent reviews. The reviewers work separately and do not see each
   other's findings.
   - Start one `sdd:step-correctness-reviewer` agent. Give it the path of the
     plan, the step, and the report of the implementer.
   - Start one `core:quality-reviewer` agent. Give it the changes of the step
     as the output.
   - Start one `core:focus-reviewer` agent. Give it the step as the task and
     the changes of the step as the output.
5. Merge the findings that describe the same problem. Present findings and
   unclear decisions to the user one at a time. Send the user's decisions
   to the same implementer. Ask the reviewer that reported a finding to
   recheck its substantive correction.
6. Update the step's `Result` with the actual verification and review
   outcomes. Change the plan only with the Edit tool, not with Bash. Mark
   its checklist item as done as soon as its actions, verification, and
   review are complete and no blocking finding remains.
7. Start one `core:committer` agent. Give it the files that the implementer
   changed, and the goal of the step as the reason. Wait for its report. Do
   not start the next step and do not change a file before the commit
   exists. If the committer reports a problem, stop and present it to the
   user.
8. Continue with the next step.

Only one agent changes files at a time. Do not start the implementer or the
committer while another agent still works on the same step.

A review can report no findings. Passing tests do not replace independent
review. If a reviewer is unavailable, the step remains unfinished. An
expected intermediate failure is a successful verification only when it
matches the plan's stated expectation. Never report an unexecuted or skipped
check as passing.

## Handle gaps and findings

For each finding or unclear decision, explain the evidence, alternatives,
consequences, and recommendation. Wait for the user's answer and clarify it
before presenting the next decision. Do not silently invent missing actions
or verification instructions, change requirements, or expand the design.

If a decision changes required behavior, set the `## Specification` section
of the progress file to `Status: In progress.` If it changes a design
materially, set the `## Design` section to `Status: In progress.` If it
changes the plan materially, set the `## Plan` section to
`Status: In progress.` Then stop, and tell the user which documents must
change first.

Resolve each question, or obtain explicit user approval to record it:

- Behavior or scope question: `${user_config.specs_dir}/<feature>_todo.md`,
  with [../create-spec/assets/template-spec-todo.md](../create-spec/assets/template-spec-todo.md).
- Technical question: `${user_config.designs_dir}/<feature>_todo.md`,
  with [../create-design/assets/template-design-todo.md](../create-design/assets/template-design-todo.md).

Recording a blocking question does not complete the step. Skip required
tests only with explicit user approval and report the resulting
verification gap.

## Finish

Confirm that the completed steps cover every acceptance criterion of the
specifications and that the plan's integration checks pass. Report the code
changes, the actual check and review outcomes, and the unfinished work. Do
not claim overall completion while required implementation, verification,
or independent review is pending.
