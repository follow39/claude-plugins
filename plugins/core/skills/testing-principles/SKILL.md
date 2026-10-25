---
name: testing-principles
description: Testing principles. Use when planning, writing, or reviewing tests.
---

# Testing principles

## Description and requirements

Before each test, write a short description of the behavior that it
verifies. In the documentation comment of the test, list the requirements
that the test verifies, one reference for each line.

The project instructions define the format of a reference and of the
list. If they do not, ask the user. Do not invent a format.

When requirements change, update the affected references in the same
change.

## Given, when, then

Write each test in three parts, in this order. Start each part with a
lowercase comment, `given`, `when`, or `then`, and separate the parts with
a blank line.

- given: the initial state and the inputs.
- when: the one action under test.
- then: the checks of the observable result.

If the test needs several actions to reach the initial state, put them in
the given part. If a test needs two actions under test, write two tests.

Write expected results as literal values. Do not compute them with the
logic under test or with a copy of it. Such a test passes when the logic
is wrong.

Name each test after the behavior: the condition and the expected result.

## Data-driven tests

Prefer one data-driven test when several cases check the same behavior
with different data. Write one test body and a table of cases. Use the
parameterized tests of the test framework, if it has them.

Give each case a name that states what makes it different. Each case holds
its given data and its expected result. A failure must identify the case.

Do not branch on the case data in the test body. If cases need different
actions or different checks, they test different behaviors: write
separate tests.

Do not put unrelated cases into one table only to remove duplication.
