# Node correspondence: what L2 needs, and what it does not

**Translations** — [한국어](ko/l2-correspondence.md)

A design exploration for the first two bullets of [`spec.md`](../spec.md)
§1.2.4 L2 — diff and merge. Both need to decide which node in one tree
corresponds to which in another, and that decision is not written.

**This document is informative. It defines nothing.** It records what the
specification already constrains, what was measured, and the one architectural
choice a future RFC has to make. No requirement here is normative; where this
text and `spec.md` disagree, `spec.md` wins. This English text is the
authoritative version of this file.

The third bullet of L2 — subtree exchange — is **not** in scope here. It needs
no correspondence at all, which is argued in [RFC
0110](../rfcs/0110-subtree-exchange.md).

## 1. The problem

Given two trees, decide which node of one *is* which node of the other. A diff
is then the operations that turn one into the other; a merge is three trees and
the same question asked twice.

Without that decision, a diff can only say *this whole tree was replaced*, which
is true, useless, and already available.

## 2. What the specification has already decided

Five constraints are settled. They are not up for re-argument in a
correspondence RFC; they are the shape of the problem.

**There is no identity.** [RFC 0016](../rfcs/0016-remove-node-identity.md)
removed node identity from what this specification defines, and §1.1.2 records
it as out of scope, because a tree carrying identity could not be lifted
deterministically — a document that does not state one gives an implementation
nothing to derive it from. Correspondence must therefore be derived from what a
node *is*, not from what it is *called*.

**Kind is part of the tree.** §2.1: two trees that are otherwise equal but
differ in the kind of any node are different trees. So a heading and a bullet
with the same text are different nodes, and whether an author's conversion of
one into the other is a change of node or a replacement of it is a question a
correspondence rule has to answer rather than assume.

**Sibling order is part of the tree.** Two trees differing only in sibling order
are different trees. A correspondence that ignores order would call two
different trees the same.

**An ordinal is position, not identity.** `L-12` makes an ordered item's ordinal
the list's start number plus its zero-based position. Measured:

```
before            a:1 b:2 c:3
insert at front   z:1 a:2 b:3 c:4
delete the first  b:1 c:2
```

Inserting one item changes the ordinal of **every** later item. Any matcher that
keys on `ordinal` therefore mismatches the entire tail of a list after a single
insertion. **Ordinals cannot be a matching key**, and that follows from a rule
already in the specification rather than from a preference.

**Equality is already defined.** `E-7` gives exact tree equality, with no
Unicode normalisation in either direction. Equal subtrees correspond; that is
the one case no algorithm is needed for, and it is where every candidate below
starts.

## 3. The finding that reframes the problem

§1.2.4 L1 says, of lift and canonical projection:

> Both operations MUST be deterministic: the same input MUST produce the same
> output, in the same process **and in any other conforming implementation**.

§1.2.4 L2 says, of diff and merge:

> - compute a structural difference between two trees, expressed as operations
>   on nodes rather than on lines of text, and
> - merge two trees that share a common ancestor, reporting conflicts in terms
>   of nodes […]

**L2 does not require two implementations to agree.** The determinism clause is
L1's, and it is scoped to L1's two operations by the words "both operations".
L2's cumulative obligation (an implementation at a level satisfies all lower
levels) carries that clause for lift and projection and does not extend it to
diff and merge.

That is either a drafting omission or the most important decision in L2, and a
correspondence RFC has to say which. It is the difference between specifying a
*property* — a diff must be sound, and must speak in nodes — and specifying an
*algorithm*, which is what agreement between implementations would require.

## 4. The candidates

Three strategies, each the simplest honest version of a family.

| | How it decides |
|---|---|
| **path** | The node at the same sequence of child indices corresponds |
| **equal subtree** | A node corresponds to one whose entire subtree is `E-7`-equal, taken in document order |
| **LCS** | Per sibling list, a longest common subsequence keyed on `(kind, label)`, recursing into matched pairs |

A fourth family — two-pass matching in the style of GumTree, where equal
subtrees are matched first and parents are then matched when *enough* of their
children already are — is discussed in §6. It is not measured here because
"enough" is a constant this project would have to choose, and choosing it is the
decision, not the measurement.

