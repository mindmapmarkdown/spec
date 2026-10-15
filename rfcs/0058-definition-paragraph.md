# RFC 0058: A paragraph after a definition keeps its line

**Translations** — [한국어](ko/0058-definition-paragraph.md). This English text is
the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-02 |
| **Comment period ends** | 2026-10-19 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/58> |
| **Supersedes** | — |
| **Superseded by** | — |

> **Revised on 2026-10-05, and the comment period restarts with it** — it ran
> from 2026-10-02 and now ends 2026-10-19. The rule proposed on 2026-10-02 kept
> the paragraph adjacent to the definition; adjacency turns out not to be enough,
> and the rule now also indents the line. What changed and why is in *Detailed
> design*; the original wording is quoted there rather than deleted.

## Summary

CommonMark takes a link reference definition out of the paragraph it was written
in, so the paragraph left behind can begin with a line that is a paragraph only
*because* it cannot interrupt one. `P-7` puts a blank line before that paragraph,
after which the same line opens a list — the paragraph stops being content and
becomes a node ([#56](https://github.com/mindmapmarkdown/spec/issues/56)).

This RFC adds one sentence to `P-7`: a paragraph directly after a
`link_reference_definition` entry is written on the line below it, with no blank
line, and its first line is indented four columns — the fewest at which no
CommonMark block begins, so the line can only be the continuation line it was.
**The tree does not change and no document stops conforming.**

## Motivation

### What goes wrong today

Two conforming documents, with RFC [0051](https://github.com/mindmapmarkdown/spec/pull/51)
recording the definition as node content:

```markdown
[x]: /x
1.
```

```markdown
[x]: /x
2. a
```

CommonMark lets a list interrupt a paragraph only when the item is non-empty
and, if ordered, starts at 1. Neither line qualifies, so each document is a
definition and a one-line paragraph, and each lifts to two content entries:

| Document | `content` |
|---|---|
| the first | `link_reference_definition` · `[x]: /x`, then `paragraph` · `1.` |
| the second | `link_reference_definition` · `[x]: /x`, then `paragraph` · `2. a` |

`P-7` separates each block of node content from the next with a single blank
line, so canonical projection writes:

```markdown
[x]: /x

1.
```

After a blank line that line interrupts nothing, so CommonMark reads it as a
list. Lifting the projection gives **one** content entry and **one node** — the
paragraph has become an item. `S-7` rejects the tree, and §2.4 says lift cannot
produce a tree `S-7` rejects.

Measured against the reference implementation with RFC 0039, 0043, 0046, 0048 and
0051 all merged, at `mindmapmd@e321e80`.

### Why it is now blocking

`S-7` ([RFC 0043](0043-well-formed-round-trip.md), accepted 2026-10-01) makes a
tree well-formed only if its canonical projection lifts back to it. That
decision named two holes to close before `S-7` could land —
[#45](https://github.com/mindmapmarkdown/spec/issues/45) and
[#40](https://github.com/mindmapmarkdown/spec/issues/40). RFC
[0057](https://github.com/mindmapmarkdown/spec/pull/57) is a third. This is the fourth, and it was found
only once 0051 was in place: without it the definition is dropped and the
paragraph is the document's only content, so the defect was hidden behind a
larger one.

### How it was found

A sweep over 40,000 generated documents, checking each document's tree round
trip and each tree against `S-7`. Nine hundred failed. Two causes were separated
out first — an implementation bug in how a block's starting column was measured
([mindmapmd#8](https://github.com/mindmapmarkdown/mindmapmd/pull/8)) and the
multi-line label of RFC 0057 — and this family is the remaining **270**.

### Who hits it

Few people on purpose. The two shapes above are what a definition followed
immediately by an unlucky line produces, and nobody writes them deliberately. But
the rule they break is the one this format exists for, and `S-7` is the rule that
says so; a gap in it cannot be left open and called a release.

## Detailed design

### `P-7`, amended

A sentence is added:

> A `paragraph` entry that directly follows a `link_reference_definition` entry
> in the same node's `content` MUST be written on the line immediately below it,
> with no blank line between them, and its first line MUST be indented four
> columns beyond the node's content column.

That is the whole change. No `L-`, `S-` or `E-` rule moves, and the tree is
untouched.

#### Revised, 2026-10-05 — adjacency is not enough

The sentence proposed on 2026-10-02 ended at the blank line:

> A `paragraph` entry that directly follows a `link_reference_definition` entry
> in the same node's `content` MUST be written on the line immediately below it,
> with no blank line between them.

It is not sufficient, and the reason is the one this RFC is about, applied once
more. **A definition ends the paragraph it was taken out of.** So the line below
it does not continue anything — it starts a block of its own, unless it cannot:

| Below the definition | What the line does at column 0 |
|---|---|
| `- a` | opens a list; a bullet list **can** interrupt a paragraph |
| `=` | underlines a setext heading, and swallows the definition's line into it |
| `***` | opens a thematic break |

`1.` and `2. a` — the two documents in *Motivation* — are safe at column 0,
because an empty ordered item and a list that does not start at 1 cannot
interrupt a paragraph. That is what made them the examples, and it is why the
narrower failure was the one found first.

**Four columns is the fewest at which no CommonMark block begins.** Every block
opener accepts at most three columns of indentation; the one construct that wants
four is an indented code block, and an indented code block cannot interrupt a
paragraph. A line four columns in is therefore a lazy continuation line — which
is the only thing it can be, and the thing it was in the document CommonMark
read.

**Only the first line.** A later line of a paragraph opens no block however it is
spelled, and four columns there would be four columns `E-5` has to remove without
`P-4` having added them. So `[x]: /x`, then `para`, then `more` is written with
`para` indented and `more` at the content column.

The rule is still unconditional: it does not ask what the line says, only what
the two `block` names are. The cost of that is below, in *Round-trip
consequence*.

#### What the revision was measured against

`tools/sweep.mjs`, 40,000 generated documents per seed, `S-7` active, on the full
0.1.0 configuration **with RFC [0079](https://github.com/mindmapmarkdown/spec/pull/79)** —
which is where this family becomes visible at all, because `E-5`'s own
indentation defect accounts for the rest.

| `P-7` | seed 1234567 | 20261005 | 7 |
|---|---|---|---|
| as proposed on 2026-10-02 | 46 | 47 | 47 |
| **with the four columns** | 0 | 1 | 0 |

The one document remaining at seed 20261005 was not this family and not a gap in
the specification: it was a lift bug, fixed in
[mindmapmd#15](https://github.com/mindmapmarkdown/mindmapmd/pull/15). With that
fix in place, six seeds over **240,000 documents report zero**.

**The rule does not ask what the paragraph's first line says.** It could have
been written to drop the blank line only where the line would otherwise open a
block, and that narrower rule would leave one more document canonical. It would
also be a second, partial grammar of CommonMark inside this specification, which
is the reason RFC 0043 stated `S-7` over the round trip rather than as a list of
forbidden spellings. The unconditional rule is one sentence, decidable by looking
at two `block` names, and cannot disagree with CommonMark because it does not
restate any of it.

### Why this is the right spelling

A definition and the paragraph after it were **one block** in the document
CommonMark read: the definition was taken out of the front of a paragraph.
Writing them on consecutive lines, with the paragraph's first line indented far
enough to be a continuation line, puts them back the way they were found — which
is why the result lifts to the same two entries. The blank line was never
information; it was `P-7` applied to a boundary that is not one. The four columns
are not information either, and `E-5` removes them again on the way back in.

### Examples

Four are proposed, in §2.2 beside RFC 0051's definition examples. Each was
checked against the prototype.

`````markdown
A paragraph directly below a definition is written there, indented four columns
and with no blank line (P-7). Here it has to be: after a blank line, `1.` with
nothing after it opens a list, and the paragraph would come back as a node.

````example
[x]: /x
    1.
.
{"content":[
  {"block":"link_reference_definition","source":"[x]: /x"},
  {"block":"paragraph","source":"1."}],
 "children":[]}
````

The rule does not look at what the paragraph says, so ordinary prose is written
the same way:

````example
# Guide

[x]: https://example.com
    See [the guide][x].
.
{"content":[],"children":[
  {"kind":"section","label":"Guide","content":[
    {"block":"link_reference_definition","source":"[x]: https://example.com"},
    {"block":"paragraph","source":"See [the guide][x]."}],
   "children":[]}]}
````

Four columns, and not simply the line below, because the line below is the start
of a block. An `=` there would underline the definition's own line as a setext
heading and take the definition with it:

````example
[x]: /x
    =
.
{"content":[
  {"block":"link_reference_definition","source":"[x]: /x"},
  {"block":"paragraph","source":"="}],
 "children":[]}
````

A block that can interrupt a paragraph is a block of its own, and P-7 is
unchanged for it:

````example
# Guide

[x]: /x

> Quoted.
.
{"content":[],"children":[
  {"kind":"section","label":"Guide","content":[
    {"block":"link_reference_definition","source":"[x]: /x"},
    {"block":"block_quote","source":"> Quoted."}],
   "children":[]}]}
````
`````

All four are canonical.

### Round-trip consequence

- **Trees.** Nothing changes. No document lifts to a different tree than it does
  under RFC 0051 alone.
- **Conforming documents.** Nothing changes. No document starts or stops
  conforming.
- **Canonical documents.** One shape changes status, and the four columns make
  it a wider shape than the 2026-10-02 rule did. Every spelling of a definition
  followed by a paragraph is now non-canonical except the indented one: `[x]: /x`,
  blank, `See [x].` and `[x]: /x` then `See [x].` at column 0 both settle to
  `[x]: /x` then four columns then `See [x].` on the first round trip — the same
  cost `L-9` and `L-10` already pay, on more documents.

  **This is what the revision costs, said plainly.** Canonical form now has an
  indented line in the common case — a definition followed by ordinary prose,
  where the prose could have stood at column 0 perfectly well. It reads like a
  mistake and it is four columns from reading like code. The alternative is to ask
  what the line says, which is the partial CommonMark grammar this RFC refuses on
  its first page. Of the two, an odd-looking canonical form is the one that costs
  nothing a reader can lose.
- **The suite.** No existing example changes.

### Edge cases

| | |
|---|---|
| Adjacent definitions | Already one entry under RFC 0051; the paragraph joins that one entry's lines |
| A definition as the last content entry, followed by children | Unaffected: the next thing is a node, and `P-10` already separates content from children |
| A definition inside a list item | `P-4` indents both lines, and the four columns are measured from the item's content column — so the paragraph's first line is written six columns in for a top-level item |
| A `block_quote`, `code_block` or table after a definition | Unaffected — each can interrupt a paragraph, so each is a block of its own and keeps its blank line |
| A definition after a paragraph | Unaffected; the rule is one-directional |

Bounds: one pass over a node's `content`, looking at two `block` names. Nothing
is parsed.

### How it is tested

The four examples above, once they are in `spec.md`. And a prototype on
[`rfc/definition-lazy-continuation`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/definition-lazy-continuation),
stacked on the RFC 0079 prototype. Its `test/definition-paragraph.test.js` holds
nineteen cases, each checking the tree round trip, byte stability, and whether
the document is canonical; three of them are the three rows of the table in
*Revised, 2026-10-05*, and five belong to #61 rather than to this RFC, added by
the RFC 0069 prototype below this one in the stack. 256 tests across the whole
branch, 256 pass, 0 fail, 0 todo.

The prototype for the rule as proposed on 2026-10-02 remains on
[`rfc/definition-paragraph`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/definition-paragraph),
branched from the RFC 0051 prototype, with its eleven cases and 150 tests.

The revision is stacked on RFC 0079 rather than on RFC 0051 alone because the
number it has to be judged by — 46 down to 0 — cannot be measured anywhere else.
Below RFC 0079 the 46 are hidden inside 139 failures of a different kind.

## Alternatives

**Do nothing.** `S-7` cannot land, so RFC 0043 cannot land. Rejected.

**A document whose lift is not well-formed does not conform.** One bullet in
§1.2.3, and §2.4's claim becomes true by construction rather than by luck. It
closes this family and any future one of the same kind, which is its real
attraction. Two costs defeat it. It throws documents away: `[x]: /x` followed by
`2. a` would stop conforming, and an L1 implementation would have to refuse it,
when a perfectly good tree for it exists and projection can write that tree back
— as this RFC shows. And it would make conformance a property of a round trip
rather than of the text, which is a much larger change to Chapter 1 than the
defect warrants. Rejected, but recorded as the answer if a member of this family
is ever found that no spelling can write back.

**Keep the paragraph adjacent and leave it at column 0** — the rule as proposed
on 2026-10-02. It fixes the two documents in *Motivation* and leaves 46 in
40,000, because a line below a definition starts a block unless it cannot, and
`- a`, `=` and `***` all can. Rejected on 2026-10-05, with the measurement in
*What the revision was measured against*. It is worth recording that the
narrower rule looked complete for three days: the documents that defeat it need
a definition **and** a first line that can open a block, and the generator
produced the first shape long before the second.

**Record the definition and the paragraph as one opaque entry**, since they were
one block. It round-trips, and it is arguably what the source says. It also makes
the paragraph's text opaque — a view would show prose inside a block it cannot
read — and it would do that to `[x]: /x` followed by ordinary prose, which is the
common shape. Narrowing it to the cases that need it brings back the partial
CommonMark grammar. Rejected.

**Have projection escape the paragraph's first line** — `1\.␣`. `P-9` writes a
block as the block it records; an escape changes the characters, so lift would
record `1\.␣` and the tree would differ. Rejected.

**Fold the paragraph onto one line, or move it after another block.** Changes
what the author wrote, and `P-9` refuses to join content into a single line.
Rejected.

**Prior art.** None to interoperate with: this is a consequence of CommonMark's
own treatment of link reference definitions, and no format layered on CommonMark
that this project has examined (markmap, OPML exporters, JSON Canvas) claims a
document round trip at all, so none has met the problem.

## Unresolved questions

**The same document with a trailing space**, `[x]: /x` then `1.␣`, is a separate
defect and is not this RFC's. Its paragraph source ends in a space, `P-8` forbids
a line ending in whitespace outside a code block, and the tree therefore has no
canonical projection at all — before anything in this RFC is reached. That is RFC
[0057](https://github.com/mindmapmarkdown/spec/pull/57) Part 2, which removes trailing whitespace from a
recorded string at lift. With that in place the document above lifts to the
example's tree and this rule applies to it unchanged. **The two RFCs are
independent**: neither needs the other to be correct, and both are needed before
`S-7` can land.

**An empty-labelled item whose content is a definition**
([#61](https://github.com/mindmapmarkdown/spec/issues/61)) loses its children:
`P-7`’s blank line before the content, plus the blank line before the child,
leaves two in a row once the definition is read out again, and two blank lines
end the item. A second sentence answering it was written into this RFC on
2026-10-02 and **withdrawn the same day**: writing the first content entry below
the marker fixed those 27 documents and broke 81 others, because when a second
content block follows the definition that block is written inside the item and
becomes its label. That is the open question RFC 0043 named — what an item’s
label is when its first block is not a paragraph — reached from another
direction, and a rule about blank lines cannot settle it. #61 stays open and
belongs with that question.

**Whether `P-7` is the right home.** `P-9` governs how a recorded string is
written and could carry it instead. `P-7` is chosen because it is the rule that
puts the blank line there.

**A paragraph left behind by front matter.** `L-10` also removes lines before
CommonMark sees them, but it removes whole lines from the top of the document and
cannot leave a paragraph's tail behind, because its closing fence ends the run.
Nothing to do here, named so that the next reader does not have to re-derive it.

## Decision and rationale
