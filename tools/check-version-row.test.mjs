// Tests for tools/check-version-row.mjs.
//
//   node --test tools/*.test.mjs
//
// Uses only the Node test runner, so the repository stays dependency-free.
//
// The case worth pinning hardest is the one that happened: a CHANGELOG entry
// dated for a new release while spec.md's row still names the previous one.
// After that, the cases worth pinning are the ones the check must NOT fire on,
// because a check that cries wolf on an ordinary pull request is ignored within
// a week — a repository with nothing released yet, and an `## Unreleased`
// heading sitting above the newest release.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import test from 'node:test'
import assert from 'node:assert/strict'

import { versionRow, newestRelease, verdict } from './check-version-row.mjs'

const spec = (version) =>
  [
    '# Mindmap Markdown',
    '',
    '| | |',
    '|---|---|',
    `| **Version** | ${version} |`,
    '| **Status** | Draft |',
    '| **Last updated** | 2026-11-18 |',
    '| **Licence** | CC-BY-4.0 |',
    '',
    '## 1. Scope',
    '',
  ].join('\n')

const changelog = (...headings) =>
  ['# Changelog', '', 'What changed.', '', '---', '', ...headings.flatMap((h) => [h, '', 'Text.', '']), ].join('\n')

test('the row and the newest release agree', () => {
  const v = verdict(spec('0.1.1'), changelog('## 0.1.1 — 2026-11-17', '## 0.1.0 — 2026-11-14'))
  assert.equal(v.ok, true)
  assert.equal(v.released, '0.1.1')
  assert.equal(v.reason, null)
})

test('the defect this check exists for: the release moved and the row did not', () => {
  const v = verdict(spec('0.1.0'), changelog('## 0.1.1 — 2026-11-17', '## 0.1.0 — 2026-11-14'))
  assert.equal(v.ok, false)
  // The message must name both numbers: the reader has to know which to change,
  // and the answer is not always the row.
  assert.match(v.reason, /0\.1\.0/)
  assert.match(v.reason, /0\.1\.1/)
})

test('an Unreleased heading is not a release, so it does not become the target', () => {
  const v = verdict(spec('0.1.1'), changelog('## Unreleased', '## 0.1.1 — 2026-11-17'))
  assert.equal(v.ok, true)
  assert.equal(v.released, '0.1.1')
})

test('nothing released yet leaves the row unconstrained', () => {
  const v = verdict(spec('unversioned draft'), changelog('## Unreleased'))
  assert.equal(v.ok, true)
  assert.equal(v.released, null)
})

test('a missing Version row is a finding, not a pass', () => {
  const noRow = spec('0.1.1').replace(/\| \*\*Version\*\* \| 0\.1\.1 \|\n/, '')
  assert.equal(versionRow(noRow), null)
  assert.equal(verdict(noRow, changelog('## 0.1.1 — 2026-11-17')).ok, false)
})

test('an empty Version cell is a finding too', () => {
  assert.equal(versionRow(spec('')), null)
  assert.equal(verdict(spec(''), changelog('## 0.1.1 — 2026-11-17')).ok, false)
})

test('the row is read with surrounding whitespace, as a table may be aligned', () => {
  assert.equal(versionRow('| **Version**   |   0.2.0   |'), '0.2.0')
})

test('newestRelease takes the first release heading, which is the newest', () => {
  const c = changelog('## 0.2.0 — 2026-12-01', '## 0.1.1 — 2026-11-17', '## 0.1.0 — 2026-11-14')
  assert.equal(newestRelease(c), '0.2.0')
})

test('a version inside prose is not mistaken for a release heading', () => {
  const c = changelog('## Unreleased') + '\nBelow 1.0 the number identifies a state, so 0.1.0 means one.\n'
  assert.equal(newestRelease(c), null)
})

test('spec.md and CHANGELOG.md in this repository agree', async () => {
  const { readFileSync } = await import('node:fs')
  const { join, dirname, resolve } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const v = verdict(
    readFileSync(join(root, 'spec.md'), 'utf8'),
    readFileSync(join(root, 'CHANGELOG.md'), 'utf8'),
  )
  assert.equal(v.ok, true, v.reason ?? '')
})