## 5. What they do, measured

One edit class at a time, applied to the tree of this repository's own
`CHANGELOG.md` (52 nodes). *survive* is how many of the original nodes still
exist after the edit; the percentage is how many of those the strategy found.
**+n wrong** counts matches onto a node that is not the same node.

| edit | survive | path | equal subtree | LCS |
|---|---|---|---|---|
| insert a first child of the root | 52 | **0.0%** +1 wrong | 100.0% | 100.0% |
| insert a first child mid-tree | 52 | 25.0% **+22 wrong** | 96.2% | 100.0% |
| delete the first of three siblings | 43 | 30.2% **+21 wrong** | 95.3% | 100.0% |
| rename a node that has children | 51 | **100.0%** +1 wrong | 96.1% | **84.3%** |
| move a subtree to another parent | 52 | 82.7% | **94.2%** | 82.7% |
| edit the content of one deep node | 52 | 100.0% | 92.3% | 100.0% |

Three things in that table matter.

**Path matching is unsound, not merely weak.** On a mid-tree insertion it
matched 22 nodes of 52 onto a *different* node. A merge built on it would apply
one side's edit to the wrong node and report no conflict — silent corruption,
which is worse than a diff that gives up. The failure is structural: inserting
one child shifts every later index, so every path below the insertion point
addresses something else.

**Each strategy is best at precisely what another is worst at.** Path is perfect
on a rename and finds nothing at all on an insertion at the front. LCS is
perfect on insertion and deletion and worst on a rename. Equal subtree is the
only one that follows a moved subtree. There is no ordering of these three by
quality, so there is no "obviously right" simple answer to adopt.

**The rename row is the crux, and it is the most ordinary edit there is.** LCS
keys on `(kind, label)`, so a renamed node does not match, and LCS does not
recurse into an unmatched pair — the whole subtree below a retitled section is
orphaned. Measured at 84.3% here and at 77.8% on `CONTRIBUTING.md`; on `spec.md`
an earlier run of the same experiment, with a host nearer the root, put it at
38.0%. Retitling one section should not destroy the correspondence of everything
under it.

**Equal-subtree matching can never match an ancestor of a change.** This is
provable rather than statistical: if any descendant differs, the subtree is not
`E-7`-equal, so no match is possible. On a single content edit it loses four
nodes of 52 — the edited node and its three ancestors. For a merge this is
exactly the wrong failure, because two people editing different children of the
same section would both be told that the section itself was replaced.

### Natural corpora, for contrast

The same strategies over consecutive revisions of this repository's files, as
the share of `min(|A|,|B|)` matched:

| corpus | revisions | path (sound) | equal subtree | LCS |
|---|---|---|---|---|
| `spec.md` | 20 | 99.7% | 84.9% | 99.8% |
| `CHANGELOG.md` | 40 | 85.8% | 88.2% | 95.3% |
| `README.md` | 14 | 91.1% | 86.2% | 98.7% |

`spec.md`'s history flatters path matching, and that is a property of the corpus
rather than of the strategy: almost every edit to this specification changes
prose inside a section that already exists, so no path moves. `CHANGELOG.md`
is the honest case, because a release inserts a heading near the top — and on
its most recent revision pair, path matching matched **3.9%** of nodes while
96.1% of the tree was untouched. A corpus that does not contain the hard case
cannot be used to argue the hard case away.

## 6. The architectural fork

A correspondence RFC has to choose one of three positions. They are not
variations; they produce different specifications.

