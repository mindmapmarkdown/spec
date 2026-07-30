#!/usr/bin/env node
//
// Checks every relative link and heading anchor in the repository's Markdown.
//
//   node tools/check-links.mjs
//
// External links are deliberately not checked. A check that fails because
// somebody else's server was slow teaches contributors to ignore red builds,
// which costs more than the broken link it might have caught. What is checked
// here is entirely within the repository, so it is decidable and never flaky:
//
//   - a relative link points at a path that exists,
//   - it exists with exactly that spelling, including case,
//   - it stays inside the repository,
//   - and a `#fragment` matches a heading in the file it points at.
//
// The case rule earns its keep on its own. A link written `Spec.md` resolves on
// Windows and macOS and fails on Linux and on GitHub's own renderer, so it is
// invisible to the person who wrote it and broken for everybody reading the
// specification on the web.
//
// Anchors are generated the way GitHub generates them, because GitHub is where
// these documents are read: lowercase, drop everything that is not a letter,
// digit, space, hyphen, or underscore, then hyphenate the spaces. Repeated
// headings take `-1`, `-2`, and so on.
//
// Fenced code blocks are skipped for both links and headings. A block
// demonstrating Markdown is not making a claim about this repository, and a
// heading inside one is not a heading.
//
// Licensed under Apache-2.0 (see LICENSE, `tools/**`).

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_DIRS = new Set(['.git', 'node_modules'])
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

/**
 * Turn heading text into the anchor GitHub would give it.
 *
 * The order matters and is GitHub's: reduce the heading to its rendered text,
 * lowercase, drop what is not a letter, digit, space, hyphen, or underscore,
 * and only then hyphenate — **one hyphen per space**, not per run. A heading
 * such as `Lazy consensus — 게으른 합의` loses its em dash and keeps the two
 * spaces that surrounded it, so its anchor carries a double hyphen. Collapsing
 * the run looks tidier and points at nothing.
 */
export function slugify(text) {
  return text
    .trim()
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*~]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N} \t_-]/gu, '')
    .replace(/[ \t]/g, '-')
}

/** Split Markdown into lines, marking which are inside a fenced code block. */
function* lines(markdown) {
  let fence = null
  let n = 0
  for (const line of markdown.split(/\r?\n/)) {
    n += 1
    const delim = /^\s{0,3}(`{3,}|~{3,})/.exec(line)
    if (fence) {
      if (delim && delim[1][0] === fence[0] && delim[1].length >= fence.length) {
        fence = null
      }
      continue
    }
    if (delim) {
      fence = delim[1]
      continue
    }
    yield [n, line]
  }
}

/** Every anchor a Markdown file offers, including GitHub's duplicate suffixes. */
export function headingAnchors(markdown) {
  const anchors = new Set()
  const seen = new Map()

  for (const [, line] of lines(markdown)) {
    const heading = /^#{1,6}[ \t]+(.*?)[ \t]*#*[ \t]*$/.exec(line)
    if (!heading) continue
    const base = slugify(heading[1])
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    anchors.add(count === 0 ? base : `${base}-${count}`)
  }

  return anchors
}

/** Every relative link in a Markdown file, with the line it appears on. */
export function extractLinks(markdown) {
  const found = []

  for (const [n, line] of lines(markdown)) {
    const bare = line.replace(/`[^`]*`/g, ' ')
    for (const match of bare.matchAll(/!?\[[^\]]*\]\(\s*([^)\s]+)/g)) {
      const target = match[1]
      if (EXTERNAL.test(target)) continue
      found.push({ line: n, target })
    }
  }

  return found
}

/** Does this path exist with exactly this spelling, inside the repository? */
function existsExact(absolute) {
  const rel = relative(ROOT, absolute)
  if (rel.startsWith('..')) return false

  let at = ROOT
  for (const segment of rel.split(sep).filter(Boolean)) {
    let entries
    try {
      entries = readdirSync(at)
    } catch {
      return false
    }
    if (!entries.includes(segment)) return false
    at = join(at, segment)
  }
  return true
}

function markdownFiles(dir = ROOT, collected = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : 1
  )) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) markdownFiles(join(dir, entry.name), collected)
    } else if (entry.name.endsWith('.md')) {
      collected.push(join(dir, entry.name))
    }
  }
  return collected
}

function main() {
  const files = markdownFiles()
  const anchorCache = new Map()
  const anchorsOf = (file) => {
    if (!anchorCache.has(file))
      anchorCache.set(file, headingAnchors(readFileSync(file, 'utf8')))
    return anchorCache.get(file)
  }

  const problems = []
  let checked = 0

  for (const file of files) {
    const where = relative(ROOT, file).split(sep).join('/')

    for (const { line, target } of extractLinks(readFileSync(file, 'utf8'))) {
      checked += 1
      const at = `${where}:${line}`
      const hash = target.indexOf('#')
      const path = hash === -1 ? target : target.slice(0, hash)
      const fragment = hash === -1 ? '' : decodeURIComponent(target.slice(hash + 1))
      const destination = path ? resolve(dirname(file), decodeURIComponent(path)) : file

      if (path && !existsExact(destination)) {
        problems.push(`${at}: ${target} — no such path in the repository`)
        continue
      }
      if (!fragment) continue

      if (!statSync(destination).isFile()) {
        problems.push(`${at}: ${target} — a directory cannot have an anchor`)
        continue
      }
      if (!destination.endsWith('.md')) continue

      if (!anchorsOf(destination).has(fragment)) {
        problems.push(
          `${at}: ${target} — no heading in ` +
            `${relative(ROOT, destination).split(sep).join('/')} yields that anchor`
        )
      }
    }
  }

  if (problems.length) {
    console.error(`${problems.length} broken link(s):\n`)
    for (const problem of problems) console.error(`  ${problem}`)
    console.error('')
    console.error(
      'Relative links and anchors are checked because forks and translations'
    )
    console.error(
      'depend on them, and because a wrong-case path works locally on Windows'
    )
    console.error('and macOS while failing on Linux and on github.com.')
    return 1
  }

  console.log(
    `${checked} relative links across ${files.length} Markdown files all resolve`
  )
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main())
}
