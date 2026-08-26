# Versioning and releases

This document says what a Mindmap Markdown version number means, when it changes,
and what has to be true before 1.0. It is procedural rather than normative — it
is not part of the specification.

Change classes are defined in [`GOVERNANCE.md`
§3](GOVERNANCE.md#3-classes-of-change) and are not restated here.

---

## 1. What is versioned

**The specification.** A version names one state of [`spec.md`](spec.md) together
with the [`examples/examples.json`](examples/examples.json) generated from it.

Those two ship as a pair and cannot disagree, because the suite is generated from
the specification and every pull request regenerates it and fails if the result
differs ([`CONTRIBUTING.md` §6](CONTRIBUTING.md)). A version therefore names a set
of rules **and** the tests that decide them.

Not versioned: `docs/**`, which is informative; `rfcs/**`, which is a record of
decisions rather than a statement of them; and `tools/**`, which serves the
specification rather than forming part of it.

## 2. The number

`MAJOR.MINOR.PATCH`, released as a git tag — `v0.1.0`.

| Class | Bump | Because |
|---|---|---|
| **Editorial** | PATCH | Nothing about conformance moves |
| **Clarifying** | PATCH | Existing intent made explicit; no conforming implementation changes behaviour |
| **Normative** | MINOR | What conforms changes, but nothing that conformed stops |
| **Breaking** | MAJOR | Documents or implementations that conformed no longer do |

A release usually carries several changes. **The bump is the largest of them.**

## 3. Before 1.0

Below 1.0 the number **identifies a state; it does not promise stability.**

A Breaking change before 1.0 bumps **MINOR** — `0.1.0` to `0.2.0` — rather than
MAJOR, which is the ordinary convention for pre-1.0 software and is stated here so
that nobody has to guess. The MAJOR/MINOR split in §2 applies from 1.0 onward.

What the number is for during 0.x is naming: an implementation can say what it
built against, and a bug report can say what it read. Neither is possible against
a moving `main`, which is the whole reason to tag before the specification is
finished.

## 4. What a conformance claim cites

An implementation claims **a level and a version together**:

> Mindmap Markdown **0.1.0**, level **L1**

A level alone is not a claim that can be checked, because the suite that decides
it changes between releases. §1.2.4 requires an implementation to state the
highest level it claims; this document adds that the claim names the release it
was tested against.

## 5. What 1.0 would mean

Stated as conditions rather than as a feeling, for the reason
[`GOVERNANCE.md` §5](GOVERNANCE.md#5-phase-transitions) gives for stating its
phase triggers as numbers: **so that no one — including the current maintainer —
gets to decide later that they were met.**

1. **No open Normative question.** Every issue or RFC that would change what
   conforms is decided and landed, or explicitly deferred past 1.0 in writing.
2. **Every rule is tested, or its absence is explained.** Each normative rule has
   at least one example in the suite, or a recorded reason why the suite's format
   cannot express it.
3. **Two independent implementations pass**, at the level each claims, written by
   people who did not write the specification.
4. **A migration guide exists** for every Breaking change since 0.1.

The third is the one that cannot be arranged by writing more text, and it is
deliberately the hardest. A specification with one implementation is a description
of that implementation.

## 6. Release procedure

1. Every open item this release claims to close is closed.
2. `node tools/extract-examples.mjs --check` reports no drift, and CI is green on
   `main`.
3. [`CHANGELOG.md`](CHANGELOG.md) has an entry for the version, dated.
4. The tag is annotated and signed: `git tag -s vX.Y.Z`.
5. A GitHub release is published from the tag, with `spec.md` and
   `examples/examples.json` attached as assets, so a reader gets the pair without
   cloning.

## 7. Yanking

A release is never deleted or re-tagged. If one turns out to be wrong, the fix is
the next release, and `CHANGELOG.md` records what was wrong with the one before.

Deleting a tag breaks every implementation that named it, which is the one thing
a version number exists to prevent.

---

*This document is licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). See
[`LICENSE`](LICENSE) for the licensing of this repository as a whole.*
