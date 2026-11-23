# RFC 0000: A level for the Phase 2 → 3 implementation count

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | `정제영 <ok@baro.pro>` |
| **Created** | 2026-11-24 |
| **Comment period ends** | 2026-12-08 |
| **Discussion** | `<link to the pull request>` |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

[`GOVERNANCE.md` §5](../GOVERNANCE.md#5-phase-transitions)'s Phase 2 → 3 trigger
counts *"≥ 3 independent conformant implementations"* and names no conformance
level. §1.2.4 makes the lowest level free — it places L0's requirement on
documents rather than on software — so that count was satisfied before this
specification was written, and is satisfied today by software whose authors have
never heard of it. This RFC pins the count to **L1 or above**, says in the same
place why L0 cannot stand in, and fixes the sense of **"independent"** by
pointing at the definition [`VERSIONING.md`
§5](../VERSIONING.md#5-what-10-would-mean) condition 3 already carries.

Nothing in [`spec.md`](../spec.md) changes. No conformance requirement moves, no
implementation changes behaviour, and the generated suite is byte-identical. This
is an RFC because [§9](../GOVERNANCE.md#9-amending-this-document) makes every
change to `GOVERNANCE.md` Normative by declaration — not because anything about
conformance moves.

## Motivation

§5 opens by saying what its numbers are for:

> The point of stating these as numbers is that no one — including the current
> maintainer — gets to decide later that the conditions have not been met.

The Phase 2 → 3 row then reads:

> ≥ 3 independent conformant implementations **and** ≥ 2 organizations depending
> on the specification in production

**"Conformant" names no level, and the lowest level costs nothing.** §1.2.4:

> L0 places its requirement on documents, not on software. … Every existing
> Markdown reader, editor, renderer, and diff tool is therefore an L0
> implementation **without modification**.

So the first conjunct is already satisfied, and always was. Three independent
conformant implementations, under the text as it stands, are any three Markdown
editors. None of their authors has read this specification; that is the *point*
of L0 and it is a feature of the level, not a defect. The defect is counting it.

**The trigger that purports to count implementations therefore counts only
organizations.** The two conjuncts are joined by **and**, so no transition is
owed today, because the second conjunct — ≥ 2 organizations depending on the
specification in production — is not met. That is the only thing keeping §5's
*"the transition is opened as an issue within 30 days"* from being owed already.
A conjunction one of whose terms is permanently true is a conjunction with one
term, and the surviving term measures dependence rather than independent
implementation. Those are different evidence, and the foundation question turns
on the second.

**The opposite misreading is equally available**, which is worse. A maintainer
who did not want to open the evaluation could read "conformant" as the highest
level the specification defines — L2 — and L2 is not written. `spec.md`'s own
header says so: *"The operations of §1.2.4 L2 — diff, merge, and subtree
exchange — are not written."* On that reading the trigger is unreachable until
someone chooses to write them, and §5's number becomes a decision the maintainer
makes by what they decline to write.

Both readings live in one table cell. A condition that can be read as
satisfied-since-forever or as never-satisfiable is not a number, and §5 says in
its first sentence that being a number is the whole job.

**What happens if nothing is done.** The second conjunct is eventually met,
someone opens the transition issue, and the project discovers at that moment that
it never agreed what the first conjunct meant — with the foundation question, the
most consequential governance decision the project has, resting on the
disagreement. The time to settle an argument about a threshold is before anyone
has an interest in its outcome.

**Why now, and why separately.** The twin defect in [`VERSIONING.md`
§5](../VERSIONING.md#5-what-10-would-mean) condition 3 — *"at the level each
claims"*, with no floor — was found first and is fixed in
<https://github.com/mindmapmarkdown/spec/pull/116> as a **Clarifying** change
under [§3](../GOVERNANCE.md#3-classes-of-change). This one could not ride along:
§9 makes changes to `GOVERNANCE.md` Normative and requires an RFC, so it gets
one. The two are the same mistake in two documents and should land with the same
answer — which is an argument for this RFC rather than against it, because the
standing warning in this repository is that the same thing stated in two places
will eventually disagree.

## Detailed design

Two changes to [`GOVERNANCE.md` §5](../GOVERNANCE.md#5-phase-transitions).
Nothing else in the repository is touched.

### The table row

The Phase 2 → 3 row becomes — shown as source, because the links in it are
written relative to `GOVERNANCE.md` rather than to this file:

```markdown
| **Phase 2 → 3** | ≥ 3 independent implementations conformant at **L1 or above**, **and** ≥ 2 organizations depending on the specification in production | Transfer to a neutral foundation is formally evaluated and the evaluation is published, whatever its outcome. |
```

The count stays at three. The second conjunct is untouched. The action is
untouched.

### The note below the table

§5 already carries a paragraph under its table fixing the sense of `"External"`
for the Phase 0 → 1 trigger. Two paragraphs join it in the same role — fixing
the terms the table uses, in the one place the table is read:

```markdown
"Independent" has the sense [`VERSIONING.md`
§5](VERSIONING.md#5-what-10-would-mean) condition 3 gives it: written by people
who did not write the specification. An implementation counted here must also
state the level and the release it claims, which §1.2.4 and [`VERSIONING.md`
§4](VERSIONING.md#4-what-a-conformance-claim-cites) already require of any
conformance claim. A count of implementations that have claimed nothing is not a
number, and the first sentence of this section says why that matters.

**L1 or above**, because §1.2.4 places L0's requirement on documents rather than
on software, and says what follows from that: every existing Markdown reader,
editor, renderer, and diff tool is an L0 implementation *without modification*. A
count that admitted L0 was met before this specification was written.
```

### Requirement language

This change states no requirement on an implementation or on a document, so it
carries no RFC 2119 keyword. The template asks for *"the normative requirements,
in RFC 2119 language, written as they would appear in spec.md"*, and the honest
answer is that there are none: the text being changed is a phase trigger in a
governance document, not a rule in the specification. §9's definition of
Normative is *"changes to this document"* — a statement about process, not about
conformance.

### The round-trip consequence

None. Lift, canonical projection, and the mutual-inverse requirement of §1.2.4 L1
are untouched, as is every rule in Chapter 2.

### How it is tested

`tools/check-links.mjs` covers the relative links the new paragraphs add and
fails on a broken anchor, which is the whole of what is mechanically checkable
here. The condition itself is tested by being evaluated: when the second conjunct
is met, the count is taken against published claims that each name a level and a
release, and either three such claims exist or they do not. That is the property
this RFC buys, and it is the property the text does not have today.

`node tools/extract-examples.mjs --check` reports no drift, because `spec.md` is
not touched and the suite is generated from it.

### Interaction with existing text

- **§1.2.4** is cited, not changed. The levels, their requirements, and their
  cumulative ordering all stand.
- **`VERSIONING.md` §5 condition 3** receives the same floor in
  <https://github.com/mindmapmarkdown/spec/pull/116>. If that pull request is
  rejected, this RFC still stands on its own reasoning, but the two documents
  would then disagree about whether L0 counts — a reason to decide them together,
  and the reason this RFC names the dependency rather than assuming it.
- **`VERSIONING.md` §4** is cited for what a conformance claim must name. It is
  not restated here, because a procedure stated in two files is a procedure that
  will disagree with itself.
- **§5's 30-day clause** is untouched, and is why the change matters: it is what
  the trigger fires.

## Alternatives

**Do nothing.** The strongest argument for it is that the trigger is harmless
today, because the second conjunct blocks it. That is exactly the problem — it is
harmless because it is inert. When the second conjunct is met, the first will be
read for the first time by people with an interest in the answer, and both
readings will be available to them. §5's first sentence is a commitment not to
leave the project in that position. Doing nothing also leaves this document
disagreeing with `VERSIONING.md` once PR #116 lands.

**Require L2 instead of L1.** Rejected on two grounds. §1.2.4 L2 is not written,
so the trigger would depend on text that does not exist and could be held shut
indefinitely by not writing it — the same failure as the "highest level"
misreading, made official. And three L2 implementations would be a far higher bar
than 1.0's two at L1, with nothing in §5 or `VERSIONING.md` offering a reason for
the jump. The phase ladder should not be harder to climb than the version it
stands on.

**Say "conformant at the highest level the specification defines".** A
self-updating formula, and attractive for exactly that reason. Rejected because
it silently changes a published trigger's meaning every time a chapter lands: an
implementation that satisfied the trigger in one release could fail it in the
next with no decision having been taken by anyone. §5's numbers exist so that the
condition cannot move under the reader, and a formula that moves on its own is
worse than a number that is wrong, because nobody has to notice.

**Drop the implementation conjunct and keep only the organizations one.** Honest
about the fact that the first conjunct contributes nothing today, and the
smallest possible diff. Rejected because the two conjuncts measure different
things and the foundation question needs both: dependence in production says the
specification is load-bearing, and independent implementation says the
specification is *implementable from its text*. Two organizations could both
depend on the same single implementation, satisfying the surviving conjunct while
demonstrating nothing about the specification — the failure `VERSIONING.md` §5
names in its closing line, *"a specification with one implementation is a
description of that implementation"*, arriving at the foundation stage instead of
at 1.0.

**Raise the count instead of naming a level** — say ≥ 5 rather than ≥ 3.
Rejected: five implementations of nothing is still nothing. The defect is the
unit, not the quantity.

**Define `"independent"` here in full, and have `VERSIONING.md` point at
`GOVERNANCE.md` instead** — reversing the direction of the reference.
Defensible: this is the document where procedure lives, and the roles and the
change classes already work that way. Rejected for this RFC because the
definition is load-bearing in `VERSIONING.md` §5 condition 3, where it is
already written as prose that a reader meets in context, and moving it would
edit a document this RFC otherwise leaves alone. Either direction removes the
duplication, which is the part that matters; if a later RFC rearranges what the
two documents own, the reference moves with it.

**Prior art.** OPML has neither conformance levels nor a phase ladder, so it
offers nothing here. The standards bodies that gate advancement on
implementations all gate on *independent, interoperating* ones rather than on
"conformant" unqualified: the IETF requires, for Internet Standard, at least two
independent interoperating implementations with operational experience, and the
W3C's Candidate Recommendation exit criteria are stated as implementation
experience of the specification's features. Neither could count an
implementation that satisfies a level placed on documents instead of on software,
because neither has such a level. This specification does have one, deliberately
(§1.4.1) — which is exactly why its own counts have to name a floor.

## Unresolved questions

**Blocking — must be answered before the comment period ends.**

Does a claim against an *older release* count? [`VERSIONING.md`
§4](../VERSIONING.md#4-what-a-conformance-claim-cites) requires a conformance
claim to name a level **and a release**: *"Mindmap Markdown 0.1.0, level L1"*. A
Phase 2 → 3 count is taken at a moment in time, and the claims it counts have
dates. If three implementations each claim L1 of `0.3.0` and the current release
is `1.2.0`, has the trigger been met?

Two answers are defensible, and this RFC does not pick one:

- **Any release counts.** Interoperability demonstrated at `0.3.0` was still
  demonstrated, and requiring re-certification on every release would make the
  trigger a treadmill: a MINOR bump could un-meet a met condition, which §5's
  first sentence argues against as strongly as it argues for a floor.
- **The claim must name a release in the current MAJOR.** Three implementations
  of a pre-1.0 specification say little about the one that shipped, and §2 of
  `VERSIONING.md` defines a MAJOR bump as precisely the point where *"documents
  or implementations that conformed no longer do"*.

The author leans to the second, narrowed: **any release within the current
MAJOR** — which under 1.x means any 1.x claim, and makes no demand at all during
0.x, where §3 of `VERSIONING.md` says the number *"identifies a state; it does
not promise stability"* anyway. It is recorded as blocking rather than decided
because it changes what the amended sentence means, and answering it in the
Decision section below is cheaper than amending the amendment later.

**Not blocking.**

Whether the floor should be revisited once L2 becomes testable. [RFC
0110](0110-subtree-exchange.md) would land Chapter 3 and one of L2's three
bullets; diff and merge need an RFC each. When all three are written and the
suite can decide them, a later RFC may argue that a Phase 2 → 3 count should want
L2, on the ground that a foundation transfer is about the hard parts. That
argument cannot be made against text that does not exist, so it is not made here
— and `L1 or above` already lets an L2 implementation count.

Whether the project should keep a register of the conformance claims it counts.
Nothing records them today; [`README.md`](../README.md) mentions `mindmapmd` in
prose and nothing else. The trigger can be evaluated without one, because a
published claim is a public fact, but a register would make the count
reproducible by someone who is not the maintainer — the same argument as §5's
first sentence, one level down. Left to a later pull request, which needs no RFC,
because recording facts changes no condition.

## Decision and rationale
