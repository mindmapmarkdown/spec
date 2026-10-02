# RFC 0058: Where a definition's blank lines go

**Translations** — [한국어](ko/0058-definition-paragraph.md). This English text is
the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-02 |
| **Comment period ends** | 2026-10-16 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/58> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

CommonMark takes a link reference definition out of the paragraph it was written
in, so the paragraph left behind can begin with a line that is a paragraph only
*because* it cannot interrupt one. `P-7` puts a blank line before that paragraph,
after which the same line opens a list — the paragraph stops being content and
becomes a node ([#56](https://github.com/mindmapmarkdown/spec/issues/56)).

A second arrangement fails for the same reason read the other way. An
empty-labelled item whose content is a definition and which has a child loses
that child: the blank line `P-7` puts before the content, plus the blank line
before the child, leaves **two** blank lines after the bare marker once the
definition is read out again, and two blank lines end a list item
([#61](https://github.com/mindmapmarkdown/spec/issues/61)).

This RFC adds two sentences to `P-7`. **The tree does not change and no document
stops conforming.**

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

Two sentences are added:

> A `paragraph` entry that directly follows a `link_reference_definition` entry
> in the same node's `content` MUST be written on the line immediately below it,
> with no blank line between them.

> When a node's `label` is empty, its first `content` entry MUST be written on the
> line immediately below the marker, with no blank line between them.

That is the whole change. No `L-`, `S-` or `E-` rule moves, and the tree is
untouched.

The second sentence is the **mirror of RFC [0046](0046-empty-first-child.md)**,
which amended the same rule for the opposite arrangement: a non-empty label whose
first child's label is empty needs a blank line, and an empty label whose first
content entry follows needs none. Both exist because a list item's boundaries are
drawn by blank lines, and both say where this specification may not put one.

Only a definition reaches the second sentence today. A node's label is its first
inline content, so any ordinary first block becomes the label rather than
content; a definition is the one block CommonMark does not report, and therefore
the one thing that can be an empty-labelled item's first content entry. The
sentence is written over `content` rather than over definitions because that is
the reason it holds, and because what an item's label is when its first block is
a code block or a block quote is a question this specification has not answered
(RFC [0043](0043-well-formed-round-trip.md), *Unresolved questions*) — when it
does, this sentence should already be right.

**The rule does not ask what the paragraph's first line says.** It could have
been written to drop the blank line only where the line would otherwise open a
block, and that narrower rule would leave one more document canonical. It would
also be a second, partial grammar of CommonMark inside this specification, which
is the reason RFC 0043 stated `S-7` over the round trip rather than as a list of
forbidden spellings. The unconditional rule is one sentence, decidable by looking
at two `block` names, and cannot disagree with CommonMark because it does not
restate any of it.

### Why no blank line is the right spelling

A definition and the paragraph after it were **one block** in the document
CommonMark read: the definition was taken out of the front of a paragraph.
Writing them on consecutive lines puts them back the way they were found, which
is why the result lifts to the same two entries. The blank line was never
information — it was `P-7` applied to a boundary that is not one.

### Examples

Three are proposed, in §2.2 beside RFC 0051's definition examples. Each was
checked against the prototype.

`````markdown
A paragraph directly below a definition is written there, with no blank line
(P-7). Here it has to be: after a blank line, `1.` with nothing after it opens a
list, and the paragraph would come back as a node.

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

An empty label's first content entry follows the bare marker. A blank line there
would leave two in a row once the definition is read out, and two blank lines end
the item — the child below would come back as a sibling:

````example
-
  [x]: /x

  - b
.
{"content":[],"children":[
  {"kind":"item","label":"",
   "content":[{"block":"link_reference_definition","source":"[x]: /x"}],
   "children":[
     {"kind":"item","label":"b","content":[],"children":[]}]}]}
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
- **Canonical documents.** One shape changes status: a blank line between a
  definition and the paragraph after it. `[x]: /x`, blank, `See [x].` is
  conforming and no longer canonical, and settles to the two-line form on the
  first round trip — the same cost `L-9` and `L-10` already pay.
- **The suite.** No existing example changes.

### Edge cases

| | |
|---|---|
| Adjacent definitions | Already one entry under RFC 0051; the paragraph joins that one entry's lines |
| A definition as the last content entry, followed by children | Unaffected: the next thing is a node, and `P-10` already separates content from children |
| A definition inside a list item | `P-4` indents both lines, and the pair stays together |
| An empty-labelled item with content and no child | Already survived, because there was only one blank line to leave behind; it is written the new way too, so one spelling covers both |
| An empty-labelled item whose first content entry is not a definition | Cannot arise: any other first block becomes the label |
| A `block_quote`, `code_block` or table after a definition | Unaffected — each can interrupt a paragraph, so each is a block of its own and keeps its blank line |
| A definition after a paragraph | Unaffected; the rule is one-directional |

Bounds: one pass over a node's `content`, looking at two `block` names. Nothing
is parsed.

### How it is tested

The three examples above, once they are in `spec.md`. And a prototype on
[`rfc/definition-paragraph`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/definition-paragraph),
branched from the RFC 0051 prototype: fourteen cases, each checking the tree
round trip, byte stability, and whether the document is canonical. 153 tests, 152
pass, 1 todo — the empty-first-child case RFC 0046 closes.

Both sentences were found the same way and the second one is why the first is not
enough: a sweep over 40,000 generated documents, re-run after the earlier causes
were fixed, took the failures from 900 to 27 — and all 27 were the second
arrangement.

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

**Whether `P-7` is the right home.** `P-9` governs how a recorded string is
written and could carry it instead. `P-7` is chosen because it is the rule that
puts the blank line there.

**A paragraph left behind by front matter.** `L-10` also removes lines before
CommonMark sees them, but it removes whole lines from the top of the document and
cannot leave a paragraph's tail behind, because its closing fence ends the run.
Nothing to do here, named so that the next reader does not have to re-derive it.

## Decision and rationale
