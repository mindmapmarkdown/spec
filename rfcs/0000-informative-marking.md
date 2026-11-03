# RFC 0000: The *(Informative)* marking does not reach the prose it was written for

**Translations** — [한국어](ko/0000-informative-marking.md). This English text is
the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-11-03 |
| **Comment period ends** | 2026-11-17 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/0000> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

§1.2.2 says a paragraph-level *(Informative)* marking "covers that paragraph
alone". The specification does not write its informative prose that way: sixteen
paragraph-level markings are each followed by further paragraphs of the same
rationale, and a literal reading makes **42 blocks** of explanation normative
text. This RFC keeps §1.2.2's sentence as it stands and fixes the document to
match it, by marking every informative paragraph, converting the two longest
runs into informative subsections, and adding a check that keeps the two from
drifting apart again.

## Motivation

### What goes wrong today

§1.2.2 states the rule:

> Everything in this document is normative except material explicitly marked
> *(Informative)*. The marking appears either on a heading, where it covers that
> section and everything beneath it, or at the start of a paragraph, where it
> covers that paragraph alone.

The heading form works and is used twice, at §1.1.3 and §1.5. The paragraph form
is used sixteen times, and **not once** does the informative material stop at the
end of the marked paragraph. §2.4 is the clearest case:

```
*(Informative)* **This is how S-1 has always worked.** `- a` followed by
`␣␣# h` is valid CommonMark and lifts, under L-1 and L-2, to a section inside an
item. No conforming document can denote that tree, …

A document this turns away is still valid Markdown. L0 is untouched: every
renderer, editor, and diff tool reads it exactly as before. …

