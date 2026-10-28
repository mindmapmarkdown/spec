# RFC 0072: A label is inline content

**Translations** — [한국어](ko/0072-label-is-inline-content.md). This English text
is the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Accepted |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-03 |
| **Comment period ends** | 2026-10-17 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/72> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

RFC [0043](0043-well-formed-round-trip.md) named a question under *Unresolved
questions* and did not answer it: **what an item's label is when its first block
is not a paragraph.** This RFC answers it, and fixes the one other thing that
answer leaves broken.

- **Part 1** — a label is the node's first *inline* content, so only a paragraph
  can be one. An item whose first block is a thematic break, a block quote, a
  fenced block or a table has an **empty label**, and that block is content like
  any other ([#71](https://github.com/mindmapmarkdown/spec/issues/71)).
- **Part 2** — `P-4`'s indentation may not reach four columns when an item begins
  with a blank line, because CommonMark reads four columns there as an indented
  code block whatever the marker was.

Together they take the whole 0.1.0 configuration from **136 ill-formed documents
in 40,000 to zero, and to zero over 300,000 across five seeds.** They are the
last thing standing between `S-7` and `spec.md`.

## Motivation

### Part 1 — the label that cannot be written back

```markdown
-
  ---
```

The item's first block is a thematic break. `E-4` records the label as that
block's source, `---`, and `P-1` writes it back as `- ---` — which CommonMark
reads as **a thematic break**, not a list at all. The tree has no canonical
projection.

It is not only the broken case that is wrong. `-` then `␣␣> q` lifts to a node
*labelled* `> q`. A reader sees an unlabelled bullet containing a quotation; the
tree says the node is called `> q`. The round trip happens to survive that one,
which is why it went unnoticed, and surviving is not the same as being right.

### Part 2 — four columns is code

```markdown
10. a
1. 
  > q
```

CommonMark numbers the second item 11. It has an empty label and a block quote
as content, so `P-4` — as RFC [0039](0039-ordered-lists.md) amends it — indents
the content by the marker's width plus one: **four columns**. An item that begins
with a blank line has its content measured from column 0, so four columns are an
indented code block. The quote comes back as code.

| Document | Content indent | What CommonMark reads |
|---|---|---|
| `1.` ⏎ ⏎ `␣␣> q` | 2 | a block quote |
| `11.` ⏎ ⏎ `␣␣␣> q` | 3 | a block quote |
| `11.` ⏎ ⏎ `␣␣␣␣> q` | **4** | **an indented code block** |

### The measurement

`tools/sweep.mjs` in the reference implementation, run against a branch where
every open proposal lands — RFC 0039, 0046, 0048, 0051, 0057, 0058, 0067, 0069 —
with `S-7` active:

| | Ill-formed in 40,000 |
|---|---|
| Those eight rules alone | **136** — 82 Part 1, 54 Part 2 |
| With Part 1 | 28 |
| With both | **0** |
| With both, five seeds, 300,000 documents | **0** |

**Those 136 were reported as zero the day before.** The sweep's generator could
not put a construct inside a list item, so it could not reach either class;
[mindmapmd#12](https://github.com/mindmapmarkdown/mindmapmd/pull/12) fixes the
generator, and is the reason this RFC exists rather than a release.

### Why it cannot wait

`S-7`'s landing was deferred past 0.1.0 on 2026-10-02, and the condition recorded
for bringing it back was "#61 answered, the label question behind it answered,
and the sweep reporting zero over a run large enough to mean something." #61 was
answered by RFC [0069](https://github.com/mindmapmarkdown/spec/pull/69) the same
day. **This is the rest of that condition**, and Part 1 is also a correctness
question in its own right: a node called `> q` is wrong whether or not `S-7`
exists to catch it.

## Detailed design

### Part 1 — `L-2` and `E-4`, amended

`L-2` gains a sentence:

> An item's `label` is the inline content of its first block when that block is a
> paragraph, and is empty otherwise. A block that does not give a label is
> content (`L-3`), in the position it occupies.

And `E-4`'s first sentence becomes:

> `label` MUST be the node's **inline** content exactly as it appears in the
> source, with leading and trailing whitespace removed […]

The word doing the work is **inline**. A heading's label is its heading text, an
item's is its first paragraph's text, and a thematic break, a block quote, a
fenced block, a table and an HTML block have no inline content of their own to
lend. They were never labels; `E-4` simply did not say so, and lift took the
first block it was given.

A heading is unaffected: `L-1` makes a heading a `section` and a heading is
inline content by construction. `S-1` already refuses a heading inside an item.

### Part 2 — `P-4`, amended

The sentence RFC 0039 wrote gains a bound:

> Each list nesting level MUST be indented by exactly the width of its parent
> item's marker plus one, **except that when an item's `label` is empty and its
> content is written after a blank line, the indentation MUST be three columns**
> where the marker's width plus one would be four or more.

All three conditions are load-bearing, and the prototype tested a version
missing the first: capping the indentation for a *labelled* item as well made
`10. a` ⏎ ⏎ `␣␣␣␣> q` non-canonical for no reason — the item does not begin with a
blank line, so its content is measured from the marker and four columns are
exactly right there.

The exception is CommonMark's constraint, not a preference. An item whose first
line is a bare marker followed by a blank line has its content measured from
column 0, so at four columns the content is an indented code block. Three is the
largest indentation that is not, and it still places the content inside the item
— checked for markers up to `100.`.

### Examples

Four are proposed: two for Part 1 in §2.2 beside the `L-3` examples, and two for
Part 2 in §2.5 beside `P-4`'s.

`````markdown
A block that is not a paragraph gives no label, and is content where it stands
(L-2). An unlabelled bullet carrying a quotation is a node with no name, not a
node called `> q`:

````example
-

  > q
.
{"content":[],"children":[
  {"kind":"item","label":"",
   "content":[{"block":"block_quote","source":"> q"}],
   "children":[]}]}
````

The same for a thematic break, which is the case that could not be written back
at all — `- ---` is itself a thematic break:

````example
-

  ---
.
{"content":[],"children":[
  {"kind":"item","label":"",
   "content":[{"block":"thematic_break","source":"---"}],
   "children":[]}]}
````

An item that begins with a blank line has its content measured from column 0, so
P-4 writes three columns where four would be an indented code block:

````example
10. a

11.

   > q
.
{"content":[],"children":[
  {"kind":"item","label":"a","ordinal":10,"delimiter":".",
   "content":[],"children":[]},
  {"kind":"item","label":"","ordinal":11,"delimiter":".",
   "content":[{"block":"block_quote","source":"> q"}],
   "children":[]}]}
````

A label of its own puts the content back at the marker's width plus one, because
the item does not begin with a blank line:

````example
10. a

    > q
.
{"content":[],"children":[
  {"kind":"item","label":"a","ordinal":10,"delimiter":".",
   "content":[{"block":"block_quote","source":"> q"}],
   "children":[]}]}
````
`````

**All four are canonical**, which is worth stating because the first three are
written here in a form that may look unusual. `P-7` makes a list loose when an
item carries block content, so the blank lines are required; the third shows the
ordinal CommonMark gives the second item, 11, which `L-12` records and `P-3` writes;
and the third's three columns against the fourth's four are Part 2 and its
absence, side by side in the same example pair.

### Round-trip consequence

- **Part 1, trees.** Every document with an item whose first block is not a
  paragraph lifts to a different tree: the label moves into `content` and the
  label becomes empty. Those trees now have canonical projections, where the
  thematic-break case had none.
- **Part 2, trees.** Nothing changes. It is a projection rule.
- **Conforming documents.** Nothing changes. Nothing starts or stops conforming.
- **Canonical documents.** Both parts change what canonical form looks like for
  the shapes above; each settles on the first round trip.
- **The suite.** No existing example changes.

### Edge cases

| | |
|---|---|
| An item whose first block is a nested list | Already handled by `L-7`, which makes it children rather than a label; unchanged |
| An item whose first block is a heading | `S-1` refuses the document; unchanged |
| An item whose *second* block is a paragraph | It is content. A label is the **first** block's inline content or nothing — a later paragraph does not become one |
| An item with an empty label, content and children | RFC 0069's rule writes the first content entry below the marker, so there is no blank line and Part 2 does not apply |
| A marker wider than `100.` | Part 2 caps at three whatever the width; checked to nine digits, the most `L-12` allows |
| An HTML block as the first block | No inline content, so no label — the same as a thematic break |

Bounds: one test of a block's type, and one comparison of two integers. Nothing
is parsed.

### How it is tested

The four examples above, once they are in `spec.md`. And a prototype on
[`rfc/label-first-block`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/label-first-block),
which is **the whole 0.1.0 configuration plus these two changes** — built that
way because Part 2 amends `P-4` as RFC 0039 amends it, and that padding does not
exist without 0039. 247 tests, 247 pass, 0 fail, 0 todo, and the sweep numbers
above.

## Alternatives

**Do nothing.** A conforming document lifts to a tree with no canonical
projection, and nodes are named after block markup. Rejected.

**Keep the block as the label and forbid the ones that cannot be written back** —
a well-formedness rule against a label like `---`. It is a partial grammar of
CommonMark inside this specification, which is what RFC 0043 avoided by stating
`S-7` over the round trip; and it would leave `> q` as a node's name, which is
the part of the defect a round trip cannot see. Rejected.

**Make an item whose first block is not a paragraph not a node at all.** Then
`-` followed by `␣␣> q` would lift to no item, and a reader sees a bullet.
Rejected on §1.2.4 L0: the tree must not disagree with what an unmodified
renderer shows.

**Part 2: cap the indentation at three everywhere**, not only after a blank line.
Simpler to state and it changes canonical form for every wide-marker item that
has content, including ones that work today. Rejected as a wider change than the
defect.

**Part 2: write the content on the line below the marker instead**, extending RFC
0069's rule to every empty label. Measured: it takes the sweep from 28 failures
to 734, because a paragraph written there becomes the label. Rejected with
numbers.

**Part 2: amend `P-4` to measure from the marker rather than from the line.**
`P-4` does measure from the marker; CommonMark is what measures from column 0 for
an item that begins with a blank line. This specification cannot amend CommonMark
(§1.5.1). Rejected.

**Prior art.** OPML has no equivalent: a node is an attribute, and block content
cannot be a node's text. markmap takes the first line of an item as its label and
drops the rest, which is Part 1 with content discarded rather than kept. The
choice here follows CommonMark's own distinction between inline and block
content.

## Unresolved questions

**Whether `L-2` or `E-4` is the right home for Part 1.** It is written in both:
`L-2` says which block gives the label, `E-4` says what a label is. A reviewer who
would put it in one place only should say which.

**A multi-line label whose first block is a paragraph** is RFC
[0057](https://github.com/mindmapmarkdown/spec/pull/57) Part 1 and RFC
[0067](https://github.com/mindmapmarkdown/spec/pull/67), both of which stand
unchanged: Part 1 here decides *whether* there is a label, not what it may
contain.

**What a `section` does when its first content block is not a paragraph.** It
cannot arise: `L-1` makes a heading a section and the heading's own text is the
label. Named so that the next reader does not have to re-derive it.

**Zero is evidence, not proof.** The sweep searches a space built from
twenty-six fragments; it found nothing in 300,000 documents, and it found 136 in
40,000 the day after it found none in 240,000. The fragment set is the limit of
the claim, and anyone adding to it should expect to be the next person writing
one of these.

## Decision and rationale

**Part 1: accepted. Part 2: accepted.** 2026-10-29, by lazy consensus. The
comment period ran in full, from 2026-10-03 to 2026-10-17, with no comment and no
objection while it was open, and the text did not change. The decision is
recorded **twelve days late**.

### What was raised after the period closed, and how both were resolved

An objection was filed on 2026-10-22, five days late, on two grounds. Like RFC
0067's it says of itself that it is about the evidence and not the rule.

**1. The 247 tests were measured on a stack containing an objected rule.** The
prototype sat on `trial/0.1.0-b`, which merges RFC 0067 — and RFC 0057 Part 1
underneath it, then under objection — together with `rfc/definition-paragraph`,
the RFC 0058 that the revision of 2026-10-05 superseded. So 247 of 247 was not a
statement about this rule on its own.

**Resolved 2026-10-23.** `rfc/0072-on-accepted` at `bf384cd` is
`trial/accepted-only` — current `main` plus the accepted rules and `S-7`, nothing
undecided — plus this RFC's two parts and nothing else. 222 tests, 222 pass.

**2. [mindmapmd#17](https://github.com/mindmapmarkdown/mindmapmd/issues/17) was
open against this rule's own prototype.** A non-paragraph first block sharing the
marker's line recorded the marker in its `source`, so `- ***`, `- >`, `- <a>` and
`1) ---` did not round-trip. The objection is right that this is an
implementation defect and not a specification question, and right that it still
mattered: it was most of the `nested` generator's ill-formed documents, so the
sweep could not say what else this rule does.

**Resolved 2026-10-23.** Not with a pattern for things that look like markers —
the issue is right that no pattern can work — but with the columns at which the
parser says list items actually open, read from `sourcepos`, with the marker text
checked at exactly those columns:

| Document | recorded `source` before | after |
|---|---|---|
| `- ***` | `- ***` | `***` |
| `- >` | `- >` | `>` |
| `- > q` ⏎ `␣␣> r` | `- > q␤␣␣> r` | `> q␤> r` |
| `- <a>` | `- <a>` | `<a>` |
| `1) ---` | `1) ---` | `---` |

That is the shape of fix the issue called for, and it is in the branch above.

### What the isolated measurement found in this rule's favour

Worth recording here, because it is load-bearing elsewhere. Under Part 1, `-` ⏎
`␣␣> q` ⏎ ⏎ `␣␣- b` lifts to an empty label with a `block_quote` content entry
**and** one child — a shape that is unreachable without this rule, because today
the quote becomes the label — and it round-trips. That is the re-measurement RFC
[0069](0069-empty-label-definition.md)'s unresolved question asked for before its
own decision, and it is recorded in 0069's decision of 2026-10-22. **This rule
widens the scope of an accepted rule and the accepted rule still holds**, which
is the strongest thing the isolated branch had to say.

### What this decision does not settle

**Whether `L-2` or `E-4` is the right home for Part 1** is left as written. It is
in both: `L-2` says which block gives the label, `E-4` says what a label is. No
reviewer said they would put it in one place only, and the behaviour is the same.
The `spec.md` edit should keep both sentences or merge them on editorial grounds,
not on this decision's authority.

**A multi-line label whose first block is a paragraph** is RFC 0057 ([#57](https://github.com/mindmapmarkdown/spec/pull/57)) Part 1 and RFC 0067 ([#67](https://github.com/mindmapmarkdown/spec/pull/67)), both accepted today and both unchanged by this
rule: Part 1 here decides *whether* there is a label, not what it may contain.
The three decisions are consistent, and each names the other two.

**Zero is evidence, not proof**, and this RFC says so about itself. The sweep
searches a space built from twenty-six fragments; it found nothing in 300,000
documents, and it had found 136 in 40,000 the day after finding none in 240,000.
That sentence is not softened by acceptance. The fragment set is the limit of the
claim, and the next person to add a fragment should expect to be the one writing
the next one of these — which is what happened on 2026-10-07 when the sweep's
random numbers were fixed and [#81](https://github.com/mindmapmarkdown/spec/issues/81)
to [#84](https://github.com/mindmapmarkdown/spec/issues/84) appeared at once.

### Where it lands

`spec.md` gets Part 1's sentences in `L-2` and `E-4`, and Part 2's `P-4`
condition, together with the other rules accepted for 0.1.0, in the single
landing pull request. `CHANGELOG.md` drops
[#71](https://github.com/mindmapmarkdown/spec/issues/71) from *Open before
0.1.0*.
