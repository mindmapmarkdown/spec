# RFC 0037: A document that opens with a thematic break

**Translations** — [한국어](ko/0037-front-matter-opening-thematic-break.md). This
English text is the authoritative one; a translation is a reading aid and carries
no normative force, and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-09-14 |
| **Comment period ends** | 2026-09-28 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/37> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

`L-10` recognises front matter by position: a first line of three hyphens, closed
by the first later line of the same. Issue
[#35](https://github.com/mindmapmarkdown/spec/issues/35) found that a document
which **opens with a thematic break and carries a later one** is read entirely as
front matter, and a heading between the two stops being a node.

This RFC proposes **no change to `L-10`.** It adds one example to §2.2 that pins
the reading `L-10` already gives, and one informative paragraph saying why a
guard was not added. The reason is prior art: Jekyll, Hugo, and gray-matter read
that document the same way `L-10` does, and every guard considered would make
this specification disagree with them about documents they already treat as
front matter — bringing back, for those documents, the spurious node RFC
[0022](0022-front-matter-root-content.md) removed.

## Motivation

### The case

```markdown
---

# A

---

# B
```

lifts, under `L-10` as merged, to

```json
{"content":[{"block":"front_matter","source":"---\n\n# A\n\n---"}],
 "children":[{"kind":"section","label":"B","content":[],"children":[]}]}
```

A plain CommonMark renderer shows two thematic breaks and two headings. The tree
has one node.

### What kind of failure this is

It is **not** a round-trip failure. The block is written back verbatim (`P-11`),
the document above is canonical, and the reference implementation returns it
byte for byte; §1.2.4's mutual inversion holds.

It is a **reading** failure, and it is the mirror image of the defect 0022 fixed:
there, `---` invented a node the document did not have; here, it removes one the
document does. Both come from the same three characters meaning two different
things.

### Why this needs a decision rather than a note

[`CHANGELOG.md`](../CHANGELOG.md) lists #35 under *Open before 0.1.0*. A release
cannot be cut over an undecided Normative question, because deciding it after the
release turns a Normative change into a Breaking one. If the answer is going to be
a guard, it has to be now.

And if the answer is *no guard*, that is still an answer the suite should
enforce. Today an implementation that added any of the guards below would pass
all 21 examples, because none of them exercises this case — so two conforming
implementations could lift the document above to different trees, which §1.4.3
forbids.

## Detailed design

**`L-10` is unchanged.**

**One example is added to §2.2**, after the example showing an opening fence with
no closer:

`````markdown
````example
---

# A

---

# B
.
{"content":[{"block":"front_matter","source":"---\n\n# A\n\n---"}],
 "children":[{"kind":"section","label":"B","content":[],"children":[]}]}
````
`````

The document is canonical: `P-11` writes the block first with one blank line
after it, and `P-7` separates the rest. Checked against the reference
implementation, which lifts it to that tree and projects it back byte for byte.

**One informative paragraph is added to §2.2**, with the other `L-10` notes:

> *(Informative)* `L-10` reads the first later line of three hyphens as the end
> of front matter, whatever lies between — including a blank line and a line
> that would otherwise be a heading. A document that opens with a thematic break
> and carries a later one is therefore read as front matter, and a heading
> between the two produces no node. This is the reading Jekyll, Hugo, and
> gray-matter give the same document, and it is kept for that reason: every rule
> that would distinguish the two cases also reclassifies documents those tools
> already treat as front matter.

### Class

Filed as **Normative**, because the question is what conforms and a guard would
change it. If this proposal is accepted, what lands is an example that adds no
requirement and an informative note — an Editorial-sized edit deciding a
Normative question. It is stated here so that the size of the diff does not
read as the size of the decision.

## Alternatives

### Prior art, first

These are the tools whose documents RFC 0022's survey found front matter in.
Their source was read on 2026-09-14.

| Tool | How the block is found | The document above |
|---|---|---|
| **Jekyll** — `lib/jekyll/document.rb` | The pattern `YAML_FRONT_MATTER_REGEXP` matches `---`, then `.*?` — lazy, and Ruby's `m` flag lets it cross line feeds — then the **first** line that is `---` or `...` | Front matter. `# A` is a YAML comment, so the page shows `B` only |
| **gray-matter** — `index.js`, used by Docusaurus and Gatsby | The input must start with the opening delimiter; the block ends at `str.indexOf('\n' + delimiter)`, the **first** occurrence | Front matter |
| **Hugo** — `parser/pageparser/pagelexer_intro.go` | After an opening `---`, the lexer scans for the **first** line that begins with the delimiter | Front matter |

**Not verified:** Obsidian, whose parser is not public, and markmap, whose
front-matter handling could not be located in its repository. Either may differ.
That is an open question below, not an assumption.

The consequence for this RFC is direct. **On all three platforms, heading `A` is
already not shown.** An author whose document has this shape and is published
through any of them has already met the behaviour `L-10` gives.

### The guards

Each was considered as a rule that would make the document above lift to two
nodes. Each is measured by what it does to a document the three tools agree is
front matter. What CommonMark makes of each such document, once a guard stops
`L-10` from recognising it, was checked against the reference parser.

| Guard | A document it stops recognising | What CommonMark then reads |
|---|---|---|
| **The line after the opening fence must not be blank** | `---`, a blank line, `title: x`, `---` | a thematic break, then a level-2 heading `title: x` — **the spurious node 0022 removed comes back**. The guard also misses `---`, `# A`, a blank line, `---`, which has no blank line after the fence |
| **The block must contain no blank line** | `---`, `a: 1`, a blank line, `b: 2`, `---` | a thematic break, a paragraph, and a heading `b: 2`. YAML permits blank lines between keys, and all three tools accept them |
| **No line of the block may be an ATX heading** | `---`, `# draft: true`, `title: x`, `---` | a thematic break and **two** headings, `draft: true` and `title: x`. `#` is YAML's comment syntax, so a commented-out key is ordinary |
| **Recognise the block only when its contents are valid YAML** | — | Rejected by 0022 under §1.4.3: conformance would depend on a grammar this specification does not define. It **would not even fix this case** — `# A` is a valid YAML document consisting of one comment |
| **The closing fence must come within *n* lines** | — | No value of *n* has any basis, and a specification with one arbitrary number in it invites a second |
| **Declare such documents non-conforming** | — | Removes documents for a reason their authors would find arbitrary, for a shape no evidence yet shows exists (§1.4.1) |

### Doing nothing

That is, leave `L-10` as it is and add no example. **Rejected** because it leaves
the reading decided but untested: an implementation that added any guard above
would still pass the suite, and the disagreement §1.4.3 exists to prevent would
stay invisible until two tools met the same file. The example is the whole of
this proposal's normative weight.

## Unresolved questions

**Whether documents of this shape exist.** There is no corpus evidence either
way — the 0022 survey did not ask. Issue #35 asks for them, and the request runs
through this comment period. A real document of this shape, from a real
repository, **is the objection that would resolve this RFC differently**, per
[`GOVERNANCE.md` §4](../GOVERNANCE.md#4-decision-making); it would have to be
weighed against the documents each guard breaks.

**How Obsidian and markmap read it.** Not verified; see above. If either reads
the document as two headings, the prior-art argument is weaker by that much, and
the decision should say so.

**Two places `L-10` already differs from prior art**, named for a later RFC and
not proposed here:

- Jekyll also accepts `...` as the closing line. `L-10` does not.
- gray-matter ends the block at a line that merely **begins** with `---`, such as
  `----` or `--- x`. `L-10` requires the line to be three hyphens and optional
  whitespace.

Both make `L-10` narrower than prior art, which means a document can be front
matter to those tools and not to this specification — the 0022 defect again, for
fewer documents. Neither has been observed in the corpus.

## Decision and rationale

<!-- LEAVE THIS EMPTY UNTIL THE COMMENT PERIOD HAS ENDED. -->
