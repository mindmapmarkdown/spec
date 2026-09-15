# RFC 0043: A well-formed tree survives its own projection

**Translations** — [한국어](ko/0043-well-formed-round-trip.md). This English text is
the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-09-16 |
| **Comment period ends** | 2026-09-30 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/43> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

§1.2.4 L1 requires that lifting the canonical projection of a tree yield that
same tree. §2.4 is where a tree that cannot is turned away, but §2.4 checks only
shape: S-1, S-2 and S-4. Nothing constrains a label, or a content entry's
`source`. So there are well-formed trees whose projection is a document that
lifts to a **different** tree, or that lift refuses
([#42](https://github.com/mindmapmarkdown/spec/issues/42)).

This RFC adds one rule to §2.4:

> **S-7.** Lifting a tree's canonical projection MUST yield that tree.

S-3 already requires an implementation to reject a tree that is not well-formed,
so such a tree is refused rather than projected. L1's wording narrows from *every
tree* to *every well-formed tree*, which S-3 already implied.

**No document lifts differently, and no example changes.** Lift never produces a
tree S-7 rejects. What changes is which trees built by hand — by an editor, an
importer, a converter — an implementation accepts. A prototype passes the suite
unchanged, and fifteen further tests.

## Motivation

### What goes wrong today

Each tree below was built programmatically, passed the reference
implementation's well-formedness check with nothing reported, and was then
projected and lifted again, at `mindmapmarkdown/mindmapmd@657da17`. Each is one
node, or one content entry, under a section.

| Tree | Projected as | Lifted again |
|---|---|---|
| item labelled `1. Install` | `- 1. Install` | an **empty** item holding an item `Install` |
| item labelled `- x` | `- - x` | an **empty** item holding an item `x` |
| item labelled `# x` | `- # x` | **lift refuses** the document: a heading inside a list item (S-1) |
| section labelled `Title #` | `## Title #` | a section labelled `Title` |
| `paragraph` with source `- x` | `- x` | no content, and a new item `x` |
| `paragraph` with source `# x` | `# x` | no content, and a new **sibling** section `x` |
| `block_quote` with source `not a quote` | `not a quote` | a `paragraph` |

The last three rows show that labels are not the whole of it. E-5 says `source`
is a block's source verbatim, and nothing checks that a recorded source *is* the
block it is recorded as.

### Who builds these trees

Lift never does. Every tree above comes from something that constructs a tree
directly:

- **An editor.** Someone types a node called `1. Install`, and the editor builds
  exactly the first row.
- **An importer that tidies labels.** easymindmap, the reference application,
  removes the backslash when it reads `1\. Install` and does not write it back.
  That is how this was found.
- **A converter from another format.** An OPML `text` attribute or a spreadsheet
  cell reading `1. Install` has no reason to escape anything.

### What happens if nothing is done

The text as it stands supports three behaviours, and each can be defended from
it:

1. **Reject the tree** — although nothing in §2.4 says to.
2. **Project it**, returning a document that denotes a different tree — which L1
   forbids, but which only §2.4 is positioned to stop.
3. **Escape on the way out**, writing `- 1\. Install` — after which lift gives the
   label `1\. Install`, because E-4 keeps inline source as written, and the round
   trip fails in a new place.

Two conforming implementations handed the same tree would disagree about whether
it is accepted and about what it means, and the conformance suite, which is made
of documents, could not say which of them is right.

## Detailed design

### 1. S-7

Added to §2.4 after S-4, with the definition of well-formed amended to match:

> **S-7.** Lifting a tree's canonical projection MUST yield that tree.
>
> A tree satisfying S-1, S-2, S-4, and S-7 is **well-formed**. S-7 is read only
> for a tree that satisfies the other three; a tree that fails one of them is not
> well-formed, whatever its projection would do. Lift cannot produce a tree that
> is not well-formed; a tree constructed programmatically can be.

*Yield that tree* means equal under E-7.

The number follows S-5 and S-6, which RFC 0039
([#39](https://github.com/mindmapmarkdown/spec/pull/39)) proposes, and does not
depend on what is decided there.

The following informative text is added after the existing note on S-4:

> *(Informative)* S-7 states as a property of a tree what §1.2.4 L1 requires of
> the two operations. A tree that fails S-1, S-2, or S-4 fails the round trip as
> well; those rules stay, and are read first, because each names its reason.
>
> It is stated over the round trip rather than as a list of forbidden labels
> because such a list would be a second, partial grammar of CommonMark, and would
> be wrong the first time the two disagreed. S-7 defers to the rules already
> written, so it is exactly as strict as they are.
>
> A tree S-7 rejects is usually one character away from a tree it accepts:
>
> | Rejected | Well-formed instead |
> |---|---|
> | an item labelled `1. Install`, `1) Install`, `- x`, `+ x`, `* x`, or `-` | `1\. Install`, `1\) Install`, `\- x`, `\+ x`, `\* x`, `\-` |
> | an item labelled `# x` | `\# x` |
> | an item labelled `[x]: /url`, which is a link reference definition and produces no block | `\[x]: /url` |
> | an item labelled `---`, since `- ---` is a thematic break | `\---` |
> | a section labelled `Title #`, whose `#` is a closing sequence | `Title \#` |
> | a label with leading or trailing whitespace | the label trimmed (E-4) |
> | a `paragraph` whose source is `- x`, `# x`, `---`, or `<div>` | `\- x`, `\# x`, `\---`, `\<div>` — or the block that source is |
> | a `paragraph` with a line ending in two spaces | the backslash form of the break (L-9) |
> | an entry whose `block` does not name the block its `source` is | the name lift gives |
>
> A tree is well-formed as a whole, not part by part. A `code_block` whose source
> is an unclosed fence is well-formed as the last thing in a document, and is not
> when a node follows it, because the fence swallows the node. An operation that
> inserts a subtree checks the tree it produces.
>
> How a label is displayed or edited is outside this specification (§1.1.2). An
> editor can let someone type `1. Install`, show it that way, and hold
> `1\. Install` in the tree.

### 2. §1.2.4, L1

Three phrases change. In the table of levels:

> | **L1** | Structure | Lifts any conforming document to the prescribed tree, and projects any **well-formed** tree to canonical form |

And in the text of L1:

> An L1 implementation MUST lift every conforming document to the tree this
> specification prescribes for it, and MUST project every **well-formed** tree to
> that tree's canonical form. …
>
> The two operations MUST be mutually inverse, in this exact sense: lifting the
> canonical projection of a **well-formed** tree MUST yield that same tree, and …

This is not a new restriction. S-3 already forbids projecting a tree that is not
well-formed; the current wording promises to project trees S-3 refuses. With S-7
in place, the second sentence holds by definition for every tree an
implementation accepts, instead of being a property each implementation hopes the
trees it accepts have.

### 3. What does not change

- **No lift, projection, or encoding rule.**
- **No document's conformance, and no tree lift produces.** Were a conforming
  implementation's lift to produce a tree S-7 rejects, L1 would already be
  violated; that is a defect in the implementation, not a tree to refuse.
- **No example.** The suite is a list of documents, and every tree it lifts to
  satisfies S-7.

### Round-trip consequence

Strengthened. Today L1 holds for the trees that happen to be expressible.
Afterwards it holds for every tree an implementation accepts, and a tree it
cannot hold for is refused, with a reason.

### Cost, bounds, and decidability

Checking S-7 costs one projection, one lift, and one E-7 comparison — the
operations an implementation already performs — and sets no bound of its own:
untrusted input is bounded wherever lift and projection bound it. Whether a
tree satisfies it is decided mechanically, because both operations are
deterministic (§1.2.4).
Projecting and lifting is the obvious way to check it, not a required one; any
method that gives the same answer conforms.

### How it is tested

The suite cannot express a rejected tree, for the reason it cannot test S-1
through S-4: it is a list of documents. This RFC proposes no normative example.
§1.4.3 asks for one with every normative requirement; S-7 falls short of that in
the way S-1 through S-4 already do, and for the same reason (unresolved question
3).

A prototype is `mindmapmarkdown/mindmapmd` branch `rfc/tree-closure-prototype` at
`6c679ef`. 79 tests pass: the 64 on `main`, unchanged, and 15 in
`test/closure.test.js`:

- **8 trees rejected** with S-7 — the seven rows of the table above, and a
  paragraph whose source is read as a setext heading;
- **4 trees accepted** — an escaped ordered-list marker, emphasis and strong
  emphasis in a label, and a section label beginning with `#`;
- a tree failing S-1 reports S-1, not S-7, and the S-7 message names the node
  where the two trees part;
- every tree the suite lifts to is well-formed.

The informative table is drawn from a further 47 trees, probed and not added as
tests.

**One probe found a defect in the prototype, not in the rule.** CommonMark reads
`## Title \#` as a heading whose text is `Title #` — an escaped `#` is not a
closing sequence — so E-4 gives the label `Title \#`. The reference
implementation's lift strips it to `Title \`, so the prototype, which checks S-7
with that lift, rejects a section labelled `Title \#` that the rule accepts. That
is a lift bug and is being fixed separately. It is also a fair picture of what
S-7 costs: **a check built on an implementation's own lift is exactly as correct
as that lift.**

## Alternatives

### Do nothing

The three behaviours in the Motivation stay conforming, and a tree's acceptance
and meaning depend on the implementation it is handed to. L1 goes on promising a
round trip that §2.4 does not secure.

### List what a label and a source may not be

The approach most people would reach for first, and the informative table above
shows what it looks like. As a normative rule it would have to cover at least:
ordered-list markers with either delimiter and up to nine digits; three bullet
markers, with and without text after them; ATX openers; closing sequences, and
the escaped `#` that is not one; thematic breaks, which `- ---` is; link
reference definitions, which produce no block at all; the seven HTML block start
conditions; setext underlines on a later line of a paragraph; leading and
trailing whitespace; the trailing-space spelling of a hard break; block names
that do not name the block their source is; and each of these again inside a list
item's indentation.

The list would change whenever a lift rule does — RFC 0038 and RFC 0039 would
both amend it — and a gap in it would be a tree the specification calls
well-formed and L1 cannot serve, which is the defect this RFC exists to close. As
informative guidance, a gap costs nothing.

### Escape on projection

Projection writes `- 1\. Install` for the label `1. Install`. Lift then gives
`1\. Install`, because E-4 keeps inline source as written, and the round trip
fails in a new place. To make it work, a label would have to hold decoded text,
with a normative escaping scheme between it and its source — a redesign of E-4,
of the `**Fast** start` example, and of every label that contains markup.

Pandoc takes that route: its tree holds parsed inline elements, and its Markdown
writer escapes. It works because Pandoc's tree is an inline syntax tree. §2.6
chose a label that is source text, so that the suite need not model Markdown's
inline semantics.

### Coerce on the way in

Trim the whitespace, escape the leading marker, and accept the tree. S-3 forbids
the same move for S-1 — coercing a section to an item — for the same reason: the
tree accepted is not the tree the caller gave, and nothing tells the caller.

### Make it a SHOULD, or leave it implementation-defined

Either keeps the three behaviours, and lets the same tree be accepted by one
conforming implementation and refused by another — which §1.2.4 rules out when
it requires the same output from any other conforming implementation.

### Prior art

OPML holds a node's text in an XML attribute, where escaping belongs to XML and
no structure can hide in the text, so the question does not arise there — and
converters from OPML are among the producers of plain-text labels described
above. markmap reads Markdown and does not write it. Neither settles this.

## Unresolved questions

None blocks acceptance.

1. **An item whose first block is not a paragraph** — `- ***`, `- > quote`,
   `- <div>`. E-4 says a label is inline content, which such an item does not
   have, and L-3 would make the block content. The reference implementation
   takes the block's source as the label instead. S-7 does not choose between
   these: it accepts whatever lift and projection agree on. The question is older
   than this RFC and separate from it.
2. **Multi-line item labels carry indentation.** An item `- a` whose paragraph
   continues on an indented line `  b` lifts to a label holding the line break and
   the two spaces. S-7 accepts that tree, because lift and projection agree.
   Whether a label should keep list-item indentation is the question RFC 0038
   answers for content, not for labels.
3. **A way for the suite to state a rejected tree.** Until there is one, S-1
   through S-4 and S-7 are tested only in implementations.
4. **If RFC 0039 is accepted**, the definition reads S-1, S-2, S-4, S-5, S-6, and
   S-7. A tree failing S-5 fails S-7 as well; S-5 stays, because it names the
   reason.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
