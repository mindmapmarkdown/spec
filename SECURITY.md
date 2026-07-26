# Security Policy

Report to **`security@mindmapmarkdown.org`**. Please do not open a public issue
for anything in [§2](#2-what-counts-as-a-vulnerability-here).

You will get a first response within **48 hours**. That is a target, not an SLA
— this project has one maintainer ([`GOVERNANCE.md`
§1](GOVERNANCE.md#1-current-state)). If 48 hours pass in silence, assume the
mail was lost rather than ignored, and follow up.

---

## 1. What this repository is

This is a **specification** repository. It contains prose, normative examples,
and the tooling that checks them. It is not a deployed service, and it has no
users in the sense a web application does.

That makes the usual question — "is this exploitable?" — the wrong one to lead
with. A specification cannot be exploited. It can, however, **require
implementers to do something unsafe**, and every conformant implementation will
then do it. A flaw in a widely-implemented requirement is worse than a flaw in
any one implementation, because it ships everywhere and each implementer
believes they are doing the right thing by following it.

So the scope below covers two distinct things, and it is worth being explicit
about the second.

## 2. What counts as a vulnerability here

### 2.1 Defects in the reference implementation and tooling

Ordinary implementation-level security defects in code this project ships —
the reference parser, canonicalizer, viewer, generators, and the conformance
runner. For example:

- Memory-safety or resource-exhaustion faults reachable from a parsed document
  (unbounded recursion on deep nesting, quadratic blow-up on crafted input,
  allocation driven by an attacker-controlled count).
- Injection through the rendered output — a document that produces active
  content in the single-file HTML viewer, e.g. script execution via a node
  label, an attribute, or a link target.
- Path traversal or unintended file access when resolving sidecars, includes,
  or adapter inputs.
- Anything that lets a document read or exfiltrate data outside itself.

### 2.2 Unsafe requirements in the specification itself

Places where the specification **as written** leads a correct, conformant
implementer into an unsafe implementation. This is in scope, it is taken as
seriously as §2.1, and it is the category most likely to be missed. For
example:

- **Untrusted input handled without a stated bound.** A construct the
  specification permits to nest, repeat, or reference without limit, where a
  conformant parser has no defined point at which it may refuse. If the
  specification does not say where "too deep" or "too many" is, every
  implementation invents a different answer and some invent none.
- **Required behaviour that de-serialises or evaluates document content.**
  Anything obliging an implementation to resolve, fetch, execute, or expand
  something a document names.
- **A required output form that is unsafe by default** — for instance a
  rendering rule that would place document-derived text into HTML where it can
  become markup, or a link handling rule that permits active URL schemes.
- **Round-trip rules that preserve more than they should.** The round-trip
  contract is the heart of this format, and "preserve everything faithfully" is
  exactly the shape of requirement that carries an attacker's payload intact
  through a pipeline that each stage believed had sanitised it.
- **Ambiguity with a dangerous default.** Where the specification is silent and
  the obvious implementation choice is the unsafe one, silence is the defect.

A report in this category does not need a working exploit. Naming the
requirement, the implementation it leads to, and the input that goes wrong is
enough — often more useful than a proof of concept against one parser.

### 2.3 Not in scope

- Vulnerabilities in third-party tools that merely consume the format, unless
  the specification is what led them there — in which case it is §2.2.
- Findings against `mindmapmarkdown.org` infrastructure, mail configuration, or
  GitHub organization settings. Send those to the same address; they are
  welcome, they are just not defects in this repository.
- Automated scanner output with no analysis attached.
- Disagreement with a design decision on non-safety grounds. That is an issue or
  an RFC, and it is welcome as one.

## 3. Reporting

Send to `security@mindmapmarkdown.org`. Useful reports include:

- Which category above, as best you can tell — a wrong guess costs nothing.
- For §2.1: version or commit, input that triggers it, observed and expected
  behaviour.
- For §2.2: the section and requirement, the implementation a careful reader
  would write from it, and why that is unsafe.
- Your assessment of impact, and any constraint on disclosure timing.
- How you want to be credited, or that you do not.

Encrypted mail is accepted on request; ask in a first message with no details
and a key will be provided.

There is no bug bounty. This is an unfunded specification project, and
pretending otherwise would waste your time.

## 4. What happens next

| When | What |
|---|---|
| Within 48 hours | Acknowledgement, and confirmation of whether it is in scope |
| Within 7 days | Initial assessment, severity, and an intended fix approach |
| Ongoing | Progress updates at least every 14 days until resolved |

**Disclosure.** Coordinated, with a default of **90 days** from the first
response to public disclosure, shortened when a fix ships sooner and extended
only by agreement. If a report is already public, or is being exploited, that
window does not apply and the fix is published as fast as it can be made.

**Fixing a §2.2 finding is a specification change**, and it goes through the
process in [`GOVERNANCE.md` §3](GOVERNANCE.md#3-classes-of-change) like any
other — it will usually be Normative or Breaking, and so will require an RFC.
The one difference is sequencing: the RFC and its comment period may run after
disclosure rather than before it, so that a known-unsafe requirement is not left
standing for the length of a comment period for the sake of procedure. The
maintainer's reasoning for any such shortcut is written down, per §4 of that
document.

**Credit.** Reporters are credited in the fix and in the release notes unless
they ask not to be.

## 5. Non-retaliation

Good-faith research on this specification, its examples, and its reference
tooling is welcome, and no legal or administrative action will be pursued over
it. Good faith means: your own systems or ours by arrangement, no third-party
data, no service disruption, and the report comes to us before it goes anywhere
else.

## 6. Related

- Conduct reports go to the same address — see
  [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) and
  [`GOVERNANCE.md` §8](GOVERNANCE.md#8-code-of-conduct). One address, two kinds
  of report, one maintainer; when Phase 1 begins these separate.
- Ordinary contributions — [`CONTRIBUTING.md`](CONTRIBUTING.md).