**(a) Specify an algorithm.** Two-pass matching, with the tie-breaks and the
similarity constant written down, so that any two implementations produce the
same correspondence and therefore the same diff. This buys interoperable diffs
— two tools that disagree about a merge can be compared, and a conformance test
can state the expected output. It costs the character of the specification:
Chapters 1 and 2 state properties (*"lift MUST be a function of the document
text alone"*), and this would be the first requirement that is a procedure. It
also puts a tuning constant in a standard, where it cannot be changed without a
Breaking change.

**(b) Specify properties only.** A diff MUST be expressed as operations on
nodes; applying it to the first tree MUST yield the second; a merge MUST report
conflicts in terms of nodes; an implementation MUST be deterministic with
itself. Nothing requires two implementations to produce the same diff — exactly
as nothing requires two `diff` programs to produce the same patch. This keeps
the specification property-shaped, is testable (apply the diff and compare
trees, which the existing suite format can almost express), and demands no
constant. It does not deliver interoperable diffs, and §1.2.4's L2 text does not
ask for them.

**(c) Specify the correspondence as data.** Define a way to *write down* a
correspondence, and specify diff and merge as functions of one. Who computes it
is then out of scope, the way lift's input is out of scope. This is the most
honest reading of a format whose §1.1.2 already declines to define identity, and
it converts the problem into the addressing question [RFC
0110](../rfcs/0110-subtree-exchange.md) leaves open — how a node is named from
outside the tree. It is more work than (b) and strictly more useful, because a
correspondence that can be written down can be exchanged, reviewed, and
corrected by a human.

**What this exploration recommends.** **(b) now, (c) next, (a) not at all.**
Specify diff and merge as properties, so L2 becomes claimable and the vocabulary
of node operations is fixed; then specify correspondence as exchangeable data,
which is where the real value is and which needs the addressing question
answered anyway. Do not put a matching algorithm with a similarity constant in
the specification: §5 shows that no simple algorithm is right, and the measured
ordering of the candidates changes with the corpus, which is the signature of a
tuning parameter rather than a standard.

## 7. What a next RFC still has to settle

1. **Whether L2's silence on inter-implementation agreement is deliberate.** §3.
   Everything else follows from the answer, so it is first.
2. **The operation vocabulary.** Insert, delete, and set-content are forced.
   Whether *move* and *rename* are primitives or are spelled as delete+insert is
   a real choice: naming them makes diffs much smaller and requires the
   correspondence to be able to see them, which §5 shows no single strategy can.
3. **Soundness, stated testably.** Applying a diff to the first tree yields the
   second, under `E-7`. This is the property that makes the level checkable, and
   the existing example format cannot express it — a test needs two trees in and
   one out.
4. **An example kind carrying more than one tree.** Needed by 2 and 3, and named
   as deferred by RFC 0110 for the same reason.
5. **What a conflict is.** "Reporting conflicts in terms of nodes" needs a
   definition of when two edits to corresponding nodes conflict. Content edits
   to the same node are the easy case; a rename on one side and a delete on the
   other is not.
6. **Whether a correspondence may cross `kind`.** §2 says a heading and a bullet
   are different nodes. Whether converting one to the other is one operation or
   two decides whether an outline-to-headings reorganisation diffs small or
   large.

## 8. Reproducing the measurements

Everything above was measured with the reference implementation
[`mindmapmd`](https://github.com/mindmapmarkdown/mindmapmd) at `85b4c09`, whose
`lift` turns each document into the tree the strategies run over. There are two
harnesses: one over consecutive git revisions of a file, one applying a single
synthetic edit class to a real tree. Neither is checked in here, because this
repository's `tools/**` holds only scripts a requirement depends on — a
measurement harness belongs beside
[`tools/corpus.mjs`](https://github.com/mindmapmarkdown/mindmapmd/blob/main/tools/corpus.mjs)
in the implementation repository, which is where RFC 0091's corpus figures were
taken. If a later RFC cites the numbers above, they go there first: a
measurement published in an RFC has to be reproducible from the method the RFC
states, and that is the standard this project already holds itself to.

Two cautions, learned while taking these numbers:

- **A corpus can hide the case the design is about.** The first run used
  `spec.md`'s own history and put path matching at 99.7%, which would have
  argued for the one strategy that is unsound. §5 keeps that number and says
  why it is an artifact.
- **The accounting is the measurement.** An early version of the per-class
  experiment renamed a node that happened to be a leaf, so the row that was
  supposed to test *rename with children intact* tested nothing, and reported
  LCS at 100% where the corrected run reports 84.3%. It also counted a
  content-edited node as destroyed, which pushed percentages above 100 and made
  the error visible. Percentages that cannot exceed their denominator hide this
  class of mistake rather than preventing it.

---

*This document is licensed under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). See
[`LICENSE`](../LICENSE) for the licensing of this repository as a whole.*
