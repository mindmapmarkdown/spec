# How the pieces fit together

**Translations** — [한국어](ko/overview.md)

What this project is made of, and why it is divided the way it is. Written for
someone who has understood the individual words — [`glossary.md`](glossary.md)
covers those — and now wants to see the shape.

**This document is informative. It defines nothing.** It describes decisions that
are stated normatively in [`spec.md`](../spec.md), and where the two disagree,
`spec.md` wins. This English text is the authoritative version of this file.

---

## Three layers

Almost every question about this project turns out to be a question about which
of three layers something belongs to.

```
     ┌─────────────────────┐                    ┌─────────────────────┐
     │  Markdown document  │ ──── lift ───────▶ │        Tree         │
     │                     │ ◀─── project ───── │      (abstract)     │
     └─────────────────────┘                    └─────────────────────┘
          what you write,                          what the document
          commit, and diff                         actually says
                                                            │
                                          projection        │
                                                            ▼
                              ┌──────────────────────────────────────────┐
                              │  mindmap · outline · table of contents   │
                              │  slide deck · anything else              │
                              └──────────────────────────────────────────┘
                                    views — outside the specification
```

**The document** is a Markdown file. It is what a person writes, what version
control stores, and what survives when every tool involved is gone.

**The tree** is the hierarchy the document *means*: a root, nodes beneath it in
order, each with a label and possibly some attached content. It is an abstract
structure — not a file, not a format, not something with a location on disk. It
has no colours and no coordinates.

**A view** is any way of showing a tree to a person. A mindmap is a view. So is
an indented outline, a table of contents, a slide deck, and whatever gets
invented next.

**The specification defines the top row only.** Views are out of scope, and that
is the load-bearing decision of the whole project.

## Who the Markdown is for

An obvious question about that diagram: if the tree is the thing that matters and
an application owns the file, why is the left box Markdown at all? JSON would be
easier to write and easier to parse.

Because of who reads it. **The party a document travels to is often a language
model**, and a model reads and writes Markdown natively — it is the format models
have seen most. A bespoke JSON schema would have to be explained in every prompt,
and explained again whenever it changed.

Human readers are served differently, and that is what frees the Markdown file
from having to serve them. A finished map goes out as HTML or a published page,
where it needs no application to open and no format to agree on.

Two things follow, and both are easy to miss:

**L0 earns its place for a new reason.** The floor — *a conforming document is
ordinary Markdown* — was argued as courtesy to existing tools. Its sharper value
is that a model which has never encountered this specification can still read a
conforming document, and can produce one by writing ordinary Markdown. Adoption
costs the model nothing because there is nothing to adopt.

**A model does not edit a document; it re-emits one.** Everything comes back
retyped, including the parts nobody asked it to touch. So an application that
exports a map and reads the result back is reading text it did not write, on
every pass. If reading is not pinned down, that application ends up disagreeing
with its own previous self — no second tool required. This is why the rules for
reading have to be exact even for someone who will never interoperate with
anybody.

**How the text reaches you is part of the round-trip.** A model may *render*
Markdown rather than emit it, showing headings as headings and tables as tables
in its own interface. Copy that rendered view and the syntax is gone: `## Install`
arrives as `Install`, a block quote arrives as an ordinary line, a table arrives
as loose words. Lifting the result gives a flatter tree than the one the model
composed — and nothing reports an error, because what arrived is still perfectly
valid Markdown. It just says less.

**L0 is what makes that loss invisible.** The property that a conforming document
renders cleanly anywhere is the same property that lets a rendered copy look
complete. The defence is not in the format, and cannot be: it is in how the text
is carried. Ask for the answer inside a fenced block and take the block, rather
than selecting rendered output.

## Why the boundary is drawn there

Two reasons, and the second is the one that actually decides it.

**Views are unbounded.** Any tree can be drawn as a radial map, a column of
cards, a nested list, an org chart. The list is not closed — the next useful view
has not been invented. A specification that named views would have to name them
all and would be incomplete the moment one more appeared.

**Views cannot be tested without a renderer.** This is the decisive one. A
requirement like "a mindmap MUST lay out its branches so that…" can only be
checked by drawing a mindmap and looking at it. The moment the specification
contains one such requirement, conformance stops being decidable by comparing
data, and the standard becomes a product specification whose lifetime is bound to
that product's.

