---
name: end-worktree
description: Finish the work in a feature worktree. Merge the feature branch or create a pull request, as the user chooses. Use when the user says that a feature is complete or asks to end a worktree.
---

# End a worktree

Bring the result of one feature worktree back to the original repository.

## Find the worktree

Use the worktree of the current session. If the session is in the original
repository, use the feature name that the user gives. If the user gave
none, ask.

The original repository is the first entry of `git worktree list`. Get
its path with `git worktree list --porcelain | head -1 | cut -d' ' -f2-`.

## Check the state

- The feature directory is `${user_config.data_dir}/<repository>/<feature>/`,
  where `<repository>` is the directory name of the original repository. If
  `plan.md` in it has an unfinished step, tell the user and ask if the work
  ends now.
- Inspect the Git status of the worktree. A merge moves only commits. If
  uncommitted changes exist, list them and ask the user which of them
  belong to the result. Start one `core:committer` agent for those files and
  wait for its report.

## Integrate

Use the method that the user named: merge or pull request. If the user
named none, ask. Do not choose a method.

The target is the branch that is checked out in the original repository.
Name the target and ask the user to confirm it.

### Merge

1. In the worktree, run `git rebase <target>`. If Git reports a conflict,
   stop and report the conflicting files. Do not resolve a conflict. Leave
   the rebase in progress, so that the user can resolve it in the worktree.
2. In the worktree, run the `Verify` commands of every step in `plan.md`
   again. If a command does not give its expected result, stop and report.
3. Call the `ExitWorktree` tool with `action: "keep"`. It moves the session
   back to the original repository and does not remove the worktree. If it
   reports that no worktree session is active and the session is still in
   the worktree, stop and tell the user to run the `sdd:end-worktree` skill
   from the original repository.
4. Run `git merge --ff-only <feature>` in the original repository. If Git
   refuses, the target changed after the rebase. Stop and report. Do not
   force the merge.

### Pull request

1. Run `git remote`. If it prints nothing, report that the repository has
   no remote and ask the user again. If it prints more than one remote, ask
   the user which one to use.
2. Run `gh auth status`. If `gh` is missing or not signed in, report that
   and stop.
3. In the worktree, run `git fetch <remote>`, then
   `git rebase <remote>/<target>`. If Git reports a conflict, stop and
   report the conflicting files. Do not resolve a conflict. Leave the rebase
   in progress, so that the user can resolve it in the worktree.
4. In the worktree, run the `Verify` commands of every step in `plan.md`
   again. If a command does not give its expected result, stop and report.
5. Run `git push -u <remote> <feature>`. If the branch was already on the
   remote, run `git push --force-with-lease <remote> <feature>` instead.
6. If `gh pr view <feature>` shows a pull request, skip this step. Otherwise,
   run `gh pr create --base <target> --head <feature> --title "<feature>"
   --body "<purpose>"`. `<purpose>` is the Purpose section of the
   specification.
7. Report the address of the pull request. Keep the worktree.

## Remove the worktree

Do this only after a successful merge, and only after the user confirms.

1. If the session is still in the worktree, call the `ExitWorktree` tool
   with `action: "keep"`.
2. Remove the worktree with
   `git worktree remove ${user_config.worktrees_dir}/<feature>`.
3. Delete the feature branch with `git branch -d`.
4. Delete the feature directory with
   `rm -f <dir>/plan.md <dir>/progress.md && rmdir <dir>`, where `<dir>` is
   `${user_config.data_dir}/<repository>/<feature>`. `rmdir` refuses a
   directory that contains other files.

If one of these operations fails, stop and report. Do not force it.

## Report

Report the merge commit or the pull request, and what you removed.
