# RFC 0016: Remove node identity from the specification

**Translations** — [한국어](ko/0016-remove-node-identity.md). This English text is
the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Accepted |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-08-13 |
| **Comment period ends** | 2026-08-27 (closed) |
| **Decided** | 2026-08-27 — Accepted, lazy consensus |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/16> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

Chapter 1 makes node identity a property of the tree and requires an
implementation to **assign** it. Neither can hold alongside the determinism
§1.2.4 L1 already requires, and together they make the conformance suite
unwritable. This is a defect in merged text, not a design preference.

This RFC removes identity from the specification. **A tree is structure,
labels, content, and kind.** Recognising a node across revisions becomes an
application's private concern, as it already is in practice. Conformance level
**L2 (Identity) is retired**, and L3's requirements move to L2 with their text
unchanged — they never mentioned identity.

Nothing that exists today stops conforming: no implementation can claim above
L1, because Chapter 2 landed two days ago and identity was never implementable.

## Motivation

### The contradiction, shown

Three statements in merged text cannot all be true.

1. **§1.3** — *identity* is "a property of a node", so it is part of the tree.
2. **§1.2.4 L1** — lift MUST be deterministic, producing the same output "in any
   other conforming implementation".
3. **§1.2.4 L2** — an implementation MUST "assign, read, and preserve" identity.

Hand two conforming implementations an ordinary Markdown document with no
identity written in it:

```markdown
# Install
## Requirements
```

Both must assign. Neither has anything to derive a value from. They assign
different values, and the same document lifts to two different trees. **L2
breaks L1.**

### It is worse for the suite than for the implementations

A normative example states an input and the exact expected tree. With identity
in the tree, the expected value would have to include one:

```json
{"kind":"section","label":"Install","content":[],"children":[],"id":"???"}
```

There is nothing to write there. The value differs per implementation by
construction, so **no example could be written down at all** — not merely the
identity ones. Conformance would not be decidable (§1.4.3) for anything.

### Why this was not caught earlier

Chapter 1 was written before there was anything to lift. The requirement to
*assign* reads naturally when no example exists to falsify it, and it survived
until the moment the suite stopped being empty. That is the ordinary way this
class of defect surfaces, and it is the argument for writing examples early
rather than last.

### What identity was for

Three uses were named in Chapter 1, and they do not fare alike.

- **A sidecar keys on it.** This survives. An application that owns both the
  document and the sidecar can key on identity it maintains privately. What it
  loses is the ability to hand that sidecar to a different tool.
- **Diff and merge key on it.** These survive, and this RFC does not weaken
  their stated requirements at all — see the design below.
- **A subtree is put back where it came from.** Survives, structurally.

**The third cost was already unavoidable.** A document that has been through a
language model returns without whatever was written into it, so structural
matching was always going to be needed. This RFC makes it the mechanism rather
than the fallback.

## Detailed design

Five clauses change. Rule labels below are `R-n` for this RFC's own reference and
do not enter `spec.md`.

**R-1.** §1.1.1 item 4 — *Node identity* — is removed from what the
specification defines.

**R-2.** §1.1.2 gains a row recording that identity is deliberately not defined,
and the *Content of a sidecar* row loses the clause "by identity":

| Not defined | Why not |
|---|---|
| Node identity | A tree that carried identity could not be lifted deterministically, because a document that does not state one gives an implementation nothing to derive it from. Recognising a node across revisions is left to applications |
| Content of a sidecar | This specification defines neither what a sidecar stores nor how it addresses what it stores |

**R-3.** §1.3 — the term *identity* — is removed.

**R-4.** §1.2.4 — **L2 (Identity) is removed.** The level that was L3 becomes
**L2**, with its three requirements and its informative paragraph unchanged. The
informative note beginning "Identity is what raises the L1 guarantee" is removed
with the level it described.

The ladder becomes:

| Level | Name | Requirement |
|---|---|---|
| **L0** | Read | A conforming document is usable by software that knows nothing about this specification |
| **L1** | Structure | Lifts any conforming document to the prescribed tree, and projects any tree to canonical form |
| **L2** | Round-trip | Diffs and merges trees, and operates on a subtree without the rest of the document |

