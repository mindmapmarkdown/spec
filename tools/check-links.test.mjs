// Tests for tools/check-links.mjs.
//
//   node --test tools/*.test.mjs
//
// Uses only the Node test runner, so the repository stays dependency-free.
//
// A link checker that is wrong is worse than none: it either passes broken
// links or, more insidiously, reports working ones as broken until somebody
// "fixes" a correct document to satisfy it. The first run of this checker did
// exactly the second thing — it collapsed a double space into one hyphen and
// declared a correct anchor broken. These cases pin the slug rules down.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import test from 'node:test'
import assert from 'node:assert/strict'

import { slugify, headingAnchors, extractLinks } from './check-links.mjs'

const md = (...l) => l.join('\n')

test('slugify lowercases and hyphenates', () => {
  assert.equal(slugify('Repository layout'), 'repository-layout')
})

test('slugify drops punctuation but keeps digits', () => {
  assert.equal(slugify('1.2.4 Conforming implementations'), '124-conforming-implementations')
})

test('slugify drops emphasis markers and their parentheses', () => {
  assert.equal(
    slugify('1.1.3 Why the boundary is drawn here *(Informative)*'),
    '113-why-the-boundary-is-drawn-here-informative'
  )
})

test('slugify puts one hyphen per space, not per run', () => {
  // The em dash is removed and both spaces around it survive as hyphens.
  assert.equal(slugify('Lazy consensus — 게으른 합의'), 'lazy-consensus--게으른-합의')
})

test('slugify keeps non-Latin letters', () => {
  assert.equal(slugify('데이터 모델'), '데이터-모델')
  assert.equal(slugify('RFC 읽는 법'), 'rfc-읽는-법')
})

test('slugify reduces code spans and links to their text', () => {
  assert.equal(slugify('Working on `spec.md`'), 'working-on-specmd')
  assert.equal(slugify('See [the docs](docs/)'), 'see-the-docs')
})

test('slugify keeps underscores, as GitHub does', () => {
  assert.equal(slugify('snake_case heading'), 'snake_case-heading')
})

test('headingAnchors suffixes repeated headings', () => {
  assert.deepEqual(
    [...headingAnchors(md('## RFC', '## RFC', '## RFC'))],
    ['rfc', 'rfc-1', 'rfc-2']
  )
})

test('headingAnchors ignores headings inside a fenced block', () => {
  const anchors = headingAnchors(
    md('# Real', '', '```markdown', '# Not a heading', '```', '', '# Also real')
  )
  assert.deepEqual([...anchors], ['real', 'also-real'])
})

test('headingAnchors handles a longer fence containing a shorter one', () => {
  const anchors = headingAnchors(
    md('````markdown', '```', '# hidden', '```', '````', '# visible')
  )
  assert.deepEqual([...anchors], ['visible'])
})

test('headingAnchors ignores closing hashes', () => {
  assert.deepEqual([...headingAnchors('## Title ##')], ['title'])
})

test('extractLinks finds relative links with their line numbers', () => {
  assert.deepEqual(
    extractLinks(md('intro', 'see [spec](../spec.md#13-terminology) for more')),
    [{ line: 2, target: '../spec.md#13-terminology' }]
  )
})

test('extractLinks ignores external and mail links', () => {
  assert.deepEqual(
    extractLinks(
      md(
        '[a](https://example.com)',
        '[b](http://example.com)',
        '[c](mailto:x@example.com)',
        '[d](//example.com)',
        '[e](docs/glossary.md)'
      )
    ),
    [{ line: 5, target: 'docs/glossary.md' }]
  )
})

test('extractLinks survives a link whose text contains code spans', () => {
  assert.deepEqual(
    extractLinks('[`GOVERNANCE.md` §3](GOVERNANCE.md#3-classes-of-change)'),
    [{ line: 1, target: 'GOVERNANCE.md#3-classes-of-change' }]
  )
})

test('extractLinks ignores a link that is itself inside a code span', () => {
  assert.deepEqual(extractLinks('write it as `[text](target.md)` in Markdown'), [])
})

test('extractLinks ignores links inside a fenced block', () => {
  assert.deepEqual(
    extractLinks(md('```markdown', '[example](nowhere.md)', '```', '[real](spec.md)')),
    [{ line: 4, target: 'spec.md' }]
  )
})

test('extractLinks finds images too', () => {
  assert.deepEqual(extractLinks('![diagram](docs/tree.png)'), [
    { line: 1, target: 'docs/tree.png' },
  ])
})

test('extractLinks keeps a fragment-only link, which points at its own file', () => {
  assert.deepEqual(extractLinks('[jump](#participating)'), [
    { line: 1, target: '#participating' },
  ])
})
