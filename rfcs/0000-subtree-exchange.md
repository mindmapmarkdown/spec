# RFC 0000: Subtree exchange

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | `정제영 <ok@baro.pro>` |
| **Created** | 2026-11-17 |
| **Comment period ends** | 2026-12-01 |
| **Discussion** | `<this pull request>` |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

Define the **subtree at a node** — the tree whose root's only child is that node
— and state the four requirements that make §1.2.4 L2's third bullet, *"lift and
project a proper subtree without access to the document that contains it"*,
decidable. The rules are new; the mechanism is not. Projecting a subtree is the
Chapter 2 projection rules applied to a re-rooted tree, and lifting a fragment
is Chapter 2 lift. This RFC adds **Chapter 3** to hold them, with rule labels
`X-1` to `X-4`, and settles one well-formedness interaction that re-rooting
exposes.

It does **not** define node correspondence, diff, or merge. Those are the other
two bullets of L2 and they need an RFC each.

## Motivation

§1.2.4 states L2 as three requirements. All three have been unimplementable
since the level was written, and the specification says so in its own header:
*"The operations of §1.2.4 L2 — diff, merge, and subtree exchange — are not
written."* `mindmapmd`, the reference implementation, claims L1 and records L2
as *"not implemented. Diff, merge, and subtree exchange need node matching, and
the rules for it are not written."*

**That diagnosis is wrong for the third bullet, and this RFC is the
consequence.** §1.2.4's informative note says *"Each of the three requires
deciding which node in one tree corresponds to which in another."* Lifting and
projecting a proper subtree requires no such decision. It involves one tree, not
two. What it requires is a statement of what the subtree *is*, and a guarantee
that it is a tree like any other — which is why it is the one piece of L2 that
can be specified now, tested by the existing conformance suite, and shipped
without inventing anything.

**The reference implementation already does it.** Measured on `mindmapmd` at
`85b4c09`, with no change to its source: given the tree of

```
# Project

## Install

- step one
- step two
```

projecting the tree whose root's only child is the `Install` node returns

```
# Install

- step one
- step two
```

Nothing about that is new code. `P-2` writes a section's heading level from its
depth, and in the re-rooted tree the depth is 1, so the level is 1. The
behaviour falls out of Chapter 2. What is missing is any sentence in the
specification that *requires* it, which means an implementation that carried the
original depth instead — writing `## Install` — would be equally conformant
today. Two implementations handed the same subtree may hand back different
documents, and nothing in the specification decides between them. That is the
defect.

**If nothing is done**, L2 stays unclaimable in full, and the one third of it
that needs no new machinery stays blocked behind the two thirds that do.

## Detailed design

### A term, in §1.3

> **subtree at a node** — For a node *n* of a tree, other than the root, the
> tree whose root has empty `content` and whose root's `children` is the
> one-element sequence containing *n*, with *n*'s own `kind`, `label`,
> `ordinal`, `delimiter`, `content` and `children` unchanged. *n* is said to be
> **re-rooted**.

The definition is deliberately a construction rather than a relation: it says
what the subtree *is*, member for member, so that two implementations handed the
same *n* build the same tree.

### Chapter 3, §3.1 — the rules

**X-1.** For every node *n* other than the root of a well-formed tree, an L2
implementation MUST be able to produce the canonical projection of the subtree
at *n*, and to lift that projection. Both MUST use only the rules of Chapter 2,
and MUST NOT require access to the tree or the document that contains *n*.

**X-2.** In the subtree at *n*, *n* is a child of the root. Its depth is
therefore 1 (L-5, L-7), and the depth of each of its descendants is counted from
it. An implementation MUST NOT carry a node's depth in the containing tree into
the subtree at *n*.

**X-3.** The root of the subtree at *n* has empty `content`. An implementation
MUST NOT copy the containing root's `content` into it, including any
`front_matter` entry (S-4).

**X-4.** If the subtree at *n* is not well-formed, S-3 applies: an
implementation MUST reject it and MUST NOT project it.

