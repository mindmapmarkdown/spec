# RFC 0000: Canonical hierarchy — node kind and the heading/list boundary

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-07-27 |
| **Comment period ends** | 2026-08-10 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/4> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

Markdown can express one hierarchy in more than one way — as nested headings, as
a nested list, or as a mixture — and this specification has so far said nothing
about which of them a document means. This RFC proposes that **the distinction
between a heading and a list item is part of the tree, not a spelling of it**:
every node carries a *kind*, either `section` or `item`, and canonical
projection reproduces the kind it was given. Canonical form then normalises
spelling (heading style, marker character, indentation width, blank lines,
code-block style) but never converts a heading into a list item or the reverse.

The RFC also fixes what becomes a node (headings and list items, and nothing
else), how heading levels are read (by nesting, not by number), what happens to
trees that cannot be written in Markdown at all, and which CommonMark
ambiguities canonical form resolves.

Because the RFC introduces normative examples, it also has to say how an expected
tree is written down. A tree is an abstract structure with no format of its own,
and an example that states one in an unspecified notation cannot be compared —
so §2.6 specifies the encoding the suite uses, as a test fixture format and
explicitly not as an interchange format.

## Motivation

### The problem, shown

These two documents describe the same hierarchy:

```markdown
# Project
## Install
- npm
- pnpm
```

```markdown
- Project
  - Install
    - npm
    - pnpm
```

Without a rule, three things follow, all of them bad:

1. **A text diff does not mean a structural diff.** Reformatting a document
   rewrites every line while changing nothing; moving one node may change one
   line. Version control cannot tell the two apart, so review cannot either.
2. **Generators are unreproducible.** Asked twice for the same content, a
   language model writes it two ways, and the resulting files do not compare.
3. **Implementations disagree silently.** Two conforming tools can lift the same
   document to different trees, and nothing in the specification says which is
   wrong. This is the failure mode §1.4.3 exists to prevent, and today the
   specification has no answer to it.

### What is at stake in the answer

The obvious fix is to pick one form and require it — the `gofmt` approach. It is
simple to specify and simple to test, and it is what a specification written
without users would choose.

It breaks the primary use case. The reference application opens an existing
Markdown file, presents it as a mindmap, and writes it back. Under a single
enforced canonical form, a user who opens this:

```markdown
# Install

## Requirements
Node.js 20 or later.
```

and edits one node gets back this:

```markdown
- Install
  - Requirements
    Node.js 20 or later.
```

The tree survived. The document did not. A tool that reformats a file this way
on save is uninstalled the first time it does it, and the specification that
required the behaviour goes with it.

The round-trip this project promises is experienced by users as a *file* going
out and coming back, not as a tree. A specification that is lossless on trees
and lossy on documents has not kept the promise; it has redefined it.

### Why this cannot be deferred

Every later chapter sits on this decision. Identity (Chapter 3) has to be
attached to something, and what a node *is* determines where an identifier can
live. Diff and merge (L3) compare trees whose shape is fixed here. The example
extractor and the conformance suite consume examples that do not exist until
these rules do. Nothing else in the specification can be written first.

## Detailed design

Numbering below is provisional: `L-n` for lift rules, `S-n` for tree
well-formedness, `P-n` for projection rules, `E-n` for the encoding examples are
written in. On acceptance these become
Chapter 2 of `spec.md`, renumbered to its sections.

### 2.1 Node kind

Add to the terminology of §1.3:

> **kind** — A property of every node other than the root, with exactly two
> values: **`section`**, a node written as a Markdown heading, and **`item`**, a
> node written as a list item. Kind is part of the tree. Two trees that are
> otherwise equal but differ in the kind of any node are different trees.

Kind is not presentation and does not belong in a sidecar (§1.4.2). A heading
and a bullet are different things to the reader of a document: one asserts a
division of the text, the other an entry in a series. Preserving that is
preserving what the document says, not how it is displayed. Colour, position,
and collapse state remain presentation and remain in the sidecar.

*(Informative)* The cost of this choice is stated plainly: a document written
with headings and a document written with bullets are **different trees**, and
this specification offers no operation that declares them equivalent. That is
believed to be correct rather than merely tolerable — the two documents were
written differently because they were meant differently.

### 2.2 What becomes a node

**L-1.** Only ATX headings, setext headings, and list items produce nodes. No
other CommonMark block produces a node.

**L-2.** A heading produces a node of kind `section`. A list item produces a
node of kind `item`.

**L-3.** Every block that is not a heading or a list item — paragraph, fenced or
indented code block, block quote, table, HTML block, thematic break — is **node
content**, and attaches to the nearest node preceding it in document order.
Content appearing before any node attaches to the root.

**L-4.** The root node is synthetic. It has no label, no kind, and no
corresponding text in the document. A document whose entire content sits under a
single level-1 heading therefore lifts to a root with exactly one child.

