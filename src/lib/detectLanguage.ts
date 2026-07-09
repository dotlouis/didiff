/**
 * Language detection via highlight.js `highlightAuto` (same engine as many
 * editors / docs sites), plus a few high-confidence structural pre-checks.
 *
 * @see https://highlightjs.org/
 */

import hljs from 'highlight.js/lib/core'

import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import markdown from 'highlight.js/lib/languages/markdown'
import pgsql from 'highlight.js/lib/languages/pgsql'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

let registered = false

function ensureRegistered() {
  if (registered) return
  registered = true

  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('c', c)
  hljs.registerLanguage('cpp', cpp)
  hljs.registerLanguage('csharp', csharp)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('diff', diff)
  hljs.registerLanguage('dockerfile', dockerfile)
  hljs.registerLanguage('go', go)
  hljs.registerLanguage('graphql', graphql)
  hljs.registerLanguage('java', java)
  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('kotlin', kotlin)
  hljs.registerLanguage('markdown', markdown)
  hljs.registerLanguage('pgsql', pgsql)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('ruby', ruby)
  hljs.registerLanguage('rust', rust)
  hljs.registerLanguage('scss', scss)
  hljs.registerLanguage('sql', sql)
  hljs.registerLanguage('swift', swift)
  hljs.registerLanguage('typescript', typescript)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('yaml', yaml)
}

/** Languages passed to highlightAuto (order does not matter). */
const CANDIDATES = [
  'sql',
  'pgsql',
  'python',
  'javascript',
  'typescript',
  'json',
  'go',
  'rust',
  'java',
  'kotlin',
  'swift',
  'c',
  'cpp',
  'csharp',
  'ruby',
  'php',
  'css',
  'scss',
  'xml',
  'yaml',
  'markdown',
  'bash',
  'dockerfile',
  'graphql',
  'diff',
] as const

/** Map highlight.js language ids → didiff language ids. */
const HLJS_TO_DIDIFF: Record<string, string> = {
  sql: 'sql',
  pgsql: 'sql',
  plsql: 'sql',
  tsql: 'sql',
  n1ql: 'sql',
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  json: 'json',
  go: 'go',
  rust: 'rust',
  java: 'java',
  kotlin: 'kotlin',
  swift: 'swift',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  csharp: 'csharp',
  ruby: 'ruby',
  php: 'php',
  css: 'css',
  scss: 'scss',
  xml: 'xml',
  html: 'html',
  xhtml: 'html',
  svg: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  markdown: 'markdown',
  md: 'markdown',
  bash: 'shell',
  shell: 'shell',
  sh: 'shell',
  zsh: 'shell',
  dockerfile: 'dockerfile',
  docker: 'dockerfile',
  graphql: 'graphql',
  diff: 'diff',
  plaintext: 'text',
}

function looksLikeJson(s: string): boolean {
  const t = s.trim()
  if (!(t.startsWith('{') || t.startsWith('['))) return false
  try {
    JSON.parse(t)
    return true
  } catch {
    return false
  }
}

/** Dense SQL keyword signal — catches short queries hljs under-scores. */
function looksLikeSql(s: string): boolean {
  const t = s.trim()
  if (!t) return false
  // Classic statement openers
  if (
    /^(SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|EXPLAIN|SHOW|DESCRIBE|CALL|MERGE)\b/i.test(
      t,
    )
  ) {
    return true
  }
  const keywords =
    t.match(
      /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|PRIMARY\s+KEY|FOREIGN\s+KEY|UNION|INTERSECT|EXCEPT|AS|ON|AND|OR|NOT|NULL|IS|IN|EXISTS|BETWEEN|LIKE|ILIKE)\b/gi,
    ) ?? []
  return keywords.length >= 3
}

function looksLikeTypescript(s: string): boolean {
  return (
    /\b(interface|type)\s+\w+/.test(s) ||
    /:\s*(string|number|boolean|any|unknown|void|never|Record|Partial|Readonly)\b/.test(
      s,
    ) ||
    /\bas\s+const\b/.test(s) ||
    /<\w+(\s*,\s*\w+)*>/.test(s) && /\b(function|const|let)\b/.test(s)
  )
}

export function detectLanguage(source: string): string {
  if (!source || !source.trim()) return 'text'

  const sample = source.length > 20_000 ? source.slice(0, 20_000) : source

  // High-confidence structural checks first
  if (looksLikeJson(sample)) return 'json'
  if (looksLikeSql(sample)) return 'sql'

  ensureRegistered()

  try {
    const result = hljs.highlightAuto(sample, [...CANDIDATES])
    const raw = result.language ?? ''
    let mapped = HLJS_TO_DIDIFF[raw] ?? 'text'

    // Prefer TS when content has type syntax but hljs said JS
    if (
      (mapped === 'javascript' || mapped === 'text') &&
      looksLikeTypescript(sample)
    ) {
      mapped = 'typescript'
    }

    // SQL dialects always collapse to sql
    if (raw === 'pgsql' || raw === 'sql' || raw === 'tsql' || raw === 'n1ql') {
      mapped = 'sql'
    }

    // Low relevance → plain text unless we already forced something above
    if ((result.relevance ?? 0) < 2 && mapped !== 'sql' && mapped !== 'json') {
      return 'text'
    }

    return mapped
  } catch {
    return 'text'
  }
}

/** Prefer stronger signal between old and new paste. */
export function detectLanguageFromPair(oldText: string, newText: string): string {
  // Prefer the longer non-empty sample for detection quality
  const a = oldText.trim()
  const b = newText.trim()
  if (!a && !b) return 'text'
  if (!a) return detectLanguage(b)
  if (!b) return detectLanguage(a)

  const langA = detectLanguage(a)
  const langB = detectLanguage(b)
  if (langA === langB) return langA
  if (langA === 'text') return langB
  if (langB === 'text') return langA

  // Prefer SQL / JSON when either side is clearly that
  if (langA === 'sql' || langB === 'sql') {
    if (looksLikeSql(a) || looksLikeSql(b)) return 'sql'
  }
  if (langA === 'json' || langB === 'json') {
    if (looksLikeJson(a) || looksLikeJson(b)) return 'json'
  }

  // Prefer the language detected on the longer side
  return a.length >= b.length ? langA : langB
}
