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
| [#35](https://github.com/mindmapmarkdown/spec/issues/35) — `L-10` swallows a document that opens with a thematic break and carries a later one. RFC [0037](rfcs/0037-front-matter-opening-thematic-break.md) proposed keeping `L-10` and was **rejected 2026-09-28**: a reader reported writing every note that way. A second reader then pointed out that **Pandoc already has the replacement rule** | RFC 0048 ([#48](https://github.com/mindmapmarkdown/spec/pull/48)) — front matter does not open on a blank line | 2026-10-11 |
| Whether an ordered list's numbers are part of the tree — left open by RFC [0004](rfcs/0004-canonical-hierarchy.md), and **missing from this list until 2026-09-15** | RFC [0039](rfcs/0039-ordered-lists.md) — ordered items record their ordinal and delimiter | **Accepted 2026-09-29.** The rules land in `spec.md` as their own pull request |
| [#40](https://github.com/mindmapmarkdown/spec/issues/40) — projection drops every link reference definition. **Deferred on 2026-09-15; the deferral was withdrawn on 2026-09-29**, because RFC 0039 turns the loss into an ill-formed tree: ordered lists separated by a definition lift to a restart with nothing between them, which `S-5` rejects and `S-3` requires refusing to project | RFC 0051 ([#51](https://github.com/mindmapmarkdown/spec/pull/51)) — a definition is node content, recorded opaquely | 2026-10-13 |
| [#45](https://github.com/mindmapmarkdown/spec/issues/45) — an item with a label whose first child has an empty label has no canonical projection, so a tree lift produces cannot be written back | RFC [0046](rfcs/0046-empty-first-child.md) — one blank line between the label and the nested list in that position | **Accepted 2026-10-01.** Lands with 0051, 0057 and 0058 |
| [#55](https://github.com/mindmapmarkdown/spec/issues/55) — a multi-line label below the top level keeps the indentation of the item holding it, and `P-4` adds it again, so the document does not survive the round trip. Found 2026-10-02 | RFC 0057 ([#57](https://github.com/mindmapmarkdown/spec/pull/57)) **Part 1** — a label's later lines lose what the first line gave up, and `P-1` writes them back at the node's content column | 2026-10-16 |
| [#59](https://github.com/mindmapmarkdown/spec/issues/59) — a recorded `source` or `label` whose line ends in whitespace has **no** canonical projection: `P-9` writes it back and `P-8` forbids the result. One stray space at the end of a paragraph is enough. Found 2026-10-02 | RFC 0057 ([#57](https://github.com/mindmapmarkdown/spec/pull/57)) **Part 2** — no line of a recorded string ends in whitespace, except a code block's content | 2026-10-16 |
| [#56](https://github.com/mindmapmarkdown/spec/issues/56) — a content entry whose `source`, written where `P-9` writes it, is read back as a different construct. **Two arrangements.** First: a definition leaves a paragraph whose first line is a paragraph only because it cannot interrupt one, and after `P-7`'s blank line that line opens a list. Second, found later the same day: a paragraph whose source is *exactly* a definition — `[y]: /y` then `---` — becomes a definition when written with a blank line after it | RFC 0058 ([#58](https://github.com/mindmapmarkdown/spec/pull/58)) answers the **first**, and was **revised on 2026-10-05**: keeping the paragraph adjacent is not enough, because a definition ends the paragraph it came out of and `- a` or `=` below it starts a block. The line is also indented four columns, the fewest at which no CommonMark block begins. The second arrangement was **not a specification question at all** — commonmark.js leaves an empty paragraph behind, covering the definition's own line, and lift recorded an entry for it. Fixed in [mindmapmd#11](https://github.com/mindmapmarkdown/mindmapmd/pull/11) | 2026-10-19 for the first; the second needs nothing |
| [#64](https://github.com/mindmapmarkdown/spec/issues/64) — a section's `label` can contain a line break and an ATX heading cannot carry one, so a setext heading spanning two lines has no canonical projection. Found 2026-10-02 | RFC 0067 ([#67](https://github.com/mindmapmarkdown/spec/pull/67)) — **Part 1**: a soft line break in a label is one space, because a soft break in a heading renders as one. **Part 2**: `S-8`, a section's label may not contain a line feed, which after Part 1 only a hard break can do | 2026-10-16 |
| [#74](https://github.com/mindmapmarkdown/spec/issues/74) — `E-5`'s indentation removal can turn a lazy continuation line into a block. `␣␣cont` then `␣␣␣␣- n3` is one paragraph; the recorded source loses two columns from the second line, and at two columns a list item interrupts a paragraph, so the projection lifts to a paragraph **and a node**. No canonical document exists for that tree. Found 2026-10-04 | RFC 0079 ([#79](https://github.com/mindmapmarkdown/spec/pull/79)) — `E-5` removes the **lesser** of what the first line gave up and what `P-4` will add. Three other answers were measured and all three fail: the container's column (RFC 0038's rejected alternative) takes 139 failures to 1,289; "as many as `P-4` will add" fixes this document and breaks a block quote attached across a container boundary; removing all leading whitespace is strictly worse | 2026-10-19 |
| [#71](https://github.com/mindmapmarkdown/spec/issues/71) — what an item's `label` is when its first block is not a paragraph. RFC 0043 named it and did not answer it. `-` then `␣␣---` took the label `---`, and `- ---` is itself a thematic break, so that tree had no canonical projection; `-` then `␣␣> q` lifted to a node *named* `> q`. Found 2026-10-03 | RFC 0072 ([#72](https://github.com/mindmapmarkdown/spec/pull/72)) — **Part 1**: only a paragraph can be a label, and any other first block is content. **Part 2**: `P-4` may not indent to four columns when the item begins with a blank line, where CommonMark reads four as code | 2026-10-17 |
| [#61](https://github.com/mindmapmarkdown/spec/issues/61) — an empty-labelled item whose content is a definition loses its children: `P-7`'s blank line before the content, plus the blank line before the child, leaves two in a row once the definition is read out, and two blank lines end the item. Found 2026-10-02 | RFC 0069 ([#69](https://github.com/mindmapmarkdown/spec/pull/69)) — the first `content` entry follows the marker directly when the label is empty **and** there are children. The same sentence without the second condition was written into RFC 0058 and withdrawn the same day: it fixed 27 documents and broke 81 | 2026-10-16 |

Two of the nine remaining are decided, and six are open with periods — RFC 0048
to 2026-10-11, RFC 0051 to 2026-10-13, RFC 0057 Parts 1 and 2 and RFC 0069 to
2026-10-16, RFC 0072 to 2026-10-17, and — **as of 2026-10-05** — RFC 0079 and
the revised RFC 0058 to 2026-10-19. One had no proposal when this was written:
[#74](https://github.com/mindmapmarkdown/spec/issues/74), found on 2026-10-04 and
answered by RFC 0079 the day after.

**Correction, the same day: #74 does hold the release, and the sentence that
first stood here said it did not.** That sentence was written on the assumption
that #74 only mattered to `S-7`. It does not. RFC 0038 Part 1 is already in
`spec.md`, so `␣␣cont` then `␣␣␣␣- n3` is a **conforming document today** whose
canonical projection lifts to a different tree — and §1.2.4 L1 requires of an L1
implementation that "lifting the canonical projection of a tree MUST yield that
same tree". With or without `S-7`, 0.1.0 would ship a conformance level that no
implementation can satisfy for a document the specification accepts.

Deferring `S-7` does not avoid that; it only changes which sentence is wrong.
With `S-7`, §2.4's claim that lift cannot produce an ill-formed tree is false of
that document. Without it, §1.2.4's L1 is unsatisfiable for it. **The only way
to have neither is to answer #74**, so the release follows its period and not
RFC 0072's.

**#74's period, set 2026-10-05: 2026-10-19.** RFC 0058's revision of the same day
restarts its period and ends on the same date, so the last two open periods close
together and the tag follows them rather than RFC 0072's 2026-10-17.

**The accepted rules do not all land at once.** RFC 0038 landed on its own and
has left this table; see *Changed* above. RFC 0039 and 0046 land together with
0051, 0057 and 0058, because until 0051 closes lift still produces a tree §2.4
rejects: with 0039 accepted, a conforming document whose ordered lists are
separated by a link reference definition lifts to a restart with nothing between
them, which `S-5` rejects. A specification that states a rule it breaks is worse
than one that waits a fortnight.

**`S-7` is no longer in that list.** Its landing was deferred past 0.1.0 on
2026-10-02; see *Deferred past 0.1.0* below.

**The 2026-10-01 wording of that paragraph said `S-5` and `S-7` were "both false"
while definitions are dropped.** That was imprecise: `S-5` is the rule a dropped
definition violates, and `S-7` was blocked because the definition of well-formed
that contains it would then be false of a tree lift produces. The sequencing for
0039 is unchanged.

### Found on 2026-10-02 — four more holes under `S-7`, and how

A sweep over 40,000 generated documents, run against the reference
implementation with every accepted and proposed rule merged together, checking
each document's tree round trip and each tree against `S-7`. **Nine hundred
failed.**

| Cause | Count | Where it went |
|---|---|---|
| A block's starting column was taken from the parser, which reports the column of the paragraph a definition was removed from | 595 | **Not a specification gap.** Fixed in [mindmapmd#8](https://github.com/mindmapmarkdown/mindmapmd/pull/8), and again in [#10](https://github.com/mindmapmarkdown/mindmapmd/pull/10) for the opposite error — an *indented* definition made the reported column too large, and `␣␣[x]: /x` then `abcd` recorded the source `cd`, two characters silently dropped |
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

### Found on 2026-10-03 — the sweep had a blind spot

Two of the four fixes above were implementation bugs rather than gaps, and so was
the second arrangement of #56: commonmark.js leaves an **empty paragraph** behind
when a definition consumes a whole paragraph and the next line closes it, and
lift recorded a content entry for it whose `source` was the definition
([mindmapmd#11](https://github.com/mindmapmarkdown/mindmapmd/pull/11)).

Diagnosing that exposed something worse. **The sweep reported zero over 240,000
documents in a configuration where two defects were still live**, because its
generator could not put a construct inside a list item: every fragment that could
be a list item's first block existed only at column 0. A sweep that cannot reach
a known failure overstates what its zero means, and that zero was the most
load-bearing number in the week's work ([mindmapmd#12](https://github.com/mindmapmarkdown/mindmapmd/pull/12)).

With the generator fixed, the configuration where every open proposal lands
reported **136 ill-formed documents in 40,000** where it had reported none. All
136 are [#71](https://github.com/mindmapmarkdown/spec/issues/71) — the question RFC 0043 named and did not answer —
and RFC 0072 takes them to zero, and to zero over 300,000 documents across five
seeds.

### Found on 2026-10-05 — #74 answered, and the rule that was nearly wrong

[#74](https://github.com/mindmapmarkdown/spec/issues/74) is answered by RFC
[0079](https://github.com/mindmapmarkdown/spec/pull/79), and the first answer
written for it was wrong in a way only a second generator caught.

`E-5` removes, from each line of a content block after the first, as many columns
as **the block's first line gave up**; `P-4` puts back as many as **the node's
content column** says. The two agree for almost every document, and #74 is a
document where they do not: `␣␣cont` with `␣␣␣␣- n3` under it is one paragraph
attached to the root, which `P-4` does not indent, so the second line came back
at two columns where a list marker opens a list.

The repair that comes to mind — remove as many as `P-4` will add — was
prototyped, measured at 139 failures down to 46, and **it breaks a second
document**:

```markdown
- a
> q
> r
␣␣␣␣- n3
```

The block quote begins at column 0, outside the item, and `L-3` attaches it to
the item anyway, so `P-4` adds two columns to a block that gave up none. Take the
item's two off the continuation line and it comes back two columns past the
content column rather than four — the same failure from the opposite direction.
Attachment is not containment, and that is the whole of #74.

So `E-5` removes **the lesser of the two**. What makes this worth a paragraph in
a changelog is how close it came to shipping wrong: on the generator that found
#74, "as many as `P-4` will add" scores about 1 failure in 40,000, and against
the narrower generator the branch was first measured with it scores **27 where
`E-5` as it stands scores none**. One generator reported zero for a rule the
other showed to be broken. Two were needed to see it, and nothing but luck put
the second one in the loop.

The second arrangement of [#56](https://github.com/mindmapmarkdown/spec/issues/56)
fell with it. RFC 0058's rule keeps a paragraph adjacent to the definition it was
taken out of; adjacency is not enough, because a definition **ends** the
paragraph it came out of and the line below starts a block of its own unless it
cannot — `- a` opens a list, `=` underlines a setext heading and swallows the
definition with it. **RFC 0058 was revised the same day**: the line is also
indented four columns, the fewest at which no CommonMark block begins, so it can
only be the lazy continuation line it was. Its comment period restarts and ends
2026-10-19.

With #74's rule, 0058's revision and one lift bug
([mindmapmd#15](https://github.com/mindmapmarkdown/mindmapmd/pull/15) — `labelOf`
trusted a stale column where `linesOf` had been taught to measure one, so a label
`\-` was recorded as `-` and projection wrote a list marker), the 0.1.0
configuration reports **zero ill-formed documents over 240,000, across six
seeds**.

What that zero is worth is in *Deferred past 0.1.0* below, and it is less than it
looks.

### The tail, and the decision taken on it

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

That exchange forced a choice, and on **2026-10-02 the maintainer took it:
`S-7`'s landing is deferred past 0.1.0.** See *Deferred past 0.1.0* below. The
rule stands — RFC 0043 is accepted and is not reopened — and what is deferred is
writing it into `spec.md`.

The alternative was to hold the tag until the family is closed. It was rejected
because the family's size is not known: the sweep has turned up a new shape on
every day it has been run, and **#64 shows the family is not even `S-7`'s** — a
well-formed tree with no canonical projection, like #45 and #59, which blocks the
release whichever way `S-7` goes — and it is now answered by RFC 0067, which
records a soft line break in a label as a space because that is what a renderer
shows, and refuses the hard-break remainder with `S-8`. A release date that depends on an unfinished
search is not a date.

Neither option moved the date much. RFC 0057 and RFC 0058 run to 2026-10-16
either way, because each fixes documents that lose their meaning with or without
`S-7`; the rules land on 2026-10-17 and the tag follows on 2026-10-18. What the
deferral buys is not time but **certainty**.

### Where the rules came from

Both external contributions this project has had are on the same question, and
both changed it.

The first was a **report**: asked on the Obsidian forum whether anyone writes
files that open with `---` as a rule, a reader answered that he writes every
note that way. RFC 0037 had proposed keeping `L-10` on the grounds that the
shape was hypothetical, and was **rejected** on 2026-09-28 because it is not.

The second was a **citation**, from [@Vituartzz](https://github.com/markmap/markmap/discussions/363) on markmap discussion
[#363](https://github.com/markmap/markmap/discussions/363) on 2026-10-01, and it is the more useful of the two. Pandoc's
manual ([§8.10.2](https://pandoc.org/demo/example33/8.10-metadata-blocks.html))
says:

> A YAML metadata block is a valid YAML object, delimited by a line of three
> hyphens (`---`) at the top and a line of three hyphens (`---`) or three dots
> (`...`) at the bottom. **The initial line `---` must not be followed by a blank
> line.**

That last sentence is RFC 0048's rule. The RFC's *Prior art* table had three
rows — Jekyll, gray-matter, Hugo — and concluded that the rule was stricter than
every tool examined; **that conclusion was the weakest part of the proposal**,
because a specification inventing a condition no implementation has is usually
wrong. It now reads the other way round.

The same reply proposed Pandoc's other half, requiring the block to parse as a
YAML object. It is rejected — deciding that needs a YAML parser, and §1.1.2
keeps this specification out of owning a metadata format — but the rejection is
now written with the measurement that shows **§1.2.4 L0 prefers the other answer
for one shape**, and the residual is RFC 0048's unresolved question 3 rather than
nothing. `L-10` is not parsing the block in 0.1.0, and what that costs is
written down.

Neither contribution came from someone building an implementation, which is
what [`GOVERNANCE.md` §5](GOVERNANCE.md#5-phase-transitions) counts toward Phase 1.
Both changed the specification anyway, and the second changed how confident the
project is entitled to be about a rule it had already written.

### Deferred past 0.1.0

**`S-7` — RFC [0043](rfcs/0043-well-formed-round-trip.md)'s rule. Deferred
2026-10-02.** The RFC is accepted and stays accepted; what is deferred is writing
the rule into `spec.md`, which moves it to 0.2.0.

Why, in the order the reasons matter:

1. **§2.4 would state a claim the specification breaks.** `S-7` comes with "lift
   cannot produce a tree that is not well-formed", and four documents that do
   exactly that were found on 2026-10-02 after the decision said there were two.
   **Updated the same evening:** #61 was answered by RFC 0069
   ([#69](https://github.com/mindmapmarkdown/spec/pull/69)) — the sentence that failed earlier in the day, with the
   second condition it was missing — and the claim is still false, of the second
   arrangement of [#56](https://github.com/mindmapmarkdown/spec/issues/56). A paragraph whose source is exactly a
   link reference definition becomes one when it is written with a blank line
   after it, and no spelling has been found that avoids it. It is all 298
   failures the 0.1.0 configuration still has.
2. **The remaining question is a different one.** #61 is the open question RFC
   0043 named and did not answer — what an item's label is when its first block
   is not a paragraph — reached from another direction. `S-7` cannot be made true
   by rules about blank lines; it needs that question answered first, and that is
   a design problem, not a fortnight's drafting.
3. **The date would depend on a search.** `tools/sweep.mjs` has found a new shape
   on every day it has been run. Holding a release until a search stops finding
   things is not a schedule.

**What is not deferred.** Every rule the sweep's findings produced lands in
0.1.0, because each fixes a document that silently loses its meaning whether or
not `S-7` exists to name the loss: RFC 0039, 0046, 0048, 0051, 0057 and 0058.
`S-7` is the rule that *finds* such documents; it is not what fixes them.

**What this costs.** §2.4 stays as it is: a tree can be well-formed by shape and
still project to a document that lifts to something else. An L2 implementation
diffing trees can therefore still be surprised, and the specification has no
sentence to point at. That is the state 0.1.0 ships in, said plainly rather than
left to be discovered.

**What has to happen before it lands in 0.2.0.** #61 answered, the label question
behind it answered, and `tools/sweep.mjs` reporting zero over a run large enough
to mean something — stated as a condition now, so that the next person does not
have to argue for it.

**Update, 2026-10-03: all three are now in hand, and none is decided.** #61 is
answered by RFC 0069, the label question by RFC [0072](https://github.com/mindmapmarkdown/spec/pull/72)
([#71](https://github.com/mindmapmarkdown/spec/issues/71)), and with both prototyped the sweep reported zero over
300,000 documents across five seeds with `S-7` active. On the strength of that,
withdrawing this deferral was recommended for 2026-10-17 — **with a trigger
attached**: if a broadened sweep found a seventh shape before then, the deferral
would stand.

**Update, 2026-10-04: it did, so the deferral stands.** The sweep's generator was
widened on purpose — 79 fragments instead of 34, twelve per document instead of
six, a second generator that mutates conformance-suite documents, and failures
shrunk before they are printed ([mindmapmd#13](https://github.com/mindmapmarkdown/mindmapmd/pull/13)). On the identical
configuration, identical seed and count:

| Generator | Ill-formed in 40,000 |
|---|---|
| the narrow one | **0** |
| the wider one | **139** |

All 139 are [#74](https://github.com/mindmapmarkdown/spec/issues/74), and it has no proposal. **The question
pencilled in for 2026-10-17 is therefore answered in advance, against the
recommendation made the day before**, which is what the trigger was for: a
release date should not depend on how hard anyone happened to look.

What this says about the three conditions is that the third was never a
threshold a single run could clear. It is restated: the sweep reporting zero
**on a generator that has stopped finding new shapes when it is widened**. Twice
in three days, widening it found something; until that stops being true, zero
means the generator and not the specification.

**Update, 2026-10-05: the 139 are answered, and the third condition is still not
tested.** #74 has a proposal — RFC [0079](https://github.com/mindmapmarkdown/spec/pull/79) —
and with it, the revision to RFC 0058 and
[mindmapmd#15](https://github.com/mindmapmarkdown/mindmapmd/pull/15), the sweep
reports zero over 240,000 documents across six seeds with `S-7` active.

That is zero on **the same generator as 2026-10-04**. The condition as restated
that day asks for zero on a generator that has stopped finding new shapes when it
is widened, and the generator has not been widened since. So the first two
conditions are in hand and awaiting decisions — #61 by RFC 0069, the label
question by RFC 0072 — and the third is untested, not met.

**What has to happen, and by when.** Widen `tools/sweep.mjs` again and run it on
the full configuration, before the last of the open comment periods ends on
**2026-10-19**. If it finds a new shape, the deferral stands and 0.1.0 ships with
§2.4 as it is. If it does not, withdrawing the deferral goes to the maintainer
with the 2026-10-19 decisions. The recommendation is not made here, because
making it before the run is what the trigger of 2026-10-03 was added to prevent.

There is a reason to expect it may find something. Both defects found on
2026-10-05 were found by *changing* the configuration rather than by widening the
generator: one by prototyping a rule and measuring it, one by running the same
sweep against a second generator. Two of the week's shapes were reached that
way, and that is not a direction the sweep searches at all.

---

#40 was deferred here on 2026-09-15 — the issue had several credible designs,
each with a cost, and choosing one in the time left would have meant choosing
without a comment period able to test it. **The deferral was withdrawn on
2026-09-29**, when accepting RFC 0039 made the same defect produce a tree no
implementation may project. Releasing over that is not a decision anyone can
write down as acceptable, so it moved into the table above.

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
