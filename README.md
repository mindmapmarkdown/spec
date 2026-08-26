# Mindmap Markdown — specification

![Status: Draft](https://img.shields.io/badge/status-draft-orange)
![Specification: CC-BY-4.0](https://img.shields.io/badge/spec-CC--BY--4.0-blue)
![Code: Apache-2.0](https://img.shields.io/badge/code-Apache--2.0-blue)

A round-trip-stable Markdown profile for hierarchical knowledge: rules that let a
Markdown document and a tree determine each other, in both directions, without
loss.

This repository holds the specification itself. If you have arrived looking for
what the project is and why it exists, start at
[the organisation page](https://github.com/mindmapmarkdown). If you are here to
read the specification, implement it, or argue with it, this page is the map.

> **⚠ Draft. Nothing conforms to this yet.**
>
> [`spec.md`](spec.md) contains **Chapters 1 and 2** — scope, conformance and
> terminology, then the rules that decide which tree a document denotes and
> which document a tree denotes. That is enough to build a reader and a writer
> against. **Diff, merge, and subtree exchange are not written**, and there is
> no version number and no release. Requirements will change.
>
> The useful thing to do with a draft this early is disagree with it. See
> [participating](#participating).

## What is specified

The specification defines the correspondence between **a Markdown document and a
tree** — nothing beyond it:

- **Lift** — the rules by which a document determines exactly one tree.
- **Canonical projection** — the rules by which a tree determines exactly one
  Markdown document.
- **Round-trip conditions** — when composing the two preserves information, and
  what "information" covers.
- **Conformance** — what a document and an implementation each have to satisfy.

## What is not specified

Rendering, layout, editing, and **the kinds of view a tree can be shown as** —
mindmap, outline, graph, slide, table of contents. A view is a projection of a
tree, and a new one may be invented at any time without changing what a document
means. HTML is a container that carries a view, not a format the specification
maps to.

That boundary is the load-bearing decision of the whole project, and it is
argued rather than asserted: see [`spec.md` §1.1](spec.md#11-scope). The short
version is that a requirement about how a mindmap draws its branches can only be
tested by drawing one, which would make conformance undecidable and turn a
standard into a product specification.

So: **`md ↔ tree`**, not `md ↔ mindmap`. Everything else follows from that.

## Conformance levels

A summary. The definitions that decide conformance are in
[`spec.md` §1.2.4](spec.md#124-conforming-implementations) — where these
disagree, that section wins.

| | Name | What it means | Who satisfies it |
|---|---|---|---|
| **L0** | Read | A conforming document is ordinary Markdown. Its hierarchy survives in tools that have never heard of this specification | Every existing Markdown tool, unmodified. Zero effort, and that is a requirement rather than a happy accident |
| **L1** | Structure | *The same shape.* Lifts any conforming document to the prescribed tree and projects any tree back to canonical form; the two are mutually inverse | An implementation that wants structural stability |
| **L2** | Round-trip | Structural diff and merge between trees, and operating on a subtree without the rest of the document | Collaborative editing; handing one branch of a large document to a tool or a model and getting it back |

Levels are cumulative, and an implementation states the highest level it claims.

Conformance is defined separately for **documents** and for **implementations**
([`spec.md` §1.2.3](spec.md#123-conforming-documents)); they are different kinds
of claim and are not interchangeable.

## Repository layout

| Path | Contents | |
|---|---|---|
| [`spec.md`](spec.md) | The specification, with its normative examples written inline | Chapters 1–2 |
| [`examples/examples.json`](examples/examples.json) | Conformance test cases, **generated** from the examples in `spec.md` and never hand-edited | 6 examples |
| [`rfcs/`](rfcs/) | Proposals for normative change, including rejected ones | |
| [`docs/`](docs/) | Informative material — an [overview](docs/overview.md) of how the pieces fit together, a [glossary](docs/glossary.md), and a guide to [reading a worked example](docs/reading-examples.md) | |
| [`tools/`](tools/) | The generator that extracts `examples.json`, the link checker, and their tests | |

The generated-not-written rule for `examples.json` is the point of the
arrangement: the specification and its test suite are the same source, so they
cannot drift apart. The checks on every pull request regenerate the file and fail
if it differs, which turns that from an intention into an invariant. It is the
mechanism, more than the prose, that made CommonMark usable.

## For implementers

**L0 and L1 can now be implemented.** Chapter 2 says which tree a document
denotes and which document a tree denotes, so a reader and a writer can be built
and checked. L2 cannot: diff, merge, and subtree exchange all have to decide
which node in one tree corresponds to which in another, and the rules for making
that decision are not written. There is no node identity to key it on, and
[RFC 0016](rfcs/0016-remove-node-identity.md) records why the specification does
not define one.

Where to start:

- **[`spec.md` §2](spec.md#2-canonical-hierarchy)** — the rules, with their
  normative examples beside them. §1.3 is the vocabulary they use; if the
  standards terms around it are unfamiliar,
  [`docs/glossary.md`](docs/glossary.md) explains them in plain language, and
  [`docs/reading-examples.md`](docs/reading-examples.md) unpacks an example for
  a reader new to JSON.
- **[`examples/examples.json`](examples/examples.json)** — the suite. Run each
  `markdown` value through your reader and compare against `tree`. It covers
  lift; projection is checked the other way round, a tree in and a document out,
  compared byte for byte.
- **Check the boundary against your use case.** If what you need is in
  [§1.1.2](spec.md#112-what-this-specification-does-not-define), the answer will
  not arrive later — say so now, while the boundary is still cheap to move.
- **Bring a document that breaks it.** A Markdown file whose structure is
  genuinely ambiguous is worth more than any amount of comment on the prose.
  Every defect found in Chapter 2 during its comment period came from running a
  real document through it.

An implementation is expected to be a layer over an existing CommonMark parser.
This specification defines no Markdown grammar and modifies none of CommonMark's
parsing rules.

The reference implementation, adapters, and conformance suite are planned as
separate repositories in this organisation. None of them exist yet; when they
do, they will be linked here.

## Participating

| You want to | Start with |
|---|---|
| Ask whether something is intended | An issue |
| Report a defect in the specification text | An issue |
| Propose a change to what conforms | An RFC — [`rfcs/0000-template.md`](rfcs/0000-template.md) |
| Fix a typo or a broken link | A pull request |
| Report a security or safety problem | [`SECURITY.md`](SECURITY.md) — not a public issue |

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first; it covers branching, the DCO
sign-off that every commit needs, and what a reviewable pull request contains.
How decisions are made — change classes, comment periods, RFCs, and what happens
if the maintainer disappears — is in [`GOVERNANCE.md`](GOVERNANCE.md) and is not
repeated elsewhere.

This project is maintained by one person and says so, in the document where it
matters. Every decision, including the rejected ones, is recorded in this
repository.

## Licensing

Dual-licensed, as is normal for an open specification. See [`LICENSE`](LICENSE).

| | |
|---|---|
| Specification text and prose — `spec.md`, `rfcs/**`, `docs/**`, this file | **CC-BY-4.0** |
| Code, tooling, and test data — `tools/**`, `examples/**`, workflows | **Apache-2.0** |

Translations and derivative specifications are explicitly welcome. Apache-2.0
carries the patent grant that implementers need; the licences permit anyone to
fork and continue this work without asking, which is deliberate and is part of
the succession story in [`GOVERNANCE.md`](GOVERNANCE.md).

## Related documents

- [`spec.md`](spec.md) — the specification
- [`docs/overview.md`](docs/overview.md) — how documents, trees, and views are layered, and why the boundary is where it is
- [`docs/glossary.md`](docs/glossary.md) — the vocabulary, in plain language, for a first-time reader
- [`docs/reading-examples.md`](docs/reading-examples.md) — how to read a worked example and the JSON tree it expects, from no prior JSON
- [`GOVERNANCE.md`](GOVERNANCE.md) — roles, change classes, RFC process, phase transitions, succession
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to work on the specification
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) — participation
- [`SECURITY.md`](SECURITY.md) — reporting security and safety problems
- [`LICENSE`](LICENSE) — what is licensed under which terms

Specification and general questions — `spec@mindmapmarkdown.org`.
Security and conduct — `security@mindmapmarkdown.org`.
