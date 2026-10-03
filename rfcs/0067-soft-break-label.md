# RFC 0067: A soft line break in a label is a space

**Translations** — [한국어](ko/0067-soft-break-label.md). This English text is the
authoritative one; a translation is a reading aid and carries no normative force,
and the decision recorded below is made against this file.

| | |
|---|---|
| **Status** | Draft |
| **Class** | Normative |
| **Author(s)** | 정제영 `<ok@baro.pro>` |
| **Created** | 2026-10-02 |
| **Comment period ends** | 2026-10-16 |
| **Discussion** | <https://github.com/mindmapmarkdown/spec/pull/67> |
| **Supersedes** | — |
| **Superseded by** | — |

## Summary

```markdown
Head
more
===
```

An ordinary setext heading spanning two lines. `E-4` records the label
`Head\nmore`, `P-6` requires ATX, and **an ATX heading is one line** — so that
tree has no canonical projection at all ([#64](https://github.com/mindmapmarkdown/spec/issues/64)).

This RFC proposes two parts. **Part 1** records a soft line break inside a label
as a single space, which is what every renderer already shows and so changes
nothing a reader sees. **Part 2** adds `S-8`: a section's label may not contain a
line feed — after Part 1 only a *hard* break can put one there, that one does
render, and `P-6` cannot write it.

## Motivation

### What goes wrong today

`Head` / `more` / `===` is a setext heading. The reference implementation at
`mindmapmd@bc8cf75` lifts it to a `section` labelled `Head\nmore`, and canonical
projection writes:

```markdown
# Head

more
```

The second line is no longer part of the heading. It lifts back to a section
labelled `Head` carrying a paragraph — a different tree, and a different
document.

The same shape arrives without anyone writing a setext underline on purpose:

```markdown
x\
10. a
- 
```

`10. a` cannot interrupt a paragraph, and `-␣` cannot either, so the first two
lines are one paragraph — and `-␣` is a setext underline, which makes the whole
thing a heading whose label is `x\␤10. a`. That is the shape a sweep over
generated documents finds; the first is the shape a person writes.

### Who hits it

Anyone whose heading is longer than one line, which an editor that re-wraps long
lines produces without being asked. On `main` today the sweep reports 1,364
failures in 40,000 generated documents, and this and
[#55](https://github.com/mindmapmarkdown/spec/issues/55) are all of them.

### Why it cannot wait for 0.2.0

§1.3 says a tree determines exactly one document. For this tree the rules
determine **none** — not a different one, none. That is the shape of
[#45](https://github.com/mindmapmarkdown/spec/issues/45) and
[#59](https://github.com/mindmapmarkdown/spec/issues/59), and it is not an `S-7`
question: `S-7`'s landing was deferred past 0.1.0 on 2026-10-02 and this still
blocks the release, because what it breaks is Chapter 1's promise rather than
§2.4's.

## Detailed design

### Part 1 — `E-4`, amended

A sentence is added:

> A **soft line break** inside `label` — a line break that `L-9` does not record
> as a hard break — MUST be recorded as a single space.

**The reason is that a soft break inside a label is invisible.** Checked against
CommonMark's own reference renderer:

| Document | HTML |
|---|---|
| `Head` / `more` / `===` | `<h1>Head` ⏎ `more</h1>` |
| `Head\` / `more` / `===` | `<h1>Head<br />` ⏎ `more</h1>` |
| `Head␣␣` / `more` / `===` | `<h1>Head<br />` ⏎ `more</h1>` |

The first renders as one line of text with a space in it, because that is what
HTML does to a newline in flow content. The other two render a line break. So
folding the first changes nothing a reader or a renderer can detect, and folding
the others would.

That is the test `L-9` applied when it chose between the two spellings of a hard
break: normalise the spelling that is invisible, keep the one that is not. `L-10`
applied it again to front matter's trailing whitespace. This is the same test
applied to the one remaining line break this specification had not looked at.

**Order matters.** The fold is applied to what is left after the marker and any
setext underline are removed. Applied earlier it would eat the line break before
the underline, and the underline would join the label.

**Which breaks are hard.** `L-9` records a hard break as a backslash before the
line break. A run of backslashes before a break is a hard break when the run is
odd; an even run is an escaped backslash followed by a soft break.

### Part 2 — `S-8`, new

> **S-8.** A `section`'s `label` MUST NOT contain a line feed.

After Part 1 the only line break a label can still carry is a hard one. It
renders, so Part 1's argument does not reach it, and `P-6` has no way to write
it: an ATX heading is one line.

§2.4 already has this shape. A heading inside a list item would lift to a section
under an item, which `S-1` forbids, and the resolution is that **the document is
not conforming** — lift is defined over conforming documents and refuses it. A
heading whose inline content carries a hard break is refused for the same reason,
and §2.4's informative note gains a paragraph saying so.

### Interaction with RFC 0057

RFC [0057](https://github.com/mindmapmarkdown/spec/pull/57) Part 1 says an item's
label loses its container's indentation and that projection writes the later
lines back at the item's content column. **Both RFCs amend `E-4`, and the
decision on this one changes the scope of that one.**

| | 0057 Part 1 alone | With this RFC |
|---|---|---|
| `- x` / `␣␣- a` / `␣␣␣␣b` | label `a\nb`, written back indented | label `a b` — one line, nothing to indent |
| `- x` / `␣␣- a\` / `␣␣␣␣b` | label `a\\\nb`, written back indented | **unchanged** — 0057 Part 1 is what makes this work |
| `Head` / `more` / `===` | still no projection | label `Head more`, written `# Head more` |
| `Head\` / `more` / `===` | still no projection | refused by `S-8` |

So 0057 Part 1 is still needed, for hard breaks only, and this RFC does not
subsume it. Accepting this one and rejecting that one would leave an item with a
hard break in its label unwritable; accepting that one and rejecting this one
would leave every wrapped heading unwritable.

### Examples

Four are proposed, in §2.6 beside the other `E-4` examples. Each was checked
against the prototype.

`````markdown
A heading written over two lines is one line of text: the break between them is
a soft break, which every renderer shows as a space, so the label holds a space
(E-4).

````example
Install
=======
.
{"content":[],"children":[
  {"kind":"section","label":"Install","content":[],"children":[]}]}
````

````example
Head
more
===
.
{"content":[],"children":[
  {"kind":"section","label":"Head more","content":[],"children":[]}]}
````

The same inside a list item, where the item's indentation goes first (E-5, and
RFC 0057 Part 1) and the break then folds:

````example
- x
  - a
    b
.
{"content":[],"children":[
  {"kind":"item","label":"x","content":[],"children":[
    {"kind":"item","label":"a b","content":[],"children":[]}]}]}
````

A hard break is not folded, because it is not invisible — it survives as the
backslash form L-9 records:

````example
- a\
  b
.
{"content":[],"children":[
  {"kind":"item","label":"a\\\nb","content":[],"children":[]}]}
````
`````

**Only the fourth is canonical.** The first and second are setext, which `P-6`
already made non-canonical; the third folds to one line, so its canonical form is
`- x` / `  - a b`. Each settles on the first round trip, as with `L-9` and
`L-10`.

No example is proposed for `S-8`, for the reason §1.4.3 already records about
`S-1` through `S-4`: the suite is a list of documents, and a document `S-8`
refuses has no tree to write down.

### Round-trip consequence

- **Trees.** Every document with a soft break inside a label — a wrapped heading,
  a wrapped item — lifts to a different tree than it does today. Every such tree
  now has a canonical projection, where a section's had none.
- **Conforming documents.** A heading whose inline content carries a hard break
  stops conforming. Nothing else changes.
- **Canonical documents.** A heading written over more than one line becomes
  conforming and not canonical; its bytes settle on the first round trip, as with
  `L-9` and `L-10`.
- **The suite.** Example 6 — `Install` / `=======` / `Requirements` /
  `------------` — is unchanged: neither label spans a line.

### Edge cases

| | |
|---|---|
| A soft break in a content block | **Not folded.** A paragraph's line structure is part of what `P-9` writes back, and `E-5` says so |
| An even run of backslashes before a break | An escaped backslash and then a soft break, so the break folds |
| A soft break next to trailing whitespace | RFC 0057 Part 2 removes the whitespace first; one space is left |
| A label that is only a line break | Cannot arise: `E-4` already removes leading and trailing whitespace |
| An item's label with a hard break | RFC 0057 Part 1's rule, unchanged |
| A section at depth 7 or more | `P-2` and `L-5` already bound the level at 6; `S-8` is about the label, not the level |

Bounds: one pass over the label. Nothing is parsed.

### How it is tested

The four examples above, once they are in `spec.md`. And a prototype on
[`rfc/soft-break-label`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/soft-break-label),
branched from the RFC 0057 prototype because both amend `E-4`: the soft and hard
cases are tested side by side, so the two rules' scopes are visible rather than
asserted. 149 tests, 148 pass, 1 todo — the empty-first-child case RFC 0046
closes.

## Alternatives

**Do nothing.** A wrapped heading has no canonical projection, and §1.3's promise
is false for it. Rejected.

**`L-2`: a setext heading whose inline content contains a line break is not a
section.** It would lift to content instead. A reader sees a heading and the tree
does not, which is the divergence §1.2.4 L0 exists to prevent. Rejected.

**A document whose lift has no canonical projection does not conform.** The
general answer, recorded in RFC 0058's alternatives for the same reason: it
throws away a document someone wrote, and here that document is a wrapped
heading. Rejected for Part 1; **this is what Part 2 does** for the hard-break
remainder, where no spelling exists and the alternative is to change what the
reader sees.

**Relax `P-6` to allow setext when a label spans lines.** Setext has only `=` and
`-`, so it covers levels 1 and 2 and leaves a section at depth 3 or more with no
spelling. It moves the hole rather than closing it, and it makes canonical form
depend on depth. Rejected.

**Fold a hard break too.** One rule, no `S-8`, nothing refused. It changes what a
renderer shows — a `<br />` becomes a space — which is the one thing this
specification has refused at every turn. Rejected.

**Record the label's lines and let projection escape the break.** `P-9`'s
reasoning applies: an escape changes the characters, lift records what it finds,
and the tree differs. Rejected.

**Prior art.** OPML cannot express the case: a `text` attribute is one line.
markmap flattens a wrapped heading to one line, which is Part 1. CommonMark
itself is the authority Part 1 rests on — the fold records what CommonMark's own
renderer produces, rather than inventing a notion of its own (§1.5.1).

## Unresolved questions

**Whether `S-8` should be stated over the label or over the document.** It is
written as a well-formedness rule because that is where `S-1` sits, and the
refusal follows from §2.4 rather than from a new mechanism. A reviewer who thinks
the refusal belongs in `L-2` should say so; the behaviour is the same and the
place it is written is not.

**A hard break inside a heading may deserve a better answer than refusal.** It is
expressible in Markdown and a renderer shows it, so refusing is this
specification choosing not to represent something a reader can see. The case for
refusing is that the alternative is worse — `P-6` would have to go, and with it
one canonical spelling for a heading. Named rather than settled; if someone
reports writing headings that way, the answer should change, as it did for
[#35](https://github.com/mindmapmarkdown/spec/issues/35).

**Separability.** Part 1 can be accepted without Part 2: a wrapped heading would
then be writable and a heading with a hard break in it would still have no
canonical projection — strictly better than today, and still a hole. Part 2
cannot be accepted without Part 1, because without the fold `S-8` would refuse
every wrapped heading. The decision should record each part.

## Decision and rationale