**R-5.** No change is needed to §1.4.2. Its text never mentions identity, and its
requirement — that deleting every sidecar changes no tree — holds regardless of
how a sidecar addresses nodes.

The four clauses below were added at the close of the comment period, after
grepping `spec.md` for every occurrence of the word rather than trusting the
list. R-1 through R-5 removed the *definition* of identity and left four places
that go on *using* it. R-6 is the one that matters: without it, this RFC would
repair one contradiction and introduce another.

**R-6.** §1.3, the term *round-trip* — its closing clause cites the level this
RFC removes:

> …at L1 a tree round-trip returns an equal tree, while a document round-trip
> returns equal bytes for canonical documents only; **at L2 a document round-trip
> additionally preserves the identity of every node, canonical or not.**

The bold clause is removed, and the sentence ends at *canonical documents only.*
Left in place it would describe an L2 that no longer exists, against a property
no longer defined — a defect strictly worse than the one this RFC fixes, because
it would be introduced deliberately.

**R-7.** §1.3, the term *sidecar* — "associates data with that document's nodes
**by identity**" loses the last two words, and gains a sentence recording where
the question went:

> **sidecar** — An artifact stored outside a document that associates data with
> that document's nodes. How a sidecar addresses a node is not defined by this
> specification (§1.1.2).

This is the same edit R-2 makes to the §1.1.2 table, applied to the second copy
of the phrase. Both were written from the same assumption and neither survives it.

**R-8.** §0 *Status of this document* — "Identity, and the operations that depend
on it, are not written" becomes "The operations of §1.2.4 L2 — diff, merge, and
subtree exchange — are not written." The old sentence promises identity is
coming; after this RFC it is not coming, and what remains unwritten is the
chapter that specifies the surviving level.

**R-9.** Two informative cross-references, neither of which changes a rule.

- **§1.5.3 (JSON Canvas)** — "provided the two are keyed on node identity"
  becomes "provided the two can be bound to the same nodes", and the sentence
  after it now says the specification defines neither such a binding nor what one
  would key on (§1.1.2).
- **The closing note of Chapter 2** — "Whether this specification should define
  identity at all is an open question; see `rfcs/0004-canonical-hierarchy.md`"
  becomes a pointer to this RFC and to §1.1.2. The question is no longer open,
  and 0004 was never where it was answered.

*(Informative)* **The surviving level's requirements are untouched.** Read them
again:

> - compute a structural difference between two trees, expressed as operations on
>   nodes rather than on lines of text, and
> - merge two trees that share a common ancestor, reporting conflicts in terms of
>   nodes, and
> - lift and project a proper subtree without access to the document that
>   contains it.

Not one of them names identity. They were written structurally from the start,
which is why removing identity costs them nothing textually. What it costs is
difficulty: matching nodes across two trees without a key is a harder problem
than matching by key, and the rules for doing it are unwritten. That is a
chapter's worth of work, and it is honest to say so rather than to leave a key
in the specification that no document can carry.

*(Informative)* **Adding is cheaper than retracting.** A specification that stays
silent and later defines identity breaks nobody. A specification that defines it,
ships, and then retracts it breaks every implementation that believed it. Given
that no carrier we can presently name survives both L0 and a round-trip through a
language model, silence is the position that keeps the most options open.

## Alternatives

**Do nothing.** Leave the contradiction in place. Rejected: it is not a
disagreement about design but a defect that makes the conformance suite
unwritable. Every example in `spec.md` would be unwritable, not just the ones
about identity.

**Drop `assign`, keep read-and-preserve.** The specification would say how
identity is written *when a document carries it*, require nothing to carry it,
and never manufacture one. This fixes determinism, and it was the first
resolution considered.

Rejected because of what it commits the specification to. Every carrier we can
name is either visible in a plain renderer, which fails L0, or an opaque token —
realistically an HTML comment — which a language model cannot be relied on to
carry through an edit. The round-trip this project is built for passes through a
model, and a model does not edit a document but re-emits one: asked to
reorganise, it may drop the tokens, omit them from nodes it adds, copy one onto
two nodes, or leave them attached to content that moved. None of that is a fault
in the model, and no instruction makes the guarantee testable. **Specifying a
carrier we would advise nobody to use is worse than specifying none.**

