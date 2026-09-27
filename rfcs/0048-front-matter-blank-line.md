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

That is not one file. It is a rule the author applies to every note.

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
branch `rfc/front-matter-blank-line` at `f5573ae`: 102 tests pass — the 91 on
`main` unchanged, and 11 for this rule, covering the reported shape, blank lines
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

That is what a tool does; a specification that did it would have to say which YAML
version, and the suite would have to model YAML failure modes. `L-10` exists
because this specification reads front matter **without** parsing it, and §1.4.3
requires a test that can be written down.

### Require the closing fence before the first blank line

Turns the reported shape away too, but breaks real front matter: a blank line
between keys is valid YAML and appears in the wild.

### Require the first line to look like a key

`key:`-shaped, that is. It is parsing by another name, and it turns away a block
whose first line is a comment — `# title: x` — which is a thing people write.

### Prior art, and where this rule is stricter

| Tool | What it does | This rule |
|---|---|---|
| Jekyll | `YAML_FRONT_MATTER_REGEXP = %r!\A(---\s*\n.*?\n?)^((---\|\.\.\.)\s*$\n?)!m` — `\s*` spans blank lines, so a block that opens on one matches | Stricter |
| gray-matter | Checks the opening delimiter, then searches for the next `\n---`; nothing looks at the line after the fence | Stricter |
| Hugo | Lexes from the opening delimiter to the closing one | Stricter |

The divergence is deliberate and small: a document whose author wrote real front
matter **after** a blank line is read here as thematic break and paragraphs. Its
bytes still survive the round trip; only the name of the block differs. The
reported shape is the commoner of the two, and the one where the difference costs
a node.

## Unresolved questions

None blocks acceptance.

1. **Other fences.** `***` and `___` open no front matter under `L-10` and are
   unaffected. Whether a document should be allowed to open with `...` — YAML's
   other terminator, which Jekyll accepts as a closing fence — is not addressed.
2. **What a reader sees.** Obsidian, where the report comes from, shows the
   reported file as rules and prose. This RFC aligns the tree with that reading
   for this shape; it does not attempt to track any tool's behaviour in general.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
