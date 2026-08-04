# RFC 0000: Canonical hierarchy — node kind and the heading/list boundary

**Translations** — [한국어](ko/0000-canonical-hierarchy.md). This English text is
the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

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

The third has a sharper form in the case this specification was written for, and
it needs no second implementation to appear. A document round-trips through a
**language model**, and a model does not edit a document — it re-emits one.
Everything comes back retyped, including the parts nobody asked it to touch. An
application that sends a map out as Markdown and reads the result back is
therefore reading text it did not write, on every pass, indefinitely.

If reading is not pinned down, that application disagrees with **its own previous
self**. A table exported onto a single line returns as a paragraph, and the map
has changed although no person and no model intended a change. That happened
during the drafting of this RFC, in one application, with no second tool anywhere
near it — see `easymindmap` #150, which is also why P-9 exists.

The interoperability argument describes a hazard that arrives when a second
implementation does. This one is already here.

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

**L-8.** Lift MUST be a function of the document text alone. An implementation
MUST NOT resolve, fetch, or otherwise depend on any resource a document
references — an image URL, a link target, an included file — when determining the
tree.

*(Informative)* L-8 follows from the determinism L1 already requires: the same
input must produce the same output in any conforming implementation. A tree that
depended on a network fetch would differ between implementations, between runs of
the same implementation, and over time as servers change or disappear, and
conformance would stop being decidable (§1.4.3). It also keeps a parser from
becoming a network client on behalf of whoever supplied the document — a property
`SECURITY.md` would otherwise have to impose after the fact, on every
implementation separately.

An application may of course fetch a referenced image and embed it;
`easymindmap` does, with a size cap and a fallback when the origin refuses. That
is a product behaviour layered on the tree, and L-8 is what stops it from
quietly becoming part of what the document means.

**L-9.** A hard line break is one construct however it is spelled — two or more
trailing spaces, or a trailing backslash. Lift MUST produce the same tree for
both spellings, and MUST record the break in `source` in the backslash form.

*(Informative)* L-9 resolves a conflict between three rules that would otherwise
have no consistent reading. E-5 records a block's source verbatim; P-9 writes
that source back; P-8 forbids a line ending in whitespace. A paragraph carrying a
two-space hard break satisfies the first two and violates the third, so a
document using that spelling could never be canonical and a tree holding it could
never be projected. Normalising at lift rather than at projection is what keeps
mutual inversion intact: if the tree kept the spelling and projection changed it,
the first round-trip would already produce a different tree.

The backslash form is the one canonical form keeps because the other is
invisible. A break whose meaning is carried by trailing spaces is silently
destroyed by editors that trim them, by formatters, and by this repository's own
conventions — `CONTRIBUTING.md` §2 bans trailing whitespace outright. A format
should not have a construct that a reasonable tool removes without being asked.

This was found in a real export: a ChatGPT conversation saved to Markdown ends
five consecutive lines with two spaces, which is how that exporter separates its
metadata lines. Documents of that shape are common, and every one of them would
have been unprojectable.

*(Informative)* L-3 also settles what a node's *title* is and is not. A label is
the node's own inline text and nothing more; the blocks that follow it are
attached to it and stay separate. A document whose first heading is followed by a
metadata block therefore lifts to a node labelled with the title alone, carrying
the metadata as content — not to a node whose label is the title and the metadata
run together. The two are never merged in either direction: P-9 forbids the
reverse on the way out.

This is what makes a mindmap of a long document readable rather than a wall of
text in its first bubble, and it is a consequence of the model rather than a
concession to one. An application decides how to show attached content —
`easymindmap` shows an indicator and opens it on demand. Where it goes is a view
decision; that it is separate from the label is not.

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

**P-9.** Each entry in a node's `content` MUST be written as the Markdown block it
records, in the recorded order, retaining that block's own line structure. A
table MUST be written as a table, a code block as a fenced block, a block quote as
a block quote. Content MUST NOT be folded into the node's label, and MUST NOT be
joined into a single line.

