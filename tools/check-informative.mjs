#!/usr/bin/env node
//
// Keeps §1.2.2 and the document that obeys it from drifting apart.
//
//   node tools/check-informative.mjs            check; non-zero on a finding
//   node tools/check-informative.mjs --measure  print the counts, check nothing
//
// §1.2.2 says a paragraph-level *(Informative)* marking "covers that paragraph
// alone". The specification did not write its informative prose that way:
// sixteen markings each carried further paragraphs of the same rationale after
// them, and a literal reading made 42 blocks of explanation normative. RFC 0093
// fixed the document rather than the rule — every informative paragraph carries
// its own marking, and the two longest runs became informative subsections —
// and this check is what stops the next paragraph of rationale from being
// written under a marking that cannot reach it.
//
// What a finding means: the paragraph is either informative, and needs its own
// marking or a heading-level one above it, or it is normative, and should say so
// by being written as a rule or moved above the marking. The check cannot tell
// which, for the reason RFC 0093's *Alternatives* records — the specification
// opens both rules and informative emphasis with bold lead-ins, so no formatting
// test separates them. It is a prompt to a human, not an oracle.
//
// Two kinds of block are never reported, because neither can state a
// requirement and neither has a paragraph start to carry a marking at: a table,
// and a thematic break, which says nothing at all.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = resolve(ROOT, 'spec.md')

const MARKING = /^\*\(Informative\)\*/
const HEADING = /^#{1,6} /
const FENCE = /^(````?|~~~~?)/
const LIST = /^\s*([-+*]|\d{1,9}[.)])\s/
const TABLE = /^\|/
const BREAK = /^(?:-{3,}|\*{3,}|_{3,})\s*$/
const BOLD = /^\*\*/
const KEYWORD =
  /\b(MUST NOT|MUST|SHALL NOT|SHALL|SHOULD NOT|SHOULD|NOT RECOMMENDED|RECOMMENDED|REQUIRED|MAY|OPTIONAL)\b/

/**
 * Split Markdown into blocks: runs of non-blank lines, with a fenced run — an
 * `example` block and everything inside it — counting as one block however many
 * blank lines it contains.
 */
export function blocksOf(source) {
  const lines = source.split('\n')
  const blocks = []
  let cur = null
  let fence = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const f = FENCE.exec(line)

    if (fence !== null) {
      cur.lines.push(line)
      if (f && f[1].length >= fence.length && line.trim() === f[1]) {
        blocks.push(cur)
        cur = null
        fence = null
      }
      continue
    }
    if (f) {
      if (cur) blocks.push(cur)
      fence = f[1]
      cur = { line: i + 1, lines: [line], kind: 'fence' }
      continue
    }
    if (!line.trim()) {
      if (cur) blocks.push(cur)
      cur = null
      continue
    }
    if (!cur) cur = { line: i + 1, lines: [], kind: null }
    cur.lines.push(line)
  }
  if (cur) blocks.push(cur)

  let section = ''
  for (const b of blocks) {
    const first = b.lines[0]
    if (b.kind !== 'fence') {
      if (HEADING.test(first)) b.kind = 'heading'
      else if (LIST.test(first)) b.kind = 'list'
      else if (TABLE.test(first)) b.kind = 'table'
      else if (BREAK.test(first)) b.kind = 'break'
      else if (BOLD.test(first)) b.kind = 'bold'
      else b.kind = 'paragraph'
    }
    b.text = b.lines.join('\n')
    b.marked = MARKING.test(b.text)
    if (b.kind === 'heading') {
      const m = /^#{2,6} (\d[\d.]*)/.exec(first)
      if (m) section = m[1]
    }
    b.section = section
  }
  return blocks
}

// A run ends at the next heading, fenced example, list, bold-opening paragraph,
// or marking. The last condition is the one worth naming: a new marking opens a
// run of its own, and leaving it out is what made an early draft of RFC 0093
// state a method that did not yield the number it reported — 57 rather than 42.
const STOPS = new Set(['heading', 'fence', 'list', 'bold'])

/** Each paragraph-level marking, with the blocks its run carries after it. */
export function runs(blocks) {
  const out = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (!b.marked || b.kind === 'heading') continue
    const run = []
    for (let j = i + 1; j < blocks.length; j++) {
      if (STOPS.has(blocks[j].kind) || blocks[j].marked) break
      run.push(blocks[j])
    }
    out.push({ marking: b, run })
  }
  return out
}

/** Blocks a run carries that are neither marked nor exempt. */
export function findings(blocks) {
  const out = []
  for (const { marking, run } of runs(blocks)) {
    for (const b of run) {
      if (b.kind === 'table' || b.kind === 'break') continue
      out.push({ marking, block: b })
    }
  }
  return out
}

/** The figures RFC 0093's *How far it reaches* states. */
export function measure(blocks) {
  const all = runs(blocks)
  const carried = all.flatMap((r) => r.run)
  const sections = {}
  for (const r of all) {
    sections[r.marking.section] = (sections[r.marking.section] || 0) + 1
  }
  return {
    markings: all.length,
    withRun: all.filter((r) => r.run.length).length,
    carried: carried.length,
    withKeyword: carried.filter((b) => KEYWORD.test(b.text)).length,
    sections,
    longest: all
      .map((r) => [r.marking.section, r.run.length])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .filter(([, n]) => n),
  }
}

function main(argv) {
  const blocks = blocksOf(readFileSync(SPEC, 'utf8'))

  if (argv.includes('--measure')) {
    const m = measure(blocks)
    const secs = Object.entries(m.sections)
      .map(([s, n]) => `§${s}${n > 1 ? ` (${n})` : ''}`)
      .join(', ')
    console.log(`paragraph-level markings                       ${m.markings}`)
    console.log(`  whose run is more than the marked paragraph  ${m.withRun}`)
    console.log(`blocks those runs carry                        ${m.carried}`)
    console.log(`  of those, containing a BCP 14 keyword        ${m.withKeyword}`)
    console.log(`sections with a paragraph-level marking        ${secs}`)
    if (m.longest.length) {
      console.log(
        `longest runs                                   ` +
          m.longest.map(([s, n]) => `§${s} with ${n}`).join(', ')
      )
    }
    return 0
  }

  const found = findings(blocks)
  if (found.length) {
    console.error(
      `${found.length} paragraph(s) carried by an *(Informative)* marking ` +
        `that does not reach them:\n`
    )
    for (const { marking, block } of found) {
      console.error(
        `  spec.md:${block.line} (§${block.section}) — marking at line ${marking.line}`
      )
      console.error(`    ${block.lines[0].slice(0, 76)}`)
    }
    console.error('')
    console.error('§1.2.2: a paragraph-level marking covers that paragraph alone.')
    console.error('Either give each paragraph its own *(Informative)*, or put a')
    console.error('heading-level marking above the run, or — if a paragraph is')
    console.error('normative — write it as a rule or move it above the marking.')
    return 1
  }

  const m = measure(blocks)
  const exempt = m.carried
  console.log(
    `${m.markings} paragraph-level *(Informative)* markings in spec.md; ` +
      `no unmarked paragraph is carried by one` +
      (exempt
        ? `\n(${exempt} table or thematic break carried, which can state no requirement)`
        : '')
  )
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
