---
name: create-spec
description: Refines the user request into required behavior. Use when the user asks to specify a feature, or to turn an idea or a request into requirements.
---

# Create specifications

## Track the progress

The progress file is
`${user_config.data_dir}/<repository>/<work>/progress.md`, where
`<repository>` is the directory name of the original repository. Use the
work that the user or the current conversation identified. Otherwise, ask.
If the file is missing, stop and tell the user. Do not give the file to an
agent. Change the file only with the Edit tool, not with Bash.

When the skill starts, replace the items of the `## Specification` section
with this list, and set `Status: In progress.`:

```text
- [ ] Read the context
- [ ] Start three spec-proposer agents
- [ ] Agree on the scope with the user
- [ ] Reconcile the decisions with the user
- [ ] Resolve or record the deferred questions
- [ ] Write the specifications
- [ ] Start the independent reviews
- [ ] Resolve the findings
- [ ] Report
- [ ] Commit after user approval
```

Check off each item as soon as it is complete, before you start the next
item. After the commit exists, set `Status: Done.`

## Scope

The `## Scope` section of the progress file lists the features that this
work creates, changes, or deletes, one name for each line.

Find the scope from the request. Keep it small and focused: include a
feature only when the work needs it. If the request is ambiguous, ask the
user. Present each feature to the user with its name and the reason. When
the user approves a feature, add its name to the scope immediately.

## Ask for decisions

Before you ask a set of decisions, show the user the list of all open
decisions, with a short name for each. When an answer settles or changes
other decisions, update the list.

Ask each decision with the `AskUserQuestion` tool, one question for each
call. Give 2 to 4 options. In the description of each option, state its
practical consequences. Put the recommended option first, and add
"(Recommended)" to its label. Use previews to compare alternative
wordings of acceptance criteria.

If a decision has more than 4 options, or no fixed options, ask it in
text.

## Read the context

- Read the specification and the TODO file of each feature in the scope, if
  they exist.
- Read [assets/template-spec.md](assets/template-spec.md). If the user
  approves recording unresolved questions, also read
  [assets/template-spec-todo.md](assets/template-spec-todo.md).
- Inspect related specifications and their TODO files. Do not read source
  code or designs.

Resolve paths such as `${user_config.specs_dir}` from the root of the
worktree. Resolve template links from this skill's directory. Resolve links
in generated documents from their destination in
`${user_config.specs_dir}/`, not from the template's location.

## Establish the requirements

### Generate candidate requirements

Start three `sdd:spec-proposer` agents. Give each agent only the original
request and subsequent user decisions, in the user's words. Do not add your
interpretation or repository context.

Do not share an agent's output with the other agents before all agents
finish. Agent proposals are candidates, not agreed requirements.

### Reconcile with the user

Compare all proposals with each other and with the original request.
Identify every disagreement, ambiguity, unsupported assumption, and
difference in scope or behavior. Agreement between agents does not
establish user intent.

Agree on the scope first. Then ask one decision at a time, as
[Ask for decisions](#ask-for-decisions) describes. The user chooses.

Wait for the user's answer before presenting the next decision. If the
answer is ambiguous, clarify that same decision before you continue.
Do not combine multiple decisions into one question.

Preserve decisions already explicit in the user's input. Obtain explicit
user agreement before adopting inferred or suggested requirements.
Do not treat silence as agreement. Use each answer to update the remaining
questions. The user must not need to decide the same issue twice.

Repeat clarification until the user agrees to the requirements or
explicitly defers specific decisions. Continue work on the agreed parts.
Do not decide unresolved behavior.

### Handle deferred decisions

Resolve each question with the user, or obtain explicit user approval to
record it in the TODO file of the affected feature,
`${user_config.specs_dir}/<feature>_todo.md`. Do not finish while a question
exists only in the conversation.

A deferred question remains unresolved and blocks the behavior that
depends on its answer. Do not present a specification as fully agreed
while such questions remain unresolved.

Apply this rule to questions discovered at any stage, including review.

## Write the specifications

For each feature in the scope, write, update, or delete
`${user_config.specs_dir}/<feature>.md`. Keep one specification per feature.
Update the existing specification when it already owns the behavior.
Describe current required behavior and keep each document small and focused.
Keep technical implementation choices out of the specifications.

Follow the specification template. Remove irrelevant sections and replace
all placeholders.

- Describe purpose and scope concisely.
- Write observable acceptance criteria under `### AC-NN: Behavior name`.
- Use the same `AC-NN` numbering scheme for normal operation, boundary
  cases, and failures. Group criteria into sections only when it helps
  readability.
- State relevant initial conditions, actions, and expected results.
- Include boundary and failure behavior where it is relevant.
- Make measurable constraints explicit when agreed requirements support
  them.
- Keep architecture, implementation tasks, and completion status out of
  acceptance criteria.
- Keep test references in tests, not in the specification.

Acceptance criterion IDs describe the current specification. You can
renumber, replace, or remove them.

Record questions in `${user_config.specs_dir}/<feature>_todo.md` only with
explicit user approval. Follow the specification TODO template and link the
specification. Replace placeholders. For each question, explain the context,
the necessary decision, and the affected behavior or acceptance criteria. Keep
implementation task lists out of TODO files. When the user resolves a question,
update the specification and remove the question. Delete empty TODO files.

Update documents in place. Use Git for history.

## Independent review

After drafting, request these independent reviews. The reviewers work
separately and do not see each other's findings.

- Start three `sdd:spec-consistency-reviewer` agents. Give each agent the paths
  of the new and changed specifications, and the original request and
  subsequent user decisions, in the user's words.
- Start two `sdd:spec-technical-reviewer` agents. Give each agent the paths of
  the new and changed specifications.
- Start one `core:focus-reviewer` agent. Give it the original request and
  subsequent user decisions as the task, the paths of the new and changed
  specifications as the output, and
  [assets/template-spec.md](assets/template-spec.md) as a rule.

### Resolve findings

Merge the findings that describe the same problem. Correct supported
consistency and focus findings that preserve agreed requirements. Present
changes to requirements, unresolved questions, and reviewer disagreements
to the user, one decision at a time. Reviewers do not decide requirements.

A technical finding is a risk, not a defect. Present each technical finding
to the user, one at a time. Do not change a requirement because of a
technical finding without a user decision. Do not give the technical
findings to the other agents.

Record unresolved questions in the specification TODO file only with
explicit user approval. Do not change a feature outside the scope.

Ask the reviewer that reported a finding to recheck its substantive
correction. If a finding remains unresolved, report it explicitly. Do not
claim that the review passed.

If independent agents are unavailable, report that limitation. Do not
present a self-review as an independent review.

## Report

Check that the specifications contain every agreed requirement, that each
criterion is testable, and that related specifications are consistent.

Report the scope, the specifications, the review outcomes, and the
unresolved questions.

When the user asks for a preview, show the content without modifying
files.

## Commit

After the user approves the result, start one `core:committer` agent. Give it
the files that this skill created, changed, or deleted, and the work name as
the reason. Wait for its report. Do not change a file before the commit
exists. Report the commit.
