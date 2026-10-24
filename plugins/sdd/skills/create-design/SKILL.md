---
name: create-design
description: Defines a feasible technical solution for the agreed specification changes. Use when the user asks to design a feature, or to turn agreed specifications into a technical solution.
---

# Create designs

## Track the progress

The progress file is
`${user_config.data_dir}/<repository>/<work>/progress.md`, where
`<repository>` is the directory name of the original repository. Use the
work that the user or the current conversation identified. Otherwise, ask.
If the file is missing, stop and tell the user. Do not give the file to an
agent. Change the file only with the Edit tool, not with Bash.

When the skill starts, replace the items of the `## Design` section with
this list, and set `Status: In progress.`:

```text
- [ ] Read the context
- [ ] Start three design-proposer agents
- [ ] Reconcile the decisions with the user
- [ ] Resolve or record the deferred questions
- [ ] Evaluate technical boundaries
- [ ] Write the designs
- [ ] Start the independent reviews
- [ ] Resolve the findings
- [ ] Report
- [ ] Commit after user approval
```

Check off each item as soon as it is complete, before you start the next
item. After the commit exists, set `Status: Done.`

## Scope

The `## Scope` section of the progress file lists the features of this
work. Design each of them. If a feature needs a change to another feature,
add the other feature to the scope. Keep the scope small and focused: add a
feature only when the work needs it. The user must approve each addition.

If a change also changes required behavior, set the `## Specification`
section of the progress file to `Status: In progress.` and stop. Tell the
user that the specifications must change first.

## Ask for decisions

Before you ask a set of decisions, show the user the list of all open
decisions, with a short name for each. When an answer settles or changes
other decisions, update the list.

Ask each decision with the `AskUserQuestion` tool, one question for each
call. Give 2 to 4 options. In the description of each option, state its
practical consequences. Put the recommended option first, and add
"(Recommended)" to its label. Use previews to compare alternative
interfaces, data structures, or code sketches.

If a decision has more than 4 options, or no fixed options, ask it in
text.

## Read the context

- Read the specification, the existing design, and the TODO files of each
  feature in the scope.
- Read [assets/template-design.md](assets/template-design.md). If the user
  approves recording unresolved questions, also read
  [assets/template-design-todo.md](assets/template-design-todo.md).
- Inspect relevant code, dependencies, and neighboring feature contracts.
- Verify technical assumptions against code and authoritative documentation.

Resolve paths such as `${user_config.designs_dir}` from the root of the
worktree. Resolve template links from this skill's directory. Resolve links
in generated documents from their destination in
`${user_config.designs_dir}/`, not from the template's location.

The specifications define required behavior. Do not invent missing
requirements or silently change behavior through design decisions.
Present specification gaps to the user before designing affected parts.

A design can change without a specification change if it preserves the
required behavior.

## Establish the design

### Generate independent proposals

Start three `sdd:design-proposer` agents. Give each agent the paths of the
specifications of the features in the scope, and the user's technical
decisions, in the user's words. Do not add your interpretation.

Do not share an agent's proposal with the other agents before all agents
finish. Proposals are candidates, not agreed technical decisions.

### Reconcile with the user

Compare the proposals with each other, the specifications, and existing
architecture. Identify every disagreement, ambiguity, unsupported
assumption, and difference in scope or technical approach.

Resolve factual uncertainty through inspection or relevant evidence.
Do not ask the user to decide a fact that you can verify.

Ask each remaining decision one at a time, as
[Ask for decisions](#ask-for-decisions) describes.

Wait for the user's answer before presenting the next decision. Clarify
an ambiguous answer before you continue. Do not combine decisions.

Preserve explicit user decisions and established repository constraints.
Obtain user agreement before adopting proposed technical choices.
Agent consensus and user silence do not establish agreement.

### Handle deferred decisions

Resolve each question with the user, or obtain explicit user approval to
record it in the TODO file of the affected feature. Do not finish while a
question exists only in the conversation.

Use `${user_config.designs_dir}/<feature>_todo.md` for technical questions and
`${user_config.specs_dir}/<feature>_todo.md` for behavior or scope questions.

Use [assets/template-design-todo.md](assets/template-design-todo.md) for design
questions. Replace placeholders and link the design. For each question,
describe the technical context, the necessary decision and evidence, and the
blocked work. For specification questions, use
[../create-spec/assets/template-spec-todo.md](../create-spec/assets/template-spec-todo.md),
link the specification, and identify the affected behavior or acceptance
criteria.

Record questions and unresolved decisions. Do not record implementation task
lists. When the user resolves a question, update the corresponding
specification or design. Then remove the question from its TODO file. Delete
empty TODO files.

A deferred decision blocks the work that depends on it. This rule also
applies to questions discovered during review.

## Evaluate technical boundaries

Apply the `core:engineering-principles` skill and the technical rules
of the project to the proposed design.

Check that the approach is feasible: that it works with the existing code,
the platform, the dependencies, and the agreed limits. If no approach can
meet a requirement, present the requirement and the reason to the user.

Identify relevant constraints, explain material tradeoffs, and distinguish
verified facts from assumptions. Propose measurements when a decision
depends on uncertain performance.

Document only considerations that affect the features in the scope.
Resolve choices that change required behavior with the user before adopting
them.

## Write the designs

For each feature in the scope, write, update, or delete
`${user_config.designs_dir}/<feature>.md`, and link its specification. A new
specification needs a new design. Delete the design of a deleted
specification. Keep one design per feature and update it in place. Describe
the architecture that implements the specification and keep each document
small and focused.

Follow the design template. Replace placeholders and remove irrelevant
sections. Describe:

- The agreed approach.
- Data, ownership, invariants, and lifecycle.
- Execution, ordering, data flow, and relevant failures.
- Modules, interfaces, and proposed code changes.
- Material tradeoffs, constraints, and limitations.
- How to verify every acceptance criterion.

Keep each design focused on its feature. Reference other designs instead
of duplicating their internal implementation.

Include snippets or diagrams only when they clarify an important decision.
Keep unresolved choices out of agreed design text.

Update documents in place. Use Git for history.

## Independent review

After drafting, request these independent reviews. The reviewers work
separately and do not see each other's findings.

- Start two `sdd:design-correctness-reviewer` agents. Give each agent the paths
  of the new and changed designs, the user's technical decisions, in the
  user's words, and a different focus: specification or system.
- Start two `core:quality-reviewer` agents. Give each agent the paths of the
  new and changed designs as the output, the user's technical decisions, in
  the user's words, and a different focus: structure or resources.
- Start one `core:focus-reviewer` agent. Give it the paths of the
  specifications and the user's technical decisions as the task, the paths of
  the new and changed designs as the output, and
  [assets/template-design.md](assets/template-design.md) as a rule.

### Resolve findings

Merge the findings that describe the same problem. Correct supported
findings that preserve agreed decisions. Present new technical choices,
requirement changes, and unresolved disagreements to the user, one decision
at a time.

Record unresolved questions only with explicit user approval.
Ask the reviewer that reported a finding to recheck its substantive
correction.
If a finding remains unresolved, report it explicitly. Do not claim that
the review passed.

If independent agents are unavailable, report that limitation.
Do not present a self-review as an independent review.

## Report

Report the scope, the designs, the review outcomes, and the unresolved
decisions. Do not expand design work into implementation.

When the user asks for a preview, show the designs without modifying files.

## Commit

After the user approves the result, start one `core:committer` agent. Give it
the files that this skill created, changed, or deleted, and the work name as
the reason. Wait for its report. Do not change a file before the commit
exists. Report the commit.
