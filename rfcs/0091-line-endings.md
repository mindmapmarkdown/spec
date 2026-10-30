# RFC 0091: What a line ending is

**Translations** — [한국어](ko/0091-line-endings.md). This English text is the
authoritative one; a translation is a reading aid and carries no normative force,
and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-30 |
| **Comment period ends** | 2026-11-13 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/91> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

`spec.md` says nothing about line endings, and the asymmetry is already visible
in its own text: **`P-8` fixes the output side** — *the document MUST end with
exactly one line feed* — and nothing fixes the input side. So a carriage return
reaches `source` and `label`, where `P-8` forbids it.

This RFC adds one rule, `L-12`: a line ending is a line feed, a carriage return
and a following line feed, or a carriage return alone, and lift records every one
of them as a single line feed.

**Under the rules accepted on 2026-10-29, 103 of 782 real files — 13.2% — are not
conforming documents without it.** With it, none is. No document's meaning
changes and no tree loses anything a view can show.

## Motivation

### What goes wrong today

`E-5` records a block's source as the document has it. `P-9` writes that source
back as it stands. `P-8` forbids a line ending in whitespace. In a CRLF document
every line of a multi-line recorded source ends in a carriage return, which is
whitespace.

| | |
|---|---|
| Document | `# A`, blank, `one`, `two` — written with CRLF |
| `source` recorded today | `one␍␊two` |
| Canonical projection | writes it back, so a line ends in `␍` |
| `P-8` | forbids it |

This is the collision `L-9` resolved for hard breaks and `L-10` resolved for
front matter, met a third time. Both were resolved by normalising at lift, and
`L-9`'s rationale says why there rather than at projection: *"if the tree kept
the spelling and projection changed it, the first round-trip would already
produce a different tree."*

### Why it is blocking now and was not three weeks ago

Before 2026-10-29 a carriage return left a tree with **no canonical projection**,
and no rule turned that into a verdict about the document: the tree was simply
unwritable, in a corner nobody measured. RFC
[0085](0085-well-formed-or-not-conforming.md), accepted that day, makes a
document whose tree is not well-formed **not a conforming document**. The same
defect is now a refusal.

So this is not a new problem. It is an old problem that acquired a consequence,
and the consequence is the one `CHANGELOG.md`'s *Open before 0.1.0* table is
about: a Normative question decided after a release is Breaking rather than
Normative.

### How far it reaches

`tools/corpus.mjs` over every `.md` file in `easymindmap` including
`node_modules`, plus this repository and `mindmapmd` — 782 files, 8.7 MB,
measured 2026-10-30 on `mindmapmd` `main` at `6b31490`:

| | files | refused | ill-formed | no canonical projection | failed the round trip |
|---|---|---|---|---|---|
| normalising | 782 | **0** | 0 | 0 | 0 |
| **as `spec.md` has it** | 782 | **103 — 13.2%** | 0 | 0 | 0 |

**186 of the 782 — 23.8% — carry a carriage return**, and every one of them is
CRLF; the corpus contains no lone carriage return at all. That is the ordinary
case for a file written on Windows, not an edge case.

All 103 refusals name `S-7`: 102 because the canonical projection is not a
document lift accepts, and one because it lifts to a different tree.

**The sweep cannot see any of this.** `tools/sweep.mjs` builds documents from
fragments and never emits a carriage return, whatever its seed count. The corpus
is the only instrument that reaches it, which is why the gap survived six RFCs
measured over hundreds of thousands of generated documents.

### The reference implementation is already ahead of the specification

This is the part that should decide the urgency rather than the percentage.

`mindmapmd` `main` normalises line endings today. The line arrived on 2026-10-23
as part of the RFC 0085 prototype — without it the corpus could not be measured
at all under RFC 0067 — and reached `main` on 2026-10-29 when that work merged.
**It has never been proposed, argued or decided.**

So a second implementation, written from `spec.md` alone by someone who has not
read this file, would disagree with the reference implementation about 186 real
files out of 782. That is precisely the failure §1.2.4 L1 exists to prevent, and
it is worse than the defect itself: a specification can be wrong and still be
interoperable, but it cannot be silent and interoperable.

## Detailed design

### `L-12`, new

> **L-12.** A **line ending** is a line feed (U+000A), a carriage return (U+000D)
> followed by a line feed, or a carriage return not followed by a line feed. Lift
> MUST record every line ending as a single line feed. No `label` and no `source`
> may contain a carriage return.

That is the whole change. No `E-`, `S-` or `P-` rule moves, and no tree gains or
loses an entry.

The three spellings are CommonMark's own (§2.1), quoted rather than invented so
that this specification cannot disagree with the parser underneath it. **Every
carriage return in a Markdown document is a line ending by that definition** —
one followed by a line feed, or one not followed by one — so the second sentence
and the third say the same thing from the two sides, and the third is the one an
implementation can test.

### Why one sentence is enough, and why it is nevertheless needed

commonmark.js 0.31.2 splits on `/\r\n|\n|\r/`, so the **parser** already agrees
with the definition above. The carriage return does not survive because the
parser kept it. It survives because this specification does not read the
document through the parser: `E-4` and `E-5` record text **as the document has
it**, taken by line and column from the source, and those lines still carry what
the file carried.

So deferring to CommonMark is not available. The parser's agreement is what makes
the fix one line rather than a rewrite, and the fact that the rules read the
source directly is what makes the sentence necessary at all.

### Where it belongs

With `L-9`, `L-10` and `L-11` — the rules that record what a construct **means**
rather than how it was spelled, each resolving the same collision between `E-5`,
`P-9` and `P-8`. `L-12` is the fourth and, as far as the corpus can tell, the
last: after it no recorded string contains a character `P-8` forbids that the
document did not put there deliberately.

