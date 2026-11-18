#!/usr/bin/env node
//
// Keeps spec.md's **Version** row and CHANGELOG.md's newest release heading
// from disagreeing.
//
//   node tools/check-version-row.mjs    check; non-zero on a finding
//
// 0.1.1 was tagged, released, and attached to the GitHub release with a
// spec.md whose header said **Version** 0.1.0. The release commit touched only
// CHANGELOG.md, on the reasoning that spec.md's text had not changed — which
// is true of the rules and false of the row that names which release the rules
// are. Anyone who downloaded v0.1.1's spec.md read that it was 0.1.0.
//
// `Last updated` already has a guard (check-last-updated.mjs) because it went
// stale for three months. This is the same bargain for the row beside it: the
// version a release claims cannot be left behind by the commit that makes the
// release.
//
// What it compares, and why that pair:
//
//   spec.md      | **Version** | 0.1.1 |
//   CHANGELOG.md ## 0.1.1 — 2026-11-17
//
// CHANGELOG.md rather than `git tag`, for three reasons. VERSIONING.md §6 makes
// a dated CHANGELOG entry a condition of releasing, so the entry exists by the
// time the row matters. The check then needs no git and no network, so it gives
// the same answer in CI, in a shallow clone, and on a contributor's machine.
// And a tag can be pushed after the merge that should have carried the row,
// which is exactly the window this check exists to close.
//
// An `## Unreleased` heading is skipped: it names no release.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// `| **Version** | 0.1.1 |`, with any amount of surrounding whitespace.
const VERSION_ROW = /^\|\s*\*\*Version\*\*\s*\|\s*([^|]*?)\s*\|\s*$/m

// `## 0.1.1 — 2026-11-17`. The separator is an em dash in this file and the
// date is not read here; check-last-updated.mjs owns dates.
const RELEASE_HEADING = /^## (\d+\.\d+\.\d+)\b/m

/**
 * The version spec.md claims, or null when the row is missing or empty.
 */
export function versionRow(specSource) {
  const m = VERSION_ROW.exec(specSource)
  if (!m) return null
  return m[1].length ? m[1] : null
}

/**
 * The newest released version CHANGELOG.md records, or null when it records
 * none. Newest means first in the file, which is the order the file is written
 * in; an `## Unreleased` heading above it is not a release and is skipped
 * because it does not match RELEASE_HEADING.
 */
export function newestRelease(changelogSource) {
  const m = RELEASE_HEADING.exec(changelogSource)
  return m ? m[1] : null
}

/**
 * `{ ok, row, released, reason }`. `ok` is true only when both are present and
 * equal. `reason` is a sentence naming what to do, or null.
 */
export function verdict(specSource, changelogSource) {
  const row = versionRow(specSource)
  const released = newestRelease(changelogSource)
  if (row === null)
    return { ok: false, row, released, reason: 'spec.md has no **Version** row, or its cell is empty.' }
  if (released === null)
    return { ok: true, row, released, reason: null } // nothing released yet; the row is unconstrained
  if (row !== released)
    return {
      ok: false,
      row,
      released,
      reason:
        `spec.md says **Version** ${row} and CHANGELOG.md's newest release is ` +
        `${released}. Whichever is wrong, both must name the same release.`,
    }
  return { ok: true, row, released, reason: null }
}

function main() {
  const v = verdict(
    readFileSync(join(ROOT, 'spec.md'), 'utf8'),
    readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8'),
  )
  if (v.ok) {
    console.log(
      v.released === null
        ? `spec.md says **Version** ${v.row}; CHANGELOG.md records no release yet`
        : `spec.md's **Version** row and CHANGELOG.md agree on ${v.released}`,
    )
    return 0
  }
  console.error(v.reason)
  console.error('')
  console.error('A release attaches spec.md to the GitHub release (VERSIONING.md')
  console.error('§6), so a stale row ships to everyone who downloads it. The row is')
  console.error('part of the release, not a detail after it: move it in the commit')
  console.error('that dates the CHANGELOG entry, together with **Last updated**.')
  return 1
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-version-row.mjs'))
  process.exit(main())
