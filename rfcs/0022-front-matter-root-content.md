# RFC 0022: Front matter is root content

**Translations** — [한국어](ko/0022-front-matter-root-content.md). This English
text is the authoritative one; a translation is a reading aid and carries no
normative force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Accepted |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-08-26 |
| **Comment period ends** | 2026-09-09 (closed) |
| **Decided** | 2026-09-11 — Accepted, lazy consensus |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/22> |
| **Supersedes** | — |
| **Superseded by** | — |


## Summary

A document that opens with a `---`-fenced block lifts to a **spurious `section`
node** whose label is that block's contents, because CommonMark reads the closing
fence as a setext heading underline. Every Obsidian note, every Hugo page, and
markmap's own examples are affected.

This RFC makes the whole block **a single unit of the root's node content**,
recorded verbatim and producing no node. It adds one lift rule, one
well-formedness rule, one projection rule, and one block-type name. Nothing about
the rest of the tree changes.

It does **not** define what may be inside the block, and does not make this
specification aware of YAML.

## Motivation

### The defect, shown

Front matter is not CommonMark. Run the opening of a markmap example through a
reference parser:

```
thematic_break
heading (level 2)  →  "title: markmap / markmap: / colorFreezeLevel: 2"
heading (level 2)  →  "Links"
```

The opening `---` has nothing before it and is a thematic break. The closing
`---` follows a paragraph, and **a line of hyphens after a paragraph is a setext
heading underline** rather than a break. The fence meant to close the block
instead promotes the block's contents to a heading.

Chapter 2 then does what it is supposed to. L-1 says a heading produces a node;
L-2 says its kind is `section`:

```
root
├── "title: markmap ..."   ← a node that is not in the document
└── "Links"
```

A round-trip makes it worse rather than better. The tree says that first node is
a section at depth 1, so P-1 and P-2 write it as a heading:

```markdown
---

# title: markmap

# Links
```

**The document's metadata has become its first chapter.**

### How often this happens

Seven repositories, 8,441 Markdown files, measured from git objects. A file
counts when line 1 is exactly `---` and a later line is exactly `---`.

| Repository | Kind of content | `.md` | front matter |
|---|---|---:|---:|
| `obsidianmd/obsidian-help` | a published Obsidian vault | 6,357 | **95.6%** |
| `gohugoio/hugoDocs` | static-site content | 1,004 | **99.4%** |
| `facebook/docusaurus` | docs site + repo docs | 238 | 37.0% |
| `nodejs/node` | project docs in a repo | 683 | 13.3% |
| `markmap/markmap` | a tool's own repo | 12 | 8.3% |
| `okpojung/easymindmap` | this project's reference app | 129 | 0.8% |
| `mindmapmarkdown/spec` | this repository | 18 | 0% |

Files opening with `---` and carrying no closing fence — a thematic break rather
than front matter — were counted separately, to keep them out of the numerator.
In the largest corpus there were **zero**.

The split is not about front matter. It is about **whether a document was written
to be read as a document or to be read as part of a repository.** This
specification's traffic is the first kind: a document handed to a tool is
somebody's notes or somebody's article, which is where the numbers are 95% and
99%. The defect does not fire rarely. It fires in the common case.

`+++` (TOML) and `{` (JSON) openings, which some static-site generators accept,
were measured in the same corpora and appear **zero** times. Only `---` needs a
rule.

Two limits of the sample are worth stating. There are **no AI chat exports** in
it, though they are the use case this project was built for, because no public
corpus of them exists; the tools emit no preamble, which would put them at 0%,
and that is an assertion rather than a measurement. And `obsidian-help` is
documentation *about* Obsidian published as a vault — the closest public stand-in
for a personal vault, not one.

### Why implementations cannot be left to choose

If one implementation ignores the block and another does not, the same document
lifts to two different trees. That is a §1.2.4 L1 determinism failure, and it is
the same class of defect [RFC 0016](0016-remove-node-identity.md) was written to
remove. There is no "implementations may vary" answer available.

## Detailed design

Rule labels below are the ones that would enter `spec.md`.

**L-10.** If a document's first line consists of exactly three hyphen-minus
characters, optionally followed by spaces or tabs, and some later line consists
of the same, then the lines from the first through the **first** such later line
are **front matter**. Front matter produces no node. It is recorded as a single
entry in the root's `content` (E-1), with `block` equal to `front_matter` and
`source` that run of lines verbatim, both fences included. A document with no
such later line has no front matter, and its first line is read as CommonMark
reads it.

**L-10 addendum — trailing whitespace.** Each line of the recorded source has
trailing spaces and tabs removed.

Without this, the rule collides with **P-8** — *no line may end in whitespace* —
and the collision is not hypothetical: a key-value line with a stray space at the
end is ordinary in hand-written front matter. Recorded verbatim, P-11 would write
it back and the canonical document would violate P-8, which makes such a document
**unprojectable**.

