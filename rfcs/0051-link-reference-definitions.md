# RFC 0051: Link reference definitions are node content

**Translations** — [한국어](ko/0051-link-reference-definitions.md). This English
text is the authoritative one; a translation is a reading aid and carries no
normative force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Accepted |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-09-29 |
| **Comment period ends** | 2026-10-13 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/51> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

CommonMark takes a link reference definition out of the document **before** it
builds the tree: no block is produced for it, so `L-3` has nothing to attach and
canonical projection never writes it back. A reference-style link stops being a
link after one round trip
([#40](https://github.com/mindmapmarkdown/spec/issues/40)).

This RFC adds `L-13`: a definition produces no node and is recorded as **node
content**, with `block` equal to `link_reference_definition` and `source` the
lines as written. `E-5` admits the second block type name this specification
defines; the first is `front_matter`.

#40 was deferred past 0.1.0 on 2026-09-15. **That deferral was withdrawn on
2026-09-29**, when accepting RFC [0039](0039-ordered-lists.md) turned the loss
into something worse than a missing link: a conforming document that no
implementation may project. A prototype passes the suite unchanged and 12 further
tests.

## Motivation

### What is lost today

Run against `mindmapmarkdown/mindmapmd@7004160`:

| Document | Tree today | What comes back |
|---|---|---|
| `See [the guide][x].` with `[x]: https://example.com` below it | One paragraph. The definition is in no entry | `See [the guide][x].` — the link has no target, and renders as literal text |
| `# Guide`, text, three definitions | One paragraph | All three gone |

Nothing in the suite has a definition, which is why no example failed.

### What accepting RFC 0039 changed

With ordinals recorded, this conforming document

```
1. a

[x]: https://example.com

1. b
```

lifts to two items, each with ordinal 1 — a restart — and the definition that
separated the two lists is in no entry. `S-5` requires content on the previous
item to separate a restart, so the tree it lifts to is one `S-3` requires an
implementation to **refuse to project**. Before 0039 the same document merely
lost the definition.

A specification cannot both accept a document and refuse to write it back. That
is why this can no longer wait for 0.2.0.

### Why it is Normative

Documents that lift to nothing today will lift to a tree with entries in it.
Nothing stops conforming, and nothing is released, so it is not Breaking
([`GOVERNANCE.md` §3](../GOVERNANCE.md#3-classes-of-change)).

## Detailed design

### `L-13`, new

> **L-13.** A link reference definition (CommonMark §4.7) produces no node. It is
> **node content**: one entry with `block` equal to `link_reference_definition`
> and `source` the definition's lines as written, and it attaches as `L-3`
> attaches any block. A run of definitions that no blank line separates is one
> entry.

The run rule is the one `L-10` already takes for front matter, and for the same
reason: telling one definition from the next means parsing them, and this
specification records them opaquely. A blank line between two definitions makes
two entries.

### `E-5`, amended

> `block`, the CommonMark block type name — or a block type name this
> specification defines for a construct CommonMark does not read as a single
> block, of which there are exactly **two**, `front_matter` (`L-10`) and
> `link_reference_definition` (`L-13`) — and `source` […]

Everything else in `E-5` applies unchanged, including the indentation rule RFC
[0038](0038-content-block-source.md) added: a definition written inside a list
item does not keep the item's columns, and `P-4` puts them back.

### Examples

````example
[x]: https://example.com

# Guide

See [the guide][x].
.
{"content":[
  {"block":"link_reference_definition","source":"[x]: https://example.com"}],
 "children":[
  {"kind":"section","label":"Guide","content":[
    {"block":"paragraph","source":"See [the guide][x]."}],"children":[]}]}
````

````example
# Guide

Text.

[x]: https://example.com
.
{"content":[],"children":[
  {"kind":"section","label":"Guide","content":[
    {"block":"paragraph","source":"Text."},
    {"block":"link_reference_definition","source":"[x]: https://example.com"}],
   "children":[]}]}
````

````example
- a

  [x]: https://example.com

- b
.
{"content":[],"children":[
  {"kind":"item","label":"a","content":[
    {"block":"link_reference_definition","source":"[x]: https://example.com"}],
   "children":[]},
  {"kind":"item","label":"b","content":[],"children":[]}]}
````

All three are canonical, so the suite tests them both ways.

### What does not change

- **A definition inside a block quote or a code block.** The quote and the code
  block record their own source, so it is already kept; it is not a separate
  entry.
- **Text that only looks like a definition.** `[x] is not a definition.` is a
  paragraph, as CommonMark says, and nothing here changes that.
- **Any existing example.** None contains a definition.

### How an implementation finds them *(Informative)*

CommonMark parsers remove definitions before reporting the tree, so a lift that
walks only the parser's output cannot see them. The reference implementation
recovers them from the source: **a line that no block covers and that is not
blank is a definition line**, because every other construct in a conforming
document is a block. Two details matter.

- A list and its items are counted by their **marker line only**. The rest of a
  list's range is its items and the gaps between them, and a gap is what is being
  looked for — but the marker line has to count, or a bare `-`, an empty item,
  reads as a definition.
- A **block quote** counts for its whole range. It records its own source, so a
  definition inside it is already kept.

Any method that produces the same entries conforms; this is one that does.

### How it is tested

The three examples above enter the suite. A prototype is
`mindmapmarkdown/mindmapmd` branch `rfc/link-reference-definitions` at `0ae9922`:
130 tests pass — the 118 on `main` unchanged, and 12 for this rule: a definition
before any node, after a paragraph, between two lists, inside an item, written
over several lines, two adjacent, after a nested list, inside a block quote,
after a block quote, inside a code block, an empty item that must not be mistaken
for one, and a document with none. Each checks L1 both ways.

## Alternatives

### Keep dropping them — the position deferred on 2026-09-15

It held while the cost was a broken link in a document nobody had reported. It
does not hold now that the same defect makes a conforming document unprojectable,
and the reasoning for deferring said as much: *resolving it later changes what a
tree contains*.

### Refuse documents that contain a definition

Simple, and wrong. Reference-style links are ordinary Markdown — READMEs are full
of them — and `L0` exists to keep this specification from making ordinary
documents non-conforming.

### Parse the definition into label, destination and title

Then the tree carries structure CommonMark's own AST does not expose, the
specification has to define escaping and case-folding for labels, and `E-4`'s
promise that source is kept as written stops being general. Recording the lines
keeps the round trip and leaves interpretation to whatever reads the tree.

### Fold the definition into the neighbouring block's source

It is not part of that block, and the neighbouring block may be a heading, which
records a label rather than a source. Position would also be lost: a definition
before the first node belongs to the root, not to the first section.

## Unresolved questions

None blocks acceptance.

1. **A definition separated from another by a blank line** is a second entry, and
   projection writes a blank line between them. That is what `P-7` already does
   for blocks of content; no new rule is needed, and the prototype confirms the
   round trip.
2. **Where a tool puts new definitions.** Some editors collect definitions at the
   end of a file. Nothing here prevents that: the entries sit where the document
   put them, and an application may move them, which is an edit like any other.

## Decision and rationale

**Accepted**, 2026-10-13, by lazy consensus. The comment period ran in full, from
2026-09-29 to 2026-10-13, with no comment on the pull request and no objection
raised anywhere.

### Why this outcome

Lift drops every link reference definition today, so a conforming document that
uses reference-style links loses their targets on the round trip. Since RFC
[0039](0039-ordered-lists.md), the same loss also produces a tree that cannot be
projected. The alternatives are recorded above, and each one either keeps that
loss, refuses ordinary documents, or gives the tree a structure CommonMark does
not expose. Recording the lines as content is the only one that keeps the round
trip without any of those costs.

### Checked before deciding

The sweep that tests the round trip was found on 2026-10-07 to have been searching
a far narrower space than it reported
([mindmapmd#16](https://github.com/mindmapmarkdown/mindmapmd/pull/16)). So the
question this decision depends on was asked again with the repaired tool: **does
`L-13` itself break a round trip that holds without it?**

On 2026-10-13 the sweep ran against `mindmapmd` `main` and against this RFC's
prototype, with all three generators, three seeds each and 20,000 documents per
run. Every shape that failed on the prototype and not on `main` was then probed
on both — every shape among the failures the sweep shrinks, which is the first
fifty of each kind per run, so this is a sample and not an enumeration. **Each one is a definition that begins on a list item's marker line.**
That is a defect in the prototype, not in the rule, and it is described below.
On `main` those documents pass only because `main` drops the definition, which is
#40 itself. No failure traced to `L-13`, so nothing here is an objection under
[`GOVERNANCE.md`](../GOVERNANCE.md) §4.

### A correction to *How an implementation finds them*

That informative section describes the prototype's method and ends *"this is one
that does"*. **It does not, for one case.** The method counts a list item's
marker line as covered, so that a bare `-` is not read as a definition, and so it
never sees a definition that **begins on that line**:

| Document | Recorded by the prototype |
|---|---|
| `- [x]: /x` | nothing — the definition is lost |
| `- [x]:` ⏎ `␣␣/x` | `/x` |
| `- [` ⏎ `a]:a` | `a]:a` |

`L-13` requires all three to be recorded whole, and nothing in this decision
changes that. The first row is the more serious one. The tree loses the
definition at lift, its projection lifts to the same tree, and so neither the
round trip nor `S-7` can detect it. It is tracked as
[mindmapmd#18](https://github.com/mindmapmarkdown/mindmapmd/issues/18). When
`L-13` lands in `spec.md`, the informative note must not say the marker-line
method is sufficient unless it has been fixed to find these.

The prototype has also moved since *How it is tested* was written. The branch was
rebuilt, so `0ae9922` is no longer in its history, and it is now at `c49a7f0`.
Since then it has gained two fixes: a tab before a definition counts as four
columns (`e321e80`), and a definition the parser hid inside an empty paragraph is
found (`c49a7f0`, which brings in
[mindmapmd#11](https://github.com/mindmapmarkdown/mindmapmd/pull/11)).

### What lands, and where

- `spec.md`: `L-13`, the amendment to `E-5`, and the three examples. All three
  are canonical, so the suite tests them both ways. The informative note on
  finding definitions is corrected as above.
- `mindmapmd`: the prototype, rebuilt on current `main` with #18 fixed, as a pull
  request.
- `CHANGELOG.md`: #40 leaves *Open before 0.1.0*.

It lands with RFC 0039, 0046, 0057 and 0058. Why they wait for each other is
recorded in `CHANGELOG.md`, under *Open before 0.1.0*.
