---
name: dev-documentation-principles
description: Developer documentation principles. Use when writing or reviewing documentation for the developers who use a component.
---

# Developer documentation principles

## Reader and task

Write for the developers who use the component, not for the developers who
change it. Before you write, identify the reader and the task that the
document helps them do. Include only what the reader needs for that task.

## Internals

Describe how the component works only when the reader must know it to use
the component correctly: a limit, a failure mode, a cost, a side effect, or
a required order of calls. Otherwise, leave it out. The code is the
reference for the internals.

## Scope

Give each document one topic. Do not explain neighboring components, the
build system, or the toolchain. If the reader must use them, link to their
documentation. If no documentation exists, give the minimum command and do
not explain it.

## Examples

Start with the shortest example that works. Then show one example for each
common task. Then give the reference: inputs, outputs, options, and errors.

Make sure that each example works with the current code. Do not show
options or calls that the code does not have.
