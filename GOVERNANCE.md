# Governance

- Status: **Phase 0 — single maintainer**
- Last updated: 2026-07-26

This document describes how decisions are made in Mindmap Markdown, who makes them,
and — most importantly — what happens when the people currently making them stop.

## Why this document exists at all

Mindmap Markdown exists partly because OPML stalled. Its specification was frozen for years
under single ownership with no mechanism for succession, and the project had no way to
continue without its original author.

It would be dishonest to point that out and then repeat it silently. This project is currently
maintained by one person. That is a real risk, not a temporary detail, and the sections below
state plainly what protects against it today and what will replace those protections later.

---

## 1. Current state

| | |
|---|---|
| Phase | 0 |
| Maintainers | 1 |
| Committers | 0 |
| Decision model | Maintainer decides, in public |

Every decision — including rejected ones — is recorded in an issue, a pull request, or an RFC.
There is no private channel in which specification decisions are made. If a decision is not
visible in this repository, it has not been made.

## 2. Roles

**Contributor** — anyone who opens an issue, comments, or submits a pull request.
No prior permission is required, and no agreement beyond the DCO sign-off.

**Committer** — may review and merge pull requests within an agreed area.
Does not exist yet; see §5 for how the role is introduced and §6 for how it is earned.

**Maintainer** — administers the repository and has final say on normative changes.
Currently one person.

**TSC (Technical Steering Committee)** — does not exist yet. See §5.

## 3. Classes of change

Not every change deserves the same process. The class is determined by its effect on
conformant implementations, not by the size of the diff.

| Class | Definition | Process |
|---|---|---|
| **Editorial** | Typos, formatting, examples that add no new requirement | One review, merge |
| **Clarifying** | Makes existing intent explicit; no conformant implementation changes behaviour | 3-day comment period |
| **Normative** | Changes what conforms | **RFC required**, 14-day comment period |
| **Breaking** | Invalidates documents or implementations that previously conformed | RFC + major version + migration guide |

When the class is disputed, it is treated as the more restrictive of the two.

## 4. Decision-making

**Lazy consensus.** A proposal with no unresolved objection after its comment period is accepted.
Silence is assent. This keeps the project moving while it is small.

**RFCs.** Normative and breaking changes require an RFC in `rfcs/`, following
`rfcs/0000-template.md`. An RFC records the problem, the proposed change, alternatives that
were considered, and — after the comment period — the decision and its reasoning.
Rejected RFCs are merged too, with status `Rejected`. **A specification that only records its
accepted ideas cannot be argued with later.**

**Objections.** A technical objection must state what would resolve it. "I disagree" pauses
nothing; "this breaks round-trip for case X" pauses everything until case X is answered.

**Deadlock.** In Phase 0 the maintainer decides and must write down why. In later phases,
see §5.

## 5. Phase transitions

The point of stating these as numbers is that no one — including the current maintainer —
gets to decide later that the conditions have not been met.

| | Trigger | What changes |
|---|---|---|
| **Phase 0 → 1** | ≥ 3 external contributors with merged pull requests **and** ≥ 3 tagged releases | Committer role introduced. Merge rights extended beyond the maintainer. |
| **Phase 1 → 2** | ≥ 2 committers affiliated with ≥ 2 distinct organizations | TSC formed. Normative decisions move from the maintainer to a TSC majority. |
| **Phase 2 → 3** | ≥ 3 independent conformant implementations **and** ≥ 2 organizations depending on the specification in production | Transfer to a neutral foundation is formally evaluated and the evaluation is published, whatever its outcome. |

"External" means not employed by, contracted to, or otherwise directed by the organization
that currently maintains the project.

When a trigger is met, the transition is opened as an issue within 30 days.

## 6. Becoming a committer

Once Phase 1 begins: five merged non-trivial pull requests, or one accepted RFC.
Nomination by a maintainer, then seven days for objection from existing committers.

Sustained review work counts. Reviewing other people's proposals carefully is harder and
rarer than writing one's own, and it is the thing this project will need most.

## 7. Continuity and succession

**This is the section OPML did not have.**

At Phase 0, no governance document can honestly promise institutional continuity — there is
one person. What actually protects the project today is not governance but three concrete
properties:

1. **The licences permit continuation without permission.** The specification is CC-BY-4.0 and
   the code is Apache-2.0. Anyone may fork, republish, translate, or continue this work.
   No one needs to negotiate with the maintainer to keep it alive.
2. **Nothing required to continue is private.** No unpublished drafts, no undocumented
   rationale, no decisions made off-repository.
3. **Dormancy is declared, not discovered.** See below.

**Dormancy.** If the maintainer does not respond to issues or pull requests for **90 days**,
any contributor may open a dormancy issue. If there is still no response **30 days** after that,
the project is declared dormant and a notice is added to this document and the README.

**Succession.** On dormancy, the maintainer's standing intention — recorded here in advance —
is that stewardship should pass to whoever is actively continuing the work, and that the
GitHub organization and domains should be transferred to a willing successor or to a neutral
foundation rather than left idle. Contributors do not need to wait for that transfer to
continue the work; see (1).

**Bus factor.** Reducing this from one is a priority, not an aspiration. A second maintainer
will be added when a suitable person is willing, and this document will be updated to say so.

## 8. Code of conduct

Enforcement follows `CODE_OF_CONDUCT.md`. Reports go to `security@mindmapmarkdown.org`
for now; when Phase 1 begins, a separate address with more than one recipient will replace it.

## 9. Amending this document

Changes to this document are **normative** (§3) and require an RFC.

The phase triggers in §5 may not be raised. They may be lowered, if the project decides to
distribute authority sooner than planned.

## 10. Contact

- Specification and general questions — `spec@mindmapmarkdown.org`
- Security and conduct — `security@mindmapmarkdown.org`
