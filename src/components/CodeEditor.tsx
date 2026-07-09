import { memo, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { keymap, EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { languageExtension } from '@/lib/editorLanguage'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  language: string
  dark: boolean
  placeholder?: string
  autoFocus?: boolean
  tabIndex?: number
  /** Focus this editor root on Tab (for dual-pane navigation). */
  tabNextId?: string
  /** Focus this editor root on Shift+Tab. */
  tabPrevId?: string
  onFocus?: () => void
  'aria-label'?: string
}

function CodeEditorInner({
  id,
  value,
  onChange,
  language,
  dark,
  placeholder,
  autoFocus,
  tabIndex,
  tabNextId,
  tabPrevId,
  onFocus,
  'aria-label': ariaLabel,
}: Props) {
  const extensions = useMemo(() => {
    const ext = [
      EditorView.lineWrapping,
      keymap.of([
        {
          key: 'Tab',
          run: () => {
            if (!tabNextId) return false
            focusEditor(tabNextId)
            return true
          },
        },
        {
          key: 'Shift-Tab',
          run: () => {
            if (!tabPrevId) return false
            focusEditor(tabPrevId)
            return true
          },
        },
      ]),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '12.5px',
          backgroundColor: 'transparent',
        },
        '.cm-scroller': {
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace',
          lineHeight: '1.5',
          overflow: 'auto',
        },
        '.cm-content': {
          padding: '8px 12px',
          caretColor: 'var(--foreground)',
        },
        '.cm-gutters': {
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--muted-foreground)',
        },
        '.cm-activeLine': {
          backgroundColor: 'color-mix(in oklch, var(--primary) 6%, transparent)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'transparent',
        },
        '&.cm-focused': {
          outline: 'none',
        },
        '.cm-placeholder': {
          color: 'color-mix(in oklch, var(--muted-foreground) 70%, transparent)',
        },
      }),
    ]
    const lang = languageExtension(language)
    if (lang) ext.push(lang)
    if (dark) ext.push(oneDark)
    return ext
  }, [language, dark, tabNextId, tabPrevId])

  return (
    <div
      id={id}
      className="min-h-0 flex-1 overflow-hidden"
      data-editor-root={id}
      onFocusCapture={() => onFocus?.()}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={dark ? 'dark' : 'light'}
        extensions={extensions}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: false,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          searchKeymap: false,
        }}
        style={{ height: '100%' }}
        aria-label={ariaLabel}
        tabIndex={tabIndex}
      />
    </div>
  )
}

export const CodeEditor = memo(CodeEditorInner)

/** Focus the CodeMirror view inside a given editor root id. */
export function focusEditor(rootId: string) {
  const root = document.getElementById(rootId)
  const cm = root?.querySelector<HTMLElement>('.cm-content')
  cm?.focus()
}
