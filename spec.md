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
  no construct whose interpretation this specification leaves undefined, and
- whose tree is well-formed (§2.4).

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
| **L1** | Structure | Lifts any conforming document to the prescribed tree, and projects any well-formed tree to canonical form |
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
the tree this specification prescribes for it, and MUST project every
**well-formed** tree (§2.4) to that tree's canonical form. Both operations MUST
be deterministic: the same input MUST produce the same output, in the same
process and in any other conforming implementation. Sibling order MUST be
preserved in both directions.

The two operations MUST be mutually inverse, in this exact sense: lifting the
canonical projection of a **well-formed** tree MUST yield that same tree, and
projecting the lift of a canonical document MUST yield that same document, byte
for byte. For a
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
equal but differ in the kind of any node are different trees. An `item` written as
an ordered list item carries two further properties, an **ordinal** and a
**delimiter**; they are part of the tree in the same way (L-12).

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
node of kind `item`. An item's `label` is the inline content of its first block
when that block is a paragraph, and is empty otherwise. A block that does not
give a label is node content (L-3), in the position it occupies.

**L-3.** Every block that is not a heading or a list item — paragraph, fenced or
indented code block, block quote, table, HTML block, thematic break — is **node
content**, and attaches to the nearest node preceding it in document order.
Content appearing before any node attaches to the root. A document's front
matter is node content as well, and attaches to the root; L-10 says how. So is a
link reference definition, which CommonMark reports as no block at all; L-13
says how.

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

**L-10.** If a document's first line consists of exactly three hyphen-minus
characters, optionally followed by spaces or tabs, the line after it is not
blank, and some later line consists of the same, then the lines from the first
through the **first** such later line are **front matter**. Front matter produces
no node. It is recorded as a single entry in the root's `content` (E-1), with
`block` equal to `front_matter` and `source` that run of lines verbatim, both
fences included and each line's trailing spaces and tabs removed. A document with
no such later line, or whose second line is blank, has no front matter, and its
first line is read as CommonMark reads it.

**L-11.** A code block — fenced or indented — MUST be recorded with `block` equal
to `code_block` and `source` made of:

1. an opening line: the **fence** immediately followed by the **info string**;
2. one line for each line of the **content**;
3. a closing line: the fence alone.

The **content** is the code block's content as CommonMark defines it — the text a
CommonMark renderer places inside the code element, with the indentation
CommonMark removes already removed, including an indented block's four columns, an
indented fence's indentation, and a list item's. Its final line feed does not
produce an additional line. Empty content produces no lines.

The **info string** is, for a fenced block, the rest of the opening fence line as
written, with leading and trailing whitespace removed; for an indented block,
empty.

The **fence** is backtick characters, or tilde characters if the info string
contains a backtick. Its length is three, or one more than the longest run of that
character anywhere in the content, whichever is greater.

**L-12.** An item of an ordered list has an **ordinal** and a **delimiter**. The
ordinal is the list's start number plus the item's zero-based position in that
list, both as CommonMark determines them. The delimiter is `.` or `)`, as
written. An item of a bullet list has neither. The list marker is not part of the
label (E-4).

**L-13.** A link reference definition (CommonMark §4.7) produces no node. It is
**node content**: one entry with `block` equal to `link_reference_definition` and
`source` the definition's lines as written, and it attaches as L-3 attaches any
block. A run of definitions that no blank line separates is one entry.

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
consistent reading: E-5 records a block's source as the document has it, P-9
writes that source back, and P-8 forbids a line ending in whitespace. A
paragraph carrying a two-space hard break satisfies the first two and violates
the third. Normalising at lift rather than at projection is what keeps mutual
inversion intact — if the tree kept the spelling and projection changed it, the
first round-trip would already produce a different tree. The backslash form is
the one canonical form keeps because the other is invisible: a break whose
meaning is carried by trailing spaces is silently destroyed by editors that trim
them.

L-10 exists because front matter is not CommonMark, and CommonMark's reading of
it is not harmless. The opening `---` has nothing before it and is a thematic
break; the closing `---` follows a paragraph, and a line of hyphens after a
paragraph is a **setext heading underline**. The fence meant to close the block
instead promotes the block's contents to a heading, which L-1 then turns into a
node that is nowhere in the document. Recording the run of lines as one opaque
block is what stops that, and it is the least this specification can do and still
satisfy §1.2.4 L1: a rule that discarded the block would leave projection nothing
to write back, and every document carrying front matter would fail the round-trip
it was conforming under.

Removing trailing whitespace at lift resolves the same collision L-9 resolves,
for the same reason. P-9 writes a recorded source back unchanged and P-8 forbids
a line ending in whitespace, so a front-matter line with a stray trailing space —
ordinary in hand-written metadata — would otherwise make the document
unprojectable. The cost is the same as L-9's: such a document is conforming but
not canonical, and its bytes settle on the first round-trip.

**Nothing in L-10 parses the block.** This specification does not know what YAML
is, does not require the contents to be valid anything, and says nothing about
what a key means. The block is opaque text occupying a known position, which is
all that is needed to stop it becoming a node and the most that can be said
without acquiring a metadata format this specification would then have to
maintain (§1.1.2). Nor does L-10 weaken L0: front matter expresses no
parent-child relationship, so the rule L0 states is not engaged. A plain renderer
does show the block as a heading where a conforming implementation shows no node
— that divergence belongs to front matter itself, and exists whatever this
specification says about it.

