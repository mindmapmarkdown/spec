# RFC 0069: An empty label with content and children

**Translations** — [한국어](ko/0069-empty-label-definition.md). This English text
is the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
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