**Make identity a relation an implementation maintains, not a property of the
tree.** §1.3 would be reworded so that identity is a correspondence between
nodes across revisions rather than a member of a node. Lift stays deterministic
because the tree gains nothing.

Rejected on testability. Conformance would have to be established by inspecting
an implementation's internal mapping rather than by comparing two artifacts,
which is the kind of requirement §1.4.3 exists to keep out. A level nobody can
test from the outside is a level nobody can claim honestly.

**Derive identity from label and position.** Deterministic, costs the document
nothing, and requires no carrier. Rejected because it fails at the only moment
identity is needed: rename a node and the derived value changes, so it is an
address rather than an identity. §1.3 required identity to be independent of
label and position precisely to exclude this.

**Carry identity in front matter.** The obvious third candidate, and the one
this RFC did not consider until it was raised in review: a fenced block at the
top of the document, as Jekyll, Hugo, Obsidian, and markmap all use. It is one
block rather than a token per node, it is human-writable, and a language model
can be asked for it in plain words — all of which the HTML comment is not.

Rejected on three counts, the last of which is decisive.

It **fails L0 in the general case.** Front matter is not CommonMark. Parsed by
the reference implementation, `---` / `title: …` / `---` is a thematic break
followed by a **setext heading**, because a line of hyphens after a paragraph is
a heading underline rather than a break. It is invisible only in readers that
special-case it, and L0 asks for any Markdown tool, not a favoured subset.

It is **not obviously safer through a model.** Being one block at the top helps,
but it is also the block a model is most likely to rewrite or drop when asked to
restructure a document, and it is the part with no visible connection to the
content.

And it **relocates the problem rather than solving it.** Front matter sits at the
top; identity has to attach to nodes throughout. Carrying it there means a side
table inside the block, which needs some way to name the node each entry belongs
to — an address. Whatever that address is, it is either a position or a label,
and §1.3 required identity to be independent of both. **The candidate that looks
like it avoids the addressing problem turns out to contain it.**

**Prior art.**

- **EMM** carries a map snapshot — styles, layout, images, and its own node
  identity — in a single base64 HTML comment at the end of the file. It works,
  and it works because EMM's round-trip partner is the application itself. It is
  evidence that an in-document carrier is possible, not that it is safe when
  something untrusted sits in the middle.
- **HTML** solves the same problem with `id` attributes, which are visible in the
  source but inert on screen. Markdown has no equivalent: there is no attribute
  syntax in CommonMark, and every extension that adds one renders as literal text
  where it is not supported.
- **OPML** puts identity in XML attributes, available to it because its documents
  are not also prose. The same answer is not available here, for the same reason
  it was not available for the hierarchy question.

## Unresolved questions

**How the surviving L2 matches nodes.** Diff, merge, and subtree replacement all
need to decide which node in one tree corresponds to which in another, and
without a key that decision is a heuristic over labels, kinds, positions, and
content. This RFC does not specify it; it belongs to the chapter that specifies
L2. **It does not block this RFC** — the level's requirements are unchanged, and
they were already stated structurally.

**What a sidecar addresses.** §1.4.2 keeps presentation outside the document and
is unaffected, but an application-owned sidecar must still point at something.
Whether this specification ever says how — and thereby makes sidecars portable
between tools — is open, and is the question this RFC most obviously defers
rather than answers.

**Whether identity ever returns, and what would bring it back.** A use case that
demands it would be two independent tools needing to exchange annotations against
the same document. Nothing today does. If that changes, the way back is an RFC
that defines a carrier and argues it against L0 and against the model round-trip
— the two tests that no candidate has yet passed.

**Whether this is Normative or Breaking.** Recorded here rather than assumed. No
implementation can claim above L1: Chapter 2 landed on 2026-08-11 and identity
was never implementable, so nothing that conforms today stops conforming, which
is what §3 makes the test. Against that, renumbering a published level name is
the kind of change that would be Breaking after a release. The nomination is
**Normative**, and §3's rule that a disputed class resolves to the more
restrictive one applies if anyone reads it the other way.

## Decision and rationale

