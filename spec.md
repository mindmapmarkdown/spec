# Mindmap Markdown

| | |
|---|---|
| **Version** | unversioned draft |
| **Status** | Draft |
| **Last updated** | 2026-07-27 |
| **Latest text** | <https://github.com/mindmapmarkdown/spec/blob/main/spec.md> |
| **Licence** | CC-BY-4.0 (see [`LICENSE`](LICENSE)) |

## Status of this document

This is a working draft. It has no version number because nothing has been
released, and no implementation conforms to it, because the requirements it
states are still expected to change.

Chapters 1 and 2 exist. Together they are enough to build a reader and a writer:
Chapter 1 fixes the vocabulary and the conformance levels, and Chapter 2 says
which tree a document denotes and which document a tree denotes. The operations
of §1.2.4 L2 — diff, merge, and subtree exchange — are not written.

Where the text below points to a chapter that does not exist, it is naming the
place a rule will go rather than citing one. Do not implement against a forward
reference.

Changes to this document follow
[`GOVERNANCE.md` §3](GOVERNANCE.md#3-classes-of-change). Draft status does not
suspend that process; it only means the process has not yet had much to work on.

---

## 1. Scope, conformance, and terminology

### 1.1 Scope

#### 1.1.1 What this specification defines

This specification defines a two-way correspondence between a Markdown document
and a hierarchical tree, consisting of:

1. **Lift** — the rules by which a document determines exactly one tree.
2. **Canonical projection** — the rules by which a tree determines exactly one
   Markdown document.
3. **Round-trip conditions** — the circumstances under which composing the two
   in either order preserves information, and precisely what "information"
   covers.
4. **Conformance** — what a document and an implementation each have to satisfy,
   and how that is tested.

The correspondence is between a document and a **tree**. It is not a
correspondence between a document and a mindmap. A mindmap is one of many
projections of a tree, and is out of scope; see §1.1.2.

Both directions are constrained. A specification that defined only lift would
permit any number of Markdown texts for one tree, and structural change would
remain indistinguishable from reformatting — which is the problem this
specification exists to solve.

#### 1.1.2 What this specification does not define

The following are outside the scope of this specification. Implementations are
free to do any of them, and doing so does not affect conformance.

| Not defined | Why not |
|---|---|
| Rendering and visual layout | Unbounded, and specific to a medium |
| Kinds of view — mindmap, outline, graph, slide, table | Views are projections of a tree; a new one may be invented at any time without changing what a document means |
| Editing and interaction models | Product decisions |
| Positioning, colour, collapse state, zoom | Presentation, which belongs in a sidecar (§1.4.2) |
| File names, directory layout, transport, sync | A document need not be a file |
| Markdown grammar | Defined by CommonMark; this specification is layered on it and does not modify it (§1.5.1) |
| Node identity | A tree that carried identity could not be lifted deterministically, because a document that does not state one gives an implementation nothing to derive it from. Recognising a node across revisions is left to applications; see [RFC 0016](rfcs/0016-remove-node-identity.md) |
| Content of a sidecar | This specification defines neither what a sidecar stores nor how it addresses what it stores |

HTML deserves a specific note, because it is the usual way a view reaches a
reader. HTML is a container that carries a view; it is not a format this
specification defines a correspondence with.

#### 1.1.3 Why the boundary is drawn here *(Informative)*

Views are unbounded and short-lived; trees are neither. Any tree can be shown as
a radial mindmap, an indented outline, a column of cards, or a table of
contents, and the list is not closed — the next useful view has not been
invented yet. A specification that named views would have to name them all, and
would be incomplete the moment one more appeared.

The cost of naming even one is higher than it looks. A requirement about how a
mindmap lays out its branches can only be satisfied by software that draws
mindmaps, so the specification would stop describing a data correspondence and
start describing a product. Its lifetime would then be bounded by that product's
lifetime, and its conformance suite would be untestable without a renderer.
Keeping views out is what allows conformance to be decided by comparing text and
trees — see §1.4.3.

This is a narrower promise than "a standard for mindmaps", and it is deliberate.
A tree that survives the trip out and back is a thing every view can be built
on. A standardised mindmap is a thing only mindmap software can use.

### 1.2 Conformance

#### 1.2.1 Requirement keywords

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in BCP 14
[RFC 2119](https://www.rfc-editor.org/info/rfc2119)
[RFC 8174](https://www.rfc-editor.org/info/rfc8174) when, and only when, they
appear in all capitals, as shown here.

#### 1.2.2 Normative and informative material

Everything in this document is normative except material explicitly marked
*(Informative)*. The marking appears either on a heading, where it covers that
section and everything beneath it, or at the start of a paragraph, where it
covers that paragraph alone.

Examples in fenced `example` blocks are **normative**. Each states an input and
the exact expected result, and an implementation that produces a different
result does not conform. These examples are extracted mechanically into
`examples/examples.json`, which is generated and never hand-edited
([`CONTRIBUTING.md` §6](CONTRIBUTING.md#6-working-on-the-specification-text)).
This chapter contains no examples; they begin with the rules they demonstrate,
in [Chapter 2](#2-canonical-hierarchy).

Informative material explains why a requirement exists or how it relates to
other work. It creates no obligation, and no implementation can be found
non-conformant against it.

#### 1.2.3 Conforming documents

Conformance is defined separately for documents and for implementations, because
they are different kinds of thing: a document is a text and either has the
required properties or does not; an implementation is a behaviour and must be
tested. The two are related but not interchangeable — a conforming
implementation is required to handle documents that do not conform, and a
conforming document does not imply the existence of any software at all.

A **conforming document** is a Markdown document that

- is a valid CommonMark document, and
- lifts (§1.3) to exactly one tree under the rules of this specification, with
  no construct whose interpretation this specification leaves undefined.

A **canonical document** is a conforming document that is byte-identical to the
canonical projection (§1.3) of its own tree. Every canonical document is a conforming
document; the converse does not hold, and is not meant to — a document may state
a tree perfectly clearly while spelling it differently from the canonical form.

An implementation MUST NOT reject a document merely because it is not canonical.

A document that is not a conforming document is **not** thereby erroneous
Markdown. It is Markdown that this specification does not assign a tree to. What
an implementation does with such a document is specified in
[Chapter 2](#2-canonical-hierarchy).

#### 1.2.4 Conforming implementations

Conformance levels are cumulative: an implementation at a level MUST satisfy all
lower levels. An implementation that claims conformance MUST state the highest
level it claims, and MUST NOT claim a level it does not satisfy in full.

| Level | Name | Requirement |
|---|---|---|
| **L0** | Read | A conforming document is usable by software that knows nothing about this specification |
| **L1** | Structure | Lifts any conforming document to the prescribed tree, and projects any tree to canonical form |
| **L2** | Round-trip | Diffs and merges trees, and operates on a subtree without the rest of the document |

**L0 — Read.** L0 places its requirement on documents, not on software. A
conforming document MUST be a valid CommonMark document (§1.2.3), and MUST NOT
express any parent–child relationship in a construct that a CommonMark renderer
discards or emits as literal text. Every existing Markdown reader, editor,
renderer, and diff tool is therefore an L0 implementation without modification.

*(Informative)* The level exists to record as a requirement what would otherwise
be an accident: adopting this specification costs nothing to anyone who has not
adopted it. A proposed requirement that fails L0 fails §1.4.1 with it.

**L1 — Structure.** An L1 implementation MUST lift every conforming document to
the tree this specification prescribes for it, and MUST project every tree to
that tree's canonical form. Both operations MUST be deterministic: the same
input MUST produce the same output, in the same process and in any other
conforming implementation. Sibling order MUST be preserved in both directions.

The two operations MUST be mutually inverse, in this exact sense: lifting the
canonical projection of a tree MUST yield that same tree, and projecting the
lift of a canonical document MUST yield that same document, byte for byte. For a
conforming document that is *not* canonical, only the tree survives; the bytes do
not, and are not required to. Beyond the tree, an L1 implementation is not
required to preserve anything about a document.

**L2 — Round-trip.** An L2 implementation MUST additionally

- compute a structural difference between two trees, expressed as operations on
  nodes rather than on lines of text, and
- merge two trees that share a common ancestor, reporting conflicts in terms of
  nodes, and
- lift and project a proper subtree without access to the document that contains
  it.

L2 is what makes concurrent editing and partial exchange possible: a tool, or a
model, can be handed one branch of a large document, work on it, and have the
result reinserted without the rest of the document ever being transmitted.

*(Informative)* Each of the three requires deciding which node in one tree
corresponds to which in another. This specification defines no identity to key
that decision on (§1.1.2), so it is a judgement over kind, label, position, and
content — and the rules for making it are not yet written.

The tests that decide each level are the conformance suite, generated from the
normative examples in this document; see §1.4.3.

### 1.3 Terminology

Terms are defined in dependency order: no definition below uses a term defined
after it. A term printed in **bold** at the start of a paragraph is being
defined there; elsewhere, defined terms are used in their ordinary type. The last
two entries are pointers rather than definitions — both terms are defined in
§1.2, above.

**document** — A sequence of Unicode code points forming a valid CommonMark
document. Where this specification says *document* without qualification, it
means a Markdown document. A document is not necessarily a file: it may be a
fragment of one, a database column, or a message payload.

**node** — The unit of hierarchical structure. A node has a **label**, which is
inline content identifying the node; zero or more units of **node content**,
which is block content attached to the node without being a node itself; and an
ordered, possibly empty sequence of **child nodes**. Which Markdown constructs
become labels, which become node content, and which become children is defined
in [Chapter 2](#2-canonical-hierarchy).

**kind** — A property of every node other than the root, with exactly two values:
**`section`**, a node written as a Markdown heading, and **`item`**, a node
written as a list item. Kind is part of the tree. Two trees that are otherwise
equal but differ in the kind of any node are different trees.

**tree** — A root node together with all of its descendants. A tree is rooted
and **ordered**: the sequence of a node's children is part of the tree, and two
trees differing only in sibling order are different trees. A tree carries no
presentation, no coordinates, and no styling.

**lift** — The mapping from a document to the tree it denotes. Lift MUST be
deterministic and MUST be total over conforming documents (§1.2.3).

**projection** — A mapping from a tree to some other representation. A Markdown
document is one projection of a tree; an outline, a mindmap, a table of
contents, and a slide deck are others. Only the projection back to Markdown is
specified here (§1.1.2).

**canonical form** — The single Markdown projection that this specification
designates for a given tree. Every tree has exactly one canonical form. The
**canonical projection** is the mapping that produces it. Canonical form is what
makes a text difference and a structural difference agree: two documents in
canonical form differ as text only where their trees differ.

**round-trip** — The composition of lift and projection. A *document
round-trip* takes a document, lifts it, and projects the result back to
Markdown. A *tree round-trip* takes a tree, projects it to Markdown, and lifts
the result. What each is required to preserve is fixed by the conformance level
(§1.2.4), and the two are not the same requirement: at L1 a tree round-trip
returns an equal tree, while a document round-trip returns equal bytes for
canonical documents only.

**sidecar** — An artifact stored outside a document that associates data with
that document's nodes. How a sidecar addresses a node is not defined by this
specification (§1.1.2). Presentation state — position, colour, collapse, zoom,
view kind — belongs in a sidecar. The meaning of a document MUST NOT depend on
any sidecar, and a document MUST lift to the same tree whether or not a sidecar
is present.

**conforming document** — Defined in §1.2.3.

**conforming implementation** — Software satisfying the requirements of at least
one conformance level in §1.2.4, together with the statement of which level it
claims.

### 1.4 Design principles

These principles are the reasons behind the requirements in the chapters that
follow. Each is stated with the consequence that makes it checkable, because a
principle that cannot be violated is decoration.

#### 1.4.1 Backward compatibility is a requirement, not a courtesy

A conforming document is ordinary Markdown, and remains readable and useful in
tools that have never heard of this specification.

*Consequence:* no requirement in this specification may cause a conforming
document to render as visible noise, fail to parse, or lose its hierarchy in a
CommonMark-conformant renderer. A proposal that fails this test fails L0
(§1.2.4) and cannot be adopted without a Breaking change under
[`GOVERNANCE.md` §3](GOVERNANCE.md#3-classes-of-change).

#### 1.4.2 Meaning in the document, presentation in the sidecar

Everything that determines what a document says lives in the document.
Everything that determines how it looks lives outside it.

*Consequence:* deleting every sidecar MUST NOT change any tree. If a proposed
requirement puts a colour, a coordinate, or a collapse state into the document,
it is in the wrong place; if it puts a node's label or its parentage into a
sidecar, so is it.

#### 1.4.3 Conformance must be decidable

A requirement is worth stating only if a test can tell whether it is met.

*Consequence:* every normative requirement is accompanied, in the section that
states it, by at least one example giving an input and the exact expected
result, from which the conformance suite is generated (§1.2.2). A requirement
whose test cannot be written down is a preference and belongs in this section or
in an RFC, not in a normative one.

#### 1.4.4 Interoperate rather than compete

Where an existing format has already settled a question, adopting its answer is
preferred to inventing another one, and the burden of argument falls on
departing from it.

*Consequence:* a normative change that duplicates the function of an existing
format must record, in its RFC, why interoperating with that format was not
sufficient — the RFC template requires prior art to be answered explicitly
rather than waved at.

### 1.5 Relationship to other work *(Informative)*

This section is informative. It describes how this specification sits alongside
existing formats and tools, and creates no requirements. None of the projects
named here are competitors to be displaced; several are dependencies, and the
rest occupy layers this specification deliberately leaves empty.

#### 1.5.1 CommonMark

CommonMark is the substrate. This specification defines no Markdown grammar and
changes none of CommonMark's parsing rules; it defines which of the structures a
CommonMark parser already produces correspond to nodes, and which Markdown text
is the canonical one for a given tree.

The consequence is that an implementation is expected to be a layer over an
existing CommonMark parser rather than a new parser. It also means CommonMark's
ambiguities are inherited rather than avoided: the same tree can be written in
more than one way, and resolving that is the substance of
[Chapter 2](#2-canonical-hierarchy).

#### 1.5.2 OPML

OPML is the established outline interchange format, and its data model — an
ordered tree of nodes carrying attributes — is close to the one here. Its
differences are in the encoding, not the model: it is XML, so it is not the
document itself but a separate representation of it, and it is not written or
reviewed by hand in the way Markdown is.

OPML's specification has also seen no substantive revision in many years. That
is the more relevant difference, and it is the reason this project publishes
[`GOVERNANCE.md`](GOVERNANCE.md) with a succession clause before it publishes a
finished specification.

#### 1.5.3 JSON Canvas

JSON Canvas describes nodes and edges positioned on an infinite canvas —
coordinates, sizes, colours, connections. That is presentation state about a
structure, which is exactly the role §1.4.2 assigns to a sidecar.

It is therefore complementary rather than overlapping. A conforming document
could carry the meaning while a JSON Canvas file carries the layout, provided
the two can be bound to the same nodes. This specification defines neither such
a binding nor what one would key on (§1.1.2).

#### 1.5.4 markmap

markmap renders a Markdown document as an interactive mindmap, and does it well;
it has an ecosystem, and for many people it is the reason they know Markdown and
mindmaps can be the same thing.

The distinction is one of layer. markmap's mapping from Markdown to hierarchy is
defined by its implementation rather than by a published specification, so it is
a very good answer to "show me this document as a mindmap" and not an answer to
"what tree does this document denote, such that another tool arrives at the same
one". This specification addresses the second question, and a tool like markmap
is a natural consumer of the answer rather than a rival to it.

#### 1.5.5 Mermaid mindmap

Mermaid's `mindmap` diagram is a diagram language embedded in a Markdown fenced
code block. The hierarchy is the content of that block: opaque to Markdown
tooling, not part of the document's own structure, and not rendered as text by a
plain reader.

That difference is the point of it. Mermaid is for authoring a diagram inside a
document; this specification is for treating the document's own structure as
data. A document can reasonably contain both.

---

## 2. Canonical hierarchy

Markdown can express one hierarchy in more than one way — as nested headings, as
a nested list, or as a mixture. This chapter fixes which tree a document
denotes, which document a tree denotes, and what must be true of a tree for the
second question to have an answer at all.

Rules are labelled by what they govern: **L** for lift, **S** for the trees lift
can produce, **P** for canonical projection, and **E** for the encoding the
examples are written in. The labels are stable and may be cited.

### 2.1 Node kind

Every node other than the root has a **kind**, defined in
[§1.3](#13-terminology). The two values are `section`, a node written as a
Markdown heading, and `item`, a node written as a list item.

**Kind is part of the tree.** Two trees that are otherwise equal but differ in
the kind of any node are different trees.

*(Informative)* Kind is not presentation and does not belong in a sidecar
(§1.4.2). A heading and a bullet are different things to the reader of a
document: one asserts a division of the text, the other an entry in a series.
Preserving that is preserving what the document says, not how it is displayed.
Colour, position, and collapse state remain presentation and remain in the
sidecar.

The cost of this is stated plainly: a document written with headings and a
document written with bullets are **different trees**, and this specification
offers no operation that declares them equivalent. That is believed to be
correct rather than merely tolerated — the two documents were written
differently because they were meant differently.

Sections nest by heading level:

````example
# Project
## Install
.
{"content":[],"children":[
  {"kind":"section","label":"Project","content":[],"children":[
    {"kind":"section","label":"Install","content":[],"children":[]}]}]}
````

Items nest by indentation:

````example
- Project
  - Install
.
{"content":[],"children":[
  {"kind":"item","label":"Project","content":[],"children":[
    {"kind":"item","label":"Install","content":[],"children":[]}]}]}
````

Those two describe the same shape and are **different trees**, because their
nodes differ in kind. Both are canonical documents, and neither is rewritten
into the other.

A document may use both, with sections above items:

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

The reverse — an `item` containing a `section` — is not a well-formed tree; see
[§2.4](#24-well-formed-trees).

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

**L-9.** A hard line break is one construct however it is spelled — two or more
trailing spaces, or a trailing backslash. Lift MUST produce the same tree for
both spellings, and MUST record the break in `source` in the backslash form.

*(Informative)* L-1 is what keeps a prose document from exploding. A README with
forty paragraphs and six headings has six nodes, not forty-six. The test for
whether something should be a node is whether Markdown gives it a hierarchy of
its own; paragraphs and tables have none.

L-3 also settles what a node's *title* is and is not. A label is the node's own
inline text and nothing more; the blocks that follow it are attached to it and
stay separate. A document whose first heading is followed by a metadata block
therefore lifts to a node labelled with the title alone, carrying the metadata as
content — not to a node whose label is the title and the metadata run together.
The two are never merged in either direction; P-9 forbids the reverse on the way
out.

L-8 follows from the determinism L1 already requires (§1.2.4). A tree that
depended on a network fetch would differ between implementations, between runs of
the same implementation, and over time as servers change or disappear, and
conformance would stop being decidable (§1.4.3). It also keeps a parser from
becoming a network client on behalf of whoever supplied the document. An
application may of course fetch a referenced image and embed it; that is a
product behaviour layered on the tree, and L-8 is what stops it from quietly
becoming part of what the document means.

L-9 resolves a conflict between three rules that would otherwise have no
consistent reading: E-5 records a block's source verbatim, P-9 writes that source
back, and P-8 forbids a line ending in whitespace. A paragraph carrying a
two-space hard break satisfies the first two and violates the third. Normalising
at lift rather than at projection is what keeps mutual inversion intact — if the
tree kept the spelling and projection changed it, the first round-trip would
already produce a different tree. The backslash form is the one canonical form
keeps because the other is invisible: a break whose meaning is carried by
trailing spaces is silently destroyed by editors that trim them.

A paragraph is content, not a node:

````example
# Install
Node.js 20 or later.
.
{"content":[],"children":[
  {"kind":"section","label":"Install",
   "content":[{"block":"paragraph","source":"Node.js 20 or later."}],
   "children":[]}]}
````

Content before the first node attaches to the root, which is why the root
carries `content` (E-1):

````example
Some prose.

# A
.
{"content":[{"block":"paragraph","source":"Some prose."}],"children":[
  {"kind":"section","label":"A","content":[],"children":[]}]}
````

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

*(Informative)* Rejecting skipped levels was considered and rejected: roughly
half of the Markdown in existence would stop conforming, for no gain, because the
author's intent in `# A` / `### B` is never ambiguous.

A skipped heading level lifts by nesting, which makes the document conforming but
not canonical:

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

### 2.4 Well-formed trees

**S-1.** A `section` MUST NOT have an `item` ancestor.

**S-2.** A `section` MUST NOT be at a depth greater than 6.

A tree satisfying S-1 and S-2 is **well-formed**. Lift cannot produce a tree that
is not well-formed; a tree constructed programmatically can be.

**S-3.** An implementation MUST reject a tree that is not well-formed, and MUST
NOT project it by coercing the offending nodes to `item`.

*(Informative)* Both constraints follow from L0 (§1.2.4) rather than from taste.
A heading nested inside a list item is legal CommonMark, but renders as a
document-level heading and is read as one by every outline extractor — the
hierarchy does not survive in an unmodified renderer, which L0 forbids. And ATX
headings stop at level 6; `#######` renders as literal text.

S-3 is not severity for its own sake. §1.2.4 L1 requires lift and canonical
projection to be mutually inverse. Silent coercion would produce a document that
lifts to a *different* tree from the one projected, breaking that requirement in
the one place it is hardest to notice. Refusing is the only behaviour consistent
with Chapter 1.

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

*(Informative)* P-5 is doing more work than it appears to. The worst ambiguity in
CommonMark for this specification is that four spaces of indentation may mean an
indented code block or a continuation of a list item, and the reading depends on
context several lines away. Banning indented code blocks from canonical form
removes the collision outright rather than adjudicating it. Lift still accepts
them (L-3); they simply come back fenced.

Loose and tight lists are a rendering distinction — whether items are wrapped in
paragraphs — and carry no structural meaning. Lift ignores the difference; P-7
picks one so that projection is deterministic.

P-9 states something §1.2.4 L1 already implies, because the failure it prevents
is easy to introduce and hard to notice. An implementation that models a node as
*a line of text with some attachments* will serialise it that way, and the output
still looks like a valid Markdown document — but a table folded onto one line
lifts back as a paragraph, so the tree has changed and mutual inversion has failed
silently.

### 2.6 The tree encoding used by examples

A tree is an abstract structure. It has no format, and this specification blesses
none — a Markdown document is one projection of a tree and the only one specified
(§1.1.2). But an example has to state its expected tree *in something*, and
whatever that notation is, it has to be specified: two implementations reading
the same suite differently is exactly the undecidable conformance §1.4.3 forbids.

**This is a test fixture encoding and nothing more.** It is not an interchange
format, not a serialisation implementations are expected to read or write outside
the suite, and not a second format this specification undertakes to maintain.

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

E-4 and E-5 carry source through verbatim so that the encoding is lossless
without the suite having to model Markdown's inline or block semantics. A label
reduced to plain text would drop emphasis and links, which would make round-trip
untestable at exactly the point where it matters.

Links are the case where this is asked most often, so it is worth stating
outright: a node written `- [How to install](https://example.com/)` has that
whole string as its label, brackets and URL included. The tree does not split it
into a caption and an address. An application is free to display the caption and
hang the address off an icon, but splitting it in the *tree* would mean teaching
the encoding what a link is, and then what a reference link is, an autolink, an
image, a link with a title attribute — CommonMark's inline grammar, arriving one
construct at a time through a door §1.1.2 closed on purpose.

Identity is not encoded, and this specification does not define it; see §1.1.2
and [RFC 0016](rfcs/0016-remove-node-identity.md).

The examples in this chapter are extracted into `examples/examples.json` by
`tools/extract-examples.mjs`, and that file is the conformance suite for lift.
Projection is checked the other way round — a tree in, a document out, compared
byte for byte — and mutual inversion by composing the two.

### 2.7 Effect on round-trip

For a canonical document, lift followed by projection returns the document byte
for byte — §1.2.4 L1 already requires this, and the rules above are what make it
achievable. For a conforming document that is not canonical, the tree is
preserved and the bytes are normalised; the second round-trip is byte-stable.

*(Informative)* Kind preservation is what makes the normalisation acceptable in
practice. The changes a non-canonical document undergoes are confined to
whitespace, marker characters, heading style, heading level, and code-fence
style. **No heading becomes a bullet and no bullet becomes a heading.**

---

*This document is licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). See
[`LICENSE`](LICENSE) for the licensing of this repository as a whole.*
