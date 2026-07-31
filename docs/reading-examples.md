# Reading a worked example

**Translations** — [한국어](ko/reading-examples.md)

The specification's examples state an input document and the tree it must
produce, and the tree is written as JSON. This explains how to read one, for
someone who has not worked with JSON before.

**This document is informative. It defines nothing.**

> **Part of what is described here is proposed, not decided.** Node *kind* and
> the JSON encoding of a tree come from
> [an RFC that is open for comment](https://github.com/mindmapmarkdown/spec/pull/4)
> and may change or be rejected. The JSON syntax itself, and the shape of an
> example block, are not in question.

**Contents** — [JSON in five symbols](#json-in-five-symbols) ·
[The shape of an example](#the-shape-of-an-example) ·
[Example 1, unpacked](#example-1-unpacked) ·
[Example 2, and the one difference](#example-2-and-the-one-difference) ·
[What kind means](#what-kind-means) ·
[Why empty arrays are written out](#why-empty-arrays-are-written-out)

---

## JSON in five symbols

JSON is a way of writing structured data as text, so that programs can exchange
it. The whole syntax you need here is five symbols.

| | | |
|---|---|---|
| `{ }` | **object** | a bundle of values, each with a name |
| `[ ]` | **array** | an ordered list of values |
| `" "` | **string** | a text value |
| `:` | | joins a name to its value |
| `,` | | separates one entry from the next |

An **object** labels what it holds:

```json
{ "name": "Ada", "born": 1815 }
```

The order of the entries does not matter, because each one has a name.

An **array** only has order:

```json
[ "apples", "pears", "plums" ]
```

Nothing is named. First is apples, second is pears. Reorder it and it means
something else.

**The two nest inside each other, and that nesting is what makes a hierarchy:**

```json
{
  "name": "Ada",
  "children": [
    { "name": "Byron" },
    { "name": "Anne" }
  ]
}
```

One person, whose `children` entry holds a *list*, each element of which is
another person. That is all a tree is in JSON, and the specification's examples
are exactly this shape.

One more thing to recognise:

```json
"children": []
```

An empty array. The entry exists and holds nothing.

## The shape of an example

An example is a fenced block whose info string is `example`:

````markdown
```example
# Project
## Install
.
{"children":[ … ]}
```
````

The line containing only `.` separates the two halves. **Above it is the
Markdown that goes in. Below it is the tree that must come out.**

An implementer runs the top half through their reader and compares the result
against the bottom half. Agreement across every example is what conformance
means. The examples are extracted mechanically into `examples/examples.json` by
`tools/extract-examples.mjs`; that file is generated and never hand-edited.

The examples in the specification are written compactly to save space. Every
JSON document below is shown spread out instead. **The content is identical** —
whitespace between JSON tokens carries no meaning.

## Example 1, unpacked

Input:

```markdown
# Project
## Install
```

Expected tree:

```json
{
  "children": [
    {
      "kind": "section",
      "label": "Project",
      "content": [],
      "children": [
        {
          "kind": "section",
          "label": "Install",
          "content": [],
          "children": []
        }
      ]
    }
  ]
}
```

**The outermost object is the root.** It has one entry, `children`, and no name
of its own — no `label`, no `kind`. That is because the root has no text in the
document. `# Project` is not the root; it is the root's first child. The root is
an invisible container holding everything.

**Each node inside has exactly four entries:**

| | |
|---|---|
| `kind` | whether it was written as a heading or as a list item |
| `label` | the node's visible text |
| `content` | block material attached to it — paragraphs, tables, code |
| `children` | the nodes beneath it |

So `Project` is a node written as a heading, labelled `Project`, with nothing
attached to it, holding one child. `Install` is the same, and its empty
`children` says the branch ends there.

```
Markdown                  Tree
────────────────────────────────────────────
                      (root)      no text of its own
# Project        →      └─ Project       kind: section
## Install       →          └─ Install     kind: section
```

## Example 2, and the one difference

Input:

```markdown
- Project
  - Install
```

Expected tree:

```json
{
  "children": [
    {
      "kind": "item",
      "label": "Project",
      "content": [],
      "children": [
        {
          "kind": "item",
          "label": "Install",
          "content": [],
          "children": []
        }
      ]
    }
  ]
}
```

Compare it with example 1: same labels, same nesting, same everything —
**except that `kind` reads `item` instead of `section`.**

And the specification calls those two **different trees**. That single word is
the whole of the proposal in the open RFC.

## What kind means

| value | written in Markdown as | what it asserts |
|---|---|---|
| `section` | a heading — `#`, `##`, `###` … | *a division of the document begins here* |
| `item` | a list item — `-` | *this is one entry in a series* |

The reason the distinction is kept in the tree rather than normalised away is
that a reader does not experience the two as the same. `## Install` announces a
section; `- Install` is one of several things listed. Preserving that is
preserving what the document says — not how it is displayed. Colour, position,
and collapse state really are display, and those belong in a sidecar
([`overview.md`](overview.md) explains that split).

What it buys, concretely — a document that goes out to a tool and comes back:

```markdown
# Install                        # Install
                        →
## Requirements                  ## Requirements
```

Without kind in the tree, the same round-trip is entitled to return:

```markdown
- Install
  - Requirements
```

The hierarchy survived. The document did not. Keeping kind is what makes the
first outcome a requirement rather than a hope.

## Why empty arrays are written out

This is the part that looks like clutter:

```json
"content": [],
"children": []
```

Why not leave out what is empty? Because then the same tree could be written two
ways:

```json
{"kind":"item","label":"npm","content":[],"children":[]}
{"kind":"item","label":"npm"}
```

Two different texts, one meaning. A test suite exists to answer *are these two
trees the same*, and an encoding that offers a choice of spelling makes that
question harder to answer — inside the one notation whose entire purpose is to
remove ambiguity.

So every entry is always present. The verbosity is real, and it is paid by a
generated file rather than by anybody writing one.

## Where the binding rules live

Nothing above is a rule. The rules are:

- **The example block format** — `tools/extract-examples.mjs`, and
  [`CONTRIBUTING.md` §6](../CONTRIBUTING.md#6-working-on-the-specification-text).
- **The tree encoding, and `kind`** — §2.1 and §2.6 of
  [the open RFC](https://github.com/mindmapmarkdown/spec/pull/4). Until it is
  accepted, these are a proposal.
- **Conformance** — [`spec.md` §1.2](../spec.md#12-conformance).

If an example ever contradicts this document, the example is right.

---

*Informative throughout. Licensed [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/);
see [`LICENSE`](../LICENSE).*
