# RFC 0038: What a content block's source contains

**Translations** — [한국어](ko/0038-content-block-source.md). This English text is
the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-09-14 |
| **Comment period ends** | 2026-09-28 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/38> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

`E-5` records each block of node content with its source "verbatim". That word
decides less than it seems to, and three things go wrong because of it:

1. **Any multi-line block inside a list item fails the round-trip.** Every line
   after the first keeps the item's indentation, and projection adds it again.
   An ordinary two-line paragraph under a list item is enough.
2. **A code block's source depends on how it was spelled** — fenced or indented,
   backticks or tildes, how long the fence is, how far the fence is indented.
   For some spellings canonical projection breaks `P-5`; for one, the code
   itself changes while the tree stays equal.
3. **`P-8` forbids whitespace that is part of code.**

This RFC proposes three parts, each of which can be decided on its own. **Part 1**
amends `E-5` so that indentation belonging to an enclosing list item is not part
of a block's source. **Part 2** adds `L-11`, recording every code block in the
one fenced form `P-5` allows. **Part 3** amends `P-5` for the one info string a
backtick fence cannot carry, and exempts code content from `P-8`.

**No existing example changes.** A prototype passes the whole suite unchanged,
plus 23 cases built from the failures below. This resolves the Normative half of
issue [#19](https://github.com/mindmapmarkdown/spec/issues/19).

## Motivation

### What goes wrong today

Every row was run against the reference implementation at
`mindmapmarkdown/mindmapmd@657da17`, which follows `E-5` literally — so each row
is what a careful reading of the current text produces, not a bug peculiar to one
program. In this table `␣` stands for a space and `⏎` for a line feed.

| Document | `source` recorded | What happens |
|---|---|---|
| A list item, then a two-line paragraph: `␣␣para one`, `␣␣para two` | `para one⏎␣␣para two` | Projection indents every line of item content by two spaces, so the second line now has four. **The tree round-trip fails** |
| The same paragraph under a nested item, under an ordered item `1.`, or a two-line block quote under an item | The second line keeps its indentation | **The tree round-trip fails**, each time |
| An indented code block: `␣␣␣␣make all`, `␣␣␣␣make test` | `make all⏎␣␣␣␣make test` | The first line lost its indentation and the second did not. **The tree round-trip fails** |
| A fenced code block inside a list item | Every line after the first keeps the item's indentation | **The tree round-trip fails** |
| A tilde fence, `~~~py` around `x = 1` | `~~~py⏎x = 1⏎~~~` | Written back with tildes. **Canonical projection breaks `P-5`**, which requires backticks |
| A fence indented two spaces: `␣␣` + three backticks, `␣␣x`, `␣␣␣␣y`, `␣␣` + three backticks | The same four lines, less the first line's two spaces | Written back with the fence at column 0 and the other lines unchanged. **The tree round-trip passes, and the code changes**: CommonMark read the content as `x` and `␣␣y`, and now reads `␣␣x` and `␣␣␣␣y` |
| A code line ending in two spaces | Kept | **Canonical projection breaks `P-8`**. Removing the spaces would change the code |

The sixth row is the one to look at twice. The check the suite makes — *does the
tree survive?* — passes, because the recorded string is the same before and
after. What that string **means** is different. A rule that lets equal trees
carry different code is not one the suite can defend.

### Why nothing caught it

No example has a multi-line block inside a list item, and none has an indented or
tilde-fenced code block. Issue #19 recorded why the second gap exists: **no
indented-code example can be written until this question is decided**, because
there is no correct expected tree to write.

### Why it is Normative

Every case above lifts to a different tree under this proposal than under the
reading the reference implementation takes today, and the current text supports
that reading. Changing what a tree contains is Normative
([`GOVERNANCE.md` §3](../GOVERNANCE.md#3-classes-of-change)). It is not Breaking:
nothing is released, so no implementation can have claimed conformance to a
version ([`VERSIONING.md` §4](../VERSIONING.md#4-what-a-conformance-claim-cites)),
and no document stops conforming — lift accepts everything it accepted before.

## Detailed design

### Part 1 — Indentation that belongs to a list item is not source

**`E-5`, amended.** The member `source` becomes:

> `source`, that block's Markdown source — internal line breaks included, with no
> trailing line feed, and **with no line keeping more leading whitespace than the
> block's first line gave up.** The first line begins at the column where the
> block begins; from each later line, up to that many columns of leading
> whitespace are removed, a tab advancing to the next multiple of four as
> CommonMark counts it. `L-9`, `L-10`, and `L-11` further normalise particular
> blocks.

The columns before a block's first character belong to whatever contains the
block — a list item's marker and padding — and not to the block. That is already
what happens to the first line; this makes every line agree with it.

- **Lazy continuation lines** have less indentation than the first line, or none.
  They lose what they have and nothing more.
- **A block at the top level** begins at a column of at most three. Its later
  lines lose at most that many columns, so relative indentation inside the block
  — in an HTML block, say — survives.
- **Labels are not affected.** `E-4` governs them; see *Unresolved questions*.

Projection needs nothing new: `P-4` already indents an item's content, and that
indentation is now added to lines that no longer carry it.

### Part 2 — A code block is recorded fenced

**`L-11`, new.**

> **L-11.** A code block — fenced or indented — MUST be recorded with `block`
> equal to `code_block` and `source` made of:
>
> 1. an opening line: the **fence** immediately followed by the **info string**;
> 2. one line for each line of the **content**;
> 3. a closing line: the fence alone.
>
> The **content** is the code block's content as CommonMark defines it — the text
> a CommonMark renderer places inside the code element, with the indentation
> CommonMark removes already removed, including an indented block's four
> columns, an indented fence's indentation, and a list item's. Its final line
> feed does not produce an additional line. Empty content produces no lines.
>
> The **info string** is, for a fenced block, the rest of the opening fence line
> as written, with leading and trailing whitespace removed; for an indented
> block, empty.
>
> The **fence** is backtick characters, or tilde characters if the info string
> contains a backtick. Its length is three, or one more than the longest run of
> that character anywhere in the content, whichever is greater.

Consequences, each checked against the prototype. Here too `␣` is a space and `⏎`
a line feed.

| Spelling in the document | `source` |
|---|---|
| ` ```bash ` around `npm i` — already canonical | ` ```bash⏎npm i⏎``` ` — **unchanged**; this is the code block in suite example 6 |
| `make all`, indented four spaces | ` ```⏎make all⏎``` ` |
| `~~~py` around `x = 1` | ` ```py⏎x = 1⏎``` ` |
| ``~~~ a`b`` around `x` | ``~~~a`b⏎x⏎~~~`` — a backtick fence cannot carry that info string |
| ` ````js ` around `x` | ` ```js⏎x⏎``` ` — the fence is as short as it can be |
| ` ```` ` around content that holds a ` ``` ` fence | ` ````⏎```⏎inner⏎```⏎```` ` — long enough to hold it |
| A fence indented two spaces, content `␣␣x`, `␣␣␣␣y` | ` ```⏎x⏎␣␣y⏎``` ` — **the code CommonMark read** |
| An unclosed fence running to the end of the document | The same content, **with** a closing fence |

Three choices in `L-11` need their reasons recorded.

**The info string as written, not as CommonMark unescapes it.** CommonMark
resolves backslash escapes and entities in an info string. `L-11` does not,
because the escape is what the author wrote: an info string `a\_b` is recorded as
`a\_b`, and projection writes back the same line.

**The longest run anywhere, not only at the start of a line.** Only a run at the
start of a line can close a fence, so the narrower rule would suffice. The wider
one is chosen because a single scan of the content decides it, with no knowledge
of CommonMark's closing-fence rule, and it is never shorter than needed. Its cost
is an occasional fence one character longer than necessary.

**The fence's length is normalised.** A document whose fence is longer than it
needs to be becomes non-canonical. The alternative keeps the length in the tree,
so that two documents with identical code lift to different trees — a difference
no reader can see, and one an L2 diff would report as a change. See
*Alternatives*.

### Part 3 — `P-5` and `P-8`

**`P-5`, amended.**

> **P-5.** Code blocks MUST be fenced — with backticks, or with tildes when the
> info string contains a backtick. Indented code blocks MUST NOT appear in a
> canonical document.

**`P-8`, amended.**

> **P-8.** No line may end in whitespace, **except a content line of a code
> block**, and the document MUST end with exactly one line feed.

`L-9` and `L-10` both resolved a collision with `P-8` by removing whitespace at
lift. Code is the case where that answer is wrong. In a paragraph, trailing
spaces are either a hard break, which `L-9` keeps in another spelling, or
nothing. In front matter they are insignificant to every consumer. **In a code
block they are the code** — a patch that changes whitespace, a Markdown sample
demonstrating a hard break, a language where trailing whitespace is syntax.
Removing them is exactly the silent change to content that Part 2 exists to
prevent.

The honest cost: a canonical document can now contain trailing whitespace, and
an editor that trims it on save will change that document. The same editor
changes the code in any Markdown file, whatever this specification says; what
this specification can do is not be the thing that changes it.

### Examples

Four examples are proposed, all in §2.2 near the existing code block example.
Each was checked against the prototype, including whether the document is
canonical.

`````markdown
An indented code block is recorded fenced, so its source does not depend on how
it was written (L-11). Canonical form writes it fenced (P-5), so this document is
conforming and not canonical:

````example
# Build

    make all
.
{"content":[],"children":[
  {"kind":"section","label":"Build",
   "content":[{"block":"code_block","source":"```\nmake all\n```"}],
   "children":[]}]}
````

A tilde fence is recorded with backticks, for the same reason:

````example
# Run

~~~py
print(1)
~~~
.
{"content":[],"children":[
  {"kind":"section","label":"Run",
   "content":[{"block":"code_block","source":"```py\nprint(1)\n```"}],
   "children":[]}]}
````

A block inside a list item carries none of the item's indentation (E-5), on any
of its lines:

````example
- Install

  Run this
  from the root:

  ```sh
  npm i
  ```
.
{"content":[],"children":[
  {"kind":"item","label":"Install",
   "content":[
     {"block":"paragraph","source":"Run this\nfrom the root:"},
     {"block":"code_block","source":"```sh\nnpm i\n```"}],
   "children":[]}]}
````

Trailing whitespace inside a code block is content, and a canonical document
keeps it (P-8). Shown as `␣`:

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
`````

The third and fourth are canonical; the first two are not.

### Round-trip consequence

- **Trees.** Every case in *Motivation* lifts to a different tree than it does
  today, and every one survives the round-trip — both halves of §1.2.4's
  inversion — with each code block's CommonMark content and info string
  unchanged by projection.
- **Canonical documents.** Some documents change status, and the list is short
  enough to give in full:

  | Document | Before | After |
  |---|---|---|
  | Tilde fence, or indented code | not canonical | not canonical |
  | Fence longer than it needs to be | canonical | **not canonical** |
  | Fence indented one to three spaces | canonical | **not canonical** |
  | Trailing whitespace inside code | not canonical (`P-8`) | **canonical** |

  A document that is not canonical still conforms, and its bytes settle on the
  first round-trip, as with `L-9` and `L-10`.
- **The suite.** No existing example changes. Example 6's code block is already
  in the form `L-11` records.

### How it is tested

The four examples above, once they are in `spec.md`. And a prototype on the
reference implementation's branch
[`rfc/0038-prototype`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/0038-prototype),
which passes the existing suite unchanged, the four examples exactly, and 23
further cases. Each case checks:

- that the tree survives the round-trip;
- that a second projection is byte-identical to the first;
- **that each code block's CommonMark content and info string are the same before
  and after projection** — the check that catches the sixth row above, which tree
  equality alone does not;
- that projected fences follow `P-5` as amended, and projected lines outside code
  follow `P-8` as amended.

### Bounds

The fence grows with the longest run of one character in the content, so it is
never longer than the content plus one, and finding it is a single linear scan.
The columns removed from a line are bounded by the block's starting column, which
is bounded by list nesting. Neither introduces anything superlinear.

## Alternatives

**Do nothing.** Every failure in *Motivation* stays, and the indented-code
example stays unwritable. Rejected.

**Keep "verbatim" literally, and make projection convert.** That is, the tree
keeps each block's lines exactly as the document had them, and projection
re-indents and re-fences on the way out. This is the reading the reference
implementation takes today, and the table in *Motivation* is what it produces:
projection changes the spelling, so lifting the result yields a different tree,
which is the first half of §1.2.4's inversion failing. `L-9` rejected the same
design for hard breaks, for the same reason. Rejected.

**Record a code block's content only, with no fence.** Issue #19 raised this. A
bare `source` cannot carry the info string, so the entry would need a third
member — a change to `E-5`'s shape that every code block in every tree would have
to make. It would also change example 6. `L-11` changes neither, for any code
block already written in canonical form. Rejected.

**Keep the fence length as written.** Normalise the fence character and remove
indentation, but let a four-backtick fence stay four long. Fewer documents change
canonical status. But two documents containing identical code would lift to
different trees, and a structural diff (L2) would report a change nobody can see.
This specification's position throughout has been that a tree holds meaning and
not spelling; the length of a fence is spelling. Rejected, at the stated cost that
over-long fences become non-canonical.

**Remove trailing whitespace from code, as `L-9` and `L-10` do.** Changes code;
see Part 3. Rejected.

**Use CommonMark's unescaped info string.** Changes what the author wrote: an
info string `a\_b` would be recorded, and written back, as `a_b`. Rejected.

**Define the removed indentation as the list item's content offset**, as
CommonMark computes it, rather than as the block's first-line column. The two
agree for every block that starts at the item's content column. They disagree for
a block indented one to three columns further into the item: the offset rule
removes less, and the extra columns would remain on later lines only, leaving the
first line and the later lines inconsistent again. The first-line rule is also
what lift already does to a block's first line, so it extends existing behaviour
rather than adding a second measure. Rejected.

**Prior art.** CommonMark itself draws Part 2's line: its specification defines a
code block's content independently of how the block was spelled, and a conforming
renderer emits the same code element for an indented block and for a fenced one.
`L-11` records that content rather than inventing a notion of its own (§1.5.1).

## Unresolved questions

**Multi-line labels.** `E-4` records a label "exactly as it appears in the
source". An item whose first paragraph runs over two lines therefore keeps the
item's indentation on its second line — the situation Part 1 fixes for content.
The prototype leaves labels unchanged, and they do survive the round-trip, but
the two rules now disagree. Named for a later change, not proposed here.

**Trees built by hand.** A program can construct a tree whose `code_block` source
is not in `L-11`'s form — indented, or tilde-fenced for no reason. `P-9` would
write it as recorded and break `P-5`. `S-4` rejects a misplaced `front_matter`
entry for the analogous reason; whether a well-formedness rule should reject such
a code block, or projection should normalise it, is not decided here.

**Separability.** Parts 1, 2, and 3 are independent: each fixes cases the others
do not, and the prototype implements them separately. The decision may accept
some and not others, and should record each part's outcome.

**The Clarifying half of issue #19** — which block type names `E-5` uses — was
answered by RFC 0022's amendment and is not reopened.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