L-11 does for a code block what L-9 does for a hard break: it records what the
construct means rather than how it was spelled. CommonMark already defines a code
block's content independently of whether the block was fenced or indented, and a
conforming renderer emits the same code element for either; L-11 records that
content and discards the rest — the fence character, its length, how far it was
indented, the item it sat in. Without it, two documents holding identical code
lift to different trees, and one spelling — a fence indented two spaces —
survives the round-trip while the code inside it changes, which is a failure no
suite of trees can see.

The exception P-8 makes is the mirror image. L-9 and L-10 both resolve their
collision with P-8 by removing whitespace at lift, and for a paragraph or a
front-matter line that costs nothing a reader can see. In a code block the
trailing spaces **are** the code — a patch that changes whitespace, a Markdown
sample demonstrating a hard break, a language where it is syntax — so removing
them is the silent change to content L-11 exists to prevent. The cost is that a
canonical document may carry trailing whitespace, and an editor that trims on
save will change that document; the same editor changes the code in any Markdown
file, and what this specification can do is not be the thing that changes it.

The word doing the work in L-2's third sentence is **inline**. A heading's label
is its heading text and an item's is its first paragraph's text; a thematic
break, a block quote, a fenced block, a table and an HTML block have no inline
content of their own to lend. They were never labels — L-2 did not say so, and
lift took whatever first block it was given. An item opening with a thematic
break then had the label `---`, and `- ---` is itself a thematic break, so that
node could not be written down at all. An item opening with a quotation was worse
for being writable: it lifted to a node *named* `> q`, which is not what the
document says.

L-10's second condition — that the line after the opening fence is not blank —
keeps the rule from swallowing a document that opens with a thematic break and
carries a later one. That is a note beginning with a horizontal rule, which is
how some people write every note, and without the condition its whole first
section became opaque front matter. The condition costs real front matter
nothing: it opens on its first key, in every tool this rule exists to
accommodate, and Pandoc requires the same thing. A line is blank when it is empty
or contains only spaces and tabs, as CommonMark defines it. An empty block is
unaffected — `---` immediately followed by `---` has a non-blank line after it,
its own closing fence.

L-12 records an ordered list's numbers because they are meaning rather than
spelling. A reader who writes `3.` is saying *third*, and a tool that renumbers
it to 1 has changed the document's content, not its formatting. CommonMark reads
a list's start from its **first** item only, so the number written on any later
item is not recorded: a list written 1, 1, 1 lifts to 1, 2, 3 and comes back
written that way. A new list begins where CommonMark begins one — a change of
delimiter, a change between bullet and ordered, or a block that interrupts the
list. Blank lines alone do not. And L-3 is unchanged by this, but worth reading
once more with numbers in mind: a block that follows a list attaches to the
nearest node preceding it, which is the list's **deepest last item**, and P-12 is
what writes it back where the numbering needs it.

L-13 records a definition rather than parsing it, and takes the run rule L-10
already takes for front matter, for the same reason: telling one definition from
the next means parsing them. A blank line between two definitions makes two
entries. Before this rule projection dropped every definition, so a document's
reference links rendered as links in the text that was read and as literal
brackets in the text that came back — a change to what the document says that no
comparison of trees can detect, because both documents lift to the same tree.

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

Content before the first node attaches to the root, which is why the root
carries `content` (E-1):

````example
Some prose.

# A
.
{"content":[{"block":"paragraph","source":"Some prose."}],"children":[
  {"kind":"section","label":"A","content":[],"children":[]}]}
````

A setext heading produces a node exactly as an ATX heading does (L-1), and its
label is the text alone. Canonical form writes every heading as ATX (P-6), so
this is a conforming document that is not a canonical one:

````example
Install
=======

Requirements
------------
.
{"content":[],"children":[
  {"kind":"section","label":"Install","content":[],"children":[
    {"kind":"section","label":"Requirements","content":[],"children":[]}]}]}
````

That setext reading is what front matter runs into, and L-10 takes the whole
block out of its way. The block produces no node; it is one entry of the root's
content, both fences included:

````example
---
title: Deploy
---

# Preparation
.
{"content":[{"block":"front_matter","source":"---\ntitle: Deploy\n---"}],
 "children":[
   {"kind":"section","label":"Preparation","content":[],"children":[]}]}
````

L-10 needs a closing fence, and this is the case it must not swallow. With no
later line of three hyphens, the first line is read as CommonMark reads it — an
ordinary thematic break, which L-3 attaches to the root:

````example
---

# A
.
{"content":[{"block":"thematic_break","source":"---"}],
 "children":[{"kind":"section","label":"A","content":[],"children":[]}]}
````

L-10 needs the line after the opening fence to be non-blank, and this is the
other case it must not swallow — a note that opens with a horizontal rule and
carries a later one. Every line of it is ordinary content of the root:

````example
---

A note that opens with a rule.

---

More text.
.
{"content":[
  {"block":"thematic_break","source":"---"},
  {"block":"paragraph","source":"A note that opens with a rule."},
  {"block":"thematic_break","source":"---"},
  {"block":"paragraph","source":"More text."}],
 "children":[]}
````

Front matter as the tools that write it write it opens on its first key, so the
condition does not reach it:

````example
---
title: A note
---

# Heading
.
{"content":[
  {"block":"front_matter","source":"---\ntitle: A note\n---"}],
 "children":[
  {"kind":"section","label":"Heading","content":[],"children":[]}]}
````

Every other block is content too, and a section with a quotation and a code
block beneath it has one node rather than three:

````example
# Install

> Requires Node 20.

```bash
npm i
```
.
{"content":[],"children":[
  {"kind":"section","label":"Install",
   "content":[
     {"block":"block_quote","source":"> Requires Node 20."},
     {"block":"code_block","source":"```bash\nnpm i\n```"}],
   "children":[]}]}
