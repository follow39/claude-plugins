---
name: end-work
description: Brings the result of the work into the target branch, and closes the workspace. Use only as a stage of `sdd:start-workflow`, or to resume this stage of an existing work.
---

# End the work

## Track the progress

The progress file is
`${user_config.data_dir}/<repository>/<work>/progress.md`, where
`<repository>` is the directory name of the original repository. Use the
work of the current worktree, or the work that the user names. Otherwise,
ask. If the file is missing, stop and tell the user. Change the file only
with the Edit tool, not with Bash.

If the `## Integration` section is `Status: In progress.`, an earlier run
stopped. Keep its list, confirm that the checked items are still true, and
continue at the first unchecked item.

Otherwise, when the user has confirmed the method and the target, replace
the items of the `## Integration` section with the list of the method, and
set `Status: In progress.`

For a merge:

```text
- [ ] Check the state
- [ ] Confirm the method and the target
- [ ] Rebase onto the target
- [ ] Verify again
- [ ] Merge into the target
- [ ] Remove the worktree
```

For a pull request:

```text
- [ ] Check the state
- [ ] Confirm the method and the target
- [ ] Rebase onto the remote target
- [ ] Verify again
- [ ] Push the branch
- [ ] Create the pull request
- [ ] Remove the worktree after the pull request is merged
```

Check off each item as soon as it is complete, before you start the next
item. The last item deletes the progress file, so it stays unchecked.

## Check the state

The original repository is the first entry of `git worktree list`. Get its
path with `git worktree list --porcelain | head -1 | cut -d' ' -f2-`.

- If `plan.md` in the work directory has an unfinished step, tell the user
  and ask if the work ends now.
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
   the worktree, stop and tell the user to run this skill again from the
   original repository.
4. Run `git merge --ff-only <work>` in the original repository. If Git
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
5. Run `git push -u <remote> <work>`. If the branch was already on the
   remote, run `git push --force-with-lease <remote> <work>` instead.
6. If `gh pr view <work>` shows a pull request, skip this step. Otherwise,
   run `gh pr create --base <target> --head <work> --title "<work>"
   --body "<brief>"`. `<brief>` is the `## Brief` section of `plan.md`.
7. Report the address of the pull request. Keep the worktree.

## Remove the worktree

Do this only after a successful merge, or after the user confirms that the
pull request is merged. Ask the user before you start.

1. If the session is still in the worktree, call the `ExitWorktree` tool
   with `action: "keep"`.
2. Remove the worktree with
   `git worktree remove ${user_config.worktrees_dir}/<work>`.
3. Delete the branch with `git branch -d <work>`.
4. Delete the work directory with
   `rm -f <dir>/plan.md <dir>/progress.md && rmdir <dir>`, where `<dir>` is
   `${user_config.data_dir}/<repository>/<work>`. `rmdir` refuses a
   directory that contains other files.

If one of these operations fails, stop and report. Do not force it.

## Report

Report the merge commit or the pull request, and what you removed.
