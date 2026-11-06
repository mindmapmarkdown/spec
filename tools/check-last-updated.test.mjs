// Tests for tools/check-last-updated.mjs.
//
//   node --test tools/*.test.mjs
//
// Uses only the Node test runner, so the repository stays dependency-free.
//
// The whole value of this check is that its answer does not depend on the
// clock, so these cases are written against pairs of file contents and never
// against a date. The one thing worth pinning hardest is the case the check
// must NOT fire on: a change that does bump the date, and a change to some
// other file that leaves spec.md alone — a false failure here would be reported
// on every pull request and would be ignored within a week.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import test from 'node:test'
import assert from 'node:assert/strict'

import { lastUpdated, verdict } from './check-last-updated.mjs'

const spec = (date, body = 'Chapter 1.') =>
  [
    '# Mindmap Markdown',
    '',
    '| | |',
    '|---|---|',
    '| **Version** | unversioned draft |',
    '| **Status** | Draft |',
    `| **Last updated** | ${date} |`,
    '| **Licence** | CC-BY-4.0 |',
    '',
    body,
    '',
  ].join('\n')

test('reads the row out of the header table', () => {
  assert.equal(lastUpdated(spec('2026-11-06')), '2026-11-06')
})

test('a file with no such row reads as null', () => {
  assert.equal(lastUpdated('# Title\n\nProse.\n'), null)
  assert.equal(verdict('# T\n', '# T\n').missing, true)
})

test('text changed and the date did not is stale', () => {
  const v = verdict(spec('2026-07-27'), spec('2026-07-27', 'Chapter 2.'))
  assert.equal(v.changed, true)
  assert.equal(v.stale, true)
})

test('text changed and the date with it is not stale', () => {
  const v = verdict(spec('2026-07-27'), spec('2026-11-06', 'Chapter 2.'))
  assert.equal(v.changed, true)
  assert.equal(v.stale, false)
  assert.equal(v.base, '2026-07-27')
  assert.equal(v.head, '2026-11-06')
})

test('nothing changed is not stale, whatever the date says', () => {
  const v = verdict(spec('2026-07-27'), spec('2026-07-27'))
  assert.equal(v.changed, false)
  assert.equal(v.stale, false, 'an untouched file is not this check’s business')
})

test('bumping only the date is not stale either', () => {
  // This commit is exactly that, and it must be allowed to pass.
  const v = verdict(spec('2026-07-27'), spec('2026-11-06'))
  assert.equal(v.changed, true)
  assert.equal(v.stale, false)
})

test('a date that is not an ISO date is malformed', () => {
  assert.equal(verdict(spec('6 November 2026'), spec('6 November 2026')).malformed, true)
  assert.equal(verdict(spec('2026-11-6'), spec('2026-11-6')).malformed, true)
  assert.equal(verdict(spec('2026-11-06'), spec('2026-11-06')).malformed, false)
})

test('the row is found whatever the cell padding is', () => {
  assert.equal(lastUpdated('|**Last updated**|2026-11-06|'), '2026-11-06')
  assert.equal(lastUpdated('|   **Last updated**   |   2026-11-06   |'), '2026-11-06')
})

test('spec.md itself has a well-formed row, which is what CI reads', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, resolve } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const path = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'spec.md')
  const source = readFileSync(path, 'utf8')
  const v = verdict(source, source)
  assert.equal(v.missing, false)
  assert.equal(v.malformed, false)
})
