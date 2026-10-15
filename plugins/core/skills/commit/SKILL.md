---
name: commit
description: Commits the named files through the `core:committer` agent. Use to commit files by hand.
argument-hint: <files> [-- <reason>]
context: fork
agent: core:committer
background: false
---

The arguments name the files to commit. Text after `--` is the reason for
the change.

$ARGUMENTS
