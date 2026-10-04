# RFC 0079: How much indentation a block's later lines lose

**Translations** — [한국어](ko/0079-block-indentation-removed.md). This English text
is the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-05 |
| **Comment period ends** | 2026-10-19 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/79> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

`E-5` removes, from each line of a content block after the first, as many columns
of leading whitespace as **the block's first line gave up**. `P-4` puts back as
many as **the node's content column** says. Those are the same number for almost
every document, and where they differ the document does not survive its own
projection.

This RFC proposes that `E-5` remove **the lesser of the two**: no more columns
than the first line gave up, and no more than `P-4` will put back. Removing more
than the first takes whitespace the block never had; removing more than the
second loses whitespace that was there.

Two examples, two new, one amended; no existing example changes. This resolves
issue [#74](https://github.com/mindmapmarkdown/spec/issues/74).

## Motivation

### The document on #74

```markdown
␣␣cont
␣␣␣␣- n3
```

`␣` is a space. This is one paragraph, and `- n3` is part of it: a list marker
four columns in cannot open a list inside a paragraph, because what four columns
would open is an indented code block, and an indented code block cannot interrupt
a paragraph. There is no heading and no list, so `L-3` attaches the paragraph to
the root.

`E-5` as RFC 0038 left it: the first line begins at column 2, so it gave up two
columns, and two columns come off every later line. The recorded `source` is

```
cont
␣␣- n3
```

`P-4` indents the content of a list nesting level. The paragraph is attached to
the root, which is not a list nesting level, so `P-4` adds nothing, and canonical
projection writes:

```markdown
cont
␣␣- n3
```

Two columns is not four. `- n3` opens a list, and lifting that document gives a
paragraph **and a node**. The content became structure, and nothing refused:
§1.2.4 L1 requires that lifting the canonical projection of a tree yield that
same tree, and here it does not.

### Why the obvious repair is also wrong

State the rule the other way — remove as many columns as `P-4` will add — and a
different document breaks:

```markdown
- a
> q
> r
␣␣␣␣- n3
```

The block quote begins at column 0, outside the item. `L-3` attaches it to the
item anyway, because the item is the nearest node preceding it, so `P-4` will
write it at the item's content column and add two columns to a block that gave up
none. Take two columns off the continuation line and `P-4` puts two back: the line
lands four columns from the left margin but only **two** past the content column,
and two columns past a content column is where a list marker opens a list. The
same failure, from the opposite direction.

This is not a corner the specification can decline to have an opinion about. It
is the ordinary consequence of `L-3`: attachment is not containment, and a block
written outside a container can belong to a node inside one.

### What it costs today, measured

`tools/sweep.mjs` in the reference implementation generates documents from
fragments, lifts each one, projects it, and lifts the result. Over 40,000
documents, with `S-7` (RFC 0043) active so that a tree failing the round trip is
reported rather than silently projected:

| `E-5` removes | seed 1234567 | 20261005 | 7 |
|---|---|---|---|
| as many columns as the first line gave up — as it stands | 139 | 139 | 138 |
| as many as `P-4` will add | 46 | — | — |
| **the lesser of the two** | 46 | 47 | 47 |

Each number is documents whose tree does not survive its own canonical
projection. The first row is this defect. What remains in the third row is a
separate family — a paragraph a link reference definition was read out of
([#56](https://github.com/mindmapmarkdown/spec/issues/56)) — which RFC
[0058](https://github.com/mindmapmarkdown/spec/pull/58) answers; with its
revision of 2026-10-05 in place as well, six seeds over 240,000 documents report
**zero**.

The two candidate numbers come out close on this generator because it produces
the block-quote shape about once in 40,000 documents. They are not close on every
generator: against the narrower sweep the prototype branch was first measured
with, *as many as `P-4` will add* scored 27 failures where `E-5` as it stands
scored none, and all 27 were that shape. A rule chosen on one generator's
arithmetic would have been the wrong rule.

### Why it is Normative

Documents that lift to one tree today lift to a different one under this
proposal — the recorded `source` of a block changes. Changing what a tree
contains is Normative
([`GOVERNANCE.md` §3](../GOVERNANCE.md#3-classes-of-change)). It is not Breaking:
nothing is released, so no implementation can have claimed conformance to a
version ([`VERSIONING.md` §4](../VERSIONING.md#4-what-a-conformance-claim-cites)),
and no document stops conforming — lift accepts everything it accepted before.

## Detailed design

### `E-5`, amended

The second sentence changes. In full, with the change in bold:

> **E-5.** `content` MUST be an array, in document order, of objects with exactly
> two members: `block`, the CommonMark block type name — or a block type name this
> specification defines for a construct CommonMark does not read as a single
> block, of which there is exactly one, `front_matter` (L-10) — and `source`, that
> block's Markdown source, internal line breaks included, with no trailing line
> feed, and with no line keeping more leading whitespace than the block's first
> line gave up. The first line begins at the column where the block begins; from
> each later line, **the lesser of those columns and the columns canonical
> projection will indent the block by (P-4) is removed**, a tab advancing to the
> next multiple of four as CommonMark counts it. L-9, L-10, and L-11 further
> normalise particular blocks.

The sentence before it is unchanged and still binds: no line may keep more
leading whitespace than the first line gave up. Taking the lesser of the two
numbers can only remove *fewer* columns than that sentence allows, never more.

The following informative text is added after the existing note on `E-5`:

> *(Informative)* Two numbers meet on a block's later lines. One is the
> indentation the block's first line gave to whatever contains it; the other is
> the indentation `P-4` will write in front of the block when the tree is
> projected. They agree whenever a block begins at the content column of the node
> it belongs to, which is almost always.
>
> They disagree in two ways, and each has a document behind it. A block at the
> top level attached to the root gave up columns that `P-4` will not replace —
> remove them and a line can come back nearer the left margin than it began, where
> a list marker or a setext underline means something it did not mean before. A
> block written at column 0 and attached by `L-3` to a list item gave up no
> columns at all, and `P-4` will add the item's — remove the item's and the line
> comes back *further* from the content column than it should.
>
> The lesser of the two is the number that is safe in both directions, and it is
> the only one that is: removing more than the first line gave up takes whitespace
> that was never the container's to take, and removing more than `P-4` restores
> loses whitespace the author wrote.

### What this does and does not touch

- **Labels.** `E-4` governs them, not `E-5`. A label is inline content and takes
  the indentation question with it; RFC 0057 Part 1 and RFC 0072 are where that
  is settled.
- **Code blocks.** `L-11` records a code block's content as CommonMark defines
  it, with the indentation CommonMark removes already removed. `E-5`'s arithmetic
  does not apply to it, and this RFC does not change that.
- **The first line.** Unchanged: it begins at the column where the block begins,
  so it keeps no leading whitespace at all.
- **`P-4`.** Unchanged. This RFC makes `E-5` depend on what `P-4` does; it does
  not change what `P-4` does.

### A note on what "`P-4` will indent the block by" means

It is the content column of the node the block is **attached** to, as `L-3`
determines attachment, and not the content column of the CommonMark container the
block was written inside. For `- a`, then `> q` at column 0, those are two and
zero; `L-3` says the item, so the number is two.

Stating it over attachment rather than containment is what makes the rule
composable: the number `E-5` removes is then the number `P-4` adds, by
construction, for every block in every tree. The reference prototype records it
on each node as the tree is built.

RFC 0038 considered and rejected a container-based rule — *define the removed
indentation as the list item's content offset, as CommonMark computes it* — for a
cosmetic reason: it left a block's first and later lines inconsistent. There is
now a better reason. Measured against the same 40,000 documents, a container rule
takes 139 failures to **1,289**, because it strips by containment while `P-4`
indents by attachment, and the two disagree for exactly the shape in *Why the
obvious repair is also wrong*.

### Examples

Two examples are proposed for §2.2. Each was checked against the prototype,
including whether the document is canonical.

`````markdown
A block attached to the root gives up its columns to nothing, so nothing is
removed from its later lines (E-5). Canonical form writes the block at the root's
content column, which is zero, so this document is conforming and not canonical:

````example
  cont
    - n3
.
{"content":[{"block":"paragraph","source":"cont\n    - n3"}],"children":[]}
````

A block written at column 0 and attached to an item by L-3 gave up no columns,
and P-4 will add the item's two. No line loses more than it gave up, so the
block quote's continuation line keeps all four of its columns, and projection
writes it six columns in:

````example
- a
> q
> r
    - n3
.
{"content":[],"children":[
  {"kind":"item","label":"a",
   "content":[{"block":"block_quote","source":"> q\n> r\n    - n3"}],
   "children":[]}]}
````
`````

Neither document is canonical in its spelling above; both settle on the first
round trip, as with `L-9` and `L-10`.

**No existing example changes**, including the one RFC 0038 added for a block
inside a list item — `- Install`, then a two-line paragraph and a fenced code
block at the item's content column. Both numbers are two there, so the lesser of
them is two and the tree is identical. The phrase being amended appears once in
`spec.md`, in `E-5` itself; no informative passage repeats it.

### Round-trip consequence

- **Trees.** Both documents in *Motivation* lift to a different tree than they do
  today, and both survive the round trip. Six seeds, 240,000 documents, with RFC
  0058's revision in place: zero trees fail to survive their own projection.
- **Canonical documents.** No document that is canonical today stops being
  canonical, and none that is not becomes canonical. The rule changes what is
  recorded for documents that were not canonical either way — a block whose
  indentation does not match its node's content column is not something canonical
  projection writes.
- **The suite.** No existing example changes.

### How it is tested

The two examples above, once they are in `spec.md`. And a prototype on branch
[`rfc/pad-matches-projection`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/pad-matches-projection)
of the reference implementation, stacked on the whole 0.1.0 configuration with
`S-7` active, because the rule means nothing against a `P-4` that later proposals
are still moving. It passes 253 tests, two of which are the two documents above —
one for each half of the rule, because each half is what the other half gets
wrong.

The generated sweep is the test that matters here, and it is the one that found
this. A rule about indentation arithmetic has a search space, and the honest way
to count its holes is to search it.

### Bounds

The number removed from a line is bounded by the lesser of two quantities that
are each already bounded — the block's first-line column, and a node's content
column, which is bounded by list nesting. Taking a minimum of two numbers adds
no cost. Nothing here is superlinear and nothing depends on document content
beyond the leading whitespace of each line.

## Alternatives

**Do nothing.** 139 documents in 40,000 lift to trees that do not survive their
own projection, and under `S-7` an implementation must refuse to project them.
Without `S-7` it writes a document that reads back as something else. Rejected.

**Remove as many columns as `P-4` will add.** The repair that comes to mind
first, and the one this RFC's prototype was built with for a day. It fixes the
document on #74 and breaks the block quote above: 27 failures in 40,000 against
one generator, about 1 in 40,000 against another. Rejected, and the measurement
is in *What it costs today*. It is worth recording that both generators were
needed to see it — one of them reported 0 for this rule and would have let it
through.

**Define the removed indentation as the CommonMark container's content offset.**
RFC 0038 recorded and rejected this. Still rejected, now with a measured reason:
139 failures become 1,289, because it strips by containment where `P-4` indents
by attachment. See *A note on what "`P-4` will indent the block by" means*.

**Change `P-4` instead, so that it indents a block by whatever the block's first
line gave up.** This would require the tree to record that number, which is
spelling and not meaning — two documents whose blocks differ only in indentation
would lift to different trees, and an L2 structural diff would report a change no
reader can see. The specification's position throughout is that the tree holds
meaning; `L-11` rejected a fence's length for the same reason. Rejected.

**Make `E-5`'s rule conditional on what the later lines look like** — remove the
columns unless doing so would change what the line means. This is the rule that
is always correct and never statable: "what the line means" is CommonMark's block
grammar, and a rule that restates part of it is a second, partial grammar that
will be wrong the first time the two disagree. RFC 0043 makes the same argument
for stating `S-7` over the round trip instead of as a list of forbidden labels.
Rejected.

**Prior art.** No format this specification interoperates with meets this
question, because it arises from recording a block's source as a string and
writing it back somewhere else. OPML carries attribute text with no block
structure; JSON Canvas carries Markdown per node and does not claim a round trip
through a single document; markmap re-renders from its own parse rather than
re-emitting source. CommonMark itself has the question and answers it the way
this RFC does, for its own purposes: a block's content is defined with the
container's indentation already removed, and the container puts it back when the
document is read again. What this RFC adds is the case CommonMark does not have,
where the container that removes it and the container that puts it back are not
the same one.

## Unresolved questions

**A label's later lines.** `E-4` records a label as it appears in the source, and
a label that runs onto a second line keeps the indentation of the node holding
it — the same arithmetic, on the other side of the encoding. RFC 0057 Part 1
proposes an answer and this RFC does not touch it. If both are accepted, the two
rules should be stated in terms of each other rather than separately; that is an
editorial question for the `spec.md` edit, not a question this RFC leaves open.

**Whether `L-3` should attach a block written at column 0 to a node at all.** The
block quote in *Motivation* is only a problem because attachment and containment
disagree. Narrowing `L-3` would remove the disagreement and a great deal else
with it — content before any node, content after a list, content under a heading
all depend on attachment. Not proposed, and named here so that the next person
reading the block-quote example does not have to wonder whether it was
considered.

**Nothing about `S-7`.** This RFC does not propose `S-7`, whose landing RFC 0043
deferred on 2026-10-02, and does not depend on it. `S-7` is what makes the
failures above *visible*; it is not what fixes them. The measurements here were
taken with it active, which is why they can be quoted at all.

## Decision and rationale

<!-- Left empty until the comment period ends on 2026-10-19. -->
