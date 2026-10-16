---
name: create-design
description: Create or refine a feature design in this repository using independent technical proposals, user decisions, and reviews of correctness, technical quality, and focus. Use when translating an agreed specification into an implementation design.
---

# Create a design

Describe how to implement the agreed specification of one feature.
Keep technical decisions explicit and base them on repository constraints.

## Select the design

Use the feature that the user explicitly identified or that the current
conversation established. Otherwise, ask the user which feature to design.
State the selected feature.

## Read the context

- Read the feature specification, existing design, and related TODO files.
- Read [assets/template-design.md](assets/template-design.md). If the user
  approves recording unresolved questions, also read
  [assets/template-design-todo.md](assets/template-design-todo.md).
- Inspect relevant code, dependencies, and neighboring feature contracts.
- Verify technical assumptions against code and authoritative documentation.

Resolve repository paths from the repository root and template links from
this skill's directory. Resolve links in generated documents from their
destination in `${user_config.designs_dir}/`, not from the template's location.

The specification defines required behavior. Do not invent missing
requirements or silently change behavior through design decisions.
Present specification gaps to the user before designing affected parts.

A design can change without a specification change if it preserves the
required behavior. Make sure that the design agrees with the specification
before implementation starts.

## Establish the design

### Generate independent proposals

Start three `sdd:design-proposer` agents. Give each agent the path of the
specification and the user's technical decisions, in the user's words. Do not
add your interpretation.

Do not share an agent's proposal with the other agents before all agents
finish.

Proposals are candidates, not agreed technical decisions.

### Reconcile with the user

Compare the proposals with each other, the specification, and existing
architecture. Identify every disagreement, ambiguity, unsupported
assumption, and difference in scope or technical approach.

Resolve factual uncertainty through inspection or relevant evidence.
Do not ask the user to decide a fact that you can verify.

Present each remaining decision to the user one at a time. Explain the
alternatives, practical consequences, and your recommendation.

Wait for the user's answer before presenting the next decision. Clarify
an ambiguous answer before you continue. Do not combine decisions.

Preserve explicit user decisions and established repository constraints.
Obtain user agreement before adopting proposed technical choices.
Agent consensus and user silence do not establish agreement.

### Handle deferred decisions

Resolve each question with the user, or obtain explicit user approval to
record it in the appropriate TODO file. Do not finish while a question
exists only in the conversation.

Use `${user_config.designs_dir}/<feature>_todo.md` for technical questions and
`${user_config.specs_dir}/<feature>_todo.md` for behavior or scope questions.

Use [assets/template-design-todo.md](assets/template-design-todo.md) for design
questions. Replace placeholders and link the design. For each question,
describe the technical context, the necessary decision and evidence, and the
blocked implementation work. For specification questions, use
[../create-spec/assets/template-spec-todo.md](../create-spec/assets/template-spec-todo.md),
link the specification, and identify the affected behavior or acceptance
criteria.

Record questions and unresolved decisions. Do not record implementation task
lists. When the user resolves a question, update the corresponding
specification or design. Then remove the question from its TODO file. Delete
empty TODO files.

Deferred decisions block the implementation work that depends on them.
This rule also applies to questions discovered during review.

## Evaluate technical boundaries

Apply the `core:engineering-principles` skill and the technical rules
of the project to the proposed design.

Identify relevant constraints, explain material tradeoffs, and distinguish
verified facts from assumptions. Propose measurements when a decision
depends on uncertain performance.

Document only considerations that affect this feature. Resolve choices
that change required behavior with the user before adopting them.

## Changes to other features

When the work requires a change to another feature, stop and present the
change to the user as a separate feature. After the other feature is merged
into `<target>`, run `git merge <target>` in this worktree before you
continue. `<target>` is the branch that is checked out in the original
repository. If Git reports a conflict, stop and report.

## Write the design

Use `${user_config.designs_dir}/<feature>.md`, with a lowercase kebab-case
feature name, and link its specification. Keep one design per feature and
update it in place. Describe the architecture that implements the specification
and keep the document small and focused.

Follow the design template. Replace placeholders and remove irrelevant
sections. Describe:

- The agreed approach.
- Data, ownership, invariants, and lifecycle.
- Execution, ordering, data flow, and relevant failures.
- Modules, interfaces, and proposed code changes.
- Material tradeoffs, constraints, and limitations.
- How to verify every acceptance criterion.

Keep the design focused on one feature. Reference other designs instead
of duplicating their internal implementation.

Include snippets or diagrams only when they clarify an important decision.
Keep unresolved choices out of agreed design text.

Remove resolved TODO questions and delete empty TODO files.
Update documents in place. Use Git for history.

## Independent review

After drafting, request these independent reviews. The reviewers work
separately and do not see each other's findings.

- Start two `sdd:design-correctness-reviewer` agents. Give each agent the path
  of the design and the user's technical decisions, in the user's words.
- Start two `core:quality-reviewer` agents. Give each agent the path of the
  design as the output, and the user's technical decisions, in the user's
  words.
- Start one `core:focus-reviewer` agent. Give it the path of the
  specification and the user's technical decisions as the task, the path of the
  design as the output, and
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

When the user asks for a preview, show the design without modifying files.
Otherwise, create or update the requested design documents.

Report the design, review outcomes, unresolved decisions, and necessary
verification work. Do not expand design work into implementation.

Distinguish an agreed design from an implemented or verified feature.

## Commit

After the user approves the result, start one `core:committer` agent. Give it
the files that this skill created, changed, or deleted, and the feature name
as the reason. Wait for its report. Do not change a file before the commit
exists. Report the commit.
