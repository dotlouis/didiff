import * as prettier from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import * as prettierPluginHtml from 'prettier/plugins/html'
import * as prettierPluginPostcss from 'prettier/plugins/postcss'
import * as prettierPluginTypescript from 'prettier/plugins/typescript'
import * as prettierPluginYaml from 'prettier/plugins/yaml'
import * as prettierPluginMarkdown from 'prettier/plugins/markdown'
import * as prettierPluginGraphql from 'prettier/plugins/graphql'
import type { Plugin } from 'prettier'

const plugins: Plugin[] = [
  prettierPluginBabel,
  prettierPluginEstree as Plugin,
  prettierPluginHtml,
  prettierPluginPostcss,
  prettierPluginTypescript,
  prettierPluginYaml,
  prettierPluginMarkdown,
  prettierPluginGraphql,
]

/** Map didiff language ids → Prettier parser names. */
function parserFor(lang: string): string | null {
  switch (lang) {
    case 'json':
      return 'json'
    case 'javascript':
    case 'jsx':
      return 'babel'
    case 'typescript':
    case 'tsx':
      return 'typescript'
    case 'html':
      return 'html'
    case 'css':
    case 'scss':
      return 'css'
    case 'yaml':
      return 'yaml'
    case 'markdown':
      return 'markdown'
    case 'graphql':
      return 'graphql'
    default:
      return null
  }
}

/**
 * Pretty-print a snippet for the given language.
 * Falls back to JSON pretty-print when language is json-like,
 * or returns original text if formatting is unsupported / fails.
 */
export async function formatCode(source: string, language: string): Promise<string> {
  const text = source
  if (!text.trim()) return text

  // Always try JSON when content looks like it
  if (language === 'json' || language === 'text' || language === 'auto') {
    try {
      const parsed = JSON.parse(text)
      return JSON.stringify(parsed, null, 2) + (text.endsWith('\n') ? '\n' : '')
    } catch {
      if (language === 'json') return text
    }
  }

  const parser = parserFor(language)
  if (!parser) {
    // Lightweight fallbacks
    if (language === 'sql') return formatSqlLite(text)
    return text
  }

  try {
    return await prettier.format(text, {
      parser,
      plugins,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 88,
      tabWidth: 2,
    })
  } catch {
    return text
  }
}

/** Very small SQL keyword-ish line breaker — better than nothing. */
function formatSqlLite(sql: string): string {
  return sql
    .replace(/\s+/g, ' ')
    .replace(
      /\b(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|GROUP BY|ORDER BY|LIMIT|OFFSET|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi,
      '\n$1',
    )
    .replace(/^\n/, '')
    .trim()
}
