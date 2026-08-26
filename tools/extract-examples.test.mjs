// Tests for tools/extract-examples.mjs.
//
//   node --test tools/
//
// Uses only the Node test runner, so the repository stays dependency-free.
//
// These matter more than they look. spec.md contains no examples yet — Chapter 1
// states no rules to demonstrate — so the extractor is entirely unexercised by
// the real source. Fixtures are the only thing standing between "it produced an
// empty file" and "it works". The first real example must land on machinery that
// has already been proven, not on machinery whose first test is that example.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import test from 'node:test'
import assert from 'node:assert/strict'

import { extract, serialise } from './extract-examples.mjs'

const spec = (...lines) => lines.join('\n')

test('extracts an example and records where it came from', () => {
  const [example, ...rest] = extract(
    spec(
      '## 2. Canonical hierarchy',
      '',
      '### 2.1 Sections',
      '',
      '```example',
      '# A',
      '.',
      '{"children":[{"kind":"section","label":"A"}]}',
      '```',
      ''
    )
  )

  assert.equal(rest.length, 0)
  assert.equal(example.example, 1)
  assert.equal(example.section, '2.1')
  assert.equal(example.heading, 'Sections')
  assert.equal(example.start_line, 5)
  assert.equal(example.end_line, 9)
  assert.equal(example.markdown, '# A\n')
  assert.deepEqual(example.tree, {
    children: [{ kind: 'section', label: 'A' }],
  })
})

test('numbers examples across the whole document and tracks the section', () => {
  const examples = extract(
    spec(
      '### 2.1 One',
      '```example',
      'a',
      '.',
      '{}',
      '```',
      '### 2.2 Two',
      '```example',
      'b',
      '.',
      '{}',
      '```'
    )
  )

  assert.deepEqual(
    examples.map((e) => [e.example, e.section]),
    [
      [1, '2.1'],
      [2, '2.2'],
    ]
  )
})

test('a longer fence lets an example contain a code fence', () => {
  const [example] = extract(
    spec(
      '````example',
      '# A',
      '',
      '```',
      'code',
      '```',
      '.',
      '{}',
      '````'
    )
  )

  assert.equal(example.markdown, '# A\n\n```\ncode\n```\n')
})

test('only the first separator splits; later ones are content', () => {
  const [example] = extract(
    spec('```example', 'a', '.', '{"note":"."}', '```')
  )

  assert.equal(example.markdown, 'a\n')
  assert.deepEqual(example.tree, { note: '.' })
})

test('a right arrow stands for a tab in the Markdown input', () => {
  const [example] = extract(
    spec('```example', '-\ta', '.', '{}', '```').replace('\t', '→')
  )

  assert.equal(example.markdown, '-\ta\n')
})

test('an open box stands for a space in the Markdown input', () => {
  const [example] = extract(
    spec('```example', 'a␣␣', 'b', '.', '{}', '```')
  )

  // L-9 turns on a hard break spelled as trailing spaces; written literally
  // here they would not survive an editor that trims them
  assert.equal(example.markdown, 'a  \nb\n')
})

test('an open box in the expected tree is left alone, like a right arrow', () => {
  const [example] = extract(
    spec('```example', 'a', '.', '{"box":"␣"}', '```')
  )

  assert.deepEqual(example.tree, { box: '␣' })
})

test('the expected tree is JSON, so a tab there is written \\t and left alone', () => {
  const [example] = extract(
    spec('```example', 'a', '.', '{"label":"x\\ty","arrow":"→"}', '```')
  )

  assert.deepEqual(example.tree, { label: 'x\ty', arrow: '→' })
})

test('a fence that is not an example is skipped whole', () => {
  const examples = extract(
    spec(
      '````markdown',
      '```example',
      'this documents the format, it is not an example',
      '.',
      '{}',
      '```',
      '````',
      '```example',
      'real',
      '.',
      '{}',
      '```'
    )
  )

  assert.equal(examples.length, 1)
  assert.equal(examples[0].markdown, 'real\n')
})

test('headings inside a skipped fence do not change the section', () => {
  const [example] = extract(
    spec(
      '### 2.1 Real',
      '```markdown',
      '### 9.9 Not a heading',
      '```',
      '```example',
      'a',
      '.',
      '{}',
      '```'
    )
  )

  assert.equal(example.section, '2.1')
})

test('an unnumbered heading clears the section', () => {
  const [example] = extract(
    spec('### 2.1 Numbered', '## Status', '```example', 'a', '.', '{}', '```')
  )

  assert.equal(example.section, null)
  assert.equal(example.heading, 'Status')
})

test('an empty input side is preserved as empty, not as a newline', () => {
  const [example] = extract(spec('```example', '.', '{}', '```'))

  assert.equal(example.markdown, '')
})

test('a missing separator is an error naming the line', () => {
  assert.throws(
    () => extract(spec('', '```example', 'a', '```')),
    /spec\.md:2: .*no `\.` separator/
  )
})

test('an unclosed example is an error', () => {
  assert.throws(
    () => extract(spec('```example', 'a', '.', '{}')),
    /spec\.md:1: .*never closed/
  )
})

test('an expected tree that is not JSON is an error', () => {
  assert.throws(
    () => extract(spec('```example', 'a', '.', '{oops}', '```')),
    /spec\.md:1: .*not valid JSON/
  )
})

test('an unrecognised example flavour is refused rather than ignored', () => {
  assert.throws(
    () => extract(spec('```example projection', 'a', '.', '{}', '```')),
    /spec\.md:1: unrecognised example flavour/
  )
})

test('a source with no examples yields none', () => {
  assert.deepEqual(extract('# Just prose\n\nNothing to extract.\n'), [])
})

test('serialisation is stable, indented, and newline-terminated', () => {
  const once = serialise(extract(spec('```example', 'a', '.', '{}', '```')))
  const twice = serialise(extract(spec('```example', 'a', '.', '{}', '```')))

  assert.equal(once, twice)
  assert.match(once, /\n$/)
  assert.equal(JSON.parse(once).source, 'spec.md')
  assert.match(JSON.parse(once)._comment, /DO NOT EDIT/)
})
