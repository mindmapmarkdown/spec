# RFC 0048: Front matter does not open on a blank line

**Translations** — [한국어](ko/0048-front-matter-blank-line.md). This English text
is the authoritative one; a translation is a reading aid and carries no normative
force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-09-27 |
| **Comment period ends** | 2026-10-11 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/48> |
| **Supersedes** | 0037 |
| **Superseded by** | — |

## Summary

`L-10` reads a document as having front matter whenever its first line is exactly
`---` and some later line is too. A reader on the Obsidian forum has now reported
writing every note that way on purpose — `---` as a rule at the top, another `---`
further down — so the run between them is read as front matter and the prose in it
stops being content ([#35](https://github.com/mindmapmarkdown/spec/issues/35)).

This RFC adds one condition to `L-10`:

> The line after the opening fence MUST NOT be blank.

Front matter as Jekyll, Hugo and Obsidian write it opens on its first key, so it
keeps working. The reported shape is left to CommonMark, which reads it as a
thematic break, a paragraph, a thematic break and a paragraph — what its author
means.

**This supersedes RFC 0037**, which proposed keeping `L-10` unchanged on the
grounds that the shape was hypothetical, and whose analysis of guards does not
apply to the shape that was actually reported (see *Why 0037's objection does not
reach this*). A prototype passes the suite unchanged and eleven further tests.

**The rule is not an invention.** Pandoc has required it since it grew a metadata
block: "The initial line `---` must not be followed by a blank line."
That was pointed out on 2026-10-02 by João Vitor Andrade on markmap discussion
[#363](https://github.com/markmap/markmap/discussions/363), after this RFC was written, and it is why the *Prior art* table
below now reads the other way round from the way it was first drafted.

## Motivation

### The report

[#35](https://github.com/mindmapmarkdown/spec/issues/35) asked whether files of
this shape exist. On the Obsidian forum, [Johnny 'Decimal'
Noble](https://forum.obsidian.md/t/do-you-have-markdown-files-that-start-with-a-horizontal-rule-that-is-not-front-matter/118692)
answered:

> I do. As a rule (ha!), I start *every* file with `---`. I just like how it
> looks, and very frequently I have informal frontmatter (I just use a bulleted
> list) above that line. […] Then, it's not uncommon for me to want to separate
> the file later using another line.

and, asked whether the `---` is literally the first line, gave the file:

```
---

Yada yada some content that is not frontmatter.

---

Yada yada some more content.
…
```

That is not one file. It is a rule the author applies to every note. On the
issue itself he reported a second shape, found while looking for examples:

```
---

---

---

…content
```

> I presume that's an artefact of me creating a YAML block there at some point,
> never using it, then *also* creating a visible `<hr>`, then having my content.

— and confirmed that Obsidian does not add an invisible YAML block of its own.
Today that file's first two rules are read as front matter; under this proposal
they are three thematic breaks, which is what they are.

### What the specification does with it

Run against the reference implementation at `mindmapmarkdown/mindmapmd@ac4ce88`:

| Document | Tree today |
|---|---|
| The file above | `front_matter` holding `---`, the first paragraph, `---`; then one paragraph. **The opening prose is no longer content — it is an opaque block** |
| The same with a heading above the second fence | The heading is inside the `front_matter` block. **It stops being a node** |
| The variant the author also mentions, with a bulleted list above the fence | Unaffected: the first line is not `---`, so `L-10` does not fire |

Bytes survive in the first row — projection writes the block back — so the failure
is not a round-trip failure. It is that a tree of this document has nothing in it:
no node, and prose the author wrote as prose recorded as front matter.

### Why 0037's objection does not reach this

RFC [0037](https://github.com/mindmapmarkdown/spec/pull/37) argued that any guard
brings back a spurious node: strip the front-matter rule and CommonMark reads the
closing `---` as a **setext heading underline**, turning the text above it into a
heading. That is true when the closing fence follows a paragraph line directly.

**The reported shape has a blank line there.** Checked with commonmark.js 0.31,
the file above parses as:

```
thematic_break, paragraph, thematic_break, paragraph
```

No heading appears. The guard costs nothing for exactly the shape that was
reported, because its author separates the fences from the prose — which is what
makes them read as rules in the first place.

## Detailed design

### `L-10`, amended

> **L-10.** If a document's first line consists of exactly three hyphen-minus
> characters, optionally followed by spaces or tabs, **the line after it is not
> blank**, and some later line consists of the same, then the lines from the first
> through the **first** such later line are **front matter**. […]

A line is blank when it is empty or contains only spaces and tabs — CommonMark's
definition (§2.1). The rest of `L-10` is unchanged: the run is still one opaque
entry of the root's `content`, still positioned by `S-4`, still written back by
`P-11`.

### Examples

Added to §2.2 beside the existing front-matter examples.

````example
---

A note that opens with a rule.

---

More text.
.
{"content":[
  {"block":"thematic_break","source":"---"},
  {"block":"paragraph","source":"A note that opens with a rule."},
  {"block":"thematic_break","source":"---"},
  {"block":"paragraph","source":"More text."}],
 "children":[]}
````

````example
---
title: A note
---

# Heading
.
{"content":[
  {"block":"front_matter","source":"---\ntitle: A note\n---"}],
 "children":[
  {"kind":"section","label":"Heading","content":[],"children":[]}]}
````

### What does not change

- **Front matter as the three tools write it.** It opens on its first key.
- **An empty block.** `---` immediately followed by `---` has a non-blank next
  line — the closing fence — and stays front matter.
- **A document with no closing fence.** Unchanged: no front matter, and the first
  line is read as CommonMark reads it.
- **`S-4`, `P-11`, `E-5`.** Only the condition for recognising the block moves.
- **Any existing example.** None opens on a blank line.

### How it is tested

Two examples above enter the suite. A prototype is `mindmapmarkdown/mindmapmd`
branch `rfc/front-matter-blank-line`: 103 tests pass — the 91 on
`main` unchanged, and 12 for this rule, covering both reported shapes, blank lines
made of spaces and tabs, the front matter Jekyll, Hugo and Obsidian write, an
indented first key, a commented-out first key, the empty block, and L1 both ways
for each shape.

## Alternatives

### Do nothing — RFC 0037's position

Defensible while the shape was hypothetical. It is not any more: the report is a
habit applied to every note by someone who writes about note-keeping for a living.
0.1.0 would ship knowing it reads those notes as one opaque block.

### Defer past 0.1.0, as [#40](https://github.com/mindmapmarkdown/spec/issues/40) was

Keeps the release date. The difference from #40 is that #40 has several credible
designs and no reported user; this has one design and a reported user. Deferring
would mean tagging a release that is known to mis-read a real corpus, and changing
it later is Breaking rather than Normative.

### Parse the block and require it to be a YAML mapping

Pandoc's other half, raised on markmap [#363](https://github.com/markmap/markmap/discussions/363) as a second and
independent check: the reported shape fails it too, because a comment and a plain
scalar are not a YAML object.

**It is rejected, and it is the strongest of these alternatives — so the reason
has to be better than a preference.**

What it buys is real, and narrower than it looks. For the shape that was reported
the blank-line condition already decides it, so the second check changes nothing
there. It changes one other shape: a block with **no** blank line whose content is
not YAML.

```markdown
---
# Meeting notes
We agreed on the plan.
---
```

Measured against the prototype: under this RFC that is front matter, so the
heading is not a node. Without `L-10`, commonmark.js reads it as a thematic
break and **two headings** — the closing fence is a setext underline, so the
prose line becomes one. §1.2.4 L0 asks the tree to agree with what an unmodified
renderer shows, and on that test **the second check gives the better answer for
this shape**, which the first draft of this section did not admit.

What it costs is a YAML parser. "A valid YAML object" cannot be decided without
one, and §1.1.2 keeps this specification out of the business of owning a metadata
format: it would have to name a YAML version, and §1.4.3 asks for a test that can
be written down, which "valid YAML in version X" is not — the suite would have to
model YAML's failure modes to express it.

The trade-off offered on #363 was that falling back to content is the better
failure mode "because nothing is lost". That is true of a renderer and **not of
this specification**: `L-10` records the run of lines opaquely and `P-11` writes
it back, so a block that is not YAML loses no bytes either way. What it loses is
a node, which is the residual below.

### Require the closing fence before the first blank line

Turns the reported shape away too, but breaks real front matter: a blank line
between keys is valid YAML and appears in the wild.

### Require the first line to look like a key

`key:`-shaped, that is. It is parsing by another name, and it turns away a block
whose first line is a comment — `# title: x` — which is a thing people write.

### Prior art — and one tool already has this rule

| Tool | What it does | This rule |
|---|---|---|
| **Pandoc** | "A YAML metadata block is a valid YAML object, delimited by a line of three hyphens (`---`) at the top and a line of three hyphens (`---`) or three dots (`...`) at the bottom. **The initial line `---` must not be followed by a blank line.**" ([manual, §8.10.2](https://pandoc.org/demo/example33/8.10-metadata-blocks.html)) | **The same, for this half** |
| Jekyll | `YAML_FRONT_MATTER_REGEXP = %r!\A(---\s*\n.*?\n?)^((---\|\.\.\.)\s*$\n?)!m` — `\s*` spans blank lines, so a block that opens on one matches | Stricter than Jekyll |
| gray-matter | Checks the opening delimiter, then searches for the next `\n---`; nothing looks at the line after the fence | Stricter |
| Hugo | Lexes from the opening delimiter to the closing one | Stricter |

**This matters more than a citation.** The first draft of this table had three
rows and concluded that the rule was stricter than every tool examined, which is
an argument a reviewer is entitled to be suspicious of: a specification inventing
a condition no implementation has is usually wrong. With Pandoc in the table the
proposal is not an invention — it is the rule the one tool that bothered to write
a condition down already has. §1.5.1 prefers interoperating to competing, and
this is what that looks like.

Pandoc differs in two further ways, and this specification stays stricter in
both:

- **Position.** "A YAML metadata block may occur anywhere in the document, but if
  it is not at the beginning, it must be preceded by a blank line." `L-10` reads
  front matter only at line 1, and `S-4` records it only as the root's first
  content entry. A block in the middle of a document is content here.
- **Validity.** Pandoc requires the block to be a valid YAML object and falls back
  to reading it as content when it is not. This specification does not parse the
  block at all; see the alternative below.

The remaining divergence from Jekyll, gray-matter and Hugo is deliberate and
small: a document whose author wrote real front matter **after** a blank line is
read here as thematic break and paragraphs. Its bytes still survive the round
trip; only the name of the block differs. The reported shape is the commoner of
the two, and the one where the difference costs a node.

## Unresolved questions

None blocks acceptance.

1. **Other fences.** `***` and `___` open no front matter under `L-10` and are
   unaffected. Whether a document should be allowed to open with `...` — YAML's
   other terminator, which Jekyll accepts as a closing fence, and which
   [Pandoc](https://pandoc.org/demo/example33/8.10-metadata-blocks.html) accepts as one too — is not addressed.
2. **What a reader sees.** Obsidian, where the report comes from, shows the
   reported file as rules and prose. This RFC aligns the tree with that reading
   for this shape; it does not attempt to track any tool's behaviour in general.
3. **A block with no blank line whose content is not YAML.** Named because the
   alternative above shows this RFC gets it wrong by §1.2.4 L0's own test: a
   renderer shows two headings and the tree shows none. The rule is kept anyway,
   because the only thing that decides it is a YAML parser and §1.1.2 refuses to
   own one. **This is the residual cost of not parsing**, it is stated here rather
   than left to be discovered, and it is where to start if someone later decides
   the dependency is worth paying. Raised on markmap [#363](https://github.com/markmap/markmap/discussions/363).

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
