---
name: start-work
description: Creates an isolated workspace for the work on a user request: a Git worktree and a branch, on a verified base. Use when a piece of work needs its workspace, or when the user asks for a worktree.
---

# Start the work

## Track the progress

The progress file is
`${user_config.data_dir}/<repository>/<work>/progress.md`, where
`<repository>` is the directory name of the original repository. Use the
work that the user or the current conversation identified. Otherwise, ask.
If the file is missing, stop and tell the user. Change the file only with
the Edit tool, not with Bash.

When the skill starts, replace the items of the `## Worktree` section with
this list, and set `Status: In progress.`:

```text
- [ ] Create the worktree
- [ ] Verify the baseline
- [ ] Report
```

Check off each item as soon as it is complete, before you start the next
item. After the report, set `Status: Done.`

## Check the state

- Inspect the Git status. Uncommitted changes stay in the current tree and
  are not in the new worktree. List them to the user. Do not commit, stash,
  or move them.
- If a branch or a worktree directory with the work name exists, stop and
  ask the user. Do not reuse or remove it.

## Create the worktree

Call the `EnterWorktree` tool with `name` set to the work name. The plugin
creates the worktree `${user_config.worktrees_dir}/<work>` on the branch
`<work>`, from the current commit, and the session moves into it. Do all
later work there.

If the session is not in that directory on that branch, the plugin did not
create the worktree. Call the `ExitWorktree` tool with `action: "remove"`,
and report it to the user.

## Verify the baseline

In the worktree, run the build and test commands of the project once,
before any change. Find them in the project's `CLAUDE.md`, its README, or
its build files. If you cannot find them, ask the user. Do not change a
file to make a command pass. If a command fails, report the failure and ask
the user whether the work starts anyway.

## Report

Report the directory, the branch, the base commit, and the result of the
baseline. Name the uncommitted changes that are not in the worktree.
