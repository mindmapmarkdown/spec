# Glossary

**Translations** — [한국어](ko/glossary.md)

Plain-language explanations of the vocabulary used in this repository — the
specification's own terms, the standards-process words that surround them, and
the Markdown terminology both rely on.

**This document is informative. It defines nothing.** Every entry that has a
binding definition elsewhere points to it, and where an explanation here and a
definition there disagree, the definition wins. Nothing in this file can make an
implementation conformant or non-conformant.

**This English text is the authoritative one.** Translations are welcome — the
licence exists partly to permit them — but a translation may lag behind, and
where one disagrees with this file, this file wins.

It is written for someone meeting this kind of project for the first time. If a
term is missing, or an explanation did not help,
[open an issue](https://github.com/mindmapmarkdown/spec/issues) — that is a
defect in this document, not in the reader.

For the shape rather than the words — how documents, trees, and views are
layered, and why the conformance suite looks the way it does — see
[`overview.md`](overview.md).

**Contents** — [Process](#process) · [Specification](#specification) ·
[Data model](#data-model) · [Markdown](#markdown) ·
[Reading an RFC](#reading-an-rfc)

---

## Process

### RFC

**Request for Comments.** A proposal to change what this specification requires,
written up so that it can be argued with before it lands.

The name is older than this project and is deliberately modest. In 1969, the
graduate students building ARPANET — the network the internet grew out of —
needed to write down how it should work, and felt they had no authority to
decree anything. So they titled the documents *Request for Comments* rather than
*Standard*. Steve Crocker wrote the first one that April. The humble name stuck,
and the documents that define email, the web, and internet addressing are all
RFCs today. Two of them, [RFC 2119](https://www.rfc-editor.org/info/rfc2119) and
[RFC 8174](https://www.rfc-editor.org/info/rfc8174), are cited in
[`spec.md` §1.2.1](../spec.md#121-requirement-keywords) — they define what
"MUST" and "SHOULD" mean.

Software projects later borrowed the shape of the process; Rust keeps an `rfcs`
repository much like this one, and Python calls its version a PEP. **The RFCs in
this repository are local to it.** They are not submitted anywhere, and they
carry no authority outside this project.

An RFC is two things at once, and the second matters more:

1. **A proposal** — here is what should change.
2. **A record** — here is why it changed, and why the other options were not
   taken.

Three years from now someone will ask why a decision went the way it did. If
there is no answer on file, the argument restarts from nothing, and it restarts
again every time a new person arrives. This is why
[`GOVERNANCE.md` §4](../GOVERNANCE.md#4-decision-making) says that a
specification recording only its accepted ideas cannot be argued with later —
and why **a rejected RFC is merged rather than deleted**. The record of why an
idea was turned down is worth as much as the record of why one was taken up.

What an RFC is *not*: it is not the specification. `spec.md` is. An accepted RFC
does not itself become a rule — it authorises a separate change to `spec.md`,
which is where the rule then lives.

Which changes need one, how long the comment period runs, and what the status
values mean are all in
[`GOVERNANCE.md` §3–§4](../GOVERNANCE.md#3-classes-of-change) and
[`CONTRIBUTING.md` §4](../CONTRIBUTING.md#4-rfcs). They are not repeated here,
deliberately: two copies of a rule eventually disagree, and then nobody knows
which one binds.

### Normative / informative

**Normative** text states a requirement. Ignoring it makes something
non-conformant. **Informative** text explains — why a requirement exists, how it
relates to other work, what it costs. It creates no obligation.

`spec.md` declares that everything in it is normative *except* what is marked
*(Informative)*. The default direction matters: a reader who is unsure about a
sentence should assume it binds.

This document is informative in its entirety.

### Class of change

Not every change deserves the same process, so each one is classified by **its
effect on conformant implementations, not by the size of its diff**. A one-word
edit that changes what conforms is a bigger change than a thousand-line
reformatting.

The four classes and the process each requires are in
[`GOVERNANCE.md` §3](../GOVERNANCE.md#3-classes-of-change).

### Lazy consensus

A proposal with no unresolved objection when its comment period ends is
accepted. **Silence is assent.** Requiring everyone to actively approve would
stall a small project; requiring everyone to actively object would not.

The counterpart obligation is that an objection has to be actionable — it must
say what would resolve it. "I disagree" pauses nothing; "this breaks round-trip
for case X" pauses everything until X is answered. See
[`GOVERNANCE.md` §4](../GOVERNANCE.md#4-decision-making).

### DCO sign-off

The `Signed-off-by:` line that `git commit -s` appends. It certifies that you
wrote the contribution, or otherwise have the right to submit it under this
repository's licences — the
[Developer Certificate of Origin](https://developercertificate.org/).

There is no separate agreement to sign. The sign-off must carry a real name and
a reachable address, because a certification nobody can be held to is not a
certification. Mechanics are in
[`CONTRIBUTING.md` §5](../CONTRIBUTING.md#5-dco-sign-off).

---

## Specification

### Conformance

Whether something follows this specification correctly. A standard that does not
say what "followed it correctly" means is not a standard: everyone claims
compliance and nothing interoperates.

### Conforming document / conforming implementation

Two different claims, defined separately on purpose in
[`spec.md` §1.2.3](../spec.md#123-conforming-documents) and
[§1.2.4](../spec.md#124-conforming-implementations).

A **conforming document** is a text with certain properties. It is true or false
of the file itself, and no software has to exist for it to hold. A **conforming
implementation** is software that behaves as required, which can only be
established by testing.

Collapsing the two produces a format that only its own toolchain can read.

### Canonical document

A conforming document that is already written the way the specification would
write it. Every canonical document conforms; the reverse does not hold, and is
not meant to — a document can state its hierarchy perfectly clearly while
spelling it differently from canonical form.

### MUST / SHOULD / MAY

Requirement strength, in the sense given by RFC 2119 and RFC 8174, and **only
when written in capitals**.

| | |
|---|---|
| **MUST** | Absolute requirement. Violating it means non-conformance |
| **SHOULD** | Recommended. May be departed from by someone who understands the consequence |
| **MAY** | Optional. Doing it and not doing it are both conformant |

The capitals rule exists because lowercase "must" is an ordinary English word
that appears in prose without intending a requirement. `CONTRIBUTING.md` §6 asks
contributors to avoid the keywords entirely outside `spec.md`, where they would
read as emphasis but scan as obligations.

### Conformance level (L0–L3)

A staircase, so that an implementation can say how far up it has come instead of
facing an all-or-nothing claim. L0 is a property of documents; L1 through L3 are
increasing obligations on software, and each includes the ones below it.

Defined in [`spec.md` §1.2.4](../spec.md#124-conforming-implementations); the
README carries a summary table.

### Testable / decidable

A requirement is worth stating only if a test can decide whether it is met.
"Anchors are stable" cannot be tested; "an anchor MUST NOT change when a sibling
is reordered" can.

This is the principle in
[`spec.md` §1.4.3](../spec.md#143-conformance-must-be-decidable), and it does
real work: a requirement whose test cannot be described is a preference wearing
a requirement's clothes, and belongs in an RFC or a design-principles section
rather than in normative text.

---

## Data model

These are the specification's own inventions, and the words most likely to be
unfamiliar even to someone comfortable with Markdown.

### Tree, node, label, node content

A **tree** is the hierarchy a document denotes: a root, and everything beneath
it, in order. Sibling order is part of the tree — two trees differing only in
the order of children are different trees.

A **node** is one unit of that hierarchy. It has a **label** (the inline text
identifying it), zero or more pieces of **node content** (block material
attached to it), and an ordered list of children.

```markdown
## Install          ← label
Node.js 20 or later.  ← node content
### Requirements    ← child node
```

The distinction that matters: **a paragraph is content, not a node.** Were
paragraphs nodes, a README with forty paragraphs and six headings would produce
forty-six nodes instead of six.

Defined in [`spec.md` §1.3](../spec.md#13-terminology).

### Lift

The mapping from a document to the tree it denotes — the reading direction. Named
so that it has a direction: text is *lifted* into structure.

### Projection

A mapping from a tree to some other representation. A Markdown document is one
projection of a tree; an outline, a mindmap, and a table of contents are others.

**Only the projection back to Markdown is specified here.** Mindmaps and outlines
are views, and views are out of scope — a point argued rather than asserted in
[`spec.md` §1.1.3](../spec.md#113-why-the-boundary-is-drawn-here-informative).

### Canonical form

The one Markdown spelling this specification designates for a given tree.
*Canonical* is the mathematical sense: the standard representative chosen from
several equivalent ones.

Its purpose is to make **a text difference mean a structural difference**. When
two documents are both in canonical form, the places where their text differs
are exactly the places where their trees differ — which is what makes version
control, review, and merge behave sensibly.

### Round-trip

Going out and coming back: document → tree → document, or tree → document →
tree. The project's central promise is that this preserves what matters, and
[`spec.md` §1.2.4](../spec.md#124-conforming-implementations) fixes precisely
what "what matters" means at each level.

### Mutually inverse

Two operations that undo each other, the way doubling and halving do. Lift and
canonical projection are required to be mutually inverse: project a tree to
Markdown, read it back, and the same tree must return.

The requirement bites harder than it looks. It rules out any well-meaning
"repair" during projection — silently fixing an awkward tree on the way out
produces text that reads back as a *different* tree, breaking the guarantee in
the place it is hardest to notice.

### Idempotent

Doing it twice gives the same result as doing it once. Normalising a document
must produce canonical form; normalising it again must change nothing.

Without this, a file would keep changing every time it is saved, and every save
would show up as a diff.

### Identity

What makes a node *the same node* across edits and round-trips, independent of
its label, its position, and its content. Two nodes with the same label are not
thereby the same node; a node whose label is rewritten is still the same one.

Identity is what a sidecar, a diff, and a merge all key on. How it is
represented is not yet specified — and **whether this specification should
define it at all** was reopened during the comment period on
[the open RFC](https://github.com/mindmapmarkdown/spec/pull/4), which records
why. It is a live question, not a settled one.

### Diff

**What changed between two versions.** Comparing two things and keeping only the
difference, because nobody can review a whole document but anyone can review a
change.

You have already read hundreds of them. The **Files changed** tab on a pull
request is a diff: `+` marks an added line, `-` a removed one, and unmarked lines
are unchanged context.

Git compares **lines of text**, which is fast, universal, and blind to meaning.
Rename a heading and git reports one line deleted and one line added, because it
has no concept of *renamed*. That gap is the reason this specification exists,
and it opens in two directions:

- **Nothing changed but everything looks changed.** Re-wrap a paragraph and every
  line is rewritten while the content is identical.
- **Something changed but almost nothing looks changed.** `## Install` to
  `- Install` is one character, and it moves a section into a list.

Canonical form closes the first gap by making one tree always spell itself the
same way. A **tree diff** — comparing nodes instead of lines — would close the
second, and is not specified yet.

### Merge

**Combining two sets of changes to the same thing.** Not the same operation as
merging a pull request, though the word is shared: git merges *files*, and what
is described here merges *trees*.

Two people open the same map. One adds a child under a node; the other renames
that node. A correct merge produces both changes. A merge that cannot tell the
renamed node is the same node produces two nodes and silently splits the map —
which is why merge is listed at L3, above identity at L2.

### Subtree

**One branch of a tree** — a node together with everything beneath it.

It matters because documents get large and the things that read them do not want
all of it. Handing one branch to a tool or a model, getting it back, and putting
it where it came from is cheaper and more accurate than sending the whole
document. Doing so requires knowing where it came from, which is identity again.

### Sidecar

A file kept alongside a document, holding data about its nodes without being
part of it — colour, position, collapse state, zoom. The name comes from the
passenger car bolted to the side of a motorcycle: it travels with the vehicle
and is not the vehicle.

The governing principle is **meaning in the document, presentation in the
sidecar** ([`spec.md` §1.4.2](../spec.md#142-meaning-in-the-document-presentation-in-the-sidecar)).
Deleting every sidecar must not change any tree.

### Kind — *proposed, not settled*

Whether a node was written as a heading (`section`) or as a list item (`item`),
and whether that distinction is part of the tree.

This is **not currently part of the specification.** It is proposed in
[*Canonical hierarchy*](https://github.com/mindmapmarkdown/spec/pull/4), an RFC
open for comment. The proposal is that kind belongs to the tree, so that a
document written with headings comes back with headings — a heading and a bullet
being different things to a reader, not two spellings of one thing.

---

## Markdown

### CommonMark

The standardised specification of Markdown. Markdown spread for years without
one, so different tools parsed the same file differently; CommonMark settled the
grammar.

**This specification is layered on CommonMark and defines no Markdown grammar of
its own.** An implementation is expected to sit on top of an existing CommonMark
parser rather than replace it. See
[`spec.md` §1.5.1](../spec.md#151-commonmark).

### ATX heading / setext heading

The two ways Markdown writes a heading.

```markdown
## Title           ← ATX

Title              ← setext
-----
```

Setext can only express two levels and is easy to introduce by accident — a line
of hyphens under a paragraph becomes a heading. Both are read; canonical form
uses ATX.

### Fenced / indented code block

The two ways Markdown marks code.

````markdown
```                ← fenced
code
```

    code           ← indented (four spaces)
````

Indented code is the awkward one: four spaces of indentation may mean a code
block *or* the continuation of a list item, and which it is depends on context
several lines away. The [*Canonical hierarchy*
RFC](https://github.com/mindmapmarkdown/spec/pull/4) proposes banning it from
canonical form — deleting the ambiguity rather than adjudicating it.

### Loose / tight list

Whether blank lines separate list items. It changes how a renderer wraps the
items and carries no structural meaning, so it does not affect the tree.

---

## Reading an RFC

An RFC is open for comment because comment is wanted, and useful review does not
require expertise in standards work. In rough order of value:

1. **Is the problem in *Motivation* a problem you recognise?** If it is not one
   anybody has actually hit, the proposal is built on speculation and the rest
   does not matter.
2. **Read the worked examples and check them against your own expectation.**
   This is the strongest check available to any reader: an example states an
   input and the exact result, and you can judge whether the result is the one
   you would have predicted without knowing any terminology. One example that
   feels wrong means a rule is wrong.
3. **Look for an alternative you are not comfortable rejecting.** *Alternatives*
   exists to be disagreed with. If a discarded option seems better than the
   chosen one, that is the objection worth raising.
4. **Check the unresolved questions.** They are deliberately left open. The
   question is whether any of them actually needs to be settled before this
   proposal can land.
5. **Test it against a real case of your own.** Take something concrete you want
   to do and run it through the proposed rules.

The earliest stage is the cheapest one at which to disagree, which is why
`CONTRIBUTING.md` opens by saying so. An objection is most useful when it names
what would resolve it — see [Lazy consensus](#lazy-consensus) above.

---

*Informative throughout. Licensed [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/);
see [`LICENSE`](../LICENSE).*
