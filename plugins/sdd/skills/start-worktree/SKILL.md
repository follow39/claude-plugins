---
name: start-worktree
description: Create a Git worktree and a branch for one feature, and move the session into it. Use before `sdd:create-spec` when the user starts work on a feature, or when the user asks for a worktree.
---

# Start a worktree

Create one worktree for one feature. The specification, the design, the
plan, and the code of the feature are made in it.

## Name the feature

Use the feature name that the user gives, in lowercase kebab-case. The
specification file gets the same name. If the user gave no name, ask.

## Check the state

- Find the repository root and the name of its directory.
- Inspect the Git status. Uncommitted changes stay in the current tree and
  are not in the new worktree. List them to the user. Do not commit, stash,
  or move them.
- If a branch, a worktree directory, or a feature directory with the target
  name exists, stop and ask the user. Do not reuse or remove it.

## Create the progress file

The feature directory is `${user_config.data_dir}/<repository>/<feature>/`.
Create it. Copy [assets/template-progress.md](assets/template-progress.md)
to `progress.md` in it, and replace `Feature name` with the feature name.

## Create the worktree

Call the `EnterWorktree` tool with `name` set to the feature name. The
plugin creates the worktree `${user_config.worktrees_dir}/<feature>` on the
branch `<feature>`, from the current commit, and the session moves into it.
Do all later work for the feature there.

If the session is not in that directory on that branch, the plugin did not
create the worktree. Call the `ExitWorktree` tool with `action: "remove"`,
and report it to the user.

## Report

Report the directory, the branch, the base commit, and the progress file.
Name the uncommitted changes that are not in the worktree. The next stage is
the `sdd:create-spec` skill.
