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
  document a tree denotes: 34 rules labelled `L-`, `S-`, `P-`, and `E-`.
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

- **A content block's `source` no longer carries its container's indentation,
  and every code block is recorded in one form.** `E-5` recorded a block's source
  "verbatim", which kept the indentation of any list item containing it — an
  ordinary two-line paragraph under an item failed the round-trip — and left a
  code block's source depending on how it was spelled, including one spelling
  that survived the round-trip while the code inside it changed. `E-5` now
  removes a container's columns from every line of a block; new `L-11` records
  every code block fenced, holding CommonMark's own notion of its content; `P-5`
  admits a tilde fence for the one info string backticks cannot carry; and `P-8`
  stops forbidding trailing whitespace on a line where it is the code. Four
  examples are added and the suite grows from 21 cases to 25 — no existing
  example changes. RFC [0038](rfcs/0038-content-block-source.md), accepted
  2026-09-28; closes [#19](https://github.com/mindmapmarkdown/spec/issues/19).
- **Front matter is root content, not a node.** A document opening with a
  `---`-fenced block lifted to a spurious `section` node, because CommonMark
  reads the closing fence as a setext heading underline. `L-10` makes the run of
  lines one opaque entry of the root's `content`, `S-4` fixes its position,
  `P-11` writes it back, and `E-5` admits the one block type name this
  specification defines. RFC [0022](rfcs/0022-front-matter-root-content.md),
  accepted 2026-09-11; closes
  [#17](https://github.com/mindmapmarkdown/spec/issues/17).
- **Node identity is no longer defined**, and conformance level **L2 (Identity)
  is removed**; the level that was L3 becomes L2 with its requirements unchanged.
  Identity as merged could not be assigned deterministically, which made every
  example in the suite unwritable — not only the ones about identity. RFC
  [0016](rfcs/0016-remove-node-identity.md), accepted 2026-08-27.
- **The heading/list distinction is part of the tree**, not a spelling of it:
  every node carries a `kind`, either `section` or `item`. RFC
  [0004](rfcs/0004-canonical-hierarchy.md), accepted 2026-08-10.
- **Example coverage** raised from 6 rules to 26 of 29 — 18 examples at the
  time, 21 now. Every expected tree is checked against an independent CommonMark
  parse. `S-1`, `S-2`, `S-3`, and `S-4` remain untested and cannot be tested in
  this format: they constrain trees, and lift cannot produce a tree that violates
  them.

### Open before 0.1.0

A release cannot be cut while a Normative question is undecided, because deciding
it afterwards makes it Breaking rather than Normative.

| Question | Proposal | Comment period ends |
|---|---|---|
| [#35](https://github.com/mindmapmarkdown/spec/issues/35) — `L-10` swallows a document that opens with a thematic break and carries a later one. RFC [0037](rfcs/0037-front-matter-opening-thematic-break.md) proposed keeping `L-10` and was **rejected 2026-09-28**: a reader reported writing every note that way | RFC 0048 ([#48](https://github.com/mindmapmarkdown/spec/pull/48)) — front matter does not open on a blank line | 2026-10-11 |
| Whether an ordered list's numbers are part of the tree — left open by RFC [0004](rfcs/0004-canonical-hierarchy.md), and **missing from this list until 2026-09-15** | RFC [0039](rfcs/0039-ordered-lists.md) — ordered items record their ordinal and delimiter | **Accepted 2026-09-29.** The rules land in `spec.md` as their own pull request |
| [#40](https://github.com/mindmapmarkdown/spec/issues/40) — projection drops every link reference definition. **Deferred on 2026-09-15; the deferral was withdrawn on 2026-09-29**, because RFC 0039 turns the loss into an ill-formed tree: ordered lists separated by a definition lift to a restart with nothing between them, which `S-5` rejects and `S-3` requires refusing to project | RFC 0051 ([#51](https://github.com/mindmapmarkdown/spec/pull/51)) — a definition is node content, recorded opaquely | 2026-10-13 |
| [#42](https://github.com/mindmapmarkdown/spec/issues/42) — a well-formed tree can project to a document that lifts to a different tree: nothing constrains a label or a content entry's `source` | RFC [0043](rfcs/0043-well-formed-round-trip.md) — `S-7`: lifting a tree's canonical projection must yield that tree | **Accepted 2026-10-01.** Lands with 0046 and 0051: until those close, lift still produces trees `S-7` rejects |
| [#45](https://github.com/mindmapmarkdown/spec/issues/45) — an item with a label whose first child has an empty label has no canonical projection, so a tree lift produces cannot be written back | RFC [0046](rfcs/0046-empty-first-child.md) — one blank line between the label and the nested list in that position | **Accepted 2026-10-01.** Lands with 0043, 0051, 0057 and 0058 |
| [#55](https://github.com/mindmapmarkdown/spec/issues/55) — a multi-line label below the top level keeps the indentation of the item holding it, and `P-4` adds it again, so the document does not survive the round trip. Found 2026-10-02 | RFC 0057 ([#57](https://github.com/mindmapmarkdown/spec/pull/57)) **Part 1** — a label's later lines lose what the first line gave up, and `P-1` writes them back at the node's content column | 2026-10-16 |
| [#59](https://github.com/mindmapmarkdown/spec/issues/59) — a recorded `source` or `label` whose line ends in whitespace has **no** canonical projection: `P-9` writes it back and `P-8` forbids the result. One stray space at the end of a paragraph is enough. Found 2026-10-02 | RFC 0057 ([#57](https://github.com/mindmapmarkdown/spec/pull/57)) **Part 2** — no line of a recorded string ends in whitespace, except a code block's content | 2026-10-16 |
| [#56](https://github.com/mindmapmarkdown/spec/issues/56) — a link reference definition can leave a paragraph whose first line is a paragraph only because it cannot interrupt one; after the blank line `P-7` puts in front of it, that line opens a list. Invisible before RFC 0051. Found 2026-10-02 | RFC 0058 ([#58](https://github.com/mindmapmarkdown/spec/pull/58)) — such a paragraph is written on the line below the definition, with no blank line | 2026-10-16 |
| [#64](https://github.com/mindmapmarkdown/spec/issues/64) — a section's `label` can contain a line break and an ATX heading cannot carry one, so a setext heading spanning two lines has no canonical projection. `P-6` cannot simply be relaxed: setext covers levels 1 and 2 and leaves depth 3 unanswered. Found 2026-10-02 | **None.** Four options are recorded on the issue with no recommendation. It was split out of RFC 0057, whose `P-1` sentence said the wrong thing about sections for part of one day | **Not open** |
| [#61](https://github.com/mindmapmarkdown/spec/issues/61) — an empty-labelled item whose content is a definition loses its children: `P-7`'s blank line before the content, plus the blank line before the child, leaves two in a row once the definition is read out, and two blank lines end the item. Found 2026-10-02 | **None.** A sentence was written into RFC 0058 and withdrawn the same day — it fixed 27 documents and broke 81, because a second content block then lands inside the item and becomes its label. It belongs with the label question below | **Not open** |

Three of the eight remaining are decided. The five still open are RFC 0048 to
2026-10-11, RFC 0051 to 2026-10-13, and RFC 0057 Parts 1 and 2 and RFC 0058 to
2026-10-16; the release follows the last of them rather than the 2026-10-05 the
roadmap first carried.

**The accepted rules do not all land at once.** RFC 0038 landed on its own and
has left this table; see *Changed* above. RFC 0039, 0043 and 0046 land together
with 0051, 0057 and 0058, because until those close lift still produces trees
§2.4 rejects: with 0039 accepted, a conforming document whose ordered lists are
separated by a link reference definition lifts to a restart with nothing between
them, which `S-5` rejects — and `S-7` cannot be stated at all while §2.4's claim
that lift never produces an ill-formed tree is false of a document someone can
write. A specification that states a rule it breaks is worse than one that waits
a fortnight.

**The 2026-10-01 wording of that paragraph said `S-5` and `S-7` were "both false"
while definitions are dropped.** That was imprecise: `S-5` is the rule a dropped
definition violates, and `S-7` is blocked because the definition of well-formed
that contains it would then be false of a tree lift produces. The sequencing it
described is unchanged.

### Found on 2026-10-02 — four more holes under `S-7`, and how

A sweep over 40,000 generated documents, run against the reference
implementation with every accepted and proposed rule merged together, checking
each document's tree round trip and each tree against `S-7`. **Nine hundred
failed.**

| Cause | Count | Where it went |
|---|---|---|
| A block's starting column was taken from the parser, which reports the column of the paragraph a definition was removed from | 595 | **Not a specification gap.** Fixed in [mindmapmd#8](https://github.com/mindmapmarkdown/mindmapmd/pull/8) |
| A multi-line label below the top level | 305 | [#55](https://github.com/mindmapmarkdown/spec/issues/55), RFC 0057 Part 1 |
| A paragraph whose source reads as a list | 270 of the remainder after the first two were fixed or isolated | [#56](https://github.com/mindmapmarkdown/spec/issues/56), RFC 0058 |
| A recorded line ending in whitespace — `S-7` does **not** catch this one, because the tree round trip passes; the tree simply has no canonical projection | not in the 900 | [#59](https://github.com/mindmapmarkdown/spec/issues/59), RFC 0057 Part 2 |

RFC [0043](rfcs/0043-well-formed-round-trip.md)'s decision, written 2026-10-01,
said two holes blocked `S-7` and both were answered. It now carries a
**Correction** recording that there were four. Nothing in its reasoning changes:
`S-7` is the rule that finds these, and each one it found is a document that
silently lost its meaning before `S-7` existed to name the loss. What changes is
the confidence of "both are answered" — a rule stated over a round trip has a
search space, and the honest way to count its holes is to search it.

### The tail, and a decision that has to be made before the tag

With the four fixes above in place the sweep goes from 900 failures to **27**,
and all 27 are [#61](https://github.com/mindmapmarkdown/spec/issues/61). Run against `main` rather than against the
open proposals, it reports 1,036 failures of 40,000 — #55 and
[#64](https://github.com/mindmapmarkdown/spec/issues/64) — and #64 is the one that showed a sentence written into
RFC 0057 that morning to be wrong, before its comment period had run a day. The
sweep is now
[`tools/sweep.mjs`](https://github.com/mindmapmarkdown/mindmapmd/blob/main/tools/sweep.mjs)
in the reference implementation, so the next person can run it rather than
rebuild it. A sentence answering it was written and
withdrawn the same day: writing an empty-labelled item's first content entry
below the marker fixed those 27 and broke 81 others, because a second content
block then lands inside the item and becomes its **label**.

That exchange names the real blocker. **`S-7` keeps running into the one question
RFC 0043 named and did not answer** — what an item's label is when its first
block is not a paragraph. #61 is that question reached from another direction,
and a rule about where blank lines go cannot settle it.

So there is a choice, and it is not a technical one:

- **Defer `S-7` past 0.1.0.** Every other rule found this week fixes a document
  that silently loses its meaning, and each lands on its own evidence. `S-7` is
  the rule that *finds* such documents, and it cannot be stated while §2.4's
  claim is false of a document someone can write. Deferring it ships 0.1.0 with
  the fixes and keeps the sweep as 0.2.0's agenda, where the label question is
  answered first and `S-7` lands on top of it.
- **Hold the tag until the family is closed.** Honest, and open-ended: the
  search space is CommonMark's, and each shape found so far has cost a fortnight.
  **#64 is the argument against this option**, because it is not an
  `S-7` hole at all — a well-formed tree with no canonical projection, like #45
  and #59 — and it blocks the release whichever way `S-7` goes.

Nothing is decided here, and **neither option moves the date much.** RFC 0057 and
RFC 0058 both run to 2026-10-16 whichever way this goes, because each fixes
documents that lose their meaning with or without `S-7`; the rules land on
2026-10-17 and the tag follows on 2026-10-18. What the first option buys is not
time but **certainty** — it stops the tag depending on a search that has turned
up a new shape on every day it has been run.

### Deferred past 0.1.0

Nothing. #40 was deferred here on 2026-09-15 — the issue had several credible
designs, each with a cost, and choosing one in the time left would have meant
choosing without a comment period able to test it. **The deferral was withdrawn on
2026-09-29**, when accepting RFC 0039 made the same defect produce a tree no
implementation may project. Releasing over that is not a decision anyone can write
down as acceptable, so it moves into the table above.

### Process notes

Three changes above landed without the comment period [`GOVERNANCE.md`
§3](GOVERNANCE.md#3-classes-of-change) sets for their class.

| Change | Required | What happened |
|---|---|---|
| RFC [0016](rfcs/0016-remove-node-identity.md), Normative | 14 days, ending 2026-08-27 | Decision written and merged **2026-08-26**, one day early. Recorded in the RFC's own `Correction` section |
| `P-10` ([#25](https://github.com/mindmapmarkdown/spec/pull/25)), Clarifying | 3-day comment period | Opened and merged the same day, **five minutes apart** |
| Canonical examples ([#30](https://github.com/mindmapmarkdown/spec/pull/30)), Clarifying | 3 days, ending 2026-08-29 | Opened and merged **four minutes apart** |

After the third, the fix was a mechanism rather than a fourth promise: the
comment period goes in the pull request **title**, and a change whose period is
open is not called ready
([#31](https://github.com/mindmapmarkdown/spec/pull/31)). RFC
[0022](rfcs/0022-front-matter-root-content.md) is the first decision here whose
period ran in full — 2026-08-26 to 2026-09-09, decided 2026-09-11.

None of them could have changed anything. There were no participants and no
objection at any point, so no comment could have arrived in the time that was
skipped.

**That is why nothing was lost. It is not a reason for the periods to be
optional.** If silence makes a 3-day period pointless it makes a 14-day one
pointless too, and a 14-day period on RFC
[0022](rfcs/0022-front-matter-root-content.md) was, when this was written, the
binding constraint on 0.1.0. A project whose case against OPML is that its process was
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
[0022](rfcs/0022-front-matter-root-content.md), which was then the one holding
0.1.0.

---

*This document is licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). See
[`LICENSE`](LICENSE) for the licensing of this repository as a whole.*