This is the same conflict §2.2 already resolved for hard line breaks, and it is
resolved the same way. Normalising at lift rather than at projection is what
keeps mutual inversion intact: if the tree kept the spelling and projection
changed it, the first round-trip would already produce a different tree. The cost
is the same too — a document whose front matter carries trailing whitespace is
conforming but not canonical, and its bytes settle on the first round-trip.

**S-4.** A `front_matter` entry MUST be the first entry of the root's `content`,
and MUST NOT appear anywhere else in a tree. A tree violating this is not
well-formed, and S-3 applies to it.

**P-11.** A `front_matter` block MUST be written first, beginning at the first
line of the document, followed by a single blank line before whatever comes next.

**E-5 amendment.** `block` is the CommonMark block type name, **or a block type
name this specification defines for a construct CommonMark does not read as a
single block.** There is exactly one such name, `front_matter`.

*(Informative)* The wording matters, because §2.6 already contains a case that
looks the same and is not. A table has no CommonMark block type either — but
CommonMark reads it as **one** block, a paragraph, so the encoding uses that name
and P-9 writes the source back intact. Front matter is different: CommonMark
reads it as **two** blocks, a thematic break and a setext heading, and neither of
them is the thing. Naming it is not filling a gap in CommonMark's vocabulary; it
is recording that this specification reads those lines as one unit where
CommonMark reads two.

**L-3 cross-reference.** L-3 lists what becomes node content — paragraph, code
block, block quote, table, HTML block, thematic break. Front matter joins that
list by way of L-10, and L-3 gains a pointer so a reader scanning it for *what
becomes content* does not have to already know about L-10.

Two examples would be added to §2.2. The construct itself:

```markdown
---
title: Deploy
---

# Preparation
```

```json
{"content":[{"block":"front_matter","source":"---\ntitle: Deploy\n---"}],
 "children":[
   {"kind":"section","label":"Preparation","content":[],"children":[]}]}
```

and the guard, which is the case L-10 must not swallow — an opening fence with no
closing one is an ordinary thematic break:

```markdown
---

# A
```

```json
{"content":[{"block":"thematic_break","source":"---"}],
 "children":[{"kind":"section","label":"A","content":[],"children":[]}]}
```

*(Informative)* **Nothing here parses the block.** This specification does not
know what YAML is, does not require the contents to be valid anything, and says
nothing about what a key means. The block is opaque text occupying a known
position — which is all that is needed to stop it becoming a node, and is the
most that can be said without acquiring a metadata format this specification
would then have to maintain (§1.1.2).

*(Informative)* **L0 is not weakened.** L0 forbids a conforming document from
expressing a parent-child relationship in a construct a plain renderer discards
or emits as literal text. Front matter expresses no relationship, so it does not
engage the rule. What is true, and worth saying plainly, is that a plain renderer
shows the block as a heading while a conforming implementation shows no node
there. That divergence is a property of front matter itself and exists today
under every option, this one included.

## Alternatives

**Do nothing.** Rejected on the survey. Leaving it alone is a decision that the
spurious node is correct behaviour, taken against 95% of the corpus this
specification is for.

**Strip the block at lift.** The obvious answer, and the one the reference
application implements. **Rejected because it breaks Chapter 1.** §1.2.4 L1
requires lift and canonical projection to be mutually inverse — projecting the
lift of a canonical document returns that document byte for byte. A stripped
block is not in the tree, so it cannot be written back, and every document
carrying front matter would fail the round-trip it was conforming under.

