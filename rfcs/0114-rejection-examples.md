# RFC 0114: Rejection examples

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | `정제영 <ok@baro.pro>` |
| **Created** | 2026-11-18 |
| **Comment period ends** | 2026-12-04 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/114> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

Give the conformance suite two kinds of example whose expected outcome is a
**refusal** rather than a tree — `example non-conforming`, a Markdown document
no tree may be assigned to, and `example not-well-formed`, a tree that must be
rejected and must not be projected — and add the one rule that is missing for
the first of them to be a requirement at all.

The two kinds are not new ideas. They are
[RFC 0043](0043-well-formed-round-trip.md) unresolved question 3 and
[RFC 0085](0085-well-formed-or-not-conforming.md) unresolved question 1, filed
fifteen months and six weeks before this RFC respectively, one for each
direction. RFC 0085's decision says what to do with them:

> `S-1` has the same gap today, which is why this does not block, but the gap is
> wider and **whoever writes the suite should treat it as the first thing to
> fix.**

## Motivation

Eight of this specification's forty-four rules — `S-1` through `S-8` — cannot be
exercised by the conformance suite. The obstacle is the format of the suite, and
for one of the two directions it is also a rule that was never written.

### 1. The suite cannot observe a refusal, measured

Against `examples/examples.json` at `v0.1.1`, every entry run through the
reference implementation:

| | |
|---|---|
| examples | 54 |
| inputs that are **not** conforming documents | **0** |
| trees that are **not** well-formed | **0** |

Every input is a conforming document and every tree is well-formed, so no
assertion in the suite is ever in a position to find out what an implementation
does with input §2.4 turns away. An implementation that omits the §2.4 check
altogether passes the published suite in full, at L1.

What that permits is not a wrong document. Handed this tree — a section under an
item, which `S-1` forbids —

```json
{"content":[],"children":[
  {"kind":"item","label":"a","content":[],"children":[
    {"kind":"section","label":"h","content":[],"children":[]}]}]}
```

an implementation with no check writes, measured:

```markdown
- a
```

The section is **gone**. `S-3` exists for exactly this, in the words *"MUST NOT
project it by coercing the offending nodes to `item`"*, and §2.4.1 gives the
reason: silent coercion *"would produce a document that lifts to a different
tree from the one projected, breaking that requirement in the one place it is
hardest to notice."* Nothing in the suite notices either.

### 2. The document direction has no rule to test

§1.2.3 defines a conforming document and then says:

> What an implementation does with such a document is specified in Chapter 2.

Chapter 2 says it in §2.4, in a paragraph marked *(Informative)*:

> *(Informative)* A document whose tree would not be well-formed is not a
> conforming document (§1.2.3), and lift assigns it no tree.

§1.2.2's test for informative material is that it *"creates no obligation, and
no implementation can be found non-conformant against it."* Every `MUST` about
refusal in the document is `S-3`, whose subject is **a tree**, and §1.2.4 L1's
`MUST` is about *conforming* documents only — it says nothing about the others.

So the promise §1.2.3 makes is kept, normatively, only by reading `S-3` as
reaching a tree that lift has just produced rather than one an implementation
was handed. That reading is available and it is probably the intended one; it is
not what §2.4's surrounding text invites, and an informative sentence is the only
place the narrower reading is corrected. `GOVERNANCE.md` §3 says a disputed class
is *"treated as the more restrictive of the two"*, which is why this RFC is
Normative rather than Clarifying: if the wide reading is right, `L-15` below
changes nothing, and if it is wrong, `L-15` changes what conforms.

An example whose expected outcome is *no tree* needs a rule saying so. That is
the whole of this RFC's normative content.

### 3. §2.4.1's recorded reason is right about the format and not uniform across the rules

The last paragraph of §2.4.1 reads, in part:

> **No example is given for any rule in this section.** The suite is a list of
> documents, and a document these rules turn away has no tree to write down.

