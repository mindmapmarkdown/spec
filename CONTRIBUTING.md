# Contributing

Thank you for considering a contribution. This specification is at its earliest
and most changeable stage, which is the most useful moment to disagree with it.

This document covers the mechanics: how to set up, how to branch, how to sign
off, and what a reviewable pull request looks like. It deliberately does **not**
restate how decisions are made — that lives in
[`GOVERNANCE.md`](GOVERNANCE.md), and is referenced rather than copied.

---

## 1. Before you write anything

| You want to | Start with |
|---|---|
| Ask whether something is intended | An issue, or Discussions |
| Report a defect in the specification text | An issue |
| Report a security or safety problem | [`SECURITY.md`](SECURITY.md) — **not** a public issue |
| Propose a change to what conforms | An RFC — see [§4](#4-rfcs) |
| Fix a typo, a broken link, a formatting slip | A pull request directly |

Opening an issue first is never wrong and often saves work. A proposal that
turns out to be already-decided is much cheaper to discover before it is
written up than after.

## 2. Development environment

This repository is prose plus the tooling that checks it. You need:

- **Git** — with your `user.name` and `user.email` configured, because the DCO
  sign-off ([§5](#5-dco-sign-off)) is derived from them.
- **A text editor that will not reformat Markdown for you.** Automatic
  reflowing produces diffs where every line changed and nothing did.
- **Node.js 20 or later** — only if you are running the generators or checks in
  `tools/`. Reading and editing the specification needs nothing but an editor.

```sh
git clone https://github.com/mindmapmarkdown/spec
cd spec
```

Conventions the checks enforce, so you may as well follow them by hand:

- UTF-8, LF line endings, no trailing whitespace, a trailing newline at EOF.
- One sentence per line is welcome but not required. What *is* required is that
  you do not rewrap paragraphs you did not otherwise change.
- Relative links between documents in this repository (`GOVERNANCE.md`, not the
  full URL), so that forks and translations keep working.

> The example generator in `tools/` is present and is exercised by the checks on
> every pull request. The separate conformance suite repository is not, and
> neither are the adapters. Where something referenced here does not exist in
> your checkout, that is why — say so in your pull request rather than working
> around it silently.

## 3. Branches and pull requests

`main` is protected and always reflects the current draft. Work on a topic
branch cut from an up-to-date `main`:

```sh
git switch main && git pull
git switch -c spec/anchor-stability
```

Prefix by what the branch touches — `spec/`, `rfc/`, `docs/`, `tools/`,
`fix/`. The prefix is a convenience for humans reading the branch list; it does
not determine the class of the change.

**One logical change per pull request.** A typo fix riding along with a
normative change forces the normative change through the typo's review and the
typo through the normative change's comment period. Split them.

Your pull request description should state:

1. **What changes, and why.** If an issue or RFC exists, link it.
2. **The class of the change**, as defined in
   [`GOVERNANCE.md` §3](GOVERNANCE.md#3-classes-of-change) — Editorial,
   Clarifying, Normative, or Breaking. That table is the single source of truth
   for what each class means and what process it requires; it is not reproduced
   here, because two copies of a rule will eventually disagree and then nobody
   will know which one is binding. Read it there and name the class here.
3. **What a conformant implementation would have to do differently**, or
   explicitly that the answer is "nothing".

If you and a reviewer disagree about the class, the more restrictive one
applies — again per §3. Nominating a class is not a claim of authority over it;
being wrong about it costs nothing.

Review is public. Every decision, including a rejection, is recorded in the
issue, pull request, or RFC — see
[`GOVERNANCE.md` §1](GOVERNANCE.md#1-current-state).

## 4. RFCs

Normative and breaking changes require an RFC. Copy
[`rfcs/0000-template.md`](rfcs/0000-template.md), fill it in, and open it as a
pull request; the number is assigned from the pull request number at merge time.

The full process — comment periods, lazy consensus, what makes an objection
blocking, and how deadlock is resolved — is in
[`GOVERNANCE.md` §4](GOVERNANCE.md#4-decision-making). Two points from it worth
repeating here only because they surprise people:

- **Rejected RFCs are merged**, with status `Rejected`. Being turned down is not
  a reason to delete the document. A specification that records only its
  accepted ideas cannot be argued with later.
- **Silence is assent.** If the comment period passes with no unresolved
  objection, the proposal is accepted. If you object, do it inside the window,
  and state what would resolve it.

## 5. DCO sign-off

Contributions are accepted under the
[Developer Certificate of Origin](https://developercertificate.org/) 1.1. There
is no CLA. Signing off certifies that you wrote the contribution or otherwise
have the right to submit it under this repository's licences.

Add the sign-off with `-s`:

```sh
git commit -s -m "Clarify anchor stability under reordering"
```

which appends a trailer matching your configured identity:

```
Signed-off-by: Jane Doe <jane@example.com>
```

Every commit in the pull request needs one. To fix a branch that is missing
them:

```sh
git rebase --signoff main     # all commits on the branch
git commit --amend -s --no-edit   # just the last one
```

**Editing through the GitHub web UI counts.** The web editor is a convenient way
to fix a typo without cloning, and it is fully supported here — but the DCO
check runs on web commits exactly as it does on pushed ones. The commit form
presents a sign-off checkbox, and it is mandatory: leaving it unticked produces
a commit with no `Signed-off-by` trailer, the DCO check fails, and the pull
request cannot merge until the commit is amended. There is no path into this
repository that skips the sign-off.

Use a real name and an address that reaches you. Anonymous and pseudonymous
sign-offs cannot be accepted, because the certification is only meaningful if it
is attributable. An account handle is not a name — `Signed-off-by: dev-42` does
not certify anything, whatever address follows it. A private or forwarding
address is fine, including the one GitHub provides at
`users.noreply.github.com`: attributability comes from the name, and nobody
should have to publish an inbox to contribute a typo fix.

**Tooling does not change who is contributing.** Draft your contribution with
whatever you find useful — an editor, a generator, an AI assistant. The DCO is a
statement about rights and responsibility, not about keystrokes: whoever signs
off certifies they have the right to submit the contribution under this
repository's licences, and answers for it in review. A file named after a tool,
such as [`CLAUDE.md`](CLAUDE.md), configures that tool. It authors nothing, and
it is not part of the specification.

## 6. Working on the specification text

**Normative examples belong in `spec.md`.** Write the example inline, in the
section whose requirement it demonstrates, where a reader encounters it in
context and a reviewer sees it in the same diff as the rule it illustrates.

**`examples/examples.json` is generated, never hand-edited.** It is extracted
from the fenced examples in `spec.md` by a generator in `tools/` and committed
as a build artifact so that implementers can consume it without running our
toolchain. A hand-edit to `examples.json` is a change to the conformance suite
that leaves no trace in the specification — the two drift, and the
machine-readable copy wins by accident. Change `spec.md`, regenerate, and commit
both in the same commit:

```sh
node tools/extract-examples.mjs      # rewrites examples/examples.json from spec.md
git add spec.md examples/examples.json
```

If a regenerated `examples.json` differs from what you expected, that difference
is the review's subject — do not reconcile it by editing the output.

The checks run the generator with `--check`, which regenerates in memory and
fails if the committed file differs. So a pull request that changes an example
without regenerating cannot merge, and neither can one that edits the output by
hand. To run what the checks run:

```sh
node --test tools/*.test.mjs         # the generator's own tests
node tools/extract-examples.mjs --check
```

Other conventions:

- **RFC 2119 keywords** (MUST, SHOULD, MAY) carry their normative meaning in
  `spec.md`. Do not use them in prose documents like this one, where they read
  as emphasis but scan as requirements.
- **Say what an implementation must do**, not what it is like. "Anchors are
  stable" is untestable; "an anchor MUST NOT change when a sibling is
  reordered" is.
- **Every normative requirement should be testable.** If you cannot describe the
  test, the requirement is probably a preference.

## 7. Licensing of contributions

This repository is dual-licensed; see [`LICENSE`](LICENSE) for what falls under
which.

- **Prose and specification text** — `spec.md`, `docs/**`, `rfcs/**`,
  `README.md`, `GOVERNANCE.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`,
  `CLAUDE.md`, and this file — **CC-BY-4.0**.
- **Code, tooling, and test data** — `tools/**`, `examples/**`, scripts, and
  workflows — **Apache-2.0**, which carries the explicit patent grant that
  implementers need.

Unless you state otherwise, a contribution you submit is licensed on these
terms. If your contribution spans both — a normative example in `spec.md` and
the generator change that emits it — each part takes the licence of where it
lands.

## 8. Conduct

Participation is governed by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
Reports go to `security@mindmapmarkdown.org`, per
[`GOVERNANCE.md` §8](GOVERNANCE.md#8-code-of-conduct).

## 9. Contact

- Specification and general questions — `spec@mindmapmarkdown.org`
- Security, safety, and conduct — `security@mindmapmarkdown.org`
