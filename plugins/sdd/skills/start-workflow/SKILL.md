---
name: start-workflow
description: Establishes spec-driven development for a new request, and makes sure that the work follows its process. Use when the user starts work on a new request.
disable-model-invocation: true
---

# Start the workflow

## Name the work

Propose a short work name in lowercase kebab-case, from the request. Ask the
user to confirm it.

## Create the progress file

The work directory is `${user_config.data_dir}/<repository>/<work>/`, where
`<repository>` is the directory name of the original repository. If it
exists, stop and ask the user. Do not reuse or remove it. Otherwise, create
it, and copy [assets/template-progress.md](assets/template-progress.md) to
`progress.md` in it.

## Run the stages

Run these skills in order. Each skill owns its procedure. Do the stages
after `sdd:start-work` in the worktree that it creates.

1. `sdd:start-work`
2. `sdd:create-spec`
3. `sdd:create-design`
4. `sdd:create-plan`
5. `sdd:execute-plan`
6. `sdd:end-work`

A stage can send the work back to an earlier stage. Then continue in order
from that stage.
