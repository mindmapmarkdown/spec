# RFC 0046: An empty first child is written after a blank line

**Translations** — [한국어](ko/0046-empty-first-child.md). This English text is the
authoritative one; a translation is a reading aid and carries no normative force,
and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-09-16 |
| **Comment period ends** | 2026-09-30 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/46> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

A conforming document can lift to a tree that canonical projection cannot write
back ([#45](https://github.com/mindmapmarkdown/spec/issues/45)). The tree is an item
with a label whose first child is an item with an empty label. P-7 requires the
nested list to follow the label directly, and directly below a label no empty list
item survives: a bare `-` is a setext heading underline, and CommonMark lets no
empty item of any other marker interrupt a paragraph.

This RFC adds one sentence to P-7:

> When an item's label is not empty and its first child's label is, a single blank
> line MUST separate the label from what follows it.

**No lift rule changes, and no existing example changes.** Every tree without this
shape projects exactly as it does today. One example is added. A prototype passes
the suite unchanged and 75 tests.

## Motivation

### What goes wrong today

Each document below is conforming, and lifts to an item whose first child has an
empty label. Checked with commonmark.js 0.31 and `mindmapmarkdown/mindmapmd`.

| Document | Canonical projection today | Lifted again |
|---|---|---|
| `- a`, blank line, `  -` | `- a`, `  -` | **refused** — CommonMark reads `a` as a setext heading inside the item (S-1) |
| `- Meeting`, `  - 2026. 1. 15. 10:00` | `- Meeting`, `  -`, `    -`, `      -`, `        - 10:00` | **refused**, for the same reason |
| `1. a`, blank line, `   1.` | `- a`, `  -` | **refused** |

The second row is the one that makes this more than a curiosity. CommonMark reads
`2026.`, `1.` and `15.` as three nested ordered lists, so a note that puts a date
under a heading item lifts to exactly this shape. RFC 0039 changes what those
nested items record; it does not change that the first child of `Meeting` has an
empty label.

### Why no spelling P-7 allows works

The nested list has to start on the line after the label, because P-7 requires a
tight list and no blank line between a label and a sublist.

- **A bare `-`** directly below a paragraph is a setext heading underline
  (CommonMark §4.3). The item's label becomes a level-2 heading.
- **Any other marker** — `*`, `+`, `1.` — cannot start an empty list item that
  interrupts a paragraph (CommonMark §5.2). It is read as paragraph continuation
  text, and the label becomes `a`, a line break, and the marker.
- **A trailing space** after the marker changes neither reading, and P-8 forbids it.

A blank line works. `- a`, a blank line, `  -` is the document in the first row,
and it lifts to the tree. The blank line makes the enclosing list loose in
CommonMark's terms, but looseness carries no structural meaning and lift ignores it
(§2.5, the informative note on P-7).

### What happens if nothing is done

§1.2.4 L1 fails for a tree that lift itself produces, and implementations have
nothing to agree on: one throws, one writes a document that denotes a different
tree, one invents a spelling. RFC 0043's claim that lift never produces a tree S-7
rejects is false for this tree.

## Detailed design

### 1. P-7

P-7 gains a final sentence:

> **P-7.** A single blank line MUST separate a heading from what follows it and each
> block of node content from the next. A list MUST be tight — no blank line between
> items — unless an item carries block content, in which case the list MUST be
> loose. **When an item's label is not empty and its first child's label is, a
> single blank line MUST separate the label from what follows it.**

The sentence is about the line after the label, not about the list:

- **Siblings stay tight.** `- a`, blank line, `  -`, `- b` — no blank line is added
  between `a`'s nested list and `b`.
- **It applies at every depth**, and to a first child that has children of its own.
- **Nothing else triggers it.** An empty child that is not the first, or an empty
  first child under an empty label, needs no blank line. Under an empty label there
  is no paragraph to continue; after an earlier sibling, the empty item's marker
  sits at that sibling's own indentation, which cannot continue or underline the
  sibling's paragraph.
- **An item with content already has the blank line**, because P-7 separates its
  blocks; the sentence adds nothing there.
- **It does not depend on the marker.** It is stated over labels, so if RFC 0039 is
  accepted, an ordered item's empty first child is covered by the same sentence.

The following informative text is added to the note after P-11:

> *(Informative)* The last sentence of P-7 exists because no other spelling of that
> tree lifts back. Directly below a label, a bare `-` is a setext heading underline,
> and CommonMark lets no empty list item of any other marker interrupt a paragraph.
> A document that puts a date line under an item — `- Meeting`, then
> `  - 2026. 1. 15. 10:00` — lifts to this shape.

### 2. Example

Added after that note:

````example
- a

  -
.
{"content":[],"children":[
  {"kind":"item","label":"a","content":[],"children":[
    {"kind":"item","label":"","content":[],"children":[]}]}]}
````

The example is canonical under the amended P-7, so the suite tests it both ways: it
lifts to the tree, and the tree projects back to it byte for byte.

### What does not change

- **No lift rule.** Every document lifts to the tree it lifts to today.
- **No other tree's canonical form.** Only a tree with this shape is written
  differently, and today it cannot be written at all.
- **No existing example.** None of the 21 has an empty label.

### Round-trip consequence

Restored. Today L1 fails for this tree; afterwards it holds.

### Interaction

- **RFC 0043 ([#43](https://github.com/mindmapmarkdown/spec/pull/43)).** With this
  sentence, the tree satisfies S-7, and 0043's claim that lift never produces a tree
  S-7 rejects holds for it. 0043 carries a note pointing here.
- **RFC 0039 ([#39](https://github.com/mindmapmarkdown/spec/pull/39)).** Independent.
  0039's P-12 governs blank lines between lists; this sentence governs the line
  after a label. If both are accepted, both apply.
- **The empty-label spelling.** P-8 already requires an empty label to be written
  as the bare marker; the reference implementation's fix for that is
  mindmapmarkdown/mindmapmd#2, which this RFC's prototype builds on.

### How it is tested

The added example tests it in the suite: lift, and byte-for-byte projection.

A prototype is `mindmapmarkdown/mindmapmd` branch `rfc/empty-first-child-prototype`
at `ba07937`, built on the empty-label fix (mindmapmd#2). 75 tests pass: the 64 on
`main` unchanged, 5 from the empty-label fix, and 6 for this RFC — the shape itself,
tight siblings after it, an empty first child with children, deeper and under a
section, and the two positions that get no blank line. Each checks P-8, that the
output lifts back to the same tree, and that a second projection is byte-stable.

## Alternatives

### Do nothing

L1 keeps failing for a tree a conforming document produces, and a date line under
an item is an ordinary thing to write.

### Forbid the tree

A well-formedness rule rejecting it would make lift produce a tree that is not
well-formed, contradicting §2.4, and would leave the document in the first row with
no tree at all — although it is conforming and renders the way its author meant.

### Read the document differently

Lift could drop the empty item or merge it into its parent. That discards a node a
CommonMark renderer shows as an empty bullet, and it changes what a date line lifts
to. E-4 already allows an empty label, and a node the document contains stays in
the tree.

### Make the whole list loose

Writing every sibling with blank lines between them would also lift back, since
lift ignores looseness. It changes more bytes than it needs to, and makes the
canonical form of a list depend on one of its grandchildren. The sentence proposed
here changes one line.

### Another spelling

Every other candidate is covered in the Motivation: another marker is read as
continuation text, and a trailing space is still a setext underline and is
forbidden by P-8. There is nothing to escape in an empty label.

## Unresolved questions

None blocks acceptance.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