````

An indented code block is recorded fenced, so its source does not depend on how
it was written (L-11). Canonical form writes it fenced (P-5), so this document
is conforming and not canonical:

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

A block inside a list item carries none of the item's indentation (E-5, E-10), on
any of its lines. Both of E-10's numbers are two here — the columns the block's
first line gave up, and the columns P-4 will write back — so two is what every
later line loses:

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

The two numbers come apart in two ways, and each has a document behind it. A
block attached to the root gave up columns that P-4 will not replace, so nothing
is removed from its later lines; canonical form writes the block at the root's
content column, which is zero, and this document is conforming and not canonical:

````example
␣␣cont
␣␣␣␣- n3
.
{"content":[{"block":"paragraph","source":"cont\n    - n3"}],"children":[]}
````

Had the two columns been removed, `- n3` would have come back at two columns,
where a list marker interrupts a paragraph — and the projection would hold a node
the tree does not.

The other way round, a block written at column 0 and attached to an item by L-3
gave up no columns at all, and P-4 will add the item's two. No line loses more
than it gave up, so the block quote's continuation line keeps all four of its
columns and projection writes it six columns in:

````example
- a
> q
> r
␣␣␣␣- n3
.
{"content":[],"children":[
  {"kind":"item","label":"a",
   "content":[{"block":"block_quote","source":"> q\n> r\n    - n3"}],
   "children":[]}]}
````

Trailing whitespace inside a code block is content, and a canonical document keeps
it (P-8). Shown here as `␣`:

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

A table has no block type of its own — CommonMark defines none — so it is
recorded as the paragraph it parses to, with its source intact. That is what
lets P-9 write it back as a table instead of folding it onto one line:

````example
# Platforms

| Platform | Status |
|---|---|
| Linux | ok |
.
{"content":[],"children":[
  {"kind":"section","label":"Platforms",
   "content":[
     {"block":"paragraph",
      "source":"| Platform | Status |\n|---|---|\n| Linux | ok |"}],
   "children":[]}]}
````

A hard line break lifts to the same tree whichever way it is spelled (L-9).
Written with trailing spaces, shown here as `␣` because they would not otherwise
survive an editor:

````example
# Note

first line␣␣
second line
.
{"content":[],"children":[
  {"kind":"section","label":"Note",
   "content":[{"block":"paragraph","source":"first line\\\nsecond line"}],
   "children":[]}]}
````

and written with a backslash, which is the form the tree keeps:

````example
# Note

first line\
second line
.
{"content":[],"children":[
  {"kind":"section","label":"Note",
   "content":[{"block":"paragraph","source":"first line\\\nsecond line"}],
   "children":[]}]}
````

Trailing whitespace that is *not* a hard break is not recorded at all, so a stray
space at the end of a paragraph does not leave a tree that cannot be written back
(E-10). Shown here as `␣`, and this document is conforming and not canonical:

````example
# Note

para␣␣
.
{"content":[],"children":[
  {"kind":"section","label":"Note",
   "content":[{"block":"paragraph","source":"para"}],
   "children":[]}]}
````

A link reference definition produces no node and is recorded whole (L-13). At the
top of a document it attaches to the root, like any other block that precedes
every node:

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

and elsewhere it attaches as L-3 attaches anything else — to the nearest node
preceding it, in the position it occupies:

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

including inside a list item, where it takes none of the item's indentation:

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

A definition is the one block CommonMark does not report, which is why it alone
can sit between a bare marker and a nested list without becoming that node's
label. An empty label's first content entry is written on the line below the
marker when the node has children (P-7): a blank line there would leave two in a
row once the definition is read out again, and two blank lines end the item, so
the child below would come back as a sibling.

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

and a label of its own puts the content back where P-7 always had it:

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

An ordered item records its number and its delimiter (L-12):

````example
# Setup

1. Install
2. Configure
.
{"content":[],"children":[
  {"kind":"section","label":"Setup","content":[],"children":[
    {"kind":"item","label":"Install","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Configure","ordinal":2,"delimiter":".",
     "content":[],"children":[]}]}]}
````

A list that starts at 3 keeps its start:

````example
# Steps

3. Test
4. Ship
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"Test","ordinal":3,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Ship","ordinal":4,"delimiter":".",
     "content":[],"children":[]}]}]}
````

CommonMark does not read the numbers written on later items, and neither does
lift. Canonical form writes them in order, so this document is conforming and not
canonical:

````example
# Steps

1. One
1. Two
1. Three
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"One","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Two","ordinal":2,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Three","ordinal":3,"delimiter":".",
     "content":[],"children":[]}]}]}
````

The delimiter is recorded as written:

````example
# Steps

1) One
2) Two
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"One","ordinal":1,"delimiter":")",
     "content":[],"children":[]},
    {"kind":"item","label":"Two","ordinal":2,"delimiter":")",
     "content":[],"children":[]}]}]}
````

A line that begins with a date is three nested ordered lists to CommonMark, and
every number is kept:

````example
# Log

- 2026. 1. 15. 10:00
.
{"content":[],"children":[
  {"kind":"section","label":"Log","content":[],"children":[
    {"kind":"item","label":"","content":[],"children":[
      {"kind":"item","label":"","ordinal":2026,"delimiter":".",
       "content":[],"children":[
         {"kind":"item","label":"","ordinal":1,"delimiter":".",
          "content":[],"children":[
            {"kind":"item","label":"10:00","ordinal":15,"delimiter":".",
             "content":[],"children":[]}]}]}]}]}]}
````

