import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { python } from '@codemirror/lang-python'
import { markdown } from '@codemirror/lang-markdown'
import { sql } from '@codemirror/lang-sql'
import { xml } from '@codemirror/lang-xml'
import { yaml } from '@codemirror/lang-yaml'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { rust } from '@codemirror/lang-rust'
import { go } from '@codemirror/lang-go'
import { php } from '@codemirror/lang-php'
import { sass } from '@codemirror/lang-sass'
import type { Extension } from '@codemirror/state'

/** CodeMirror language extension for a didiff language id. */
export function languageExtension(lang: string): Extension | null {
  switch (lang) {
    case 'typescript':
      return javascript({ typescript: true })
    case 'tsx':
      return javascript({ typescript: true, jsx: true })
    case 'javascript':
      return javascript()
    case 'jsx':
      return javascript({ jsx: true })
    case 'json':
      return json()
    case 'html':
      return html()
    case 'css':
      return css()
    case 'scss':
      return sass()
    case 'python':
      return python()
    case 'markdown':
      return markdown()
    case 'sql':
      return sql()
    case 'xml':
    case 'svg':
      return xml()
    case 'yaml':
      return yaml()
    case 'c':
    case 'cpp':
    case 'csharp':
      return cpp()
    case 'java':
    case 'kotlin':
      return java()
    case 'rust':
      return rust()
    case 'go':
      return go()
    case 'php':
      return php()
    default:
      return null
  }
}