### What X-2 decides, in characters

`X-2` is the only rule here with a visible consequence, and it is the reason
this RFC is Normative rather than Clarifying. For the document above, the
subtree at `Install` projects to `# Install`, and **not** to `## Install`, which
is what carrying the containing depth would produce.

The same rule governs items through `P-4`'s content column. In

```
- a
  - b
    - c
```

the subtree at `b` projects to `- b` with `- c` indented **two** columns, not
the four it occupies in the containing document. A subtree's projection is
therefore not a substring of the containing document's projection, and an
implementation that extracts text rather than projecting the tree will be wrong
as soon as the subtree is not at depth 1.

### The round-trip consequence

For every subtree that is well-formed, lifting its canonical projection yields
it, because that is `S-7` and the subtree is a tree. Measured on `mindmapmd` at
`85b4c09`:

| Subtree at | Projects to | `lift(projection)` equals it |
|---|---|---|
| `Install`, depth 2 | `# Install\n\n- step one\n- step two\n` | yes |
| `b`, depth 2 of `- a` / `- b` / `- c` nested | `- b\n  - c\n` | yes |
| `C`, depth 3 of `# A` / `## B` / `### C` / `text` | `# C\n\ntext\n` | yes |
| `B`, depth 2 of a document with front matter | `# B\n` | yes |

What is **not** preserved is the subtree's place in the containing tree: its
depth, its siblings, and its parent's content are all gone, by `X-2` and `X-3`.
Recovering them is reinsertion, which this RFC does not define.

### The one interaction re-rooting exposes

Re-rooting can turn a well-formed tree into one that is not. There is exactly
one way, and `S-6` is the rule:

> **S-6.** […] An item that begins a list — one that does not continue the item
> before it — MUST have an ordinal of at most 999999999.

`L-12` makes an item's ordinal the list's start number plus its zero-based
position, so `999999999. a` followed by `1. b` lifts to ordinals `999999999` and
**`1000000000`**. That tree is well-formed: `S-6` bounds only items that *begin*
a list, and `P-3` writes the second one as `999999999.` so the document still
parses. Re-root that second item and it becomes the item that begins a list,
with an ordinal no CommonMark marker can carry.

Measured, again with no change to the reference implementation, projecting the
subtree at that item reports:

```
tree is not well-formed (spec.md §2.4):
  S-6: an ordered list at  starts at 1000000000, which no marker can carry
```

`X-4` is that behaviour stated as a requirement. An application that wants to
hand out such a subtree renumbers the list first; renumbering changes the tree,
which is the author's decision and not the format's.

*(Informative, and the claim worth checking hardest)* `S-6` is the only rule
that can fail this way. `S-1` and `S-2` can only be helped, because re-rooting
removes ancestors and reduces depth. `S-4` cannot fail, because it forbids a
`front_matter` entry anywhere but the root's content and `X-3` empties that.
`S-5` cannot fail, because *n* has no previous sibling in the subtree and the
sibling relationships among its descendants are unchanged. `S-8` is a property
of a label and re-rooting does not touch labels. `S-7` is the round-trip
guarantee itself, so if it fails the subtree is not well-formed and `X-4`
already governs. `S-3` is the rejection rule, not a condition. This enumeration
is informative on purpose: stating it normatively would make a completeness
claim into a conformance requirement, and if the enumeration is ever wrong the
rule that should fail is the one that was violated, not this sentence.

### Why no fragment can be read as front matter

The obvious hazard is that a projected fragment begins with `---` and `L-10`
reads it as front matter instead of a thematic break. It cannot happen. `X-3`
empties the subtree root's content, so the first line a subtree projects is
always *n*'s own first line, and `P-1` makes that an ATX heading or a list
marker — `#`, `-`, or an ordinal. `L-10` fires only on a document's first line,
and no node's first projected line is three hyphens.

Checked rather than assumed: the subtree at `B` in `# A` / `## B` / `---` /
`## C` projects to `# B\n\n---\n`, where the thematic break is `B`'s content and
lands on line 3. It lifts back to the same tree.