That is a recorded reason, and
[`VERSIONING.md` §5](../VERSIONING.md#5-what-10-would-mean) condition 2 accepts
one in place of a test. Measured, it does not hold the same way for all eight.
Of the seven shape rules, **two can be reached by a Markdown document and five
cannot**:

| Rule | A document reaches it? | Why |
|---|---|---|
| `S-1` | **yes** | `- a` then `␣␣# h` lifts, under `L-1` and `L-2`, to a section under an item |
| `S-8` | **yes** | a setext heading carrying a hard break lifts to a section label with a line feed |
| `S-2` | no | a section's depth is nesting (`L-5`) and ATX stops at six, so no document denotes a seventh |
| `S-4` | no | front matter is positional (`L-10`); the same three lines elsewhere are a thematic break and a setext heading |
| `S-5` | no | a restart needs an interrupting block, and `L-3` makes that block the preceding node's content, so a document's tree satisfies `S-5` by construction |
| `S-6` | no | `1000000000.` is a paragraph, not a list marker, so no document crosses the bound |
| `S-7` | no | tried against 31 documents written to provoke it; every one lifted to a well-formed tree |

For five rules the **input cannot be written** in Markdown at all, and the
recorded reason is exactly right. For `S-1` and `S-8` the input can be written —
`- a` / `␣␣# h` is written out in §2.4.1 already, as prose — and the only
obstacle is that the format has no way to write *"and there is no tree."*

That difference is why there are two kinds rather than one, and it is also why
RFC 0043 and RFC 0085 each filed one of them.

### 4. The two kinds do not test the same code

In the reference implementation `S-1` is enforced twice, in two places that
share no line: `lift.js` refuses a heading inside a list item while lifting the
document, and `tree.js` refuses a section with an item ancestor in a tree it is
handed. An implementation can have either without the other, and the published
suite sees no difference. A document case and a tree case are therefore not two
spellings of one test.

### 5. What this is for

Condition 2 of `VERSIONING.md` §5 is met today, by its own letter: the reason is
recorded in §2.4.1. Condition 3 asks for *"two independent implementations
[that] pass, at the level each claims."* Eight rules the suite cannot observe
are eight rules a second implementation can fail while passing — and the failure
mode `S-3` names is a node that disappears with no error. Meeting condition 2's
letter is what would make condition 3's pass mean less than it reads.

## Detailed design

### §2.4 — the rule that is missing

**L-15.** An **L1** implementation MUST NOT assign a tree to a document that is
not a conforming document (§1.2.3).

It lands beside `S-3`, which is the same requirement for the other direction,
and the pair is then complete: `S-3` for a tree an implementation is handed,
`L-15` for a document it is given. How either refusal is reported is outside this
specification (§1.1.2), as RFC 0085 unresolved question 2 already decided —
*"Whether it says why, and how, is product design."*

**`L-15` is scoped to L1 and `S-3` is not, deliberately.** An L0 implementation is
every existing Markdown reader, editor, renderer, and diff tool, *"without
modification"* (§1.2.4). `S-3` never reaches one, because an L0 implementation
is never handed a tree. An unscoped `L-15` would reach all of them and require a
renderer to refuse to render — which fails L0, and §1.2.4 says a proposed
requirement that fails L0 *"fails §1.4.1 with it."* The asymmetry is the scoping
that keeps the rule inside L0's promise.

### §2.6 — the two kinds of example

A rejection example is a fenced block whose info string is `example` followed by
one of two names, with the same `.` separator the existing examples use:

````markdown
````example non-conforming
- a

  # h
.
S-1
````
````

````markdown
````example not-well-formed
{"content":[],"children":[
  {"kind":"item","label":"a","content":[],"children":[
    {"kind":"section","label":"h","content":[],"children":[]}]}]}
.
S-1
````
````

Before the separator is the input — a Markdown document, or a tree encoded
exactly as `E-1` to `E-9` already say. After it are the rule labels the case is
written for, one per line.

**No new `E-rule` is proposed, and that is a choice rather than an omission.**
§2.6's rules are about the tree encoding, and the `not-well-formed` kind reuses
them unchanged; what is new is which trees appear and what is expected of them,
and the expectation is `S-3` and `L-15`. The example *syntax* — the `example`
info string, the `.` separator, the `→` and `␣` conventions — has never been
normative in `spec.md` for the existing kind either; it lives in
`tools/extract-examples.mjs` and [`CONTRIBUTING.md` §6](../CONTRIBUTING.md).
Making the new kinds normative while the old one is not would put the suite's
own format in two registers. Whether **all** of it should become normative is
unresolved question 2.

**The rule labels are a record, not a requirement.** An implementation satisfies
the case by refusing the input; it may report any rule, or none. The measurement
behind that is in the case table below.

### Where the cases go

In §2.4, beside the rules they are written for.
[`CONTRIBUTING.md` §6](../CONTRIBUTING.md) states the arrangement this suite
depends on — examples are *"written inline in spec.md, next to the rule they
demonstrate"* — and §2.6 holds the examples that are about the encoding. A case
for `S-5` belongs beside `S-5`.

### The cases proposed

Eleven. Each was run against the reference implementation, which refuses every
one and names the rule in the first column, except the last row.

| Rule | Kind | Case |
|---|---|---|
| `S-1` | non-conforming | `- a` then `␣␣# h` |
| `S-8` | non-conforming | a setext heading whose first line ends in two spaces |
| `S-1` | not-well-formed | a section under an item |
| `S-2` | not-well-formed | a section at depth 7 |
| `S-4` | not-well-formed | a `front_matter` entry that is not the root's first |
| `S-5` | not-well-formed | a restart whose preceding node has no content |
| `S-6` | not-well-formed | an `ordinal` with no `delimiter` |
| `S-6` | not-well-formed | a list beginning at `1000000000` |
| `S-7` | not-well-formed | an item labelled `1. Install` |
| `S-7` | not-well-formed | an item labelled `---` |
| `S-8` | not-well-formed | a section label holding a line feed — refused, reported as `S-7` |

`S-3` and `L-15` need no case of their own. They are the rules that say *refuse*,
so every row above tests one of them; a case for `S-3` alone would be a case
with nothing in it.

The last row is why the labels are a record. §2.4 says *"`S-7` is read only for
a tree that satisfies the other six"*, and `S-8` is one of the six, yet the
reference implementation reads `S-7` for that tree and reports it — a correct
verdict reached through the wrong rule. Requiring the label would make that
refusal non-conformant. See unresolved question 3.

### How it is extracted

`tools/extract-examples.mjs` already reserves the door, and says why:

> unrecognised example flavour. Only a bare `example` info string is defined; if
> the specification needs another kind of example, the format has to be
> specified before it can be extracted.

The cases extract to a **new top-level `rejections` array**, beside `examples`,
each entry carrying `rejection` — its own counter — `section`, `heading`,
`start_line`, `end_line`, `kind` (`document` or `tree`), one of `markdown` or
`tree`, and `rules`.

A separate array and a separate counter, for two measured reasons.
`conformance.test.js` reads `e.markdown` and `e.tree` from every entry of
`suite.examples`, and three of its four test groups throw on an entry that has
neither; §1.4.1 makes backward compatibility *"a requirement, not a courtesy"*,
and a consumer that ignores an unknown top-level key keeps passing. The counter
is separate because every test in that file is named from `e.example`, so a
shared counter would rename tests in every downstream suite each time a case was
inserted above them.

### How it is tested

Two groups, which the reference implementation gains with the suite:

- for each `kind: "document"` entry, lifting the Markdown must not yield a tree;
- for each `kind: "tree"` entry, the tree must be rejected, and projection must
  not be attempted on it.

And one coverage record, printed rather than asserted, in the shape
`conformance.test.js` already uses for canonical examples: how many of §2.4's
nine rules have at least one case. That number is what
`VERSIONING.md` §5 condition 2 is asking about, and it belongs where it can be
read off a test run.

### §2.4.1 — the paragraph this replaces

The paragraph beginning *"**No example is given for any rule in this
section.**"* becomes false when the first case lands. It is replaced by what the
measurement in Motivation §3 found: that five of the eight cannot be reached by
any Markdown input, that `S-1` and `S-8` can, and that both directions are now
written as cases whose expected outcome is a refusal. Its closing clause —
*"these rules are decidable — one projection, one lift, and one `E-7`
comparison — without the suite being able to state a case"* — keeps its first
half and loses its second.

### What does not change

No rule of §2.4 changes, and no document's conformance changes. An
implementation that today refuses what §2.4 turns away alters nothing; what
changes is that the suite can tell whether it does.

## Alternatives

### One kind, with the input sniffed as JSON or Markdown

Rejected, and not on taste. A tree encoding is JSON, and a Markdown document may
also be JSON: measured, the text

```
{"content":[],"children":[]}
```

is at once a well-formed tree and a conforming document — a root whose content
is one paragraph with that source. A single kind would have to guess which test
was meant, which is the undecidable conformance §1.4.3 forbids, in the one file
whose purpose is to remove ambiguity.

### Rejection cases as entries in the existing `examples` array

Rejected on §1.4.1, measured above: every existing consumer reads `markdown` and
`tree` from every entry of that array.

### Require the implementation to name the rule

Rejected on the measurement in the last row of the case table, and on RFC 0085
unresolved question 2, which already placed the wording of a refusal outside
this specification. Requiring the label would make a correct refusal
non-conformant and turn the suite into a test of diagnostics — a quality of an
implementation, not of its conformance.

### Add `L-15` without the examples, or the examples without `L-15`

Both rejected, for the same reason in opposite directions. `L-15` alone restates
in normative form what §2.4's informative note already says, and nothing would
test it — which is how the gap arose. The examples alone would give the
`non-conforming` kind no requirement to assert against: an implementation could
assign a tree to `- a` / `␣␣# h` and point out, correctly, that no `MUST`
forbids it.

### Leave it, and keep the recorded reason

What `VERSIONING.md` §5 condition 2 permits, and the reason is already written.
Rejected on Motivation §5.

## Unresolved questions

**Resolved during the comment period**, 2026-11-20, by the maintainer, who is
required to write down why (`GOVERNANCE.md` §4); the amendment is
<https://github.com/mindmapmarkdown/spec/pull/115>. One answer renames a rule, so
the period is re-run from this revision and now ends **2026-12-04**, on the
precedent [RFC 0093](0093-informative-marking.md) set — a period has to cover
the text as it stands. §2 says labels *"are stable and may be cited"*, so the
name a second implementation will cite is published for a full fourteen days
rather than for eleven.

1. **`non-conforming` and `not-well-formed`, as proposed.** Measured: `invalid`
   appears **nowhere** in `spec.md`. `conforming document` is defined in §1.2.3
   and `well-formed` in §2.4, so the proposed names send the reader of a failing
   case to a definition, while `invalid-document` would send them to a word this
   specification does not use. The length is paid once per case by a human
   reading it, and by no parser.
2. **No — the suite's format does not become normative, and it does get
   specified.** Three grounds. *Scope*: `spec.md` specifies `md ↔ tree`, and the
   file the suite ships in is neither. *Cost*: by `GOVERNANCE.md` §3 a normative
   format makes every new example kind a Normative change and every change to
   the format Breaking, and this RFC expects the suite to grow and names a third
   and fourth kind as wanted (question 5). *And the need behind the question is
   not met by making it normative* — it is met by writing it down, which
   measurement says nothing does today: `examples/` holds `examples.json` and
   nothing else, and `CONTRIBUTING.md` §6 documents the contributor's workflow
   while specifying neither the fence, the info string, the `.` separator, nor
   the shape of `examples.json` itself.

   So this answer accepts an obligation in place of the one it declines.
   `examples/README.md` specifies the artifact a consumer reads — the top-level
   members, both arrays, every kind, and the separator — is versioned with the
   suite, and moves to the `conformance` repository when that exists. It lands
   with this RFC, not before. `E-1` to `E-10` keep the one part of the format
   that *is* about `md ↔ tree`: the tree encoding.
3. **`L-15`, not `S-9`.** The same sentence of §2 that decides
   [RFC 0110](0110-subtree-exchange.md)'s label question decides this one: **S**
   is *"for the trees lift can produce."* Every S-rule's subject is a tree or a
   node, `S-3`'s included — *"a tree that is not well-formed."* This rule's
   subject is a **document**, and what it requires is that lift produce **no**
   tree for it; there is no tree here for an S-rule to govern. The rules whose
   subject is a document are L-rules — `L-8`, *"Lift MUST be a function of the
   document text alone"*, and `L-10`, *"If a document's first line…"* — and this
   one is the exact dual of §1.2.4 L1's *"MUST lift every conforming document"*,
   which is a statement about lift. Deciding `X-n` on that convention and `S-9`
   against it would have been two principles, used once each.

   The label is not the placement. `L-5`, `L-6` and `L-7` are printed in §2.3,
   far from `L-1` to `L-4`, so a family is not confined to one section. `L-15`
   is printed in §2.4 immediately before `S-3`, where the pair reads as one
   thing, and §2.4.1's informative *"lift assigns it no tree"* is rewritten to
   cite `L-15` rather than to assert it. The free labels left are `S-9`, `P-13`
   and `E-11`.

**Deliberately left to a later RFC.**

4. **`S-7`'s reading order.** §2.4 says `S-7` is read only for a tree that
   satisfies the other six. Read as a definition of the predicate, the reference
   implementation's report is a diagnostic choice and conformant; read as a
   requirement on behaviour, it is not. This RFC takes the first reading. Which
   one the document means is worth stating, and is not this RFC's to state.
5. **An example kind that carries more than one tree.** Named as deferred by
   RFC 0110 unresolved question 5 and by
   [`docs/l2-correspondence.md`](../docs/l2-correspondence.md) §7, and not
   provided here. This RFC's contribution to it is the spelling: a kind is
   `example <name>`, which leaves the room a third and fourth will need.
6. **Whether projection deserves positive cases of its own.** A tree that must
   not be projected is covered. Whether the suite should also carry well-formed
   trees with their canonical document pinned — projection's positive direction,
   currently derived in `conformance.test.js` rather than stated in the suite —
   is a separate and larger question.

**What implementation experience is expected to teach us.** Whether eleven cases
is the right number. One per rule is the floor condition 2 asks for, and `S-6`
has five clauses of which the table tests two. The cases are cheap, and the
argument for more of them is the argument for the suite, so the expectation is
that this grows rather than that it is finished.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