*(Informative)* That last tree is not a mistake, and it is not something this
specification chose. CommonMark reads `2026.` as a list marker, and so every
renderer in existence already reads that line as three nested lists; recording
anything else would be recording something no reader of the document sees. It is
not canonical, and its canonical form is a shape nobody would write — which is
the honest answer for a document whose text and whose meaning disagree.

A label is inline source rather than rendered text, and lift never resolves what
that source points at (E-4, L-8). The link below is the whole label, brackets and
URL included, and no request is made for it:

````example
# Links

- [How to install](https://example.com/)
.
{"content":[],"children":[
  {"kind":"section","label":"Links","content":[],"children":[
    {"kind":"item","label":"[How to install](https://example.com/)",
     "content":[],"children":[]}]}]}
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

A heading at or below the level of the open section closes it, so the next
section becomes a sibling rather than a child:

````example
# A

## B

# C
.
{"content":[],"children":[
  {"kind":"section","label":"A","content":[],"children":[
    {"kind":"section","label":"B","content":[],"children":[]}]},
  {"kind":"section","label":"C","content":[],"children":[]}]}
````

An item's depth is its nesting within the list, counted from the node that
contains the list rather than from the document (L-7):

````example
# Menu

- Drinks
  - Tea
    - Green
.
{"content":[],"children":[
  {"kind":"section","label":"Menu","content":[],"children":[
    {"kind":"item","label":"Drinks","content":[],"children":[
      {"kind":"item","label":"Tea","content":[],"children":[
        {"kind":"item","label":"Green","content":[],"children":[]}]}]}]}]}
````

### 2.4 Well-formed trees

**S-1.** A `section` MUST NOT have an `item` ancestor.

**S-2.** A `section` MUST NOT be at a depth greater than 6.

**S-4.** A `front_matter` entry MUST be the first entry of the root's `content`,
and MUST NOT appear anywhere else in a tree.

**S-5.** Among consecutive sibling items, an ordered item whose delimiter equals
the previous item's, and whose ordinal is not one more than the previous item's,
**restarts** the list. For every restart, the deepest last descendant of the
previous item MUST have non-empty content.

**S-6.** `ordinal` and `delimiter` MUST appear together, and only on items. An
ordinal MUST be a non-negative integer, and a delimiter MUST be `.` or `)`. An
item that begins a list — one that does not continue the item before it — MUST
have an ordinal of at most 999999999.

**S-7.** Lifting a tree's canonical projection MUST yield that tree.

**S-8.** A `section`'s `label` MUST NOT contain a line feed.

A tree satisfying S-1, S-2, S-4, S-5, S-6, S-7, and S-8 is **well-formed**. S-7
is read only for a tree that satisfies the other six; a tree that fails one of
them is not well-formed, whatever its projection would do. *Yield that tree*
means equal under E-7.

A document whose tree would not be well-formed is not a conforming document
(§1.2.3), and lift assigns it no tree. A tree constructed programmatically can
fail to be well-formed; S-3 applies to it.

**S-3.** An implementation MUST reject a tree that is not well-formed, and MUST
NOT project it by coercing the offending nodes to `item`.

*(Informative)* S-1 and S-2 follow from L0 (§1.2.4) rather than from taste.
A heading nested inside a list item is legal CommonMark, but renders as a
document-level heading and is read as one by every outline extractor — the
hierarchy does not survive in an unmodified renderer, which L0 forbids. And ATX
headings stop at level 6; `#######` renders as literal text.

S-4 has a different source. Front matter is defined by its position — the first
line of the document (L-10) — so a `front_matter` entry anywhere else encodes a
tree no document lifts to, and P-11 would have to write it somewhere it could not
be read back from. The constraint states in the tree what the rule already says
about the text.

S-3 is not severity for its own sake. §1.2.4 L1 requires lift and canonical
projection to be mutually inverse. Silent coercion would produce a document that
lifts to a *different* tree from the one projected, breaking that requirement in
the one place it is hardest to notice. Refusing is the only behaviour consistent
with Chapter 1.

*(Informative)* **This is how S-1 has always worked.** `- a` followed by
`␣␣# h` is valid CommonMark and lifts, under L-1 and L-2, to a section inside an
item. No conforming document can denote that tree, so the document is not
conforming, and an implementation reports it rather than producing the tree. The
definition in §1.2.3 now says so for every rule in this section, where it used to
be implied for S-1 alone.

A document this turns away is still valid Markdown. L0 is untouched: every
renderer, editor, and diff tool reads it exactly as before. What it does not have
is a tree, because the one tree the rules would give it is a tree its own
canonical projection does not return.

S-5 and S-6 are what makes a numbering restart survive. CommonMark merges two
adjacent lists of the same type and delimiter unless a block interrupts them, and
in any document that block is — by L-3 — the content of the node just before the
second list. S-5 states in the tree what the document already had to contain, so
that projection can write it back (P-12). S-6's bound is CommonMark's: a list
marker carries at most nine digits, so `999999999.` begins a list and
`1000000000.` is a paragraph. An item that *continues* a list may exceed it — the
second item of a list starting at 999999999 is number 1000000000 — because such
an item's number is never written for CommonMark to read (P-3).

S-8 is S-1's shape applied to a label. After E-4 folds a soft break, the only
line break a section's label can still carry is a hard one; it renders, so the
argument that folding changes nothing a reader can see does not reach it, and P-6
has no way to write it, because an ATX heading is one line. A heading whose
inline content carries a hard break is therefore refused exactly as a heading
inside a list item is, and for the same reason: lift is defined over conforming
documents.

S-7 states as a property of a tree what §1.2.4 L1 requires of the two operations.
A tree that fails S-1, S-2, or S-4 fails the round trip as well; those rules stay,
and are read first, because each names its reason.

It is stated over the round trip rather than as a list of forbidden labels because
such a list would be a second, partial grammar of CommonMark, and would be wrong
the first time the two disagreed. S-7 defers to the rules already written, so it
is exactly as strict as they are.

A tree S-7 rejects is usually one character away from a tree it accepts:

| Rejected | Well-formed instead |
|---|---|
| an item labelled `1. Install`, `1) Install`, `- x`, `+ x`, `* x`, or `-` | `1\. Install`, `1\) Install`, `\- x`, `\+ x`, `\* x`, `\-` |
| an item labelled `# x` | `\# x` |
| an item labelled `[x]: /url`, which is a link reference definition and produces no block | `\[x]: /url` |
| an item labelled `---`, since `- ---` is a thematic break | `\---` |
| a section labelled `Title #`, whose `#` is a closing sequence | `Title \#` |
| a label with leading or trailing whitespace | the label trimmed (E-4) |
| a `paragraph` whose source is `- x`, `# x`, `---`, or `<div>` | `\- x`, `\# x`, `\---`, `\<div>` — or the block that source is |
| an entry whose `block` does not name the block its `source` is | the name lift gives |

One case does not appear in that table, and the reason is worth stating. A
recorded string whose line ends in whitespace has no canonical projection either,
but E-10 forbids it outright, so S-7 is never asked. L-9 records the one spelling
of trailing whitespace that means something; everywhere else it goes at lift.

A tree is well-formed as a whole, not part by part. A `code_block` whose source
is an unclosed fence is well-formed as the last thing in a document, and is not
when a node follows it, because the fence swallows the node. An operation that
inserts a subtree checks the tree it produces.

How a label is displayed or edited is outside this specification (§1.1.2). An
editor can let someone type `1. Install`, show it that way, and hold
`1\. Install` in the tree.

**No example is given for any rule in this section.** The suite is a list of
documents, and a document these rules turn away has no tree to write down. That
gap is recorded rather than papered over; §1.4.3 asks for mechanically decidable
conformance, and these rules are decidable — one projection, one lift, and one
E-7 comparison — without the suite being able to state a case.

### 2.5 Canonical projection

**P-1.** Kind MUST be preserved. A `section` MUST be written as an ATX heading; an
`item` MUST be written as a list item. When an `item`'s `label` contains a line
feed, each line after the first MUST be written at that item's content column
(P-4).

**P-2.** A section's heading level MUST equal its depth.

**P-3.** A bullet item's marker MUST be `-`. An ordered item's marker MUST be its
ordinal followed by its delimiter; an item that continues a list and whose ordinal
exceeds 999999999 MUST use `999999999` in place of its ordinal.

**P-4.** The **content column** of the root and of a `section` is zero. The
content column of an `item` is that of the node holding it plus the width of the
item's own marker plus one: two under `-`, three under `1.`, four under `10.`. An
item's node content and its nested lists MUST be indented to the item's content
column — except that where the item's `label` is empty and its content is written
after a blank line, that content MUST be indented three columns wherever the
content column would be four or more.

**P-5.** Code blocks MUST be fenced — with backticks, or with tildes when the
info string contains a backtick. Indented code blocks MUST NOT appear in a
canonical document.

**P-6.** Headings MUST be ATX. Setext headings MUST NOT appear in a canonical
document.

**P-7.** A single blank line MUST separate a heading from what follows it and
each block of node content from the next. A list MUST be tight — no blank line
between items — unless an item carries block content, in which case the list MUST
be loose. When an item's `label` is not empty and its first child's label is, a
single blank line MUST separate the label from what follows it. When a node's
`label` is empty and the node has children, its first `content` entry MUST be
written on the line immediately below the marker, with no blank line between them.

**P-8.** No line may end in whitespace, **except a content line of a code block**,
and the document MUST end with exactly one line feed.

**P-9.** Each entry in a node's `content` MUST be written as the Markdown block it
records, in the recorded order, retaining that block's own line structure. A
table MUST be written as a table, a code block as a fenced block, a block quote as
a block quote. Content MUST NOT be folded into the node's label, and MUST NOT be
joined into a single line.

**P-10.** A node's `content` MUST be written before any of its children.

**P-11.** A `front_matter` block MUST be written first, beginning at the first
line of the document, followed by a single blank line before whatever comes next.

**P-12.** Consecutive sibling items MUST be written as one list for as long as
each continues the previous one — the same type and, for ordered items, the same
delimiter and an ordinal one greater. Where one list ends and another begins, a
single blank line MUST separate them. At a restart (S-5), the content of the
previous item's deepest last descendant MUST be written between the two lists,
unindented, and not inside the first list; P-7 then decides whether the first list
is loose from the content it still contains.

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

P-4's indentation is the width of the marker rather than a fixed two columns
because under an ordered item two columns are not merely different, they are
wrong: a list indented two spaces under `1.` is not nested in it — CommonMark
reads it as a new list after the first — and four columns are needed under `10.`.
Naming the number **content column** is what lets the other rules that need it
cite it instead of restating it: P-1 writes a multi-line label's later lines
there, and E-10 removes no more than it from a block's later lines. The exception
below is about the indentation written, not about the number — the content column
is still the marker's width plus one, which is what E-10 reads.

P-4's exception is CommonMark's constraint and not a preference. An item whose
first line is a bare marker followed by a blank line has its content measured from
column 0, so at four columns that content is an indented code block whatever the
marker was — and `11.` reaches four. Three is the largest indentation that is not
code, and it still places the content inside the item. A labelled item never
reaches the exception: its content is measured from the marker, where the content
column is exactly right.

P-1's second sentence is needed with E-10's first case, not instead of it.
Removing a label's indentation at lift and writing nothing back would put a
continuation line at column 1 inside a list, where CommonMark reads it as a lazy
continuation of whatever list encloses the item — a different tree again. P-1 says
nothing about a `section`, deliberately: an ATX heading is one line, so no column
exists to write a second one at, and S-8 is why no well-formed tree asks for one.

P-7's last two sentences are each there because no other spelling of one tree
lifts back. **Directly below a label, a bare `-` is a setext heading underline**,
and CommonMark lets no empty list item of any other marker interrupt a paragraph
— so a blank line is the only way to write an item whose first child has an empty
label. A document that puts a date line under an item, `- Meeting` then
`␣␣- 2026. 1. 15. 10:00`, lifts to exactly that shape. The other sentence runs the
opposite way: under an **empty** label a blank line before the content is what
breaks the tree, because P-7's blank line plus the blank line before the nested
list leaves two in a row once a definition is read out again, and two blank lines
end a list item — the children would come back as siblings.

The two do not collide. The first is about the label of the first *child*, and
only applies when the node has no content of its own; the second is about the
label of the node being written, and only when it has some.

P-12's blank line between two lists is necessary rather than stylistic: without
it, an ordered item whose number is not 1 reads as a lazy continuation of the item
above. And the restart rule is what makes a numbering restart survive — indented,
the interrupting paragraph would sit inside the first list, the second list would
merge into it, and 1, 2 would come back as 3, 4.

P-7's blank line is a requirement on **projection**, not on lift. A document that
runs a heading straight into what follows it is conforming and lifts to the same
tree as the canonical spelling — it simply is not that spelling, and comes back
as one:

````example
# A
## B
.
{"content":[],"children":[
  {"kind":"section","label":"A","content":[],"children":[
    {"kind":"section","label":"B","content":[],"children":[]}]}]}
````

*(Informative)* That shape is the most common in Markdown written by hand, so it
is stated as its own example rather than left implicit. Every other example in
this chapter deviates from canonical form **only in the way it is demonstrating**
— a setext heading, an indented code block, a tilde fence, a hard break spelled
with spaces, a skipped level, a list numbered 1, 1, 1, a label wrapped over two
lines, a block whose indentation does not match its node's content column — which
is what makes the ones that do not deviate usable as projection tests.

An item carrying block content makes the list loose (P-7), and that content
stays a block of its own rather than joining the label:

````example
- Setup

  Run the installer.

- Verify
.
{"content":[],"children":[
  {"kind":"item","label":"Setup",
   "content":[{"block":"paragraph","source":"Run the installer."}],
   "children":[]},
  {"kind":"item","label":"Verify","content":[],"children":[]}]}
````

A blank line goes between a label and an empty first child, and nowhere else
(P-7). This is canonical, and the only spelling of this tree that lifts back to
it:

````example
- a

  -
.
{"content":[],"children":[
  {"kind":"item","label":"a","content":[],"children":[
    {"kind":"item","label":"","content":[],"children":[]}]}]}
````

An item that begins with a blank line has its content measured from column 0, so
P-4 writes three columns where four would be an indented code block:

````example
10. a

11.

␣␣␣> q
.
{"content":[],"children":[
  {"kind":"item","label":"a","ordinal":10,"delimiter":".",
   "content":[],"children":[]},
  {"kind":"item","label":"","ordinal":11,"delimiter":".",
   "content":[{"block":"block_quote","source":"> q"}],
   "children":[]}]}
````

A label of its own puts the content back at the content column, because the item
does not begin with a blank line:

````example
10. a

␣␣␣␣> q
.
{"content":[],"children":[
  {"kind":"item","label":"a","ordinal":10,"delimiter":".",
   "content":[{"block":"block_quote","source":"> q"}],
   "children":[]}]}
````

A nested list is indented to the content column of the item it sits under, which
is the width of that item's marker plus one (P-4):

````example
# Steps

9. Prepare
   - Back up
10. Deploy
    - Swap
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"Prepare","ordinal":9,"delimiter":".",
     "content":[],"children":[
       {"kind":"item","label":"Back up","content":[],"children":[]}]},
    {"kind":"item","label":"Deploy","ordinal":10,"delimiter":".",
     "content":[],"children":[
       {"kind":"item","label":"Swap","content":[],"children":[]}]}]}]}