### Round-trip consequence

- **Trees.** A CRLF document and the same document saved with line feeds now lift
  to the **same** tree. Today they lift to two different trees, because `E-7`
  compares sequences of code points — or, under RFC 0085, the first lifts to
  nothing at all. Nothing in `spec.md` says those two documents should differ,
  and nothing says they should not; this says they do not.
- **Conforming documents.** 103 of 782 real files **start** conforming. **No
  document stops.** This is the only rule proposed this cycle that is a pure
  widening.
- **Canonical documents.** A CRLF document is conforming and not canonical; its
  bytes settle to line feeds on the first round trip. That is the same cost
  `L-9` and `L-10` already pay, named in their own rationale.
- **The suite.** No existing example changes. Every example in `spec.md` is
  written with line feeds, and `examples/examples.json` is generated from it.

### Edge cases

| | |
|---|---|
| A lone carriage return | A line ending, recorded as a line feed. Zero occurrences in 782 files; included because CommonMark includes it |
| Mixed endings in one file | Every ending becomes a line feed. The document is conforming and not canonical |
| Front matter (`L-10`) | Normalised before `L-10` runs, so a CRLF front-matter block records line feeds. `L-10` already removes trailing whitespace for the same reason |
| A code block (`L-11`) | Its content's line endings become line feeds too — see *the honest cost* below |
| A document with no final line ending | Untouched. `P-8` already says the canonical form ends with exactly one line feed |
| `&#13;` written as five characters | Not a carriage return and not touched. The rule is about the code point |

**The honest cost.** A fenced code block that deliberately carried CRLF loses it,
and for a block holding, say, an HTTP exchange or a fixture file those bytes were
the content. The alternative is to exempt `code_block` from the rule, which would
leave exactly the trees this RFC is written to fix — `P-8` exempts a code block's
*trailing whitespace*, not a carriage return in the middle of a recorded string,
and the exemption would have to be widened to cover it. This is the same trade
RFC [0057](0057-multi-line-label.md) Part 2 made for an HTML block's trailing
whitespace, stated the same way: in the open rather than discovered later.

Bounds: one pass over the document text before anything is parsed. Nothing is
decided by looking at structure.

### How it is tested

The prototype is
[`rfc/0091-line-endings`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/0091-line-endings),
on `main` at `6b31490`. It adds `MMD_CRLF=0`, which lifts **without**
normalising — that is, as `spec.md` requires today — so both columns of the table
above come from one branch that differs in nothing else. This is the same shape
as `MMD_E5` on `rfc/0079-on-accepted` and `MMD_P1` on `rfc/0057p1-on-0085`, and
for the same reason: a rule that is argued by comparison has to be measured
without anything else moving.

230 tests, 230 pass.

An example for `spec.md` is **not** proposed. The suite's examples are written
inside `spec.md` and extracted by `tools/extract-examples.mjs`, and a Markdown
file cannot carry one line ending in one example and another in the next without
the repository's own tooling normalising it. Stating that limitation is worth
more than an example that cannot be trusted; it is the same gap RFC 0085's
unresolved question 1 describes, reached from another direction.

## Alternatives

**Do nothing.** 103 of 782 real files are not conforming documents, the reference
implementation goes on disagreeing with the specification, and the first answer
after 0.1.0 is Breaking. Rejected.

**Exempt the carriage return from `P-8`.** One clause, and the documents keep
conforming. It puts a whitespace character back into the one rule written to keep
whitespace out, and it leaves `E-7` equality depending on which editor saved the
file — so a conformance suite could not state an expected tree without also
stating a line ending, and two implementations could both be right about the same
document. Rejected.

**Normalise at projection rather than at lift.** The tree would keep the carriage
return and projection would drop it, so lifting the projection gives a different
tree and §1.2.4 L1 fails on the first round trip. This is the argument `L-9`
already made for hard breaks; it does not need making twice. Rejected.

**Record the document's line ending in the tree**, as a root property, so that
projection can write the file back exactly. It round-trips, and it is arguably
the most faithful answer. It also adds a member to the encoding for something no
view can show and no consumer of a tree has asked for, and it would make two
documents with the same structure unequal under `E-7` — which is the defect, not
the fix. Rejected.

**Prior art.** CommonMark defines a line ending in §2.1 and this RFC adopts that
definition verbatim. Pandoc, Jekyll and gray-matter all accept CRLF silently and
none claims a document round trip, so none has had to say what it records. The
one project that does make the claim and has met this question is
[CommonMark's own reference implementations](https://spec.commonmark.org/0.31.2/#line-endings),
which normalise, and this agrees with them.

## Unresolved questions

**Whether §1.2.3's definition of *document* should mention it.** That paragraph
says a document is *"a sequence of Unicode code points forming a valid CommonMark
document"*, which already settles it indirectly through CommonMark §2.1. A cross
reference would help a reader who starts at the terms. Editorial, for the
`spec.md` edit rather than for this decision.

**A code block that deliberately carries CRLF.** Named in *Edge cases* and not
settled. If someone reports a real document of that shape, the answer should
change — the precedent is [#35](https://github.com/mindmapmarkdown/spec/issues/35),
where a reader's report turned down RFC 0037 after it had been argued for. Zero
such blocks in 782 files, which is evidence and not proof.

**The measurement switch.** `MMD_CRLF` exists to make this decision and should be
removed when it is made, together with `MMD_P1`, whose decision was made on
2026-10-29. Neither belongs in a reference implementation once the rule it
compares is settled. Not a specification question; recorded so it is not
forgotten.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