*(Informative)* L-1 is what keeps a prose document from exploding. A README with
forty paragraphs and six headings has six nodes, not forty-six. The test for
whether something should be a node is whether Markdown gives it a hierarchy of
its own; paragraphs and tables have none.

### 2.3 Depth, and heading levels

**L-5.** A section's depth is determined by **nesting, not by heading level**. A
heading whose level is greater than that of the section currently open becomes
its child, whatever the size of the jump. A heading whose level is less than or
equal to it closes open sections until one of lower level remains, and becomes
that node's child.

**L-6.** Consequently a document that skips a heading level lifts without error.
`# A` followed by `### B` lifts to `B` as a child of `A`, at depth 2. Canonical
projection (P-2) then writes `B` as `##`, so such a document is a conforming
document that is not a canonical document — exactly the distinction §1.2.3
defines.

**L-7.** An item's depth is its list nesting depth, counted from the node that
contains the list.

*(Informative)* Rejecting skipped levels was considered and rejected in
[Alternatives](#alternatives). Roughly half of the Markdown in existence would
stop conforming, for no gain: the author's intent in `# A` / `### B` is never
ambiguous.

### 2.4 Well-formed trees

Two constraints follow from L0 (§1.2.4) rather than from taste. A heading nested
inside a list item is legal CommonMark, but renders as a document-level heading
and is read as one by every outline extractor — the hierarchy does not survive in
an unmodified renderer, which L0 forbids. And ATX headings stop at level 6;
`#######` renders as literal text.

**S-1.** A `section` MUST NOT have an `item` ancestor.

**S-2.** A `section` MUST NOT be at a depth greater than 6.

A tree satisfying S-1 and S-2 is **well-formed**. Lift cannot produce a tree that
is not well-formed; a tree constructed programmatically can be.

**S-3.** An implementation MUST reject a tree that is not well-formed, and MUST
NOT project it by coercing the offending nodes to `item`.

*(Informative)* S-3 is not severity for its own sake. §1.2.4 L1 requires lift and
canonical projection to be mutually inverse. Silent coercion would produce a
document that lifts to a *different* tree from the one projected, breaking that
requirement in the one place it is hardest to notice. Refusing is the only
behaviour consistent with Chapter 1.

### 2.5 Canonical projection

**P-1.** Kind MUST be preserved. A `section` MUST be written as an ATX heading; an
`item` MUST be written as a bullet list item.

**P-2.** A section's heading level MUST equal its depth.

**P-3.** The bullet marker MUST be `-`.

**P-4.** Each list nesting level MUST be indented by exactly two spaces relative
to its parent item's marker.

**P-5.** Code blocks MUST be fenced with backticks. Indented code blocks MUST NOT
appear in a canonical document.

**P-6.** Headings MUST be ATX. Setext headings MUST NOT appear in a canonical
document.

**P-7.** A single blank line MUST separate a heading from what follows it and
each block of node content from the next. A list MUST be tight — no blank line
between items — unless an item carries block content, in which case the list MUST
be loose.

**P-8.** No line may end in whitespace, and the document MUST end with exactly
one line feed.

*(Informative)* P-5 is doing more work than it appears to. The worst ambiguity in
CommonMark for this specification is that four spaces of indentation may mean an
indented code block or a continuation of a list item, and the reading depends on
context several lines away. Banning indented code blocks from canonical form
removes the collision outright rather than adjudicating it. Lift still accepts
them (L-3); they simply come back fenced.

Loose and tight lists are a rendering distinction — whether items are wrapped in
paragraphs — and carry no structural meaning. Lift ignores the difference; P-7
picks one so that projection is deterministic.

### 2.6 The tree encoding used by examples

A tree is an abstract structure. It has no format, and this specification blesses
none — a Markdown document is one projection of a tree and the only one specified
(§1.1.2). But an example has to state its expected tree *in something*, and
whatever that notation is, it has to be specified: two implementations reading
the same suite differently is exactly the undecidable conformance §1.4.3 forbids.

**This is a test fixture encoding and nothing more.** It is not an interchange
format, not a serialisation implementations are expected to read or write outside
the suite, and not a second format this specification undertakes to maintain.
Whether a normative interchange encoding is ever wanted is left open below.

**E-1.** A tree MUST be encoded as a JSON object with exactly one member,
`children`, whose value is an array of node objects in order. The root is
synthetic (L-4) and has no label and no kind, so it has no other members.

**E-2.** A node MUST be encoded as a JSON object with exactly four members:
`kind`, `label`, `content`, and `children`. All four MUST be present, including
when `content` or `children` is empty.

**E-3.** `kind` MUST be the string `section` or the string `item`.

**E-4.** `label` MUST be the node's inline content exactly as it appears in the
source, with leading and trailing whitespace removed. Inline markup MUST NOT be
interpreted: the heading `## **Fast** start` has the label `**Fast** start`.

**E-5.** `content` MUST be an array, in document order, of objects with exactly
two members: `block`, the CommonMark block type name, and `source`, that block's
Markdown source verbatim — internal line breaks included, with no trailing line
feed.

**E-6.** `children` MUST be an array of node objects, in document order.

**E-7.** Two encoded trees are equal if and only if: objects have the same set of
member names and each corresponding value is equal; arrays have the same length
and are equal element-wise in order; strings are identical sequences of Unicode
code points. **No Unicode normalisation is applied**, in either direction, at any
point.

**E-8.** Members SHOULD appear in the order `kind`, `label`, `content`,
`children`. Member order is not significant to E-7, and an implementation MUST
NOT depend on it.

*(Informative)* E-2 forbids omitting an empty `content` or `children` because
allowing it would mean two different JSON texts encode the same tree — an
ambiguity in the one notation whose entire purpose is to remove ambiguity. The
verbosity is the cheaper of the two costs, and it is paid by a generated file
rather than by an author.

*(Informative)* E-4 and E-5 carry source through verbatim so that the encoding is
lossless without the suite having to model Markdown's inline or block semantics.
A label reduced to plain text would drop emphasis and links, which would make
round-trip untestable at exactly the point where it matters. A structured inline
tree would re-specify CommonMark inside our test data, which §1.1.2 says this
specification does not do.

Identity is not encoded. Chapter 3 will add a member for it, and doing so will be
a Normative change to this section rather than a clarification of it.

### 2.7 Worked examples

These are written in the format the extractor consumes: input, a `.` separator,
and the expected tree encoded per §2.6. On acceptance they move into `spec.md`
inline, and `examples/examples.json` is generated from them — never the reverse
(`CONTRIBUTING.md` §6). Trees are shown without identity, which is Chapter 3.

Sections nest by heading level:

````example
# Project
## Install
.
{"children":[
  {"kind":"section","label":"Project","content":[],"children":[
    {"kind":"section","label":"Install","content":[],"children":[]}]}]}
````

Items nest by indentation:

````example
- Project
  - Install
.
{"children":[
  {"kind":"item","label":"Project","content":[],"children":[
    {"kind":"item","label":"Install","content":[],"children":[]}]}]}
````

The two are different trees. Both are canonical.

Mixed documents keep both kinds, sections above items:

````example
# Install
- npm
- pnpm
.
{"children":[
  {"kind":"section","label":"Install","content":[],"children":[
    {"kind":"item","label":"npm","content":[],"children":[]},
    {"kind":"item","label":"pnpm","content":[],"children":[]}]}]}
````

A paragraph is content, not a node:

````example
# Install
Node.js 20 or later.
.
{"children":[
  {"kind":"section","label":"Install",
   "content":[{"block":"paragraph","source":"Node.js 20 or later."}],
   "children":[]}]}
````

A skipped heading level lifts by nesting (L-5), which makes the document
conforming but not canonical:

````example
# A
### B
.
{"children":[
  {"kind":"section","label":"A","content":[],"children":[
    {"kind":"section","label":"B","content":[],"children":[]}]}]}
````

Projecting that tree yields `# A` / `## B`, which lifts to the same tree. The
round-trip is stable at the second pass, and idempotent thereafter.

### 2.8 Effect on round-trip

For a canonical document, lift followed by projection returns the document byte
for byte — §1.2.4 L1 already requires this, and the rules above are what make it
achievable. For a conforming document that is not canonical, the tree is
preserved and the bytes are normalised; the second round-trip is byte-stable.

Kind preservation is what makes the normalisation acceptable in practice. The
changes a non-canonical document undergoes are confined to whitespace, marker
characters, heading style, heading level, and code-fence style. No heading
becomes a bullet and no bullet becomes a heading.

### 2.9 Testing

Every rule above is decided by comparing two artifacts, with no renderer
involved:

- **Lift rules** — input document, expected tree, compared structurally under
  E-7. This is the `example` block format above, and the generated
  `examples/examples.json` is the suite.
- **The encoding itself** — the generator in `tools/` currently checks only that
  an expected tree is well-formed JSON, because until this section exists there
  is no shape to check against. On acceptance it can enforce E-1 to E-6, so that
  a malformed example fails in the pull request that introduces it rather than in
  somebody's implementation months later.
- **Projection rules** — input tree, expected document, compared byte for byte.
- **Mutual inversion** — for every canonical example, projecting its lift MUST
  reproduce the input exactly; for every non-canonical example, the second
  round-trip MUST be byte-stable.
- **Well-formedness** — a tree violating S-1 or S-2 MUST produce an error, and a
  test asserts the error rather than an output.

## Alternatives

**Do nothing.** Leave the choice to implementations. This is the current state,
and it is the reason the specification cannot yet be implemented: two conforming
tools would disagree about what a document means with no rule to appeal to.
Rejected because it makes §1.4.3 — conformance must be decidable — unsatisfiable.

**A single enforced canonical form (`gofmt`).** One tree, one document; the
heading/list choice is spelling and is normalised away. Simplest to specify,
strongest diff guarantee, and genuinely attractive on paper. Rejected because it
rewrites a user's document the first time a tool touches it, which destroys the
primary use case (see [Motivation](#motivation)). The stronger diff guarantee is
also smaller than it looks: under this RFC, a text diff still corresponds to a
structural diff for any document that was canonical to begin with, which is every
document a conforming tool has written.

**Headings only.** Every node is a heading. Rejected on a hard limit rather than
a preference: ATX headings stop at level 6, and hierarchies deeper than six
levels are ordinary in this domain. It also makes leaf enumerations absurd — three
shopping-list entries become three headings.

**Lists only.** Every node is a list item. Unlimited depth and closest to how
outliners work. Rejected because it fails the same use case as `gofmt` from the
other side, and because deep indentation produces long lines and noisy diffs.
A document about anything other than an outline stops looking like a document.

**Kind as a sidecar annotation.** Keep the tree free of representation and record
"this node was a heading" outside the document. Rejected because it violates
§1.2.4 L1: canonical form must be a function of the tree alone, and this makes it
a function of the tree plus a file that may be absent. It also mislabels the
distinction — a heading versus a bullet is something the document says, not
something a viewer chose.

**Depth-switching at a fixed level** — sections for depths 1–3, items below, as a
constant in the specification. Rejected for two reasons. The constant is
arbitrary and would be argued about forever; and it makes canonical form depend
on a node's *absolute* depth, so a subtree extracted on its own would project
differently from the same subtree in place — which breaks the subtree operation
L3 requires (§1.2.4).

**Prior art.**

- **markmap** derives a hierarchy from headings and lists together, and is the
  closest existing behaviour to what this RFC describes. Its rules live in its
  implementation rather than in a published specification, so they cannot be
  cited, targeted by another tool, or argued with. This RFC is in part an attempt
  to write down, testably, something markmap already does usefully.
- **OPML** settles the question by not having it: an outline is a list of
  `<outline>` elements and there is no second way to spell one. That is available
  to a format whose documents are not also prose. It is not available here, and
  the reason is the same reason this project exists.
- **JSON Canvas** stores presentation about a structure, and is where a sidecar
  under §1.4.2 would interoperate. It has nothing to say about which Markdown
  spelling means what, so it neither supports nor contradicts this proposal.

## Unresolved questions

**Ordered lists.** `1.` items are list items and become `item` nodes, but this
RFC does not say whether ordered-ness is part of the tree or a spelling of it.
Both readings are defensible: a numbered procedure is arguably a different
assertion from a bulleted set, which would make it a third kind or an attribute;
but numbering is also frequently incidental. **This blocks nothing in Chapter 2
and should be settled before Chapter 3**, because whatever answer is chosen has
to survive diff and merge.

**Task list items.** `- [ ]` is a widespread extension, not CommonMark. Whether
the checkbox is node content, an attribute, or invisible to this specification is
open, and touches whether two kinds are enough.

**Where identity is written.** Chapter 3's problem, but constrained here: L0
forbids any construct that renders as literal text, which leaves very little room
in Markdown — realistically an HTML comment, or a convention over existing
attributes. If no acceptable carrier exists, the L2 requirement in §1.2.4 has to
be revisited rather than fudged. Naming it now is what prevents Chapter 2 from
being written into a corner.

**Setext heading levels on lift.** L-1 accepts setext headings and P-6 removes
them; setext expresses only levels 1 and 2, so no information is lost. Whether
lift should treat a setext heading as identical to its ATX equivalent in every
respect is assumed here and not argued.

**Whether a normative interchange encoding is ever wanted.** §2.6 defines how an
expected tree is written in the test suite and says plainly that this is not an
interchange format. But implementations will need to hand trees to each other —
the subtree exchange L3 requires is precisely that — and they will either agree on
something or each invent one. Blessing §2.6 for that purpose would be the obvious
move and is deliberately not made here: an interchange format acquires
requirements a fixture format does not have, starting with versioning, and
committing to those inside a chapter about hierarchy would be scope creep of the
kind §1.1.3 argues against. **This does not block Chapter 2.** It should be
answered before L3 is specified, and by its own RFC.

## Decision and rationale

<!-- Left empty until the comment period ends, per rfcs/0000-template.md and
     GOVERNANCE.md §4. -->