````

A paragraph between two items interrupts the list in CommonMark, and the numbering
continues across it. The paragraph is content of the item before it (L-3), and
canonical form writes it inside that item, as one list:

````example
1. Overview

Overview text.

2. Detail
.
{"content":[],"children":[
  {"kind":"item","label":"Overview","ordinal":1,"delimiter":".",
   "content":[{"block":"paragraph","source":"Overview text."}],
   "children":[]},
  {"kind":"item","label":"Detail","ordinal":2,"delimiter":".",
   "content":[],"children":[]}]}
````

When the numbering restarts, canonical form keeps the interrupting paragraph
between the two lists, unindented, so that the restart survives (P-12):

````example
# Rollout

1. Build
2. Verify

Then, on each server:

1. Stop
2. Swap
.
{"content":[],"children":[
  {"kind":"section","label":"Rollout","content":[],"children":[
    {"kind":"item","label":"Build","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Verify","ordinal":2,"delimiter":".",
     "content":[{"block":"paragraph","source":"Then, on each server:"}],
     "children":[]},
    {"kind":"item","label":"Stop","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Swap","ordinal":2,"delimiter":".",
     "content":[],"children":[]}]}]}
````

P-10 states what L-3 already implies, because the failure it prevents is silent.
L-3 attaches a block to the *nearest node preceding it in document order*, so
content written after a child would lift back attached to that child instead —
a different tree, from output that is a perfectly ordinary Markdown document.
Both orderings satisfy every other rule in this section, which is why the
requirement has to be stated rather than derived.

