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

Only Chapter 1 exists. Where the text below points to a later chapter, it is
naming the place a rule will go, not citing a rule that has been written. Those
references are marked *(not yet written)* on first use in each section. Do not
implement against a forward reference.

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
4. **Node identity** — how a node is distinguished from its label, its content,
   and its position, so that the same node can be recognised after a round-trip
   and across revisions of the document.
5. **Conformance** — what a document and an implementation each have to satisfy,
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
| Content of a sidecar | This specification defines only how an external artifact *refers* to a node — by identity — not what it stores against it |

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
in Chapter 2 *(not yet written)*.

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
an implementation does with such a document is specified in Chapter 2 *(not yet
written)*; until then, treat it as undefined.

#### 1.2.4 Conforming implementations

Conformance levels are cumulative: an implementation at a level MUST satisfy all
lower levels. An implementation that claims conformance MUST state the highest
level it claims, and MUST NOT claim a level it does not satisfy in full.

| Level | Name | Requirement |
|---|---|---|
| **L0** | Read | A conforming document is usable by software that knows nothing about this specification |
| **L1** | Structure | Lifts any conforming document to the prescribed tree, and projects any tree to canonical form |
| **L2** | Identity | Preserves node identity across lift and projection |
| **L3** | Round-trip | Diffs and merges trees, and operates on a subtree without the rest of the document |

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

**L2 — Identity.** An L2 implementation MUST additionally assign, read, and
preserve node identity (§1.3). Lifting a document and projecting the result MUST
preserve the identity of every node present in the input — including where the
document was not canonical, and the projection therefore differs from it byte
for byte. An L2 implementation MUST NOT change a node's identity in response to
a change in that node's label, content, or position alone.

*(Informative)* Identity is what raises the L1 guarantee from *the same shape* to
*the same nodes*. At L1, a reformatted document round-trips to an equal tree. At
L2 it round-trips to a tree whose nodes can still be matched against the ones a
sidecar, a reviewer, or an earlier revision already knew about — which is the
precondition for everything L3 does.

**L3 — Round-trip.** An L3 implementation MUST additionally

- compute a structural difference between two trees, expressed as operations on
  nodes rather than on lines of text, and
- merge two trees that share a common ancestor, reporting conflicts in terms of
  nodes, and
- lift and project a proper subtree without access to the document that contains
  it.

L3 is what makes concurrent editing and partial exchange possible: a tool, or a
model, can be handed one branch of a large document, work on it, and have the
result reinserted without the rest of the document ever being transmitted.

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
in Chapter 2 *(not yet written)*.

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
canonical documents only; at L2 a document round-trip additionally preserves the
identity of every node, canonical or not.

**identity** — A property of a node by which it is recognised as the same node
across round-trips and across revisions of a document, independent of its label,
its content, and its position. Two nodes with identical labels are not thereby
the same node, and a node whose label is rewritten is still the same node.
Identity is what a sidecar, a diff, and a merge all key on; how it is
represented and where it is stored is defined in a later chapter *(not yet
written)*.

**sidecar** — An artifact stored outside a document that associates data with
that document's nodes by identity. Presentation state — position, colour,
collapse, zoom, view kind — belongs in a sidecar. The meaning of a document MUST
NOT depend on any sidecar, and a document MUST lift to the same tree whether or
not a sidecar is present.

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
more than one way, and resolving that is the substance of Chapter 2 *(not yet
written)*.

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
the two are keyed on node identity. Whether this specification defines such a
binding is an open question for a later chapter.

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

*This document is licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). See
[`LICENSE`](LICENSE) for the licensing of this repository as a whole.*
