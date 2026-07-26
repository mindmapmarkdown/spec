<!--
================================================================================
  Mindmap Markdown RFC template

  Copy this file to `rfcs/0000-my-proposal.md` and fill it in. Leave the number
  as 0000 — it is assigned from the pull request number when the RFC is merged,
  at which point the file is renamed and any links are updated.

  An RFC is required for Normative and Breaking changes, per GOVERNANCE.md §3.
  Editorial and Clarifying changes do not need one; open a pull request.

  WRITE THE FIRST SIX SECTIONS BEFORE OPENING THE PULL REQUEST.
  "Decision and rationale" is filled in AFTER the comment period, by the person
  who makes the decision — not by the author in advance.

  REJECTED RFCs ARE MERGED TOO, with Status: Rejected and the reasoning recorded
  below. This is deliberate and is stated in GOVERNANCE.md §4: a specification
  that only records its accepted ideas cannot be argued with later. Do not
  delete or close a rejected RFC — the record of why an idea was turned down is
  worth as much as the record of why one was taken up, and is what stops the
  same proposal arriving every year with no answer waiting for it.

  This document is prose and is licensed CC-BY-4.0 (see LICENSE, `rfcs/**`).
================================================================================
-->

# RFC 0000: `<title>`

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative <!-- or Breaking; see GOVERNANCE.md §3 --> |
| **Author(s)** | `Name <email>` or `@handle` |
| **Created** | YYYY-MM-DD |
| **Comment period ends** | YYYY-MM-DD <!-- length is set by the class; see GOVERNANCE.md §3 --> |
| **Discussion** | `<link to the pull request or issue>` |
| **Supersedes** | `<RFC number>`, or — |
| **Superseded by** | — <!-- filled in only if this RFC is later replaced --> |

<!--
  Status is one of exactly four values. Nothing else is valid:

    Draft       Open for comment, or written and not yet decided. Every RFC
                starts here.
    Accepted    The proposal stands. The specification change may land.
    Rejected    The proposal will not be adopted. THE RFC IS STILL MERGED.
    Superseded  Was Accepted, and a later RFC has replaced it. Fill in
                "Superseded by" and leave the original text untouched — the
                superseding RFC is where the new position is argued.

  A Draft that is abandoned by its author is closed as Rejected with a
  one-line rationale saying so, rather than being deleted.

  Status changes only when the decision is recorded below. Editing this field
  without writing the corresponding rationale leaves no trace of who decided
  what, which is the failure this whole process exists to prevent.
-->

## Summary

<!-- One paragraph. What changes, stated so that someone who reads only this
     paragraph knows whether the rest concerns them. No motivation, no design
     detail — just the change. -->

## Motivation

<!-- The problem, before the solution. GOVERNANCE.md §4 requires an RFC to
     record the problem it addresses.

     - What breaks, or cannot be expressed, today? Show it. A concrete document
       or implementation that goes wrong is worth several paragraphs of
       description.
     - Who hits it — authors, implementers, or models consuming the output?
     - What happens if nothing is done?

     If the honest answer is "the current design is merely inelegant", say so.
     That is a real motivation and it is sometimes sufficient; dressing it up as
     a defect is what gets a proposal rejected on inspection. -->

## Detailed design

<!-- The proposal, in enough detail that an independent implementer could build
     it from this section alone and arrive at the same behaviour as everyone
     else.

     Include:
     - The normative requirements, in RFC 2119 language (MUST / SHOULD / MAY),
       written as they would appear in spec.md.
     - Worked examples: input, and the exact expected output. Once accepted,
       normative examples live inline in spec.md and examples.json is
       regenerated from them — see CONTRIBUTING.md §6. Never hand-write
       examples.json.
     - Interaction with existing requirements, named by section.
     - The round-trip consequence. This format's central promise is that a
       document survives the trip out and back; state explicitly what this
       change does to it, even if the answer is "nothing".
     - Edge cases, and what a conformant implementation does with malformed or
       hostile input. If the requirement handles untrusted input, say where the
       bounds are — an unbounded requirement is a security finding waiting to
       happen (SECURITY.md §2.2).
     - How it is tested. A normative requirement whose test cannot be described
       is a preference.

     For a Breaking change, GOVERNANCE.md §3 also requires a major version bump
     and a migration guide. Sketch the migration here and link the guide when
     it exists: what previously-conformant documents or implementations stop
     conforming, and what their authors have to do. -->

## Alternatives

<!-- GOVERNANCE.md §4 requires an RFC to record the alternatives that were
     considered. This section is not a formality — it is the part a reader in
     three years will actually need, because the question then is never "what
     did we do" but "why not the other thing".

     For each alternative: what it was, and the specific reason it was not
     chosen. Include:
     - Doing nothing. Always a candidate; say why it loses.
     - The approach a reasonable person would reach for first, if it is not
       this one.
     - Prior art — OPML, markmap, JSON Canvas, and other formats that met this
       problem. Interoperating is preferred to competing, so an approach that
       an existing format already settled deserves an explicit answer.

     An alternative dismissed in a clause ("rejected as too complex") has not
     been recorded, it has been waved at. -->

## Unresolved questions

<!-- What this RFC deliberately does not settle.

     - Questions to resolve before the comment period ends — these block
       acceptance.
     - Questions deliberately left to a later RFC — these do not block it, and
       naming them here is what keeps the scope honest.
     - What implementation experience is expected to teach us.

     "None" is a legitimate answer and is more credible on a small proposal
     than on a large one. -->

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED.

     Filled in by whoever makes the decision — at Phase 0, the maintainer, who
     is required by GOVERNANCE.md §4 to write down why. Then update Status
     above to match.

     Record:
     - The outcome: Accepted, Rejected, or Superseded.
     - The date, and whether it was reached by lazy consensus (the comment
       period passed with no unresolved objection — silence is assent) or by a
       maintainer decision over a live disagreement.
     - The reasoning. Not a summary of the proposal — the reason this outcome
       and not the other one.
     - Every substantive objection raised, and how it was resolved or why it
       was overridden. Per GOVERNANCE.md §4 a technical objection must state
       what would resolve it; if one was answered, say what answered it.
     - For a rejection: what would have to be different for this to be
       reconsidered. This is the most valuable line in a rejected RFC, and it
       is the reason rejected RFCs are merged rather than discarded.
     - For an acceptance: what lands, where, and what still has to happen —
       spec.md sections, regenerated examples.json, conformance tests, and for
       a Breaking change the version bump and migration guide.
-->

---

<!--
  Checklist before opening the pull request:

    [ ] Filename is rfcs/0000-<short-kebab-title>.md
    [ ] Status is Draft
    [ ] Class named, and it matches GOVERNANCE.md §3 (when disputed, the more
        restrictive class applies)
    [ ] Comment period end date set, using the length GOVERNANCE.md §3 gives
        for this class
    [ ] Summary, Motivation, Detailed design, Alternatives, and Unresolved
        questions are filled in
    [ ] Decision and rationale left EMPTY
    [ ] Breaking change: migration guide sketched and version impact stated
    [ ] Commits signed off — git commit -s (CONTRIBUTING.md §5)
-->