A node with both content and children projects in that order, and lifts back
unchanged:

````example
# Install

Node.js 20 or later.

## Requirements

- git
.
{"content":[],"children":[
  {"kind":"section","label":"Install",
   "content":[{"block":"paragraph","source":"Node.js 20 or later."}],
   "children":[
     {"kind":"section","label":"Requirements","content":[],"children":[
       {"kind":"item","label":"git","content":[],"children":[]}]}]}]}
````

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
`kind`, `label`, `content`, and `children` — except an item that has an ordinal,
which has exactly six: `kind`, `label`, `ordinal`, `delimiter`, `content`, and
`children`. All members MUST be present, including when `content` or `children`
is empty.

**E-3.** `kind` MUST be the string `section` or the string `item`.

**E-4.** `label` MUST be the node's **inline** content exactly as it appears in
the source, with leading and trailing whitespace removed, and with its later lines
as E-10 says. Inline markup MUST NOT be interpreted: the heading
`## **Fast** start` has the label `**Fast** start`. A **soft line break** inside
`label` — a line break that L-9 does not record as a hard break — MUST be recorded
as a single space.

**E-5.** `content` MUST be an array, in document order, of objects with exactly
two members: `block`, the CommonMark block type name — or a block type name this
specification defines for a construct CommonMark does not read as a single block,
of which there are exactly two, `front_matter` (L-10) and
`link_reference_definition` (L-13) — and `source`, that block's Markdown source,
internal line breaks included, with no trailing line feed, and with its later
lines as E-10 says. L-9, L-10, and L-11 further normalise particular blocks.

