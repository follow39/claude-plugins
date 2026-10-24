---
name: style-principles
description: Code style principles. Use when writing or reviewing code.
---

# Style principles

Apply these principles when writing or reviewing code.

## Comments

Write no comment by default. Add a comment only when it tells the reader
something that the name, the type, and the code do not show:

- the reason for a decision or a value
- a unit, a range, or a coordinate convention
- an invariant, or a condition that the caller must meet
- a result that the reader does not expect

Delete the comment in your mind. If the reader loses nothing, do not write
it. If a better name makes the comment unnecessary, change the name.

Use one sentence where possible, and three lines at most. Describe the
current code. Do not describe the change, the history, or the task.

The testing principles define the comments that tests require.

## Vertical spacing

When a function does several logical steps, separate the steps with one
blank line. A function with one step needs no blank lines.
