#!/usr/bin/env node
//
// Extracts the normative examples embedded in spec.md into a machine-readable
// conformance suite at examples/examples.json.
//
//   node tools/extract-examples.mjs           rewrite examples/examples.json
//   node tools/extract-examples.mjs --check    verify it is up to date, write nothing
//
// The specification and its test suite are the same source. Examples are
// written inline in spec.md, next to the rule they demonstrate, and the JSON is
// generated from them — never the other way round. That is the arrangement that
// stops a specification and its tests from drifting apart, and it is the reason
// CommonMark's suite could be trusted; this script is deliberately modelled on
// theirs. See CONTRIBUTING.md §6.
//
// An example is a fenced block whose info string is `example`:
//
//     ```example
//     <Markdown input>
//     .
//     <expected tree, as JSON>
//     ```
//
// The fence may use any number of backticks from three upwards, so that an
// example containing a code fence can be wrapped in a longer one. The first
// line consisting of exactly `.` separates input from expected output; a later
// one is ordinary content.
//
// In the Markdown input, a right-arrow (→, U+2192) stands for a tab. A literal
// tab there is invisible, significant to the parser, and easily destroyed by an
// editor, which is why CommonMark adopted the same convention. The expected
// tree needs no such convention and gets none: it is JSON, where a tab is
// written `\t` and a literal one would not parse.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'spec.md')
const TARGET = join(ROOT, 'examples', 'examples.json')

const NOTICE =
  'GENERATED FILE — DO NOT EDIT. Extracted from spec.md by ' +
  'tools/extract-examples.mjs. Edit the example in spec.md and regenerate; ' +
  'a hand-edit here changes the conformance suite without changing the ' +
  'specification, and the two silently disagree. See CONTRIBUTING.md §6.'

const FENCE_OPEN = /^(`{3,})[ \t]*(\S.*?)?[ \t]*$/
const HEADING = /^#{1,6}[ \t]+(?:([\d]+(?:\.[\d]+)*)\.?[ \t]+)?(.*?)[ \t]*$/
const TAB = /→/g

class ExtractionError extends Error {
  constructor(line, message) {
    super(`spec.md:${line}: ${message}`)
    this.name = 'ExtractionError'
  }
}

/**
 * Pull every `example` block out of a specification source.
 *
 * @param {string} text  contents of spec.md
 * @returns {Array<object>} one entry per example, in document order
 */
export function extract(text) {
  const lines = text.split(/\r?\n/)
  const examples = []

  let section = null
  let heading = null
  let number = 0

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const fence = FENCE_OPEN.exec(line)

    if (!fence) {
      const h = HEADING.exec(line)
      if (h) {
        section = h[1] ?? null
        heading = h[2] || null
      }
      i += 1
      continue
    }

    const [, backticks, info = ''] = fence
    const startLine = i + 1
    const closer = new RegExp(`^\`{${backticks.length},}[ \\t]*$`)

    // A fence that is not an example is skipped whole, so that a block
    // demonstrating this format cannot be mistaken for an example itself.
    if (info !== 'example') {
      if (info.split(/[ \t]+/)[0] === 'example') {
        throw new ExtractionError(
          startLine,
          `unrecognised example flavour \`${info}\`. Only a bare \`example\` ` +
            `info string is defined; if the specification needs another kind ` +
            `of example, the format has to be specified before it can be ` +
            `extracted.`
        )
      }
      i += 1
      while (i < lines.length && !closer.test(lines[i])) i += 1
      i += 1
      continue
    }

    const input = []
    const expected = []
    let seenSeparator = false
    let closed = false

    i += 1
    while (i < lines.length) {
      if (closer.test(lines[i])) {
        closed = true
        break
      }
      if (!seenSeparator && lines[i] === '.') {
        seenSeparator = true
      } else {
        ;(seenSeparator ? expected : input).push(lines[i])
      }
      i += 1
    }

    if (!closed) {
      throw new ExtractionError(startLine, 'example block is never closed')
    }
    if (!seenSeparator) {
      throw new ExtractionError(
        startLine,
        'example block has no `.` separator between input and expected tree'
      )
    }

    const endLine = i + 1

    let tree
    try {
      tree = JSON.parse(expected.join('\n'))
    } catch (cause) {
      throw new ExtractionError(
        startLine,
        `expected tree is not valid JSON — ${cause.message}`
      )
    }

    number += 1
    examples.push({
      example: number,
      section,
      heading,
      start_line: startLine,
      end_line: endLine,
      markdown: input.length ? input.join('\n').replace(TAB, '\t') + '\n' : '',
      tree,
    })

    i += 1
  }

  return examples
}

/** Serialise the suite exactly as it is committed — stable and newline-terminated. */
export function serialise(examples) {
  return (
    JSON.stringify(
      { _comment: NOTICE, source: 'spec.md', examples },
      null,
      2
    ) + '\n'
  )
}

function main(argv) {
  const check = argv.includes('--check')
  const unknown = argv.filter((a) => a !== '--check')
  if (unknown.length) {
    console.error(`unknown argument: ${unknown[0]}`)
    console.error('usage: node tools/extract-examples.mjs [--check]')
    return 2
  }

  let generated
  try {
    generated = serialise(extract(readFileSync(SOURCE, 'utf8')))
  } catch (error) {
    if (error instanceof ExtractionError) {
      console.error(error.message)
      return 1
    }
    throw error
  }

  const count = JSON.parse(generated).examples.length

  if (!check) {
    mkdirSync(dirname(TARGET), { recursive: true })
    writeFileSync(TARGET, generated)
    console.log(`examples/examples.json ← spec.md (${count} examples)`)
    return 0
  }

  let committed
  try {
    committed = readFileSync(TARGET, 'utf8')
  } catch {
    console.error('examples/examples.json is missing.')
    console.error('Run: node tools/extract-examples.mjs')
    return 1
  }

  if (committed !== generated) {
    console.error(
      'examples/examples.json does not match the examples in spec.md.'
    )
    console.error('')
    console.error(
      'The suite is generated, so this means one of two things: spec.md was'
    )
    console.error(
      'changed without regenerating, or examples.json was edited by hand.'
    )
    console.error('Either way the fix is the same — regenerate and commit both:')
    console.error('')
    console.error('    node tools/extract-examples.mjs')
    console.error('    git add spec.md examples/examples.json')
    console.error('')
    console.error('See CONTRIBUTING.md §6.')
    return 1
  }

  console.log(`examples/examples.json is up to date (${count} examples)`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