*(Informative)* That wording is narrower than it may look, and §2.2 already
contains a case that resembles it and is not the same. A table has no CommonMark
block type either — but CommonMark reads a table as **one** block, a paragraph,
so the encoding uses that name and P-9 writes the source back intact. Front
matter is different: CommonMark reads it as **two** blocks, a thematic break and
a setext heading, and neither of them is the thing. Naming it is not filling a
gap in CommonMark's vocabulary; it is recording that this specification reads
those lines as one unit where CommonMark reads two.

A link reference definition is the third kind of case, and the sharpest: it is a
construct CommonMark reads as **no** block at all. The parser consumes it and
reports nothing, which is why projection used to drop it without any rule saying
to. Naming it is what gives P-9 something to write back.

**E-6.** `children` MUST be an array of node objects, in document order.

**E-7.** Two encoded trees are equal if and only if: objects have the same set of
member names and each corresponding value is equal; arrays have the same length
and are equal element-wise in order; strings are identical sequences of Unicode
code points. **No Unicode normalisation is applied**, in either direction, at any
point.

**E-8.** Members SHOULD appear in the order `kind`, `label`, `ordinal`,
`delimiter`, `content`, `children`. Member order is not significant to E-7, and an
implementation MUST NOT depend on it.

**E-9.** `ordinal` MUST be a JSON number that is a non-negative integer, and
`delimiter` MUST be the string `.` or the string `)`.

**E-10.** A **recorded string** — a `label` (E-4) or a block's `source` (E-5) —
is a run of lines, and no line of it keeps more leading whitespace than its first
line gave up. The first line begins at the column where the recorded text begins,
and keeps none. From each later line, *n* columns of leading whitespace are
removed, a tab advancing to the next multiple of four as CommonMark counts it,
where *n* is

- for a `label`, the columns the first line gave up;
- for a block's `source`, the lesser of those columns and the content column (P-4)
  of the node the block is attached to (L-3).

No line of a recorded string may end in whitespace, except a content line of a
code block. L-11 records a code block's content as CommonMark defines it, and this
rule's arithmetic does not reach it.

*(Informative)* E-10 is one piece of arithmetic with two cases, rather than one
sentence in E-4 and another in E-5. The two were written separately and they do
not give the same number; stating them together is what keeps that difference
deliberate and in one place, instead of discovered later in two.

**Why the two cases differ.** Two numbers meet on a recorded string's later
lines: the indentation its first line gave to whatever contains it, and the
indentation canonical projection will write back in front of it. They agree
whenever the text begins at the content column of the node it belongs to, which is
almost always. For a `label` they *always* agree — a label is the inline content
of the node's own first block, so it begins inside the node that holds it, and P-1
writes its later lines back where its first line began. One number, so there is
nothing to take a minimum of.

A block's `source` is different because L-3 can attach a block to a node the block
was **not written inside**, and then the two numbers come apart in both
directions. A block at the top level attached to the root gave up columns that
P-4 will not replace — remove them and a line can come back nearer the left margin
than it began, where a list marker or a setext underline means something it did
not mean before. A block written at column 0 and attached by L-3 to a list item
gave up no columns at all, and P-4 will add the item's — remove the item's and the
line comes back *further* from the content column than it should.

The lesser of the two is the number that is safe in both directions, and it is the
only one that is: removing more than the first line gave up takes whitespace that
was never the container's to take, and removing more than P-4 restores loses
whitespace the author wrote. Both documents are in §2.2.

**Why no line may end in whitespace.** P-8 forbids a line ending in whitespace
outside a code block, and P-9 writes a recorded source back as it stands, so a
recorded string whose line ends in whitespace would have no canonical projection
at all — the P-rules would be unsatisfiable for that tree, and one stray space at
the end of a paragraph is enough. This is the collision L-9 resolved for hard
breaks and L-10 for front matter, resolved for everything else. L-9 has already
taken the one spelling of trailing whitespace that a reader can see and recorded
it as a backslash before this rule is reached.

