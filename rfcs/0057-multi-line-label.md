# RFC 0057: What a recorded string may contain

**Translations** — [한국어](ko/0057-multi-line-label.md). This English text is the
authoritative one; a translation is a reading aid and carries no normative force,
and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-02 |
| **Comment period ends** | 2026-10-16 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/57> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

A `label` and a content entry's `source` are recorded strings, and canonical
projection has to be able to write them back. Twice it cannot, and the two cases
are one question asked of two members:

- **Part 1** — a label below the top level keeps the indentation of the item that
  holds it, projection adds the item's indentation again, and the document does
  not survive the round trip
  ([#55](https://github.com/mindmapmarkdown/spec/issues/55)).
- **Part 2** — a recorded string whose line ends in whitespace has **no**
  canonical projection at all: `P-9` writes the string back as it stands and
  `P-8` forbids the line that results
  ([#59](https://github.com/mindmapmarkdown/spec/issues/59)).

Part 1 does for `E-4` what RFC [0038](0038-content-block-source.md) Part 1 did for
`E-5`. Part 2 does for every block what `L-9` and `L-10` each did for one.
**Either part can be decided on its own.**

## Motivation

### What goes wrong today

```markdown
- x
  - a
    b
```

The nested item's label is recorded as `a\n    b`. Those four columns are the
nested item's own content column — they belong to the item, not to its label.
`P-4` indents the nested list by two more, so canonical projection is:

```markdown
- x
  - a
      b
```

which lifts to the label `a\n      b`. **A conforming document lifts to a tree
whose canonical projection lifts to a different tree.** At depth three the second
line comes back with ten columns instead of six, and so on.

Measured against the reference implementation at `mindmapmd@c9a11a8`:

| Document | Label recorded | Projection | Round trip |
|---|---|---|---|
| `- a` / `␣␣b` | `a\nb` *(two columns removed; see below)* | `- a` / `␣␣b` | passes |
| `- x` / `␣␣- a` / `␣␣␣␣b` | `a\n␣␣␣␣b` | `␣␣␣␣␣␣b` | **fails** |
| `- x` / `␣␣- y` / `␣␣␣␣- a` / `␣␣␣␣␣␣b` | `a\n␣␣␣␣␣␣b` | `␣␣␣␣␣␣␣␣␣␣b` | **fails** |
| `# H` then the second row | as above | as above | **fails** |

**The top level passes by accident.** A label at depth one carries exactly the
two columns `P-4` re-adds, so the numbers happen to agree. Nothing in the rules
says they should, and one column of difference anywhere in the chain breaks it.

### Why nothing caught it

No example in the suite and no test in the reference implementation had a
multi-line label inside a nested item. RFC 0038 named this case under
*Unresolved questions*:

> **Multi-line labels.** `E-4` records a label "exactly as it appears in the
> source". An item whose first paragraph runs over two lines therefore keeps the
> item's indentation on its second line — the situation Part 1 fixes for content.
> The prototype leaves labels unchanged, and they **do survive the round-trip**,
> but the two rules now disagree. Named for a later change, not proposed here.

That claim was tested at depth one only. It is false below it.

### What goes wrong today · Part 2

```markdown
para␣␣
```

`E-5` records the block's Markdown source, so `source` is `para␣␣`. `P-9` writes
that source back as it stands, and `P-8` forbids a line ending in whitespace
outside a code block. **Those two rules cannot both be satisfied**, so the tree
has no canonical projection — not a different one, none. §1.3 says a tree
determines exactly one document; for this tree the rules determine none.

The tree round trip still passes, which is why `S-7` does not catch this one. It
is the shape of [#45](https://github.com/mindmapmarkdown/spec/issues/45) — a tree
that cannot be written back — rather than of #40, #55 or #56.

It reaches every content block except a code block:

| Document | `source` recorded | Canonical projection |
|---|---|---|
| `para␣␣` | `para␣␣` | **breaks `P-8`** |
| `para␣` | `para␣` | **breaks `P-8`** |
| `para␣` then `more` | `para␣\nmore` | **breaks `P-8`** |
| `para` and a tab | the tab included | **breaks `P-8`** |
| `>␣q␣␣` | `>␣q␣␣` | **breaks `P-8`** |
| a table row ending in a space | the row, space included | **breaks `P-8`** |
| `para␣␣` then `more` | `para\\` then `more` | fine — `L-9` made it a backslash |
| a code block line ending in spaces | kept | fine — `P-8` exempts code content |

**This is the most reachable of the five defects found under `S-7` this week.** It
needs no definition, no nesting and no unusual construct: one stray space at the
end of any paragraph.

### The specification has answered this twice already

`L-9`'s informative note: "A paragraph carrying a two-space hard break satisfies
the first two and violates the third. Normalising at lift rather than at
projection is what keeps mutual inversion intact." `L-10` records front matter
with "each line's trailing spaces and tabs removed", and its note says
"Removing trailing whitespace at lift resolves the same collision `L-9` resolves,
for the same reason."

Neither covers an ordinary paragraph. Part 2 is the general case of a rule this
specification has already written down twice.

### Why it is now blocking

`S-7` ([RFC 0043](0043-well-formed-round-trip.md), accepted 2026-10-01) makes a
tree well-formed only if its canonical projection lifts back to it, and §2.4 says
lift cannot produce a tree that is not well-formed. The document above is
conforming and lifts to a tree `S-7` rejects, so `S-7` cannot be written into
`spec.md` until this is answered. RFC 0043's decision named two such holes —
[#45](https://github.com/mindmapmarkdown/spec/issues/45) and
[#40](https://github.com/mindmapmarkdown/spec/issues/40) — on the strength of the
claim quoted above. This is a third.

### Who hits it

Anyone whose outline has a nested entry longer than one line. It needs no unusual
construct: a wrapped sentence under a sub-bullet is enough, and an editor that
re-wraps long lines produces it without being asked.

## Detailed design

### Part 1 · `E-4`, amended

The second sentence of `E-4` becomes:

> `label` MUST be the node's inline content exactly as it appears in the source,
> with leading and trailing whitespace removed, and **with no line keeping more
> leading whitespace than the label's first line gave up.** The first line begins
> at the column where the label's inline content begins; from each later line, up
> to that many columns of leading whitespace are removed, a tab advancing to the
> next multiple of four as CommonMark counts it.

This is `E-5`'s wording, applied to the other member. The reason is the same one
RFC 0038 Part 1 gave: the columns before a label's first character belong to
whatever contains it — the item's marker and padding — and not to the label.

A heading's label is unaffected: a heading begins at column 3 or less and its
later lines, when a setext heading has one, lose at most that.

### Part 1 · `P-1`, amended

A second sentence:

> When a `label` contains a line break, each line after the first MUST be written
> indented to the node's content column: for an `item`, the width of its marker
> plus one; for a `section`, column 1.

Both halves are needed. Amending `E-4` alone would have projection write a
continuation line at column 1 inside a list, where CommonMark reads it as a lazy
continuation of whatever list encloses the item — a different tree again. `P-4`
already indents an item's *content* this way; this says a label's continuation
lines are indented the same, which is what makes them part of the same label.

### Part 2 · `E-4` and `E-5`, amended

A sentence is added to each:

> No line of `label` may end in whitespace.

> No line of `source` may end in whitespace, except a content line of a code
> block (`L-11`).

The exception is the one `P-8` already makes, for the reason RFC 0038 Part 3 gave:
in a code block the trailing spaces **are** the code. Everywhere else they are
insignificant to every consumer, and `L-9` has already taken the one spelling
that is not — a hard break — and recorded it as a backslash before this rule is
reached.

**The honest cost.** An HTML block's trailing whitespace goes too, and inside a
`<pre>` it was significant to a browser. Exempting `html_block` would leave that
block's tree with no canonical projection, which is the defect being fixed; a
document that needs those spaces can carry a code block, which keeps them. Stated
rather than hidden, as with `L-9` and `L-10`.

### Examples

Three are proposed for Part 1, in §2.6 beside the other `E-4` examples. Each was
checked against the prototype.

`````markdown
A label of more than one line does not carry the indentation of the item that
holds it (E-4), and P-1 writes it back at the item's content column:

````example
- x
  - a
    b
.
{"content":[],"children":[
  {"kind":"item","label":"x","content":[],"children":[
    {"kind":"item","label":"a\nb","content":[],"children":[]}]}]}
````

A line indented further than the first keeps what is left over, as a content
block does. Here the first line gives up two columns and the second has four,
written with a tab:

````example
- a
→b
.
{"content":[],"children":[
  {"kind":"item","label":"a\n  b","content":[],"children":[]}]}
````

A hard break inside a label is still one construct, recorded in the backslash
form (L-9), and the line after it is indented like any other:

````example
- x
  - a\
    b
.
{"content":[],"children":[
  {"kind":"item","label":"x","content":[],"children":[
    {"kind":"item","label":"a\\\nb","content":[],"children":[]}]}]}
````
`````

The first and third are canonical. The second is not: a tab is written back as
the four spaces it stood for, so the document settles on the first round trip, as
with L-9 and L-10.

Two more are proposed for Part 2, in §2.2 beside L-9's examples.

```````markdown
Trailing whitespace is not recorded, so a stray space does not make a document
unprojectable (E-5). Shown here as `␣`:

````example
# Note

para␣␣
.
{"content":[],"children":[
  {"kind":"section","label":"Note",
   "content":[{"block":"paragraph","source":"para"}],
   "children":[]}]}
````

A code block keeps it, because there it is the code (P-8):

````example
# Patch

```diff
-old␣␣
+new
```
.
{"content":[],"children":[
  {"kind":"section","label":"Patch",
   "content":[{"block":"code_block","source":"```diff\n-old  \n+new\n```"}],
   "children":[]}]}
````
```````

The first is conforming and not canonical; the second is canonical and is the
example RFC 0038 already put in §2.2, repeated here only to show the pair.

### Round-trip consequence

- **Trees.** Every document with a multi-line label below the top level lifts to
  a different tree than it does today, and every one now survives the round trip.
  A label at depth one lifts to a different tree too — `a\nb` rather than
  `a\n␣␣b` — although its document round trip passed before.
- **Canonical documents.** No document changes status. The projection of a
  depth-one label is byte-identical to what it was; below depth one, documents
  that were non-canonical by this defect become canonical.
- **Part 2, trees.** Every document with trailing whitespace outside a code block
  lifts to a different tree than it does today. Every such tree now has a
  canonical projection, where before it had none.
- **Part 2, canonical documents.** A document with trailing whitespace becomes
  conforming and not canonical, where before it was conforming and
  unprojectable. Its bytes settle on the first round trip.
- **The suite.** No existing example changes.

### Edge cases

| | |
|---|---|
| A label whose continuation line is indented with a tab | The tab is four columns; the first line's columns are removed and the rest stays, as in the second example |
| A label whose continuation line is blank | Cannot happen: a blank line ends the paragraph the label comes from |
| A hard break spelled with trailing spaces | `L-9` records it in the backslash form first; indentation is applied to what `L-9` produced |
| A continuation line that reads as a block | Cannot arise from indentation: a line that would open a block inside a list item is not a continuation. The one way a block-looking line becomes a label or a paragraph's first line is [#56](https://github.com/mindmapmarkdown/spec/issues/56), which this RFC does not address |
| A setext heading's label | The underline is already removed before this rule applies, so there is nothing left to re-indent |

Bounds: the columns removed from a line are bounded by the label's starting
column, which is bounded by list nesting. One linear pass.

### How it is tested

The three examples above, once they are in `spec.md`. And a prototype on
[`rfc/multi-line-label`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/multi-line-label),
which passes the existing suite unchanged and fourteen further tests across both
parts — for Part 1 a hard break in both spellings, a tab-indented continuation,
three lines, a label beside content, a label with a sibling after it, links and
emphasis across lines and a setext heading; for Part 2 a paragraph, a block
quote, a table, a list item's content, a tab, a hard break on a line that is not
the last, a code block that keeps its whitespace and an HTML block that does not.
Each case checks the tree round trip, byte stability, and that no line outside a
code block ends in whitespace. 146 tests, 145 pass, 1 todo.

A sweep over 40,000 generated documents, which found Part 1's defect, reports no
remaining failure of that kind.

## Alternatives

**Do nothing.** `S-7` cannot land, so RFC 0043 cannot land, and a wrapped line in
a nested bullet keeps failing the round trip. Rejected.

**Forbid a multi-line label in a canonical document**, as a `P-` rule. Projection
would have to fold the label onto one line, which changes what the author wrote
and is what `P-9` refuses to do for content. It also would not help: lift would
still produce the tree `S-7` rejects, because the defect is in `E-4`, not in
projection. Rejected.

**Fold a multi-line label onto one line at lift.** The tree would hold `a b`, and
the round trip would pass. It discards a line break the author wrote, and `L-9`
already decided the opposite for the one line break Markdown gives meaning to.
Rejected.

**Define the removed indentation as the item's content offset**, as CommonMark
computes it, rather than as the label's first-line column. The two agree wherever
a label begins at its item's content column, which is always: a label is the
item's first inline content. The first-line rule is chosen for one reason only —
it is the same rule `E-5` states, and two rules that say the same thing in
different words drift. Rejected on symmetry, not on behaviour.

**Part 2: remove trailing whitespace at projection instead.** Projection would
trim each line on the way out, and the tree would keep what the document had.
Then lifting the projection gives a different tree, which is the first half of
§1.2.4's inversion failing — the reason `L-9` normalises at lift. Rejected, for
the third time in this specification.

**Part 2: exempt `html_block` as well as code.** Keeps the one case where the
whitespace means something to a renderer. It also puts that block's tree back
where it is today, with no canonical projection, which is the whole defect.
Rejected at the stated cost.

**Part 2: amend `P-8` to allow it, rather than `E-5` to drop it.** Canonical
documents would then carry trailing whitespace anywhere, which is what RFC 0038
Part 3 argued for **inside code** and against everywhere else: outside code the
whitespace is invisible, and an editor that trims on save would make every
document non-canonical. Rejected.

**Prior art.** OPML has no case: a `text` attribute is one line, and a line break
inside it is not expressible. markmap flattens a wrapped item to one line. The
choice here follows CommonMark instead: a paragraph's lines after the first have
their container's indentation removed, and `E-4` now agrees with `E-5`, which
agrees with CommonMark.

## Unresolved questions

**What an item's label is when its first block is not a paragraph.** Named by RFC
0043 and still open. This RFC does not touch it.

**A paragraph whose source reads as a list**
([#56](https://github.com/mindmapmarkdown/spec/issues/56)), RFC 0058. Independent
of both parts here: it is about what a line means, not about how far it is
indented or how it ends. Part 2 does reach one of that RFC's documents — the
trailing space in `1.␣` — and RFC 0058 says so.

**Separability.** Parts 1 and 2 are independent. Each fixes documents the other
does not, the prototype implements them separately, and the decision may accept
one and not the other. It should record each part's outcome, as RFC 0038's did.

**Whether `P-1` is the right rule to carry projection's half.** It could as
reasonably be `P-4`, which already indents an item's content, or `P-9`, which
governs how a recorded string is written. `P-1` is chosen because it is the rule
that writes the marker and the label together, and the continuation lines belong
to that line's construct. A reviewer who prefers another home should say so; it
changes nothing about behaviour.

## Decision and rationale
