# RFC 0069: An empty label with content and children

**Translations** — [한국어](ko/0069-empty-label-definition.md). This English text
is the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Accepted |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-02 |
| **Comment period ends** | 2026-10-16 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/69> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

```markdown
-
  [z]: /z
  - b
```

One item: an empty label, a link reference definition as its content, one child.
`P-7`'s blank line before the content, plus the blank line before the nested
list, leaves **two** blank lines after the bare marker once the definition is
read out again — and two blank lines end a list item. **The child comes back as
a sibling** ([#61](https://github.com/mindmapmarkdown/spec/issues/61)).

This RFC adds one sentence to `P-7`: when a node's `label` is empty **and** it
has children, its first `content` entry is written on the line below the marker,
with no blank line. The tree does not change and no document stops conforming.

## Motivation

### What goes wrong today

With RFC [0051](https://github.com/mindmapmarkdown/spec/pull/51) recording a
definition as node content, the document above lifts to:

```json
{"kind":"item","label":"",
 "content":[{"block":"link_reference_definition","source":"[z]: /z"}],
 "children":[{"kind":"item","label":"b","content":[],"children":[]}]}
```

Canonical projection writes the content after the blank line `P-7` asks for:

```markdown
-

  [z]: /z

  - b
```

A definition is removed before CommonMark builds the block structure, so what is
read back is a bare marker, a blank line, another blank line, and then an
indented list. **A list item may begin with at most one blank line**, so the
second one ends it: the nested list is no longer inside the item.

Measured against the reference implementation with every rule that lands in
0.1.0 merged together, at `mindmapmd@8eb4eeb`.

### Why the first attempt at this was wrong

A sentence answering this was written into RFC
[0058](https://github.com/mindmapmarkdown/spec/pull/58) on 2026-10-02 and
withdrawn the same day. It said:

> When a node's `label` is empty, its first `content` entry MUST be written on
> the line immediately below the marker, with no blank line between them.

**It fixed 27 documents and broke 81.** With no children there is only one blank
line to leave behind, the item survives it, and a second content entry written
directly below the marker lands *inside* the item — where, being the item's first
inline content, it becomes the item's **label**.

So the sentence is the same and the condition is a conjunction. That is the whole
of this RFC, and it is recorded this way because the near-miss is the argument:
a rule about where a blank line goes has to name both of the things that blank
line is doing.

### Who hits it

Few people on purpose, like #56. The shape is what an indented definition inside
an unlabelled item produces, and nobody writes it deliberately. It is here
because it is the last thing a sweep over 40,000 generated documents still
failed on after the other six were fixed, and because a round-trip format cannot
ship a known case of a child becoming a sibling.

## Detailed design

### `P-7`, amended

A sentence is added:

> When a node's `label` is empty and the node has children, its first `content`
> entry MUST be written on the line immediately below the marker, with no blank
> line between them.

Both conditions are load-bearing:

| | |
|---|---|
| **the label is empty** | With a label, the content already follows it after a blank line and the marker's line is not bare, so nothing is left behind that could end the item |
| **there are children** | With no children there is one blank line to leave behind, not two, and the item survives it. Removing the blank line there would be a change with no defect behind it — and would cause one, by pushing a second content entry inside the item |

### Why it can be stated over `content`

Only a link reference definition can be the first `content` entry of an
empty-labelled item that also has children, and **that is measured rather than
assumed.** A node's label is its first inline content, so a block in that
position becomes the label instead:

| Attempt | What lift produces |
|---|---|
| `-` ⏎ ⏎ `␣␣para` ⏎ ⏎ `␣␣- b` | label `""`, a paragraph, **no children** — the list is a sibling |
| `-` ⏎ ⏎ `␣␣> q` ⏎ ⏎ `␣␣- b` | the same |
| `-` ⏎ `␣␣> q` ⏎ ⏎ `␣␣- b` | label `"> q"` — the quote became the label |
| `-` ⏎ ⏎ a fenced block ⏎ ⏎ `␣␣- b` | label `""`, a code block, **no children** |
| `-` ⏎ `␣␣[z]: /z` ⏎ `␣␣- b` | label `""`, a definition, **one child** — the case this RFC is about |

A definition is the one block CommonMark does not report, which is why it alone
can sit between a bare marker and a nested list without becoming the label. The
sentence is nevertheless written over `content` rather than over definitions,
for the reason RFC 0058 gives for the same choice: that is why the rule holds,
and when the open question about a non-paragraph first block is answered it
should already be right.

### Examples

Three are proposed, in §2.2 beside RFC 0051's definition examples.

`````markdown
An empty label's first content entry is written on the line below the marker
when the node has children (P-7). A blank line there would leave two in a row
once the definition is read out again, and two blank lines end the item — the
child below would come back as a sibling:

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

With no children there is one blank line to leave behind and the item survives
it, so P-7 is unchanged:

````example
-

  [x]: /x
.
{"content":[],"children":[
  {"kind":"item","label":"",
   "content":[{"block":"link_reference_definition","source":"[x]: /x"}],
   "children":[]}]}
````

And a label of its own puts the content back where P-7 always had it:

````example
- a

  [x]: /x

  - b
.
{"content":[],"children":[
  {"kind":"item","label":"a",
   "content":[{"block":"link_reference_definition","source":"[x]: /x"}],
   "children":[
     {"kind":"item","label":"b","content":[],"children":[]}]}]}
````
`````

All three are canonical.

### Round-trip consequence

- **Trees.** Nothing changes. No document lifts to a different tree than it does
  with RFC 0051 and RFC 0058 alone.
- **Conforming documents.** Nothing changes.
- **Canonical documents.** One shape changes status: a blank line between a bare
  marker and the content of a node that has children. It is conforming and no
  longer canonical, and settles on the first round trip.
- **The suite.** No existing example changes.

### Edge cases

| | |
|---|---|
| Two adjacent definitions | Already one entry under RFC 0051, so the pair is written as one and the child still survives |
| An empty label, content, and children, where the content is not a definition | Cannot arise; see the table above |
| A nested list under an item with content, where the label is **not** empty | `P-7` unchanged |
| An empty label and children but no content | `P-7` already writes the nested list on the next line, and RFC 0046 decides whether a blank line goes there. This rule does not run |
| An empty `section` label with content and children | A section's marker line is `#`, and a blank line after it leaves nothing behind that ends anything. The rule still applies and writes the content on the next line, which lifts back to the same tree |

Bounds: one test of a node's label and one of its children's length. Nothing is
parsed.

### How it is tested

The three examples above, once they are in `spec.md`. And a prototype on
[`rfc/empty-label-definition`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/empty-label-definition),
branched from the RFC 0058 prototype because the rule is about a definition and
without RFC 0051 there is no definition in a tree to be about: five cases,
including the two conditions separately and the four non-definition attempts
above. 164 tests, 163 pass, 1 todo.

And in the whole 0.1.0 configuration — every rule that lands, merged into one
branch — **225 tests pass**, and `tools/sweep.mjs` over 40,000 documents reports
298 failures, none of them this.

## Alternatives

**Do nothing.** A child becomes a sibling, silently, in a document the sweep
finds in minutes. Rejected.

**The sentence without the second condition.** Written and withdrawn on
2026-10-02: 27 documents fixed, 81 broken. Rejected with numbers.

**Make lift attach the definition elsewhere** — to the item's parent, say, rather
than to the item. The tree would avoid the shape entirely. It breaks `L-3`, which
attaches a block to the nearest node preceding it and is the rule the whole of
§2.2 is built on, and it would move content a reader sees under one node to
another. Rejected.

**Refuse the document**, with a well-formedness rule saying an empty-labelled
node may not have both content and children. A spelling exists and is one line
long, so refusing would throw away a document for no reason. Rejected.

**A document whose lift has no faithful canonical projection does not conform.**
The general answer, recorded in RFC 0058's alternatives and in #56's options.
Rejected here for the same reason: a spelling exists. It is worth saying that
this is the third RFC in a row to reject it on those grounds, and that the ninth
shape found on 2026-10-02 is one where no spelling has yet been found — see
*Unresolved questions*.

**Prior art.** None: this is a consequence of CommonMark's rule that a list item
may begin with at most one blank line, combined with its removal of link
reference definitions before block structure is built. No format layered on
CommonMark that this project has examined claims a document round trip, so none
has met it.

## Unresolved questions

**This is not the last of the family, and it does not unblock `S-7`.** `S-7`'s
landing was deferred past 0.1.0 on 2026-10-02 because #61 had no proposal. It now
has one, and the deferral still stands: a ninth shape was found the same day and
has none. A paragraph whose source is exactly a link reference definition — the
document `[y]: /y` followed by `---` — projects to a document in which that
paragraph **is** a definition, so the block type changes
([#56](https://github.com/mindmapmarkdown/spec/issues/56), second shape). It is
an `S-7` hole and it is all 298 of the failures the 0.1.0 configuration still
has.

**Whether `P-7` is the right home**, as with RFC 0058. `P-7` is chosen because it
is the rule that puts the blank line there.

**What an item's label is when its first block is not a paragraph.** Named by RFC
[0043](0043-well-formed-round-trip.md) and still open. This RFC leans on the
answer being "the block, as now" in the table above; if that changes, the
measurement that lets the rule be stated over `content` has to be re-run.

## Decision and rationale

**Accepted**, 2026-10-22, by lazy consensus. The comment period ran in full, from
2026-10-02 to 2026-10-16, with no comment on the pull request and no objection
raised. The text did not change while the period ran, so it was not restarted.

**This decision is recorded six days after the period ended.** Nothing was raised
in those six days. Four issues were filed while the period was open
([#81](https://github.com/mindmapmarkdown/spec/issues/81),
[#82](https://github.com/mindmapmarkdown/spec/issues/82),
[#83](https://github.com/mindmapmarkdown/spec/issues/83),
[#84](https://github.com/mindmapmarkdown/spec/issues/84)) and none of them is
about this rule: the first two are the label and first-child questions, the third
is the empty-label case **without** children, which the second condition here
deliberately leaves alone, and the fourth is RFC
[0058](https://github.com/mindmapmarkdown/spec/pull/58).

### Why this outcome

The tree is one lift produces from a conforming document, and `P-7` left it with
no writable spelling. The blank line before the content, plus the blank line
before the nested list, leaves two in a row once the definition is read out
again, and two blank lines end a list item — so the children came back as
siblings. One of the two blank lines has to go, and the one before the content is
the only one that can: the other is what keeps the child a child.

The sentence is stated over `content` rather than over definitions. That looked
like caution when it was written and is now the reason the rule survives a change
underneath it, which is the next section.

### Checked before deciding

Measured 2026-10-22, by projecting each tree, lifting the result, and comparing
both the tree and the bytes.

The three examples are canonical — projection returns the document byte for byte
and the tree round-trips — in every current configuration:
`rfc/definition-lazy-continuation` at `8463da3` (RFC 0058 revised, `S-7` active),
`trial/0.1.0-c` at `099c221`, and `trial/0.1.0-b` at `14f2ad7`, which carries RFC
[0072](https://github.com/mindmapmarkdown/spec/pull/72).

**The re-measurement the unresolved question asked for has been run.** That
question says this RFC leans on an item's first non-paragraph block being the
label, and that the measurement has to be re-run if
[#71](https://github.com/mindmapmarkdown/spec/issues/71)'s answer changes. RFC
0072 Part 1 changes it: a non-paragraph first block becomes content. On
`trial/0.1.0-b`, `-` ⏎ `␣␣> q` ⏎ ⏎ `␣␣- b` now lifts to an empty label with a
`block_quote` content entry **and** one child — a shape the table above could not
produce, because there the quote became the label — and it round-trips. So the
rule's scope widens under 0072 and the rule still holds. Writing it over
`content` is what makes that true; a sentence about definitions would have had to
be amended.

`trial/all-rfcs` at `3643d4a` rejects the first example under `S-7`. That branch
carries the **superseded** 0058, which writes the paragraph adjacent with no
indentation where the revision of 2026-10-05 writes four columns. It is a stale
merge rather than a defect in this rule: the same example is canonical on every
branch carrying the revision.

Prototype `rfc/empty-label-definition` at `8eb4eeb`: 164 tests, 163 pass, 0 fail,
1 todo.

### What this does not settle

[#83](https://github.com/mindmapmarkdown/spec/issues/83) stays open. An
empty-labelled item **without** children still has its content written outside
the item, and the second condition in this rule is exactly why that case is
untouched. It has no proposal.

And the rule has never been measured with **no** RFC 0058 present: every branch
carrying it carries one of the two 0058 lineages. The mechanism is independent —
this is the gap after a bare marker, 0058 is the join between a definition and
the paragraph after it — but independence is argued here, not measured. If 0058
is rejected outright, that measurement should be made before `spec.md` is
written.

### Where it lands

`spec.md` gets the `P-7` sentence and the three examples, together with RFC 0051,
RFC 0046 and RFC 0039, so that no rule lands over a hole. `CHANGELOG.md` drops
[#61](https://github.com/mindmapmarkdown/spec/issues/61) from *Open before
0.1.0*.