The honest cost: an HTML block's trailing whitespace goes too, and inside a
`<pre>` it was significant to a browser. Exempting `html_block` would leave that
block's tree with no canonical projection, which is the defect being fixed; a
document that needs those spaces can carry a code block, which keeps them.

*(Informative)* E-4's fold of a soft line break rests on the same test L-9
applied. Checked against CommonMark's own reference renderer, a heading written
`Head` / `more` / `===` renders as `<h1>Head` ⏎ `more</h1>` — one line of text
with a space in it, because that is what HTML does to a newline in flow content —
while the two spellings of a hard break render a `<br />`. So folding the soft
break changes nothing a reader or a renderer can detect, and folding the others
would. L-9 normalised the spelling that is invisible and kept the one that is not;
L-10 applied the same test to front matter's trailing whitespace; this is that
test applied to the one remaining line break this specification had not looked at.

The fold is applied to what is left after the marker and any setext underline are
removed. Applied earlier it would eat the line break before the underline, and the
underline would join the label. Which breaks are hard is L-9's question: a run of
backslashes before a break is a hard break when the run is odd, and an even run is
an escaped backslash followed by a soft break.

*(Informative)* E-2 forbids omitting an empty `content` or `children` because
allowing it would mean two different JSON texts encode the same tree — an
ambiguity in the one notation whose entire purpose is to remove ambiguity. The
verbosity is the cheaper of the two costs, and it is paid by a generated file
rather than by an author.

E-4 and E-5 carry source through as written — normalised only where L-9, L-10,
L-11 and E-10 say so — so that the encoding is lossless without the suite having
to model Markdown's inline or block semantics. A label reduced to plain text would
drop emphasis and links, which would make round-trip untestable at exactly the
point where it matters.

Links are the case where this is asked most often, so it is worth stating
outright: a node written `- [How to install](https://example.com/)` has that
whole string as its label, brackets and URL included. The tree does not split it
into a caption and an address. An application is free to display the caption and
hang the address off an icon, but splitting it in the *tree* would mean teaching
the encoding what a link is, and then what a reference link is, an autolink, an
image, a link with a title attribute — CommonMark's inline grammar, arriving one
construct at a time through a door §1.1.2 closed on purpose.

Inline markup is carried through untouched (E-4):

````example
# Guide

## **Fast** start
.
{"content":[],"children":[
  {"kind":"section","label":"Guide","content":[],"children":[
    {"kind":"section","label":"**Fast** start","content":[],"children":[]}]}]}
````

A heading written over two lines is one line of text: the break between them is a
soft break, which every renderer shows as a space, so the label holds a space
(E-4). Canonical form writes it as one ATX heading, so this document is
conforming and not canonical:

````example
Head
more
===
.
{"content":[],"children":[
  {"kind":"section","label":"Head more","content":[],"children":[]}]}
````

The same inside a list item, where E-10 takes the item's indentation off the
second line first and the break then folds:

````example
- x
  - a
    b
.
{"content":[],"children":[
  {"kind":"item","label":"x","content":[],"children":[
    {"kind":"item","label":"a b","content":[],"children":[]}]}]}
````

A line indented further than the first keeps what is left over, as a content
block does, and the fold leaves that leftover where it is. Here the first line
gives up two columns and the second has four, written with a tab, so one space
from the fold and two columns left over make three:

````example
- a
→b
.
{"content":[],"children":[
  {"kind":"item","label":"a   b","content":[],"children":[]}]}
````

Neither of those two is canonical — one line each is what their labels now are,
so canonical form writes `- x` / `␣␣- a b` and `- a   b`. Each settles on the
first round trip, as with L-9 and L-10.

A **hard** break is not folded, because it is not invisible. It survives as the
backslash form L-9 records, and P-1 writes the line after it at the item's content
column like any other:

````example
- a\
  b
.
{"content":[],"children":[
  {"kind":"item","label":"a\\\nb","content":[],"children":[]}]}
````

````example
- x
  - a\
    b
.
{"content":[],"children":[
  {"kind":"item","label":"x","content":[],"children":[
    {"kind":"item","label":"a\\\nb","content":[],"children":[]}]}]}
````

and no Unicode normalisation is applied, in either direction (E-7). The label
below is `caf`, then `e`, then a combining acute accent — three code points, not
the two that the precomposed spelling would give, though the two render alike:

````example
# café
.
{"content":[],"children":[
  {"kind":"section","label":"café","content":[],"children":[]}]}
````

*(Informative)* Two characters in an example’s Markdown input stand for
whitespace that cannot be written literally and be relied on to survive an
editor: `→` (U+2192) is a tab, and `␣` (U+2423) is a space. They are a
convention of this document rather than of the suite — `examples/examples.json`
carries the real characters. CommonMark’s own specification uses the first for
the same reason.

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
whitespace, marker characters, heading style, heading level, code-fence style,
the numbers written on an ordered list's later items, and the line breaks inside
a label. **No heading becomes a bullet and no bullet becomes a heading.**

The two additions to that list are worth naming, because each changes characters
a reader can see. An ordered list written 1, 1, 1 comes back 1, 2, 3, which is
what CommonMark already renders it as (L-12). And a label wrapped over two lines
comes back on one, which is what every renderer already shows it as (E-4). In
both cases the normalisation moves the text towards what the document already
meant, rather than away from it.

---

*This document is licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). See
[`LICENSE`](LICENSE) for the licensing of this repository as a whole.*