An application may lose what it does not model, and EMM does exactly that in
[okpojung/easymindmap#329](https://github.com/okpojung/easymindmap/pull/329).
A specification whose central promise is a lossless round-trip may not.

**Declare such documents non-conforming.** Rejected: it removes most of the
corpus for a reason its authors would find arbitrary, and it fails §1.4.1 by
making adoption cost something to people who have not adopted.

**Parse the block and put its keys in the tree.** Rejected without much
hesitation. It would make this specification the owner of a metadata format —
which keys exist, what types they have, how they merge — and §1.1.2 closed that
door on purpose. It also could not be done without depending on YAML, whose
grammar is larger than CommonMark's.

**Recognise the block only when its contents are valid YAML.** Rejected for the
same reason and one more: conformance would depend on a grammar this
specification does not define and cannot test, which §1.4.3 forbids.

**Prior art.** Jekyll, Hugo, Obsidian, Docusaurus, and markmap all use the `---`
form, and none of them defines it in a specification — each recognises it
positionally and hands the contents to a parser of its choice. That is what L-10
does, minus the parser.

## Unresolved questions

**What an implementation should do with a `---` fence that is not at line 1.**
Nothing, under L-10 as written — it is a thematic break or a setext underline as
CommonMark says. Whether a fence after a byte-order mark or a leading comment
should count is not addressed, and no corpus evidence was found for it.

**Whether `front_matter` should have been an opaque block type in general**,
rather than one name for one construct, so that later additions do not each need
an E-5 amendment. Named here as the shape of a future question, not proposed.

## Amendments during the comment period

**2026-08-26 — this RFC's projection rule is renumbered P-11.**

As first written, it was P-10, and it carried an unresolved question: §2.5 never
said where a node's `content` goes relative to its `children`, so two different
documents satisfied every projection rule and only one of them lifted back to the
tree it came from.

That gap was filed as [#23](https://github.com/mindmapmarkdown/spec/issues/23)
and closed by [#25](https://github.com/mindmapmarkdown/spec/pull/25), which added
**P-10 — a node's `content` MUST be written before any of its children.** The
label was taken, so this RFC's rule becomes **P-11**.

The rule itself is unchanged, and it does not become redundant. P-10 says
*before the children*; P-11 says *the first line of the document*, which is
stronger and is the only position in which front matter is front matter at all.

**2026-09-11 — three clauses added at the close of the period.**

Found the way RFC 0016's missing clauses were found: by reading `spec.md` for
everything these rules touch, rather than trusting the list. One of the three is
not tidying.

| | |
|---|---|
| **L-10 addendum** | `P-11` writes the block verbatim; **P-8** forbids a line ending in whitespace. A front-matter line with a stray trailing space made the document **unprojectable** |
| **E-5 wording** | *"where CommonMark defines none"* is not what is happening, and §2.6 has a case that proves it — a table also has no CommonMark type, and there the encoding uses `paragraph` rather than inventing a name |
| **L-3 cross-reference** | L-3 enumerates what becomes content and would not have mentioned front matter |

The proposal itself is unchanged. Nothing in Motivation or Alternatives moved.

## Decision and rationale

**Accepted on 2026-09-11 by lazy consensus**, the fourteen-day comment period
having closed on 2026-09-09 with no unresolved objection ([`GOVERNANCE.md`
§4](../GOVERNANCE.md#4-decision-making)).

**This is the first decision in this project whose comment period was actually
waited out.** RFC 0016 was written a day early and two Clarifying changes were
merged within minutes of being opened; all three are recorded in
[`CHANGELOG.md`](../CHANGELOG.md). The mechanism put in place after the third —
the period in the pull request title, and nothing described as ready while one is
open — is what made the difference. The period ran from 2026-08-26 to 2026-09-09
and the decision was written after it.

**No comment arrived from outside this project**, as with every decision here so
far. The discussion carries none, and the three on issue #17 are the maintainer's
own and predate the period. The proposal was never tested by disagreement. What
it was tested by is a corpus — 8,441 files across seven repositories — and that
is a different thing, worth less than a reviewer and more than an intuition.

### Why this outcome and not the other

The alternative that had to be beaten was **stripping the block**, because it is
the obvious answer and the reference application already does it.

It fails on Chapter 1. §1.2.4 L1 requires projecting the lift of a canonical
document to return that document byte for byte, and a stripped block is not in
the tree to be written back. **Every document carrying front matter would fail
the round-trip it was conforming under.** An application may lose what it does
not model; a specification whose central promise is a lossless round-trip may
not.

What replaced it costs nothing new. L-3 already sends pre-node blocks to the
root, E-1 already gives the root a `content` member, and an example already tests
it. The whole change is to stop the closing `---` from being read as a setext
underline.

### What the survey settled, and what it did not

It settled *how often*. Front matter is near-universal in the content this
specification is for — a published Obsidian vault at 95.6%, Hugo content at
99.4% — and rare in repository-internal documentation. **The defect does not fire
rarely; it fires in the common case.** That is what made *do nothing* untenable.

It did not settle the AI round-trip, which is the use case this project was built
for and has no public corpus. That limit is stated in Motivation rather than
papered over.

### What acceptance does not settle

**How a `---` fence that is not at line 1 should be treated**, and whether a
byte-order mark or a leading comment before it should count. L-10 says nothing,
which means CommonMark's reading applies, and no corpus evidence was found either
way.

**Whether `front_matter` should have been a general opaque block type** rather
than one name for one construct. The E-5 wording added today makes the question
sharper rather than answering it: the name records that this specification reads
two CommonMark blocks as one unit, and nothing says that will only ever happen
once.

### Class

**Normative**, as nominated. No document that conforms today stops conforming —
a document with front matter conforms before and after, and only the tree it
lifts to changes. Nothing is released, so no implementation can have been built
against the old reading.

### What happens next

The rules land in `spec.md` as a separate pull request, as RFC 0016's did, so
that the decision and the edit it authorises stay separately reviewable. Issue
[#17](https://github.com/mindmapmarkdown/spec/issues/17) closes with that edit,
and issue [#19](https://github.com/mindmapmarkdown/spec/issues/19)'s Clarifying
half — which was waiting on this RFC because both amend E-5 — can follow it.