*(Informative)* P-9 states something §1.2.4 L1 already implies, because the
failure it prevents is easy to introduce and hard to notice. An implementation
that models a node as *a line of text with some attachments* will serialise it
that way, and the output still looks like a valid Markdown document — but a table
folded onto one line lifts back as a paragraph, so the tree has changed and
mutual inversion has failed silently. This was observed in an implementation
(`easymindmap` #150) before it was written down here, which is the usual order.

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

**E-1.** A tree MUST be encoded as a JSON object with exactly two members,
`content` and `children`. `content` holds the blocks that precede every node
(L-3), encoded as in E-5; `children` holds node objects in document order. Both
MUST be present, including when empty. The root has no `label` and no `kind`,
because it has no text of its own in the document (L-4).

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

Links are the case where this is asked most often, so it is worth stating
outright: a node written `- [How to install Apache2](https://ubuntu.com/…)` has
that whole string as its label, brackets and URL included. The tree does not
split it into a caption and an address. An application is free to display the
caption and hang the address off an icon — `easymindmap` does exactly that, and
it is a good product decision — but splitting it in the *tree* would mean
teaching the encoding what a link is, and then what a reference link is, an
autolink, an image, a link with a title attribute. That is CommonMark's inline
grammar, arriving one construct at a time through a door this specification
closed on purpose.

Identity is not encoded. Chapter 3 will add a member for it, and doing so will be
a Normative change to this section rather than a clarification of it.

### 2.7 Worked examples

These are written in the format the extractor consumes: input, a `.` separator,
and the expected tree encoded per §2.6. On acceptance they move into `spec.md`
inline, and `examples/examples.json` is generated from them — never the reverse
(`CONTRIBUTING.md` §6). Trees are shown without identity, which is Chapter 3.

The six are numbered here so that they can be referred to in review. Those
numbers are local to this RFC: the numbering `examples.json` assigns depends on
where each example finally sits in `spec.md`.

**Example 1 — sections nest by heading level.**

````example
# Project
## Install
.
{"content":[],"children":[
  {"kind":"section","label":"Project","content":[],"children":[
    {"kind":"section","label":"Install","content":[],"children":[]}]}]}
````

**Example 2 — items nest by indentation.**

````example
- Project
  - Install
.
{"content":[],"children":[
  {"kind":"item","label":"Project","content":[],"children":[
    {"kind":"item","label":"Install","content":[],"children":[]}]}]}
````

Examples 1 and 2 describe the same shape and are **different trees**, because
their nodes differ in kind. Both are canonical, and neither is rewritten into the
other. That is the whole proposal, in six lines.

**Example 3 — a mixed document keeps both kinds, sections above items.**

````example
# Install
- npm
- pnpm
.
{"content":[],"children":[
  {"kind":"section","label":"Install","content":[],"children":[
    {"kind":"item","label":"npm","content":[],"children":[]},
    {"kind":"item","label":"pnpm","content":[],"children":[]}]}]}
````

**Example 4 — a paragraph is content, not a node.**

````example
# Install
Node.js 20 or later.
.
{"content":[],"children":[
  {"kind":"section","label":"Install",
   "content":[{"block":"paragraph","source":"Node.js 20 or later."}],
   "children":[]}]}
````

**Example 5 — a skipped heading level lifts by nesting (L-5), which makes the
document conforming but not canonical.**

````example
# A
### B
.
{"content":[],"children":[
  {"kind":"section","label":"A","content":[],"children":[
    {"kind":"section","label":"B","content":[],"children":[]}]}]}
````

Projecting that tree yields `# A` / `## B`, which lifts to the same tree. The
round-trip is stable at the second pass, and idempotent thereafter.

**Example 6 — content before the first node attaches to the root (L-3), which is
why the root carries `content` (E-1).**

````example
Some prose.

# A
.
{"content":[{"block":"paragraph","source":"Some prose."}],"children":[
  {"kind":"section","label":"A","content":[],"children":[]}]}
````

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
- **Purity of lift (L-8)** — lift run with no network available MUST produce the
  same tree as lift run with one. The test does not need a network at all: it
  asserts that no request is attempted.
- **Hard line breaks (L-9)** — two documents differing only in how a hard break
  is spelled MUST lift to the same tree, and neither projection MUST end a line
  in whitespace. One example pair settles both.

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

This alternative is not hypothetical. **EMM implements it**, with the constant at
six, and the observable result is the one this RFC is trying to avoid: a document
whose second-level nodes were written as bullets comes back with them written as
`##`. See the prior art below — that is the strongest evidence available either
way, and it is evidence for kind belonging to the tree.

**Standalone blocks as nodes.** A fenced code block, a table, or an image
standing alone between blank lines has a visible boundary, and a reader looking
at a mindmap expects it as its own bubble rather than buried inside the node
above it. markmap does exactly this: in its own sample document the three blocks
under *Blocks* become three sibling nodes. `easymindmap` added the same
behaviour as an import option in
[#151](https://github.com/okpojung/easymindmap/pull/151). Rejected for Chapter 2
on three grounds.

1. **A node needs a label and a block has none.** E-2 requires `label` on every
   node, so a code-block node would carry an empty one, and P-1 would then have
   to write it back as an empty heading or an empty bullet — visible noise in a
   plain renderer, which fails L0. Making it work needs a **third kind**, which
   is a larger change than it appears and pushes on the same question the
   checkbox does, below.
2. **The line being drawn is presentational.** The proposed test is that a fenced
   block has a clear boundary while a paragraph blends into the flow. That is
   true of how they *look* and not of what they *are* — in the document model a
   paragraph is exactly as bounded as a table. A rule that separates them has to
   appeal to appearance, which §1.1.3 places outside this specification.
3. **Nothing is lost by leaving it to the view.** `content` is an ordered
   sequence of blocks (E-5), so an application that wants three bubbles under a
   node already has everything it needs to draw them. It does not need the tree
   to be different, and drawing them is a projection (§1.1.2).

The distinction behind the proposal is real, though, and the encoding already
keeps it. A block standing alone becomes its own entry in `content`; an image or
a table embedded in a run of prose — a pasted article, a form — stays inside that
paragraph's `source`. **Standalone and embedded are already different in the
tree.** What this RFC declines to do is make one of them a node.

**Prior art.**

- **EMM (EasyMindMap Markdown)** is the closest prior art by a wide margin, and
  it is not third-party: it is specified and implemented in
  [`easymindmap`](https://github.com/okpojung/easymindmap) by this RFC's author,
  which is disclosed here because prior art one controls is still prior art and
  hiding the overlap would be worse than the overlap. Its specification is at
  `docs/04-extensions/emm-spec.md`, with a reference parser and a twelve-case
  conformance corpus.

  EMM reaches largely the same conclusions this RFC does — headings and list
  items both produce nodes, no new syntax is invented in the body, structure is
  separated from style, round-trip fidelity is the central promise, and
  conformance is a specification plus a corpus rather than an implementation.
  Chapter 1 was written without consulting it, and the convergence is worth more
  than agreement obtained by copying.

  It differs on three points that this RFC decides the other way:

  1. **Kind is not preserved.** Nodes are written by depth — levels 2 to 6 as
     `##` to `######`, level 7 and beyond as indented list items. A bullet at
     depth 2 therefore returns as a heading. This is coherent when the *map* is
     the source of truth and the Markdown is an export of it, which is EMM's
     case. It is damaging when the *document* is the source of truth and was
     written by someone else, which is the case this specification targets. The
     divergence is a difference in starting point, not a defect.
  2. **Heading levels are read by number**, with an `h1Mode` shift for documents
     whose body contains `#`. L-5 reads them by nesting instead, which handles
     that case and the skipped-level case with one rule rather than a mode.
  3. **Empty headings are ignored.** This RFC keeps an empty node, on the ground
     that discarding it loses information a round-trip promised to preserve.

  How the two specifications relate is not settled by this RFC; see the
  unresolved questions.

- **markmap** derives a hierarchy from headings and lists together, and is the
  closest existing behaviour to what this RFC describes. Its rules live in its
  implementation rather than in a published specification, so they cannot be
  cited, targeted by another tool, or argued with. This RFC is in part an attempt
  to write down, testably, something markmap already does usefully.

  Its own sample document shows what that costs. Standalone blocks become
  sibling nodes; ordered list items keep their numbers inside the node text; a
  task list item renders as a checkbox; and the sample carries a prose warning
  that where blocks and lists appear at the same level, the lists are dropped.
  Each of those is a decision this specification has to make explicitly, and
  none of them can be quoted from anything — they can only be observed, one
  version at a time. **Behaviour that can be watched but not cited is exactly
  what a specification is for.**
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

**Whether two kinds are enough** is now pushed on from two directions, which is
worth stating as its own question rather than leaving it as an aside under the
checkbox. A task list item is arguably not the same assertion as a bullet, and a
standalone block would need a kind of its own to become a node at all (see
Alternatives). Both are rejected here, and both would be answered together by a
third kind rather than separately. **If a third kind is ever added, it should be
added once, by an RFC that considers every candidate for it at the same time** —
adding one per problem is how a two-value field becomes an unstructured
vocabulary.

**Whether identity belongs in this specification at all.** This was recorded as
*where identity is written*, on the assumption that it had to be written
somewhere. Asked during the comment period why identity could not simply live
inside a mindmap application, and following the answer through, that assumption
turns out to contradict Chapter 1.

Three statements in the merged text cannot all hold:

1. §1.3 makes identity **a property of a node**, so it is part of the tree.
2. §1.2.4 L1 requires lift to be **deterministic** — the same input producing the
   same output "in any other conforming implementation".
3. §1.2.4 L2 requires an implementation to **assign** identity.

Give two conforming implementations an ordinary Markdown document with no
identity written in it. Both must assign, neither has anything to derive the
value from, so they assign different values and lift the same document to
different trees. L1 is broken by L2.

It is worse for the suite than for the implementations. A normative example
would have to state an expected tree, and the expected identity would differ per
implementation, so no value could be written down. Conformance would not be
decidable (§1.4.3) for any example at all.

The resolution that looks right is to **drop `assign` and keep `read and
preserve`**: the specification says how identity is written *when a document
carries it*, requires nothing to carry it, and never manufactures one. A document
without identity then lifts to a tree without identity, deterministically, and an
example can state exactly what its document contains. Creating identity becomes
an application's business, which is where the question started.

The cost is real and should be weighed rather than waved through. Sidecars stop
being interoperable between tools; there is no standard way for one document to
reference a node in another; and diff and merge have to match nodes structurally
rather than by identity, which is less precise. **The third cost is not actually
new** — a document that has been through a language model comes back without its
identity regardless, so structural matching was always going to be needed. This
choice only makes it the primary mechanism instead of the fallback.

Two things follow for process. This cannot be settled inside this RFC: §1.2.4 and
§1.3 are merged text, so changing them is a Normative change needing **its own
RFC**. And Chapter 2 does not depend on the answer — no rule in §2.1 to §2.6
mentions identity, and E-2's four members are complete without it.

The rest of this entry is the earlier discussion, which stands whichever way the
question above is decided.

L0 forbids any construct that renders as literal text, which leaves very little
room in Markdown — realistically an HTML comment, or a convention over existing
attributes.

The HTML-comment carrier is no longer a guess. EMM ships one — a single
`<!-- easymindmap:v1:BASE64 -->` line at the end of the file, carrying style,
layout, and images, with round-trip proven against its corpus. So the carrier
works, survives real documents, and stays invisible in every Markdown reader.

What it also demonstrates is a tension this specification has not resolved.
§1.4.2 puts presentation in a sidecar and forbids a document's meaning from
depending on one; EMM puts it *in the document*. Both are defensible, and the
choice is not free: an in-document carrier travels with the file and needs no
second artifact, while a sidecar keeps the document readable and diffable and
cannot bloat it with base64. Chapter 3 has to choose knowingly rather than
inherit §1.4.2 by default, and an existence proof on one side is a reason to
argue the question rather than to assume it is settled.

One argument bears on that choice and was not obvious until the purpose of the
round-trip was stated plainly: **the party a document round-trips through is a
language model**, not a person and not another mindmap tool. Markdown is chosen
because a model reads and writes it natively; HTML and web publishing carry a
finished map to human readers, so the Markdown file never has to serve that job.

A model cannot be relied on to carry an opaque token through an edit. Asked to
reorganise a document, it may drop the comments, omit them from nodes it adds,
copy one onto two nodes, or leave them attached to content that moved. None of
those is a bug in the model — it was never told the tokens were load-bearing, and
no instruction makes the guarantee testable. A base64 trailer is worse on three
counts: it is paid for in tokens on every request, a long meaningless string is
the thing a model is likeliest to truncate, and if it does survive an edit it now
describes the structure that existed before.

That is an argument for the sidecar, and it is worth noting that it does not make
EMM's opposite choice wrong. **EMM's round-trip partner is the application
itself**, which never mangles anything, and an in-document carrier is the simpler
answer when nothing untrusted sits in the middle. The divergence is the same
difference in starting point recorded under prior art, arriving a second time.

**How EMM and this specification relate.** Out of scope for Chapter 2, and
recorded because it will not stay out of scope. EMM is a maintained format with a
specification, a reference implementation, and a conformance corpus; this is a
specification with one chapter. Two specifications for one format, in two
repositories, under one maintainer, will contradict each other — the failure this
project exists to prevent, one level up. Whether EMM is the prototype this
supersedes, a profile of it, or a separate format that merely interoperates has
to be answered before either can claim a version 1.0. It does not block this RFC.

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