### How it is tested

Every example this RFC lands is a normative example in the existing format — a
Markdown input and the expected tree — and the suite is generated from `spec.md`
as always (§1.2.2, [`CONTRIBUTING.md`
§6](../CONTRIBUTING.md#6-working-on-the-specification-text)). **Subtree exchange
needs no new example kind**, which is the second reason to specify it before
diff and merge: a subtree example is an ordinary example whose Markdown happens
to be a fragment and whose tree happens to be a re-rooting, and the suite's
existing two directions — lift the Markdown, project the tree — test `X-1`,
`X-2` and `X-3` exactly as they test Chapter 2.

What the suite cannot express is the containing tree. An example states that
*this fragment lifts to this tree*; it does not state that the tree was obtained
by re-rooting a node of a larger one, nor that the implementation produced it
without reading the parent. §3.1 is written so that each subtree example sits
beside the example for its containing document and the subtree's JSON is
literally a sub-object of the containing tree's, which makes the relation
checkable by a reader. Making it checkable by the suite needs an example kind
that carries more than one tree — which diff and merge will need regardless, and
which this RFC deliberately does not invent.

### Interaction with existing requirements

- **§1.2.4 L2, third bullet** — unchanged in wording; `X-1` to `X-4` are what
  make it decidable.
- **§1.2.4 L2's third informative paragraph** — *"Each of the three requires
  deciding which node in one tree corresponds to which in another"* becomes
  false when this RFC lands, because the third requires no such decision. It
  should say the **first two** require it. The correction is Clarifying and
  rides along with this change rather than waiting, because leaving a false
  informative sentence beside the rules that falsify it is worse than either
  fixing it or deferring the whole change.
- **Status of this document** — *"Chapters 1 and 2 exist"* and *"The operations
  of §1.2.4 L2 … are not written"* both need amending to say that Chapter 3
  exists and holds one of the three.
- **L-5, L-7, P-1, P-2, P-3, P-4** — all unchanged, and all load-bearing. `X-2`
  does not restate them; it fixes the depth they read from.
- **S-3, S-6, S-7** — unchanged. `X-4` applies `S-3`; the `S-6` interaction is
  described, not altered.
- **§1.4.2** — satisfied. Nothing here puts structure in a sidecar or
  presentation in the document.
- **§1.4.1 and L0** — satisfied, and vacuously: a projected subtree is an
  ordinary canonical document, so every L0 reader handles it already.

### Malformed and hostile input

`X-1` is bounded by construction. The subtree at *n* is built from a tree the
implementation already holds, so it allocates one root object and shares the
rest; projecting it is bounded by the size of that tree. Lifting a fragment is
lifting a document, so [`SECURITY.md` §2.2](../SECURITY.md) applies unchanged
and there is no new parsing surface. The one new refusal is `X-4`, which is a
rejection rather than an error, and it is the rejection `S-3` already requires.

## Alternatives

**Do nothing.** L2 stays unclaimable. This is the status quo and it has held
since the level was written, which is an argument that it is tolerable, not that
it is right: the cost is that an implementation *can* hand out `## Install`
today and be conformant, so two tools disagree with no rule to appeal to.
Rejected because the defect is interoperability, which is the one thing a
specification exists to fix.

**Carry the containing depth instead of re-rooting.** The subtree at `Install`
would project to `## Install`, preserving where it came from. Rejected on three
grounds. It contradicts `P-2`, which ties heading level to depth, so either
`P-2` gains an exception or the fragment is not canonical. The fragment would
not be a conforming document on its own once the depth exceeds 6 (`S-2`), so a
subtree of a deep document could not be handed out at all. And it encodes the
parent in the child, which is exactly what §1.2.4 L2 asks to be able to avoid —
*"without the rest of the document ever being transmitted"*.

**Address and exchange subtrees by node identity.** The natural design, and the
one most formats use. Not available: [RFC 0016](0016-remove-node-identity.md)
removed node identity from what this specification defines, on the ground that a
tree carrying identity could not be lifted deterministically, and §1.1.2 records
it as out of scope. Re-rooting is what identity-free subtree exchange looks
like, and this RFC is partly a test of whether RFC 0016's decision survives
contact with L2. It does, for this bullet.

**Specify all three L2 operations in one RFC.** Rejected. Correspondence is a
design problem with live prior art and no obvious answer; diff and merge both
depend on it; all three need an example format that does not exist. Bundling
them would mean one comment period covering four independent decisions, and the
one piece that is ready would wait for the three that are not. The project has
made this call before: [RFC 0093](0093-informative-marking.md)'s decision
deliberately scoped out 104 readings rather than absorb them, and the four
batches that followed were split by kind of decision rather than by position.

**Prior art.**

- **OPML.** An `<outline>` element is self-contained, and a subtree is literally
  a well-formed fragment of the XML. OPML gets this requirement for free, and we
  cannot adopt its answer, because the reason it is free is that OPML spells
  nesting with element nesting while Markdown spells it in the marker — `P-2`
  and `P-4` make depth visible in the characters. §1.4.4 puts the burden of
  argument on departing from an existing answer: the answer here is that the
  departure is forced by the host format, not chosen.
- **Markdown transclusion**, as implemented by MultiMarkdown, Obsidian embeds
  and similar tools. These insert a fragment and let the *includer* shift
  heading levels to fit. That is prior art for rebasing depth on insertion
  rather than carrying it, and it is the design `X-2` adopts: the fragment is
  written at depth 1, and whoever reinserts it decides where it lands.
- **JSON Canvas.** Nodes carry ids and a fragment is a list of nodes plus the
  edges between them. Not adoptable, for the same reason as identity above.
- **XInclude, `git subtree`, JSON Pointer (RFC 6901).** All address a fragment
  rather than describe its structure. They are prior art for the *addressing*
  question this RFC leaves open, not for the one it settles.
- **markmap.** Derives a map from headings and has no fragment concept. Nothing
  to adopt.

## Unresolved questions

**Blocking — to resolve before the comment period ends.**

1. **The rule-label family.** This RFC uses `X-n`. The alternatives are a single
   family for every L2 operation — `O-n` for *operation* — or one family per
   operation, which would make four. `X-n` is proposed because it reads as
   *exchange* and because a shared family would make the diff and merge RFCs
   renumber each other's rules. The next free labels elsewhere are `L-15`,
   `S-9`, `P-13`, `E-11`, and nothing in the document depends on the choice.
2. **Whether Chapter 3 is the right home**, or whether §2.8 is. Chapter 3 is
   proposed because Chapter 2 is titled *Canonical hierarchy* and is about the
   correspondence between a document and a tree, while L2's operations are
   tree-to-tree. A reader looking for them under *Canonical hierarchy* would not
   find them.

**Deliberately left to a later RFC.**

3. **How a caller names *n*.** The subtree at *n* is defined; how a request for
   it identifies *n* is not. A path of child indices is the obvious candidate
   and is not proposed here, because the useful form of the question is tangled
   with reinsertion.
4. **Reinsertion.** §1.2.4's informative note promises that a worked-on branch
   can *"have the result reinserted"*. Reinsertion must restore the depth `X-2`
   discards, and whether it must restore it to the *same* place is a
   correspondence question. Nothing in this RFC is contradicted by any answer to
   it.
5. **An example kind that carries more than one tree.** Needed by diff and
   merge, and by any test of the re-rooting relation itself. Not invented here.
6. **Node correspondence, diff, and merge.** The other two bullets of L2.

**What implementation experience is expected to teach us.** Whether `X-4`'s
rejection is ever reached in practice. It requires an ordered list whose start
number is within one of CommonMark's nine-digit limit, which is contrived; if a
year of use never produces one, that is an argument for leaving it exactly as it
is — a stated bound costs nothing — and not for removing it.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