Keeping views out is what allows every requirement to carry a test. That
principle is stated normatively in
[`spec.md` §1.4.3](../spec.md#143-conformance-must-be-decidable), and the boundary
argument in full is [§1.1.3](../spec.md#113-why-the-boundary-is-drawn-here-informative).

So the project's promise is narrower than "a standard for mindmaps", on purpose.
A tree that survives the trip out and back is something every view can be built
on. A standardised mindmap is something only mindmap software can use.

### A worked case

The boundary sounds clean until a real question lands on it. Here is one that
did.

A document ends with three things in a row under one heading — a code block, a
table, and an image, each standing alone between blank lines. Should each become
its own node?

**markmap says yes.** Render its own sample document and the three blocks appear
as three sibling nodes. Anyone importing a file into a mindmap editor expects the
same, because on screen those three things obviously are three things.

**This specification says no.** They are *content* of the node above them, held
in order. Nodes come from headings and list items, and nothing else.

Both answers are right, because they answer different questions. markmap is
deciding **what to draw**. The specification is deciding **what the document
says**. And an application that wants three bubbles is not blocked by that: a
node's content is an ordered sequence of blocks, so everything needed to draw
them separately is already there. Where they appear on screen is a projection —
which is the layer this specification leaves to whoever is drawing.

The test that settles which side a question falls on:

> Could two implementations answer it differently without either being wrong?
> If the only thing that changes is what a reader sees, it is a view.

Two mindmap tools can lay the same tree out differently and both be correct.
They cannot disagree about whether a document has three nodes or one.

*This case is recorded in full — including why it was tempting — in the
[open RFC](https://github.com/mindmapmarkdown/spec/pull/4), under Alternatives.*

## Both directions are specified

It would be easier to specify only reading — document to tree. That is not
enough.

If only reading were specified, one tree could be written as any number of
different Markdown texts, all correct. Then a structural change and a
reformatting look the same in a diff, which is the problem this project exists to
solve. So the way back is specified too, and it produces exactly one document for
a given tree: **canonical form**.

That is what makes a text difference mean a structural difference. Two documents
in canonical form differ as text only where their trees differ.

Both directions are required to fit together exactly: write a tree out, read it
back, and the same tree must return. This has a consequence that is easy to miss
and impossible to work around — a tool must never quietly "tidy up" a tree on the
way out, because the tidied text reads back as a *different* tree.

## Where presentation goes

A mindmap application has to remember that a node is blue and sits at a
particular place on a canvas. None of that belongs in the document.

It goes in a **sidecar** — a separate file that attaches data to nodes without
being part of them. The rule is *meaning in the document, presentation in the
sidecar*
([`spec.md` §1.4.2](../spec.md#142-meaning-in-the-document-presentation-in-the-sidecar)),
and its test is blunt: delete every sidecar, and no tree may change.

A sidecar has to point at *something*, and so the obvious next question is what
a node is called. The specification's answer is that **it deliberately does not
say**: a name that a second tool could read would have to be written into the
document, and nowhere to write it survives both the promise that a conforming
document is ordinary Markdown and a round trip through a language model. So an
application recognises its own nodes however it likes, and a sidecar it owns is
its own; see [RFC 0016](../rfcs/0016-remove-node-identity.md).

## The repository, in that picture

| Path | What it is | Layer |
|---|---|---|
| [`spec.md`](../spec.md) | The rules. Normative examples are written inline, next to the rule each demonstrates | document ↔ tree |
| `examples/examples.json` | The conformance suite, **generated** from those examples | testing |
| `tools/` | The generator that produces it, and its tests | testing |
| [`rfcs/`](../rfcs/) | Proposals to change the rules, including rejected ones | process |
| [`docs/`](.) | Explanations like this one. Informative, never normative | orientation |

This table describes the arrangement, not the current state of the checkout. The
specification is a draft and parts of it are unwritten;
[`README.md`](../README.md) tracks what is actually present.

The reference application, `easymindmap`, lives outside this organisation. It
draws the bottom row of the diagram — the view — which is exactly what the
specification does not describe.

## The conformance suite, and why it is JSON

This is the part that surprises people, so it is worth being explicit.

**`examples/examples.json` is not a conversion output.** It is not what you get
when you convert a Markdown file. It is a **test paper**: a list of pairs saying
*given this input, this is the answer*.

```
  markdown:  the document to feed in
  tree:      the structure that must come out
```

An implementer writing a tool in Rust or Python downloads that file, runs each
`markdown` value through their reader, and compares the result against `tree`.
Agreement across the whole file is what "conformant" means.
[`reading-examples.md`](reading-examples.md) unpacks one, symbol by symbol, for
a reader who has not worked with JSON before.

**It is generated from `spec.md`, never written by hand.** The examples live in
the specification, beside the rules they demonstrate, and the JSON is extracted
from them. A hand-edited suite would eventually contradict the specification, and
when that happens the machine-readable copy wins by accident — it is the one
people actually run. Generating it makes the contradiction impossible to commit,
and the checks on every pull request enforce that. This mechanism, more than the
prose, is why CommonMark's specification became something implementers could
trust.

### Why the expected answer is JSON and not a mindmap file

Because a tree has no format. To write one down for comparison you need *some*
notation, and JSON is a notation — not a blessed format. It is closer to writing
a tree in brackets on paper than to saving a file.

Using a mindmap file (`.mm`, OPML, JSON Canvas, or any other) would break three
things at once:

**The scope would explode.** If the correct answer to a test were a particular
`.mm` file, then "conformant" would mean "produces this mindmap file", and a
mindmap format would have become normative here. That is precisely the
scope-and-lifetime problem the boundary exists to prevent.

**Presentation would leak in.** Mindmap formats carry positions, colours, and
collapse state — the things the sidecar rule pushes out of the document. A test
paper containing them would be marking answers to questions the specification
never asked.

**There is no non-arbitrary choice of which one.** FreeMind, XMind, OPML, JSON
Canvas and the rest differ in what they can express. Picking one excludes the
users of the others and starts an argument that has to be re-won every year.

So the expected answer is written in the plainest notation that can hold a tree
and nothing else. The encoding is specified — which keys, what they contain, how
two trees are compared — because an unspecified notation would let two
implementations read the same test paper differently, and then conformance could
not be decided at all.

## What this means depending on why you are here

**Reading, to decide whether this solves your problem** — check the boundary
first. If what you need is a view, a layout, or an editing model, it is not here
and will not arrive later; say so now, while the boundary is still cheap to move.

**Implementing** — you are building the top row: a reader that produces the tree
the specification prescribes, and a writer that produces canonical form. Build it
on an existing CommonMark parser; this specification defines no Markdown grammar
of its own. Then run the suite.

**Building an application** — you are building the bottom row. The specification
gives you a tree you can rely on and a file format that other tools can still
read; what you draw with it is yours.

**Bringing a document that breaks it** — the most useful thing anyone can do
right now. A real Markdown file whose structure is genuinely ambiguous is worth
more than any amount of comment on the prose.

---

*Informative throughout. Licensed [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/);
see [`LICENSE`](../LICENSE).*
