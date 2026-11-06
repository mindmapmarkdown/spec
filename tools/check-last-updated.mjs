#!/usr/bin/env node
//
// Fails when spec.md changed and its **Last updated** row did not.
//
//   node tools/check-last-updated.mjs                 against origin/main
//   node tools/check-last-updated.mjs --base <ref>    against another ref
//
// The field said 2026-07-27 for three months, which was the date the file was
// created. It survived seven commits to spec.md because nothing looked at it,
// and a date nobody checks is worse than no date: it does not say "unknown", it
// says something false with the authority of the document's own header.
//
// This is the same bargain CONTRIBUTING.md §6 already makes for the conformance
// suite — a pull request that changes an example without regenerating cannot
// merge — applied to the one other thing in this repository that is maintained
// by hand and drifts silently.
//
// What it does NOT do is check that the date is *right*. Comparing it to the
// clock, or to a commit's timestamp, would make the check fail on the authoring
// timezone and on the hour a pull request happens to be merged: a date stamped
// in Seoul after 09:00 KST is tomorrow in UTC. A check that fails for a reason
// the author cannot see teaches contributors to ignore red builds, which costs
// more than the stale date it would catch. So the question asked here is
// decidable from the two versions of the file alone and never from the time:
// **did the text change without the date changing?**
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = resolve(ROOT, 'spec.md')

const ROW = /^\|\s*\*\*Last updated\*\*\s*\|\s*(.*?)\s*\|\s*$/m
const ISO = /^\d{4}-\d{2}-\d{2}$/

/** The value of the **Last updated** row, or null if there is no such row. */
export function lastUpdated(source) {
  const m = ROW.exec(source)
  return m ? m[1] : null
}

/**
 * Compare two versions of the file. Pure, and deliberately independent of the
 * clock: `stale` is true only when the text moved and the date did not.
 */
export function verdict(baseSource, headSource) {
  const base = lastUpdated(baseSource)
  const head = lastUpdated(headSource)
  const changed = baseSource !== headSource
  return {
    changed,
    base,
    head,
    missing: head === null,
    malformed: head !== null && !ISO.test(head),
    stale: changed && base === head,
  }
}

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
}

function main(argv) {
  const at = argv.indexOf('--base')
  let base = at >= 0 ? argv[at + 1] : null

  const head = readFileSync(SPEC, 'utf8')

  // Format first: it is worth saying whatever the diff turns out to be, and it
  // needs no history at all.
  const now = verdict(head, head)
  if (now.missing) {
    console.error('spec.md has no **Last updated** row in its header table.')
    return 1
  }
  if (now.malformed) {
    console.error(`spec.md's **Last updated** is "${now.head}", not an ISO date.`)
    console.error('Write it as yyyy-mm-dd, the form every other date in this')
    console.error('repository uses.')
    return 1
  }

  if (!base) {
    try {
      const headSha = git('rev-parse', 'HEAD').trim()
      const mainSha = git('rev-parse', 'origin/main').trim()
      base = headSha === mainSha ? 'HEAD^' : 'origin/main'
    } catch {
      console.error('Cannot resolve origin/main, so there is nothing to compare')
      console.error('spec.md against. In CI this means the checkout is shallow:')
      console.error('actions/checkout needs fetch-depth: 0 for this step.')
      console.error('Locally, pass --base <ref>.')
      return 1
    }
  }

  let baseSource
  try {
    baseSource = git('show', `${base}:spec.md`)
  } catch {
    console.error(`Cannot read spec.md at ${base}.`)
    return 1
  }

  const v = verdict(baseSource, head)
  if (v.stale) {
    console.error(`spec.md changed since ${base}, and **Last updated** did not.`)
    console.error(`It still says ${v.head}.`)
    console.error('')
    console.error('Set it to the date of this change. It is the only thing in')
    console.error('the header a reader can use to judge how fresh the text is,')
    console.error('and it was wrong by three months before this check existed.')
    return 1
  }

  if (!v.changed) {
    console.log(`spec.md unchanged since ${base}; **Last updated** is ${v.head}`)
  } else {
    console.log(`spec.md changed since ${base}; **Last updated** ${v.base} → ${v.head}`)
  }
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
