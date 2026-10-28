# RFC 0085: A document whose tree does not survive its own projection does not conform

**Translations** — [한국어](ko/0085-well-formed-or-not-conforming.md). This English
text is the authoritative one; a translation is a reading aid and carries no
normative force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Accepted |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-15 |
| **Comment period ends** | 2026-10-29 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/85> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

A conforming document (§1.2.3) gains a third condition: **its tree is
well-formed** (§2.4). §2.4's sentence *"Lift cannot produce a tree that is not
well-formed"* stops being a claim about lift and becomes a consequence of that
definition. `S-7` (RFC [0043](0043-well-formed-round-trip.md), accepted
2026-10-01, landing deferred) then lands in 0.1.0 as it was accepted. Together they
make §1.2.4 L1 true **by definition** for every conforming document: a document
whose tree does not survive its own canonical projection is not assigned a tree,
in the same way that a heading inside a list item is already not assigned one.

## Motivation

### What goes wrong today

§1.2.4 L1 says lifting the canonical projection of a tree MUST yield that tree.
Every week of measurement has turned up conforming documents for which no
implementation can do that:

| Document | Issue | Status |
|---|---|---|
| `␣␣cont` ⏎ `␣␣␣␣- n3` | [#74](https://github.com/mindmapmarkdown/spec/issues/74) | RFC [0079](https://github.com/mindmapmarkdown/spec/pull/79), period to 2026-10-19 |
| `- a` ⏎ ⏎ `␣b` ⏎ `␣␣␣␣- c` | [#74](https://github.com/mindmapmarkdown/spec/issues/74)'s family, [counterexample on #79](https://github.com/mindmapmarkdown/spec/pull/79#issuecomment-6120870454) | no proposal |
| `- a` ⏎ ⏎ `␣␣b` ⏎ `=` | [#81](https://github.com/mindmapmarkdown/spec/issues/81) | no proposal |
| `- a` ⏎ ⏎ `␣␣2. b` | [#82](https://github.com/mindmapmarkdown/spec/issues/82) — appears when RFC 0039 lands | no proposal |
| `-` ⏎ `>` ⏎ `␣␣> q` | [#83](https://github.com/mindmapmarkdown/spec/issues/83) | no proposal |
| `1) [x]:x` ⏎ `␣␣␣2)` | [#84](https://github.com/mindmapmarkdown/spec/issues/84) | no proposal |

Each is valid CommonMark, lifts to exactly one tree, and is therefore conforming
under §1.2.3 as written. Each tree projects to a document that lifts to a
different tree, or that lift refuses. So L1 — a MUST — is unsatisfiable for each
of them, in every implementation.

The family has no known size. `tools/sweep.mjs` in the reference implementation
has found a new member on most days it has been run, and when its generator was
repaired on 2026-10-07 ([mindmapmd#16](https://github.com/mindmapmarkdown/mindmapmd/pull/16))
it found four at once. Each was answered, or will be, by its own rule — a blank
line here, a column count there — and each rule has a comment period of its own.

### Why enumerating them has stopped working

This project has answered each member as it was found, and rejected the general
answer three times, each time because a spelling existed for the shape in front of
it. That is no longer true:

- **Five of the six documents above have no proposal**, and RFC 0079 — the
  answer to #74 — answers #74's document but not its family.
- **The search does not converge.** On 2026-10-02 the landing of `S-7` was
  deferred because "a release date that waits for a search to stop finding things
  is not a date". The same reasoning now applies to the release itself: #74
  showed that these documents hold 0.1.0 whether or not `S-7` lands, because L1
  is already in `spec.md`.
- **Two proposals in their comment periods are blocked by members of the family.**
  An objection to RFC 0057 Part 1
  ([#57](https://github.com/mindmapmarkdown/spec/pull/57#issuecomment-6160196350))
  rests on a label that Part 1 writes into a setext heading. RFC 0058's rule causes
  a member of its own ([#84](https://github.com/mindmapmarkdown/spec/issues/84)).

### Why this is the moment

A release cannot be cut while a Normative question is undecided (`CHANGELOG.md`,
*Open before 0.1.0*), and none of the five can be decided by 2026-10-21. Answered
after 0.1.0, each would change what conforms, which `GOVERNANCE.md` §3 classes as
Breaking. Answered by this RFC before 0.1.0, it is Normative, and every later
answer to a particular member only **extends** what conforms (see *Detailed
design*, §4).

### Who hits it

Measured on 2026-10-15 over **747 real Markdown files** — every `.md` file in the
`easymindmap` repository, 543 of them third-party package READMEs and changelogs
under `node_modules`, and every `.md` file in this repository — 8 MB in all:

| Configuration | Round trip fails | `S-7` rejects the tree | Refused by lift |
|---|---|---|---|
| `mindmapmd` `main` (no open proposal) | **42** (5.6%) | — (no `S-7`) | 0 |
| the 0.1.0 configuration (every open proposal, `S-7` active) | **0** | **0** | 0 |

Of the 42, 41 pass on RFC 0057's prototype alone — almost all of them a wrapped
line in a nested bullet, which is [#55](https://github.com/mindmapmarkdown/spec/issues/55)
— and the last on RFC 0067's, a table that CommonMark reads as a setext heading.

So **in that corpus, this RFC turns away no document** once the open proposals
land. Its cost falls on documents like the six above, which a generator builds
and the corpus does not contain. On the 0.1.0 configuration with the repaired
generators, that is 213 of 240,000 documents from `assembled` and 79 of 240,000
from `mutated`. The `nested` generator's figure is not quoted, because most of it
is a lift defect in a prototype
([mindmapmd#17](https://github.com/mindmapmarkdown/mindmapmd/issues/17)).

The corpus has one blind spot, and it is stated rather than hidden: it contains no
mind-map exports. Wrapped nested bullets — the shape that fails 5.6% of it today —
are the ordinary case in a mind-map export, so the 0.1.0 figure depends on RFC
0057 Part 1 landing (see *Interaction with open proposals*).

## Detailed design

### 1. §1.2.3, amended

> A **conforming document** is a Markdown document that
>
> - is a valid CommonMark document, **and**
> - lifts (§1.3) to exactly one tree under the rules of this specification, with
>   no construct whose interpretation this specification leaves undefined, **and**
> - **whose tree is well-formed (§2.4).**

### 2. §2.4, amended

The sentence after the definition of well-formed —

> Lift cannot produce a tree that is not well-formed; a tree constructed
> programmatically can be.

— is replaced by:

> A document whose tree would not be well-formed is not a conforming document
> (§1.2.3), and lift assigns it no tree. A tree constructed programmatically can
> fail to be well-formed; S-3 applies to it.

And this informative note is added after the note on S-3:

> *(Informative)* This is how S-1 has always worked. `- a` ⏎ `␣␣# h` is valid
> CommonMark and lifts, under L-1 and L-2, to a section inside an item. No
> conforming document can denote that tree, so the document is not conforming,
> and an implementation reports it rather than producing the tree. The definition
> in §1.2.3 now says so for every rule in this section, where it used to be implied
> for S-1 alone.
>
> A document this turns away is still valid Markdown. L0 is untouched: every
> renderer, editor, and diff tool reads it exactly as before. What it does not have
> is a tree, because the one tree the rules would give it is a tree its own
> canonical projection does not return.

### 3. `S-7` lands

`S-7` lands in §2.4 as RFC [0043](0043-well-formed-round-trip.md) accepted it,
together with that RFC's amendment to §1.2.4 L1. The deferral recorded in RFC 0043
on 2026-10-02 named three conditions for its withdrawal, and this RFC changes what
the third one was for:

1. **#61 answered** — by RFC [0069](https://github.com/mindmapmarkdown/spec/pull/69),
   whose period ends 2026-10-16.
2. **The label question answered** — by RFC
   [0072](https://github.com/mindmapmarkdown/spec/pull/72), whose period ends
   2026-10-17.
3. **The sweep reporting zero on a generator that has stopped finding new shapes.**
   This condition existed because §2.4 *claimed* that lift never produces an
   ill-formed tree, and each new shape made that claim false. Under §2 above it is
   no longer a claim. A new shape is then a document that is not yet conforming,
   and a candidate for a rule that gives it a tree. It is not a defect in
   `spec.md`.

If this RFC is accepted, the deferral is withdrawn when conditions 1 and 2 are
met, and `S-7` lands with them.

### 4. What a later answer to one member is

Every member of the family is a document that this RFC makes non-conforming. A
later rule that **gives such a document a tree** — RFC 0079 for #74's document,
for instance — changes no conforming document's tree, and no conforming
implementation's behaviour on a conforming document. It extends §1.2.3, and it is
**Normative**, not Breaking.

A later rule that also changes how an existing well-formed tree is projected is
Breaking or not on its own terms, exactly as it would be without this RFC.

### Interaction with open proposals

| Proposal | Before this RFC | With this RFC |
|---|---|---|
| RFC 0057 Part 1 | objected to on 2026-10-14: `- a␣␣` ⏎ `=` round-trips today and fails with Part 1 | Under resolution 2 of that objection, the document is refused rather than broken. Part 1 fixes 41 of the 747 real files and breaks none of them, so it can be accepted |
| RFC 0058 | its rule breaks `[x]:x` ⏎ ⏎ `[y]:>` ⏎ `-`, which round-trips without it (#84) | **unchanged.** This RFC would turn that document away, and it conforms today, so the objection to 0058 stands on its own |
| RFC 0079 | answers #74's document, not its family | unchanged. It still gives #74's document a tree, and the rest of the family is refused until answered |
| #81 – #84 | open questions that hold the release | open questions that **do not** hold the release: each is a document without a tree, and answering it extends conformance |

### Round-trip consequence

Strengthened, and made unconditional. Today L1 holds for the documents whose
trees happen to survive projection, and fails silently for the rest. Afterwards
it holds for every conforming document by definition, and a document it cannot
hold for is refused instead of being silently changed.

### Edge cases

| Case | What happens |
|---|---|
| A document whose tree fails `S-7` only because of an implementation defect | The implementation does not conform to L1, and the document still does. A wrong lift refusing a document is a defect like any other wrong lift. |
| A document refused under this rule, edited until its tree survives | Conforming from that point, with the tree lift gives it. Nothing about its history matters (L-8). |
| A subtree of a conforming document | Not covered by §1.2.3, which is about documents. L2's operation on a subtree is a separate requirement, and this RFC does not touch it. |
| A tree built programmatically that fails `S-7` | As today: S-3 refuses to project it. |

### Cost, bounds, and decidability

Deciding whether a document conforms now costs one lift, one projection, one more
lift, and one E-7 comparison, where it used to cost one lift. The work is linear in
the document, sets no bound of its own, and needs no resource beyond the text
(L-8). It is decided mechanically, because both operations are deterministic
(§1.2.4), so §1.4.3 is met. An implementation that has `S-7` already performs
these steps.

### How it is tested

- **The suite.** Every example in `spec.md` is a conforming document whose tree
  satisfies `S-7` — RFC 0043 established that and its prototype checks it — so no
  example changes. The suite cannot yet state a document that does **not**
  conform. That is RFC 0043's unresolved question 3, and S-1 is in the same
  position today.
- **The reference implementation.** `S-7` is already implemented, in
  `src/wellformed.js` on RFC 0043's prototype branch, which every 0.1.0
  integration branch includes.
  The change is that `lift` refuses a document whose tree it rejects, as it
  already refuses a heading inside an item. The prototype is planned as a pull
  request on the 0.1.0 integration branch. It is not written yet; *Unresolved
  questions* says why it does not block review.
- **The corpus run above**, to be added to `mindmapmd` as `tools/corpus.mjs`, so
  that the next proposal can be measured against real documents before it is
  measured against generated ones.

## Alternatives

### Do nothing, and release 0.1.0 with the family recorded as known defects

Keeps 2026-10-21. It ships a MUST that no implementation can meet for documents the
specification itself accepts. It breaks the rule `CHANGELOG.md` states for this
release, and it makes the first answer to any member a Breaking change and so a
major version. On 2026-10-04 the project decided that #74 alone was reason enough
to hold the release, for exactly this reason. Rejected.

### Keep enumerating

Answer each member with its own rule, as has been done since 2026-10-02. Each
answer is better than a refusal for the document it answers, and that is why
§4 above leaves every such answer open. As the **only** mechanism, though, it ties
the release to a search that has not converged, and it leaves L1 false for every
member not yet found. Rejected as the only mechanism; kept as the way the
conforming set grows.

### Weaken L1, or list its exceptions

"SHOULD", or "MUST, except for the following documents". A list of exceptions is a
second, partial grammar of CommonMark that would be wrong the first time the two
disagreed. That is the argument RFC 0043 made against listing forbidden labels,
and it applies unchanged. A SHOULD gives up the one promise this format is for.
Rejected.

### Give such a document a best-effort tree and flag it

Lift would return the tree with a warning, and L1 would apply to unflagged trees
only. That defines a second kind of tree with its own rules, which is a
conformance level that nothing else in the specification uses, and §1.4.3 asks
what the test for "best effort" would be. Turning the document away is simpler,
and it is what S-1 already does. Rejected.

### Prior art

CommonMark reads every string of characters as a document, so it never faces this
question, and it defines no writer. Converters that do write Markdown back, Pandoc
among them, do not promise that what they write reads back as what they read. The
formats in §1.5 that do promise a round trip — OPML, JSON Canvas — define their
own syntax, and so never meet a document they cannot write back. The author knows
of no format that reads an existing syntax and promises to write every reading
back; a reader who knows of one should say so on the pull request, because it
would have met this question first. Until then the precedent this RFC follows is
the specification's own: S-1.

## Unresolved questions

None blocks acceptance.

1. **A way for the suite to state a non-conforming document.** This is RFC 0043's
   unresolved question 3, and it matters more after this RFC, because the set of
   non-conforming documents becomes the set this RFC defines. It does not block,
   because S-1 is already a refusal that the suite cannot state.
2. **What an application does with a refused document.** That is outside this
   specification (§1.1.2). An L1 application can still show the document as text,
   because it is valid Markdown. Whether it says *why*, and how, is product design.
   The reference implementation names the first rule the tree fails.
3. **The prototype.** The change to `lift` is a few lines over `src/wellformed.js`.
   It is to be written as a pull request against the 0.1.0 integration branch
   during the comment period, so that the decision is made with the corpus run
   repeated on it. Its absence at opening does not block review of the rule,
   which the measurements above already describe.

## Decision and rationale

**Accepted**, 2026-10-29, by lazy consensus. The comment period ran in full, from
2026-10-15 to 2026-10-29, and no objection was raised. The text did not change
while the period ran, so it was not restarted. **This is the only decision in
this group recorded on the day its own period ended**; the other five were
overdue, and `CHANGELOG.md` says what that cost.

One comment was posted, on 2026-10-23, by the author: the prototype and the
repeated corpus run that *Unresolved questions* 3 asked for before the decision.
It is reported below rather than taken on trust.

### Why this outcome

§1.2.4 L1 requires that lifting the canonical projection of a tree yields that
same tree, and §2.4 said lift cannot produce a tree that is not well-formed.
**Both sentences were false of documents §1.2.3 accepted** — not in one place but
in a family, and the family kept growing: [#55](https://github.com/mindmapmarkdown/spec/issues/55),
[#56](https://github.com/mindmapmarkdown/spec/issues/56),
[#59](https://github.com/mindmapmarkdown/spec/issues/59),
[#61](https://github.com/mindmapmarkdown/spec/issues/61),
[#64](https://github.com/mindmapmarkdown/spec/issues/64),
[#71](https://github.com/mindmapmarkdown/spec/issues/71),
[#74](https://github.com/mindmapmarkdown/spec/issues/74), then
[#81](https://github.com/mindmapmarkdown/spec/issues/81) to
[#84](https://github.com/mindmapmarkdown/spec/issues/84) when the sweep's random
numbers were fixed. Each new member was answered by a rule about where a
character goes, and each answer left the next member standing.

This RFC stops answering members. It makes the two sentences true by
construction: a document whose tree is not well-formed is not a conforming
document, so lift is never asked about it, and L1 is a statement about the
documents that remain. Every later answer to a member then **widens** what
conforms, which is Normative — where answering them one at a time before a
release made each next answer Breaking.

That is the argument the release decision of 2026-10-15 already made, and this
decision is the point at which it either holds or does not. It holds.

### Measured

`tools/sweep.mjs`, 20,000 generated documents per seed, the same branch with and
without the change:

| | 1234567 | 20261005 | 7 |
|---|---|---|---|
| not conforming, without | 792 | 773 | 744 |
| not well-formed, without | 1559 | 1571 | 1525 |
| **not conforming, with** | **2351** | **2344** | **2269** |
| **not well-formed, with** | **0** | **0** | **0** |

792 + 1559 = 2351. 773 + 1571 = 2344. 744 + 1525 = 2269. **Every ill-formed tree
becomes a non-conforming document and nothing else moves**, on every seed,
exactly. That is the claim *Round-trip consequence* makes, and the equality is
what distinguishes this rule from one that also turns away something else.

`tools/corpus.mjs` over 770 real `.md` files, 8.4 MB — every one in
`easymindmap` including `node_modules`, plus this repository and `mindmapmd`:

```
770 files · 8.4 MB · 0 refused · 0 ill-formed · 0 with no canonical projection · 0 failed the round trip
```

**It turns away no real document.** The figure was re-run on 2026-10-29, on
`rfc/0057p1-on-0085` at `6c26411` — the configuration that now lands, RFC 0057
Part 1 included — and again on `rfc/0085-on-accepted` at `30f9cbb` without it.
Both are zero.

`lift` now runs the `S-7` check on every call: a projection and a second raw
lift. On `spec.md`, 50 KB, 32 ms becomes 39 ms — **1.2×**, which is what *Cost,
bounds, and decidability* argued was affordable.

Prototype: [mindmapmd#21](https://github.com/mindmapmarkdown/mindmapmd/pull/21),
on `rfc/0085-on-accepted`. The import cycle between `lift.js` and
`wellformed.js` is deliberate and is described there.

### What this rule now carries that the RFC did not claim

**[#56](https://github.com/mindmapmarkdown/spec/issues/56).** RFC 0058 ([#58](https://github.com/mindmapmarkdown/spec/pull/58)) was **rejected today**, and its own
*Alternatives* section named this rule as the answer *"if a member of this family
is ever found that no spelling can write back"*. #84 part 1 is that member. So
this rule answers #56 as well, by refusing two documents rather than giving them
a spelling, and 0058's decision records the measurement on both sides. Measured
on `rfc/0085-on-accepted`:

| Document | Result |
|---|---|
| `[x]: /x` ⏎ `1.` | not conforming |
| `[x]: /x` ⏎ `2. a` | not conforming |
| `1) [x]:x` ⏎ `␣␣␣2)` — #84 part 1 | not conforming |
| `[x]:x` ⏎ ⏎ `[y]:>` ⏎ `-` — #84 part 2 | conforms, round-trips |

The last row is the one to notice: this rule turns away the three documents that
have no canonical form and leaves alone the one that works. A rule that answered
#56 by spelling could not do that, which is why 0058 was rejected.

**The dependency on RFC 0057 Part 1 is gone.** *Interaction with open proposals*
said the 0.1.0 corpus figure depends on Part 1 landing, because the wrapped-label
shape is 5.6% of the corpus. RFC 0067 ([#67](https://github.com/mindmapmarkdown/spec/pull/67)) answers that
shape instead — a wrapped label folds to one line — so this rule never needed the
rule that was under objection. Part 1 is accepted today on its own merits, and
the corpus figure above is zero with it and without it.

### What this does not settle

*Unresolved questions* 1 — a way for the conformance suite to state that a
document is **not** conforming — matters more now than when it was written. The
set the suite cannot express is now exactly the set this rule defines. `S-1` has
the same gap today, which is why this does not block, but the gap is wider and
whoever writes the suite should treat it as the first thing to fix.

[#89](https://github.com/mindmapmarkdown/spec/issues/89) — `spec.md` says nothing
about line endings, and 24% of the corpus carries a carriage return — was filed
on 2026-10-23 while this period was open. It is Normative and needs an RFC of its
own. It does not bear on this rule: a CRLF document is conforming either way.
Every figure above includes the one-line normalisation on `fix/crlf`, without
which the corpus cannot be measured at all under RFC 0067.

### Where it lands

`spec.md` §1.2.3 gains the third condition, §2.4's informative note gains the
paragraph saying lift refuses such a document, and **`S-7` lands with it** —
deferred past 0.1.0 on 2026-10-02 and now the rule the third condition is stated
over. `CHANGELOG.md` drops the 2026-10-15 row and moves
[#56](https://github.com/mindmapmarkdown/spec/issues/56),
[#81](https://github.com/mindmapmarkdown/spec/issues/81) to
[#84](https://github.com/mindmapmarkdown/spec/issues/84) out of *Open before
0.1.0*: each is a document with no tree, which this rule makes a statement about
conformance rather than a hole in the rules.