**Accepted on 2026-08-27 by lazy consensus**, the fourteen-day comment period
having closed with no unresolved objection ([`GOVERNANCE.md`
§4](../GOVERNANCE.md#4-decision-making)).

As with RFC 0004, the record should not read stronger than it is. **No comment
arrived from outside this project.** There were no reviews and no participants
other than the maintainer; the single comment on the discussion was the
maintainer's own amendment. The proposal was never tested by disagreement. What
it was tested by is the same thing that produced it — reading the merged text
against an example it could not express.

### Correction — the acceptance was recorded a day early

**This decision was written and merged on 2026-08-26**, one day before the
comment period this RFC states. The date was taken from the conversation in
which the work was done rather than checked against a clock; the repository's
own commit timestamps and the merge on the discussion both record 2026-08-26.

Recorded rather than corrected away, because the two halves are not the same
size.

**What it changed: nothing.** There were no participants and no objection at any
point in the period, so no comment could have arrived in the day that was
skipped, and the outcome on either date is identical.

**What it costs is the harder half.** [`GOVERNANCE.md`
§5](../GOVERNANCE.md#5-phase-transitions) states the phase triggers as numbers
for one stated reason — "no one, including the current maintainer, gets to decide
later that the conditions have not been met." A project that writes that sentence
has to hold itself to its own dates, and on its first decision under the rule it
did not. The acceptance stands as of the close of the period on 2026-08-27; the
process note is that it should not have been written before then.

### Why this outcome and not the other

The genuine alternative was not *do nothing.* It was **drop `assign`, keep
read-and-preserve**: say how identity is written when a document carries one,
require nothing to carry it, and never manufacture a value. That fixes
determinism and keeps the concept.

It was rejected because of what it commits the specification to. Saying *how
identity is written* means naming a carrier, and every candidate fails one of the
two tests this project cannot waive. Visible carriers fail L0. Opaque carriers —
realistically an HTML comment — survive L0 and do not survive the round trip this
project exists for, because a language model does not edit a document but
re-emits one. Front matter, raised during the comment period, fails on a third
count that neither of the others does: it needs a side table whose entries name
their node, and any such name is a position or a label, which §1.3 required
identity to be independent of.

**Specifying a carrier we would advise nobody to use is worse than specifying
none.** That is the whole decision.

### Why now rather than after another revision

The cost of this change is one renumbering: L3 becomes L2, and a published level
name moves. That cost is zero today and never zero again.

| | |
|---|---|
| Chapter 2 merged | 2026-08-11, sixteen days ago |
| Implementations that can claim above L1 | none — identity was never implementable |
| Normative examples carrying an identity | none of the six |
| Releases affected | none; the specification is Draft |

Deferring would not have bought better information. It would have bought the
same decision at a price.

### What the comment period changed

| Added | Because |
|---|---|
| **Front matter**, in Alternatives | It is the carrier anyone would propose next, and silence on it would read as not having thought of it. Rejected on three counts, the last decisive — it relocates the addressing problem rather than solving it |
| **R-6 … R-9** | R-1 through R-5 removed the definition of identity and left four passages still using it. **R-6 is not tidying:** the *round-trip* term cites the removed level, so the RFC as first written would have repaired one contradiction and introduced another |
| **Issue [#17](https://github.com/mindmapmarkdown/spec/issues/17)** | The parser run that rejected front matter also showed it lifting to a spurious `section` node under L-1 — a Chapter 2 question, filed separately rather than folded in |

The first came from review. The second came from grepping the specification for
the word instead of trusting the clause list — the same method that found the
original contradiction, applied to the fix.

### What acceptance does not settle

Two questions leave this RFC open rather than answered, and both are recorded
above: **how the surviving L2 matches nodes without a key**, which belongs to the
chapter that specifies it, and **what a sidecar addresses**, which decides
whether sidecars are ever portable between tools. Neither blocks the removal.
Both are harder now than they would have been with a key, and saying so is part
of the decision rather than a caveat on it.

### Class

**Normative**, as nominated. Nothing that conforms today stops conforming, which
is the test §3 sets. The renumbering is the one fact that argues the other way,
and it is recorded here so that a later reader can disagree with the call rather
than have to reconstruct it.