S-5 and S-6 are what makes a numbering restart survive. …
```

Ten further paragraphs follow that marking before the next rule. Read literally,
the first is informative and the other ten are requirements.

### How far it reaches

Measured over `spec.md` at [`1a47604`](https://github.com/mindmapmarkdown/spec/commit/1a47604bb2e28304802d49f79d067d61beb5b150),
by splitting the file into blocks and taking each paragraph-level marking's run
to end at the next heading, fenced example, list, or paragraph opening with bold
text:

| | |
|---|---|
| Paragraph-level markings | **16**, in eight sections |
| Markings whose run is more than the marked paragraph | **16 of 16** |
| Blocks a literal reading makes normative | **42** |
| Of those, blocks containing an RFC 2119 keyword | **0** |

The sections are §1.2.4 (2 markings), §2.1, §2.2 (2), §2.3, §2.4 (2), §2.5 (2),
§2.6 (5) and §2.7. The longest runs are §2.4 with ten trailing blocks, §2.5 with
nine, and §2.2 with five.

**The last row is the measure of how bad this is, and it is good news.** Not one
of the 42 blocks states a requirement in BCP 14 terms. No MUST, SHOULD or MAY is
sitting in prose that was meant to be explanation, so no implementer can read an
obligation out of this that the specification did not intend to impose. The
harm is narrower, and of two kinds.

First, the 42 blocks are rationale, history, measurement and worked reasoning —
*why* a rule exists, what was considered and rejected, what a number was measured
at. Normative text must be true of every conforming implementation. Explanatory
prose is written to a looser standard than that: it simplifies, it describes the
common case, it argues. Binding it is a promise the text was not drafted to keep.

Second, `GOVERNANCE.md` §3 ties process to class, and class to effect on
conformant implementations. While that prose is normative, correcting a sentence
of rationale is a Normative change needing an RFC and fourteen days. That is a
standing tax on exactly the material that should be cheapest to improve.

### Who hits it

A reader deciding what they must implement, and a maintainer deciding what
process a change needs. Neither is served by a rule the document does not follow.

### What happens if nothing is done

0.1.0 is tagged with 42 blocks of explanation in its normative surface. After the
tag, moving them out is a change to what the released version requires, which is
a heavier class than it is today. **This is cheaper before the tag than after,
and that is the only reason it is urgent.**

## Detailed design

### 1. §1.2.2 is not changed

The sentence is already unambiguous. The defect is that the document does not
obey it. Changing the rule to cover runs was the first design tried and it does
not survive contact with the text — see *Alternatives*.

### 2. Every informative paragraph carries the marking

Each of the 42 blocks that is informative gains its own *(Informative)* at the
start, in the form §1.2.2 already defines. No new syntax, and each paragraph
states its own status, so no reader has to infer where a run ended.

Where a paragraph is a table or a code sample rather than prose, the marking goes
on the paragraph that introduces it, and the run becomes a subsection instead —
see 3.

### 3. The two longest runs become informative subsections

§2.4's ten-block run and §2.5's nine-block run are converted to subsections
carrying a heading-level marking, which covers the section and everything beneath
it. Ten repetitions of *(Informative)* down a page is worse to read than one
heading that says the same thing once. The heading form is the mechanism §1.2.2
already provides and §1.1.3 and §1.5 already use.

This is a presentational change to prose that is informative either way. It adds
no requirement and removes none.

### 4. A check, so the two cannot drift apart again

`tools/` gains a check, run in CI beside `extract-examples --check` and
`check-links`, that fails when a paragraph following a paragraph-level
*(Informative)* marking is itself unmarked and is not a heading, a fenced block,
a list, or a rule.

The check is deliberately conservative: it reports a candidate, and a paragraph
that really is normative is made to say so by rewriting it as a rule or by moving
it above the marking. It cannot be made exact, for the reason given under
*Alternatives*, so it is a prompt to a human rather than an oracle.

## Alternatives

### Change §1.2.2 so a paragraph marking covers a run

The obvious fix: say the marking covers the marked paragraph *and the paragraphs
following it, up to the next heading, fenced example, list, or rule*. It was
tried first and abandoned, because **the terminator cannot be inferred from the
text**. The specification opens both rules and informative emphasis with bold
lead-ins, so no formatting test separates them. Two counterexamples, from the
runs this very RFC is about:

| Block | Would terminate a run | Actually is |
|---|---|---|
| `**Why the two cases differ.**` (§2.6, after E-10) | yes — opens with bold | informative; the explanation of why `E-4`'s number and `E-5`'s differ |
| `**Nothing in L-10 parses the block.**` (§2.2) | yes — opens with bold | informative |

A rule whose boundary is wrong in the document that motivated it is not a rule
worth writing. Marking each paragraph costs 42 markings and is never ambiguous.

### Leave it, and record it as known

Defensible before a release that was not imminent. It is not defensible through a
tag, because the tag is what makes the heavier class apply.

### Declare all prose informative unless it states a BCP 14 keyword

Mechanical and wrong. §2's rules are normative without always using a keyword —
`L-12`'s "An item of an ordered list has an **ordinal** and a **delimiter**" is a
requirement stated as a fact. This alternative would unbind a large part of
Chapter 2.

### Move all informative prose to an appendix

Clean separation, and it would destroy the document. The prose is placed where it
is because it explains the rule beside it; an appendix is read by nobody at the
moment they need it.

## Unresolved questions

1. **Does 3 belong in this RFC?** Converting two runs to subsections is
   presentational and could be a separate editorial pull request. It is here
   because doing 2 without it means ten consecutive *(Informative)* markings in
   §2.4, which is the outcome nobody wants.
2. **Is the class right?** No conformant implementation changes behaviour, which
   reads Clarifying. But §1.2.2 governs which text binds at all, and moving 42
   blocks out of the normative surface changes what a conforming implementation
   must be consistent with, which reads Normative. `GOVERNANCE.md` §3 says a
   disputed class is treated as the more restrictive of the two, so this is filed
   Normative. **If it is Clarifying, the period is three days rather than
   fourteen, and 0.1.0 is not delayed by it.** That question is worth settling
   early in the period rather than at the end of it.
3. **How exact should the check in 4 be?** It cannot be exact. Whether a
   near-miss should fail CI or warn is open.
4. **Are all 42 blocks actually informative?** They were classified by reading.
   Any block that turns out to state a requirement is a finding this RFC wants,
   not an obstacle to it — the whole point is that nobody can presently tell.

## Decision and rationale

<!-- Filled in after the comment period ends, by the person who makes the
     decision. Not written in advance. -->
