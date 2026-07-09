import { memo, useEffect } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { CodeEditor, focusEditor } from '@/components/CodeEditor'

type Props = {
  oldText: string
  newText: string
  onOldChange: (value: string) => void
  onNewChange: (value: string) => void
  language: string
  dark: boolean
  autoFocus?: boolean
  onFocusSide?: (side: 'old' | 'new') => void
}

function EditorPanesInner({
  oldText,
  newText,
  onOldChange,
  onNewChange,
  language,
  dark,
  autoFocus = true,
  onFocusSide,
}: Props) {
  useEffect(() => {
    if (!autoFocus) return
    const id = window.requestAnimationFrame(() => focusEditor('editor-old'))
    return () => window.cancelAnimationFrame(id)
  }, [autoFocus])

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full min-h-0"
      id="editor-split"
    >
      <ResizablePanel defaultSize={50} minSize={20} id="editor-old-panel">
        <div className="flex h-full min-h-0 flex-col bg-background">
          <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-red-500 uppercase dark:text-red-400">
              Original
            </span>
            <span className="truncate font-mono text-[11px] text-muted-foreground tabular-nums">
              {lineCount(oldText)} lines · {oldText.length} chars
            </span>
            <span className="ml-auto truncate text-[10px] text-muted-foreground uppercase">
              {language}
            </span>
          </header>
          <CodeEditor
            id="editor-old"
            value={oldText}
            onChange={onOldChange}
            language={language}
            dark={dark}
            placeholder="Paste original text…"
            autoFocus={autoFocus}
            tabIndex={1}
            tabNextId="editor-new"
            onFocus={() => onFocusSide?.('old')}
            aria-label="Original text"
          />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className="bg-border" />

      <ResizablePanel defaultSize={50} minSize={20} id="editor-new-panel">
        <div className="flex h-full min-h-0 flex-col bg-background">
          <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
              Modified
            </span>
            <span className="truncate font-mono text-[11px] text-muted-foreground tabular-nums">
              {lineCount(newText)} lines · {newText.length} chars
            </span>
            <span className="ml-auto truncate text-[10px] text-muted-foreground uppercase">
              {language}
            </span>
          </header>
          <CodeEditor
            id="editor-new"
            value={newText}
            onChange={onNewChange}
            language={language}
            dark={dark}
            placeholder="Paste modified text…"
            tabIndex={2}
            tabPrevId="editor-old"
            onFocus={() => onFocusSide?.('new')}
            aria-label="Modified text"
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function lineCount(s: string): number {
  if (!s) return 0
  let n = 1
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) === 10) n++
  return n
}

export const EditorPanes = memo(EditorPanesInner)
