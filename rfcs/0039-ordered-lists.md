# RFC 0039: Ordered lists keep their numbers

**Translations** — [한국어](ko/0039-ordered-lists.md). This English text is the
authoritative one; a translation is a reading aid and carries no normative force,
and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-09-15 |
| **Comment period ends** | 2026-09-29 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/39> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

An ordered list loses its numbering today. `1. Install` lifts to an item labelled
`Install`, indistinguishable from `- Install`, and canonical projection writes it
back as `- Install`. A list that starts at 3 forgets that it did. A line that
merely begins with a date loses the date.

RFC [0004](0004-canonical-hierarchy.md) left this open on purpose — *"whether
ordered-ness is part of the tree or a spelling of it"* — and asked that it be
settled before Chapter 3. It was not listed among the questions to settle before
0.1.0, and it should have been: once 0.1.0 records that numbers are dropped,
keeping them becomes a Breaking change.

This RFC keeps them. An item of an ordered list records its **ordinal** — the
number CommonMark gives it — and its **delimiter**, `.` or `)`. Bullet items do not
change, and `kind` keeps its two values. Projection writes the numbers back,
indents nested content by the width of the marker it sits under, and keeps two
lists apart when CommonMark would otherwise merge them.

**No existing example changes** — none of the 21 contains an ordered list. A
prototype passes the suite unchanged, the eight examples proposed here, and
thirteen further cases.

## Motivation

### What is lost today

Each row was run against the reference implementation at
`mindmapmarkdown/mindmapmd@657da17`.

| Document | Tree today | Projected back |
|---|---|---|
| `1. Install`, `2. Configure` | items `Install`, `Configure` | `- Install`, `- Configure` — **a numbered procedure becomes a bullet list** |
| `3. Test`, `4. Ship` | items `Test`, `Ship` | `- Test`, `- Ship` — **the start is gone** |
| `1) One`, `2) Two` | items `One`, `Two` | `- One`, `- Two` |
| `- 2026. 1. 15. 10:00` | an empty item, holding an empty item, holding an empty item, holding `10:00` | **the text `2026. 1. 15.` is nowhere in the tree** |

The last row is not an exotic document. CommonMark reads `2026.`, `1.` and `15.`
as three nested ordered lists — a CommonMark renderer shows them that way — and
because the numbers are not recorded, the date disappears from the tree entirely.
Dropping numbers is not only a loss of spelling; here it is a loss of content, in a
specification whose promise is that content survives.

### Why the numbers are meaning, not spelling

A reader of a rendered document sees them. `3. Test` is shown as step three, and a
procedure numbered from one says something a set of bullets does not. The test
this specification uses to tell tree from view — *could two implementations
disagree without either being wrong?* — gives the answer: two tools that showed
the same document with different step numbers could not both be right.

What CommonMark itself treats as spelling is narrower, and this RFC follows it. A
list's numbers are its **start** and its **delimiter**; the digits written on items
after the first are not read. `1.`, `1.`, `1.` renders as 1, 2, 3, exactly as `1.`,
`2.`, `3.` does, and this RFC records the same thing for both.

### Why now

[`CHANGELOG.md`](../CHANGELOG.md) states that a release is not cut while a
Normative question is open, because deciding it afterwards makes it Breaking. This
question was open and was not on that list. Settling it before 0.1.0 keeps the
first version from recording a loss.

## Detailed design

