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

import { blocksOf, runs, findings, measure } from './check-informative.mjs'

const md = (...l) => l.join('\n')
const carried = (source) => runs(blocksOf(source)).flatMap((r) => r.run).length
const reported = (source) => findings(blocksOf(source)).length

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
