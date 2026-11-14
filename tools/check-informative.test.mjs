// Tests for tools/check-informative.mjs.
//
//   node --test tools/*.test.mjs
//
// Uses only the Node test runner, so the repository stays dependency-free.
//
// The run rule is the whole check, and it is easy to get subtly wrong: the
// first draft of RFC 0093 described one rule and counted with another, which
// is how a measurement of 42 came to be published alongside a method that
// yields 57. These cases pin each stop down separately, so that a change to one
// cannot quietly move the number.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  blocksOf,
  runs,
  findings,
  measure,
  uncarried,
  UNREAD_PIN,
} from './check-informative.mjs'

const md = (...l) => l.join('\n')
const carried = (source) => runs(blocksOf(source)).flatMap((r) => r.run).length
const reported = (source) => findings(blocksOf(source)).length
const unreached = (source) => uncarried(blocksOf(source)).length

test('a marking whose paragraph is the whole of it carries nothing', () => {
  assert.equal(carried(md('*(Informative)* Why the rule exists.', '')), 0)
  assert.equal(reported(md('*(Informative)* Why the rule exists.', '')), 0)
})

test('a following paragraph is carried, and reported', () => {
  const s = md('*(Informative)* Why the rule exists.', '', 'And more of the same.', '')
  assert.equal(carried(s), 1)
  assert.equal(reported(s), 1)
})

test('a marking on the following paragraph ends the run', () => {
  const s = md('*(Informative)* First.', '', '*(Informative)* Second.', '')
  assert.equal(carried(s), 0)
  assert.equal(reported(s), 0)
  // Two markings, not one with a run of one.
  assert.equal(runs(blocksOf(s)).length, 2)
})

test('a heading ends a run', () => {
  assert.equal(carried(md('*(Informative)* First.', '', '## Next', '', 'Normative.', '')), 0)
})

test('a fenced example ends a run, and counts as one block', () => {
  const s = md(
    '*(Informative)* First.',
    '',
    '````example',
    '# A',
    '',
    '.',
    '{"content":[],"children":[]}',
    '````',
    '',
    'After the fence.',
    ''
  )
  assert.equal(carried(s), 0)
  // The blank line inside the fence does not split it.
  const fences = blocksOf(s).filter((b) => b.kind === 'fence')
  assert.equal(fences.length, 1)
})

test('a list ends a run', () => {
  assert.equal(carried(md('*(Informative)* First.', '', '- an item', '')), 0)
})

test('a bold-opening paragraph ends a run', () => {
  assert.equal(carried(md('*(Informative)* First.', '', '**L-13.** A definition.', '')), 0)
})

test('a heading-level marking opens no run of its own', () => {
  const s = md('#### 2.4.1 Why *(Informative)*', '', 'Rationale.', '', 'More rationale.', '')
  assert.equal(runs(blocksOf(s)).length, 0)
  assert.equal(reported(s), 0)
})

test('a table and a thematic break are carried but never reported', () => {
  const s = md('*(Informative)* First.', '', '| a | b |', '|---|---|', '| 1 | 2 |', '')
  assert.equal(carried(s), 1)
  assert.equal(reported(s), 0, 'a table has no paragraph start to carry a marking at')

  const t = md('*(Informative)* First.', '', '---', '')
  assert.equal(carried(t), 1)
  assert.equal(reported(t), 0, 'a thematic break states nothing')
})

test('measure counts BCP 14 keywords only in the blocks a run carries', () => {
  const s = md(
    '*(Informative)* First.',
    '',
    'An implementation MUST do this.',
    '',
    '## Next',
    '',
    'An implementation MUST do that.',
    ''
  )
  const m = measure(blocksOf(s))
  assert.equal(m.carried, 1)
  assert.equal(m.withKeyword, 1, 'the one inside the run')
})

test('measure attributes each marking to the section it sits in', () => {
  const s = md(
    '### 2.4 Well-formed trees',
    '',
    '*(Informative)* Why S-1.',
    '',
    '### 2.5 Canonical projection',
    '',
    '*(Informative)* Why P-5.',
    '',
    '*(Informative)* Why P-7.',
    ''
  )
  const m = measure(blocksOf(s))
  assert.deepEqual(m.sections, { '2.4': 1, '2.5': 2 })
})

test('the marking must open the block to count', () => {
  // A mention inside a sentence is not a marking.
  const s = md('The *(Informative)* marking covers that paragraph alone.', '', 'Next.', '')
  assert.equal(runs(blocksOf(s)).length, 0)
})

test('spec.md itself passes, which is what CI runs', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, resolve } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const spec = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'spec.md')
  assert.equal(findings(blocksOf(readFileSync(spec, 'utf8'))).length, 0)
})

// ── the second job: the set no marking reaches (#97) ──
//
// The first job asks whether a marking reaches too far. This one asks what no
// marking reaches at all, and the cases below pin each exclusion separately,
// because every one of them is a reason a block is NOT a candidate for a
// marking, and getting one wrong either hides informative prose or invites a
// requirement to be withdrawn.

test('prose after a fence is in the set, which is the shape #97 is about', () => {
  const s = md('```example', 'in', '```', '', 'Why the rule reads that way.', '')
  // No marking reaches it: a run would have stopped at the fence anyway.
  assert.equal(reported(s), 0)
  assert.equal(unreached(s), 1)
})

test('a block a run carries is the first job, not this one', () => {
  const s = md('*(Informative)* Why.', '', 'And more.', '')
  assert.equal(reported(s), 1)
  assert.equal(unreached(s), 0)
})

test('a marked block is not in the set', () => {
  assert.equal(unreached(md('*(Informative)* Why.', '')), 0)
})

test('a heading marking covers everything beneath it', () => {
  const s = md('## Why *(Informative)*', '', 'One.', '', 'Two.', '')
  assert.equal(unreached(s), 0)
})

test('a heading marking stops at the next heading of its depth or above', () => {
  const s = md(
    '## Why *(Informative)*', '', 'Covered.', '',
    '### Still under it', '', 'Also covered.', '',
    '## A new section', '', 'Not covered.', ''
  )
  assert.equal(unreached(s), 1)
  assert.equal(uncarried(blocksOf(s))[0].lines[0], 'Not covered.')
})

test('a rule and a §1.3 term are normative by their form', () => {
  assert.equal(unreached(md('**L-14.** A line ending is a line feed.', '')), 0)
  assert.equal(unreached(md('**document** — A sequence of code points.', '')), 0)
  // A bold lead-in that is neither is in the set -- it is exactly the shape
  // RFC 0093's *Alternatives* says no formatting test can classify.
  assert.equal(unreached(md('**Why the two cases differ.** Because of E-10.', '')), 1)
})

test('a heading, a list, a table and a thematic break are not prose', () => {
  assert.equal(unreached(md('## A heading', '')), 0)
  assert.equal(unreached(md('- an item', '')), 0)
  assert.equal(unreached(md('| a | table |', '|---|---|', '')), 0)
  assert.equal(unreached(md('---', '')), 0)
})

test('spec.md sits at the pin, so the number in the tool is the document', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, resolve } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const spec = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'spec.md')
  const m = measure(blocksOf(readFileSync(spec, 'utf8')))
  // Equal, not "at most": a count that has fallen is a pin to lower in the
  // same commit, which is the whole reason the number lives in the source.
  assert.equal(m.unread, UNREAD_PIN)
})