Labels here assume RFC [0038](https://github.com/mindmapmarkdown/spec/pull/38) is accepted as
proposed, which adds `L-11`. If it is not, `L-12` below becomes `L-11`.

### Lift

**`L-12`, new.**

> **L-12.** An item of an ordered list has an **ordinal** and a **delimiter**. The
> ordinal is the list's start number plus the item's zero-based position in that
> list, both as CommonMark determines them. The delimiter is `.` or `)`, as
> written. An item of a bullet list has neither. The list marker is not part of
> the label (E-4).

*(Informative)* CommonMark reads a list's start from its first item only, so the
number written on any later item is not recorded. A new list begins where
CommonMark begins one: a change of delimiter, a change between bullet and ordered,
or a block that interrupts the list. Blank lines alone do not.

*(Informative)* This RFC relies on `L-3` as written: a block that follows a list
attaches to the nearest node preceding it, which is the list's **deepest last
item**. The reference implementation currently attaches such a block to the
enclosing section instead; that is a defect in the implementation, not a reading
of the specification, and the prototype corrects it.

### Well-formedness

**`S-5`, new — a restart must be separable.**

> **S-5.** Among consecutive sibling items, an ordered item whose delimiter equals
> the previous item's, and whose ordinal is not one more than the previous item's,
> **restarts** the list. For every restart, the deepest last descendant of the
> previous item MUST have non-empty content.

CommonMark merges two adjacent lists of the same type and delimiter unless a block
interrupts them. In any document, that block is — by `L-3` — the content of the
node just before the second list. `S-5` states in the tree what the document
already had to contain, so that projection can write it back (`P-12`).

**`S-6`, new — valid numbers.**

> **S-6.** `ordinal` and `delimiter` MUST appear together, and only on items. An
> ordinal MUST be a non-negative integer, and a delimiter MUST be `.` or `)`. An
> item that begins a list — one that does not continue the item before it — MUST
> have an ordinal of at most 999999999.

A CommonMark list marker carries at most nine digits: `999999999.` begins a list,
`1000000000.` is a paragraph. An item that continues a list can exceed the limit —
the second item of a list starting at 999999999 is number 1000000000 — and `S-6`
permits that, because such an item's number is never written for CommonMark to
read (`P-3`).

The definition of well-formed becomes: a tree satisfying S-1, S-2, S-4, S-5, and S-6.

### Projection

**`P-3`, amended.**

> **P-3.** A bullet item's marker MUST be `-`. An ordered item's marker MUST be its
> ordinal followed by its delimiter; an item that continues a list and whose
> ordinal exceeds 999999999 MUST use `999999999` in place of its ordinal.

**`P-4`, amended.**

> **P-4.** An item's content and nested lists MUST be indented by the width of the
> item's marker plus one space: two spaces under `-`, three under `1.`, four under
> `10.`.

The current text says two spaces for every nesting level. Under an ordered item
that is wrong, not merely different: a list indented two spaces under `1.` is not
nested in it — CommonMark reads it as a new list after the first. Four spaces are
needed under `10.`.

**`P-12`, new — consecutive items and restarts.**

> **P-12.** Consecutive sibling items MUST be written as one list for as long as
> each continues the previous one — the same type and, for ordered items, the same
> delimiter and an ordinal one greater. Where one list ends and another begins, a
> single blank line MUST separate them. At a restart (`S-5`), the content of the
> previous item's deepest last descendant MUST be written between the two lists,
> unindented, and not inside the first list; `P-7` then decides whether the first
> list is loose from the content it still contains.

The blank line between different lists is necessary, not stylistic: without it, an
ordered item whose number is not 1 would be read as a lazy continuation of the item
above. And the restart rule is what makes a numbering restart survive: indented, the
interrupting paragraph would sit inside the first list and the second list would
merge into it, turning 1, 2 into 3, 4.

### Encoding

**`E-2`, amended.**

> **E-2.** A node MUST be encoded as a JSON object with exactly four members: `kind`,
> `label`, `content`, and `children` — except an item that has an ordinal, which
> has exactly six: `kind`, `label`, `ordinal`, `delimiter`, `content`, and
> `children`. All members MUST be present, including when `content` or `children`
> is empty.

**`E-9`, new.**

> **E-9.** `ordinal` MUST be a JSON number that is a non-negative integer, and
> `delimiter` MUST be the string `.` or the string `)`.

**`E-8`, amended.** Members SHOULD appear in the order `kind`, `label`, `ordinal`,
`delimiter`, `content`, `children`.

`E-3` is unchanged: `kind` is still `section` or `item`.

### Examples

Eight examples are proposed. Each was checked against the prototype, including
whether the document is canonical, and — beyond tree equality — that a CommonMark
renderer shows **the same number on every item** before and after projection.

`````markdown
An ordered item records its number and delimiter (L-12):

````example
# Setup

1. Install
2. Configure
.
{"content":[],"children":[
  {"kind":"section","label":"Setup","content":[],"children":[
    {"kind":"item","label":"Install","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Configure","ordinal":2,"delimiter":".",
     "content":[],"children":[]}]}]}
````

A list that starts at 3 keeps its start:

````example
# Steps

3. Test
4. Ship
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"Test","ordinal":3,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Ship","ordinal":4,"delimiter":".",
     "content":[],"children":[]}]}]}
````

CommonMark does not read the numbers written on later items, and neither does lift.
Canonical form writes them in order, so this document is conforming and not
canonical:

````example
# Steps

1. One
1. Two
1. Three
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"One","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Two","ordinal":2,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Three","ordinal":3,"delimiter":".",
     "content":[],"children":[]}]}]}
````

The delimiter is recorded:

````example
# Steps

1) One
2) Two
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"One","ordinal":1,"delimiter":")",
     "content":[],"children":[]},
    {"kind":"item","label":"Two","ordinal":2,"delimiter":")",
     "content":[],"children":[]}]}]}
````

A nested list is indented by the width of the marker it sits under (P-4):

````example
# Steps

9. Prepare
   - Back up
10. Deploy
    - Swap
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"Prepare","ordinal":9,"delimiter":".",
     "content":[],"children":[
       {"kind":"item","label":"Back up","content":[],"children":[]}]},
    {"kind":"item","label":"Deploy","ordinal":10,"delimiter":".",
     "content":[],"children":[
       {"kind":"item","label":"Swap","content":[],"children":[]}]}]}]}
````

A paragraph between two items interrupts the list in CommonMark, and the numbering
continues. The paragraph is content of the item before it (L-3), and canonical form
writes it inside that item, as one list:

````example
1. Overview

Overview text.

2. Detail
.
{"content":[],"children":[
  {"kind":"item","label":"Overview","ordinal":1,"delimiter":".",
   "content":[{"block":"paragraph","source":"Overview text."}],
   "children":[]},
  {"kind":"item","label":"Detail","ordinal":2,"delimiter":".",
   "content":[],"children":[]}]}
````

When the numbering restarts, canonical form keeps the interrupting paragraph
between the lists, unindented, so that the restart survives (P-12):

````example
# Rollout

1. Build
2. Verify

Then, on each server:

1. Stop
2. Swap
.
{"content":[],"children":[
  {"kind":"section","label":"Rollout","content":[],"children":[
    {"kind":"item","label":"Build","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Verify","ordinal":2,"delimiter":".",
     "content":[{"block":"paragraph","source":"Then, on each server:"}],
     "children":[]},
    {"kind":"item","label":"Stop","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Swap","ordinal":2,"delimiter":".",
     "content":[],"children":[]}]}]}
````

A line that begins with a date is three nested ordered lists to CommonMark, and
every number is kept:

````example
# Log

- 2026. 1. 15. 10:00
.
{"content":[],"children":[
  {"kind":"section","label":"Log","content":[],"children":[
    {"kind":"item","label":"","content":[],"children":[
      {"kind":"item","label":"","ordinal":2026,"delimiter":".",
       "content":[],"children":[
         {"kind":"item","label":"","ordinal":1,"delimiter":".",
          "content":[],"children":[
            {"kind":"item","label":"10:00","ordinal":15,"delimiter":".",
             "content":[],"children":[]}]}]}]}]}]}
````
`````

The first, second, fourth, fifth, and seventh are canonical; the third, sixth, and
eighth are not.

### Round-trip consequence

- **Trees.** Every document containing an ordered list lifts to a different tree:
  its items gain `ordinal` and `delimiter`. A block written after a list attaches
  to the list's deepest last item, which `L-3` already required.
- **Canonical documents.** An ordered list was never canonical, because `P-3`
  required `-`. Under this RFC it can be: numbers in sequence from the start, the
  recorded delimiter, and nesting indented by marker width. A bullet list nested
  two spaces under an ordered item stops being nested — but that was already
  CommonMark's reading, and the tree lifted from such a document never had it
  nested.
- **The suite.** No existing example contains an ordered list or a block after a
  list. The prototype passes all 21 unchanged.
- **Class.** Normative, not Breaking: nothing is released, so no implementation can
  have claimed conformance to a version, and no document stops conforming.

### How it is tested

The eight examples, once in `spec.md`. And a prototype on the reference
implementation's branch
[`rfc/ordered-list-prototype`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/ordered-list-prototype),
which passes the existing suite, the eight examples exactly, and thirteen further
cases — bullet and ordered lists side by side, delimiter changes, restarts at the
top level and inside a nested list, restarts after an item with children, blank
lines that do not restart, a start of zero and of nine digits, an item beyond nine
digits, escaped numbers, and blocks after lists. Each case checks:

- that the tree survives the round-trip;
- that a second projection is byte-identical to the first;
- **that a CommonMark renderer shows the same number on every item** before and
  after projection;
- that no projected line ends in whitespace.

Hand-built trees check that `S-5` and `S-6` reject what they should.

### Bounds

Ordinals are integers no larger than a nine-digit start plus the number of items in
the list. Splitting a run of items into lists is a single linear pass, and so is
finding a deepest last descendant.

## Alternatives

**Do nothing.** Numbers stay dropped, procedures become bullet lists on the way
out, and a line starting with a date loses its text. RFC 0004 asked for an answer
before Chapter 3. Rejected.

**Keep the marker in the label** — `1. Install` as the label. This is what markmap and
easymindmap do, and it fails in three places. The marker is not inline
content, so it contradicts `E-4`. Moving an item leaves its number stale. And it
cannot be written back: `- 1. Install` is a bullet containing an ordered list, and
escaping it as `- 1\. Install` makes a different label. It also cannot save the
date line, which CommonMark has already split into lists before any label exists.
Rejected.

**A third kind, `ordered_item`.** `kind` records whether a node is written as a
heading or a list item — the distinction RFC 0004 made part of the tree. Ordered or
not is a property of the list an item belongs to, and a third kind would still need
the start and the delimiter somewhere. Rejected.

**List nodes.** Record each list as a node carrying its start. The tree has no list
nodes; adding them would change every item's depth under `L-7` and the shape of
every tree in the suite. Rejected.

**Record the start on the first item only.** Later items' numbers are implied, so
this holds the same information. It was not chosen because a restart would then
have to be marked some other way, and because a per-item ordinal makes every
fixture show the number a reader sees. The cost of the chosen design, stated
plainly: a program that reorders items in a tree must renumber them, or it creates
restarts that `S-5` may reject.

**Record the number written on every item.** CommonMark does not read those digits,
and no renderer shows them. They are spelling. Rejected.

**Separate restarting lists with an HTML comment**, as CommonMark's own
documentation suggests. The comment is an HTML block, which `L-3` would record as
content — projection would add a node's content that the document never had.
**Or switch the delimiter** from `.` to `)`: that changes recorded data. Writing the
interrupting content unindented uses what the tree already holds. Rejected.

**Prior art.** CommonMark defines exactly the information recorded here: an ordered
list has a start and a delimiter, and later numbers are ignored. OPML has no ordered
lists. markmap renders ordered items with their numbers as part of the node text,
which is the label alternative above.

## Unresolved questions

**Link reference definitions.** A definition such as `[x]: https://example.com`
produces no block in CommonMark's document tree, so `L-3` has nothing to attach and
it is recorded nowhere. Two consequences, both found while preparing this RFC:

- A definition between two ordered lists splits them, so `1. a`, a definition,
  `1. b` lifts to a restart with nothing to separate it — a tree `S-5` rejects,
  from a conforming document.
- More broadly, **projection drops every link reference definition**, so a
  reference-style link such as `[the guide][g]` stops being a link after one
  round-trip. That is a loss of content in any document, ordered lists or not.

The second is not introduced by this RFC and is larger than it; it is filed as
issue [#40](https://github.com/mindmapmarkdown/spec/issues/40). The first is resolved by whatever resolves the second.

**Multi-line content in an ordered item** keeps the item's indentation on its later
lines — the defect RFC 0038 Part 1 fixes. A three- or four-space marker makes it
more visible, not different. The prototype records that case as pending on 0038.

**An empty label with content.** CommonMark reads `-` followed by a blank line and
indented text as an empty item followed by a paragraph, so an item with an empty
label and content cannot be written back. That is true of bullet items today and is
not changed here.

**Task list items.** RFC 0004's other open question, whether `- [ ]` is part of the
tree, is not addressed.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
