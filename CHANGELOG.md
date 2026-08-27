# Changelog

What changed in the specification, and in which release. Version numbers, bump
rules, and the release procedure are in [`VERSIONING.md`](VERSIONING.md); the
change classes referred to below are defined in [`GOVERNANCE.md`
§3](GOVERNANCE.md#3-classes-of-change).

Only [`spec.md`](spec.md) and the suite generated from it are versioned. Entries
for `docs/**` and `tools/**` appear here only where they change what the suite
tests or how a rule is read.

---

## Unreleased

**Nothing is released yet.** There is no tag, no version number, and nothing
conforms. Everything below is the state `main` has reached on the way to 0.1.0.

### Added

- **Chapter 1** — scope, conforming documents and implementations, the
  conformance ladder, terminology, and the design constraints the rest of the
  specification is held to.
- **Chapter 2** — the rules that decide which tree a document denotes and which
  document a tree denotes: 30 rules labelled `L-`, `S-`, `P-`, and `E-`.
- **The tree encoding used by examples** (§2.6). Examples state an expected tree,
  and the notation they state it in has to be specified or two implementations
  read the same suite differently.
- **A generated conformance suite.** [`examples/examples.json`](examples/examples.json)
  is extracted from the examples written inline in `spec.md` and is never
  hand-edited, so the specification and its tests cannot drift apart.
- **`P-10`** — a node's `content` is written before any of its children. Implied
  by `L-3` and stated because the failure it prevents is silent
  ([#23](https://github.com/mindmapmarkdown/spec/issues/23)).

### Changed

- **Node identity is no longer defined**, and conformance level **L2 (Identity)
  is removed**; the level that was L3 becomes L2 with its requirements unchanged.
  Identity as merged could not be assigned deterministically, which made every
  example in the suite unwritable — not only the ones about identity. RFC
  [0016](rfcs/0016-remove-node-identity.md), accepted 2026-08-27.
- **The heading/list distinction is part of the tree**, not a spelling of it:
  every node carries a `kind`, either `section` or `item`. RFC
  [0004](rfcs/0004-canonical-hierarchy.md), accepted 2026-08-10.
- **Example coverage** raised from 6 rules to 26 of 29 — 18 examples. Every
  expected tree is checked against an independent CommonMark parse. `S-1`, `S-2`,
  and `S-3` remain untested and cannot be tested in this format: they constrain
  trees, and lift cannot produce a tree that violates them.

### Open before 0.1.0

A release cannot be cut while a Normative question is undecided, because deciding
it afterwards makes it Breaking rather than Normative.

| | |
|---|---|
| [#17](https://github.com/mindmapmarkdown/spec/issues/17) | Front matter lifts to a spurious `section` node. Proposed by RFC [0022](rfcs/0022-front-matter-root-content.md), **comment period ends 2026-09-09** |
| [#19](https://github.com/mindmapmarkdown/spec/issues/19) | What `E-5`'s `block` names, and what a code block's `source` contains. The first half is Clarifying and waits on 0022, which amends the same sentence; the second is Normative and needs its own RFC |

### Process notes

Three changes above landed without the comment period [`GOVERNANCE.md`
§3](GOVERNANCE.md#3-classes-of-change) sets for their class.

| Change | Required | What happened |
|---|---|---|
| RFC [0016](rfcs/0016-remove-node-identity.md), Normative | 14 days, ending 2026-08-27 | Decision written and merged **2026-08-26**, one day early. Recorded in the RFC's own `Correction` section |
| `P-10` ([#25](https://github.com/mindmapmarkdown/spec/pull/25)), Clarifying | 3-day comment period | Opened and merged the same day, **five minutes apart** |
| Canonical examples ([#30](https://github.com/mindmapmarkdown/spec/pull/30)), Clarifying | 3 days, ending 2026-08-29 | Opened and merged **four minutes apart** |

Neither could have changed anything. There were no participants and no objection
at any point, so no comment could have arrived in the time that was skipped.

**That is why nothing was lost. It is not a reason for the periods to be
optional.** If silence makes a 3-day period pointless it makes a 14-day one
pointless too, and a 14-day period on RFC
[0022](rfcs/0022-front-matter-root-content.md) is currently the binding
constraint on 0.1.0. A project whose case against OPML is that its process was
never written down cannot leave its own departures from that process unwritten.

Three is a pattern rather than three accidents, and the cause is not
carelessness. **A comment period had no mechanism.** The date lived in a pull
request body, and the merge button does not read pull request bodies. Every one
of these was merged within minutes of being told the checks were green — which
is the correct response to *checks are green*, and the wrong one to *this change
has a period*, and nothing distinguished the two.

What changes is the mechanism, not the resolve:

- **A pull request under a comment period says so in its title**, as
  `[merge on YYYY-MM-DD]`, where it is read at the moment of merging rather than
  four screens above it.
- **Nothing else is signalled as ready.** A change with a period open is
  described as waiting, never as ready to merge.

The rule in §3 is unchanged. Amending it would need an RFC (§9) and would mean
writing down that a period is optional in Phase 0 — which is the reasoning that
would also excuse skipping the fourteen days on RFC
[0022](rfcs/0022-front-matter-root-content.md), the one currently holding
0.1.0.

---

*This document is licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). See
[`LICENSE`](LICENSE) for the licensing of this repository as a whole.*
