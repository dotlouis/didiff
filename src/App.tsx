import { useCallback, useEffect, useMemo, useState } from 'react'
import { CommandPalette } from '@/components/CommandPalette'
import { CommandsDock } from '@/components/CommandsDock'
import { DiffView } from '@/components/DiffView'
import { EditorPanes } from '@/components/EditorPanes'
import { focusEditor } from '@/components/CodeEditor'
import {
  HistorySidebar,
  SidebarRevealButton,
} from '@/components/HistorySidebar'
import { Titlebar, TitlebarSpacer } from '@/components/Titlebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useTheme } from '@/hooks/useTheme'
import { detectLanguageFromPair } from '@/lib/detectLanguage'
import {
  clearHistory,
  loadHistory,
  pushHistory,
  removeHistoryEntry,
  type HistoryEntry,
} from '@/lib/history'
import { tryImportFromClipboard } from '@/lib/importPayload'
import { loadSettings, saveSettings, type Settings } from '@/lib/settings'

const DRAFT_KEY = 'didiff:draft:v1'
const LEGACY_DRAFT = 'difdif:draft:v1'

function loadDraft(): { oldText: string; newText: string } {
  try {
    const raw =
      localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem(LEGACY_DRAFT)
    if (!raw) return { oldText: '', newText: '' }
    const data = JSON.parse(raw) as { oldText?: string; newText?: string }
    return {
      oldText: typeof data.oldText === 'string' ? data.oldText : '',
      newText: typeof data.newText === 'string' ? data.newText : '',
    }
  } catch {
    return { oldText: '', newText: '' }
  }
}

function useResolvedDark(theme: Settings['theme']): boolean {
  const [dark, setDark] = useState(() => {
    if (theme === 'dark') return true
    if (theme === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (theme === 'dark') {
      setDark(true)
      return
    }
    if (theme === 'light') {
      setDark(false)
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(mq.matches)
    const onChange = () => setDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  return dark
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [oldText, setOldText] = useState(() => loadDraft().oldText)
  const [newText, setNewText] = useState(() => loadDraft().newText)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [formatting, setFormatting] = useState(false)
  const [focusedSide, setFocusedSide] = useState<'old' | 'new'>('old')

  useTheme(settings.theme)
  const resolvedDark = useResolvedDark(settings.theme)

  const debouncedOld = useDebouncedValue(oldText, 120)
  const debouncedNew = useDebouncedValue(newText, 120)

  const detected = useMemo(
    () => detectLanguageFromPair(debouncedOld, debouncedNew),
    [debouncedOld, debouncedNew],
  )
  const resolvedLanguage =
    settings.language === 'auto' ? detected : settings.language

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ oldText, newText }))
      } catch {
        /* ignore */
      }
    }, 400)
    return () => window.clearTimeout(id)
  }, [oldText, newText])

  useEffect(() => {
    if (!debouncedOld.trim() && !debouncedNew.trim()) return
    if (debouncedOld === debouncedNew) return
    const id = window.setTimeout(() => {
      setHistory((prev) =>
        pushHistory(prev, {
          oldText: debouncedOld,
          newText: debouncedNew,
          language: resolvedLanguage,
        }),
      )
    }, 1500)
    return () => window.clearTimeout(id)
  }, [debouncedOld, debouncedNew, resolvedLanguage])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const params = new URLSearchParams(window.location.search)
      const shouldImport =
        params.has('import') || params.get('from') === 'raycast'

      if (shouldImport) {
        const payload = await tryImportFromClipboard()
        if (!cancelled && payload) {
          setOldText(payload.oldText)
          setNewText(payload.newText)
          if (payload.language) patchSettings({ language: payload.language })
          const url = new URL(window.location.href)
          url.search = ''
          window.history.replaceState({}, '', url.pathname)
        }
      }

      const b64Old = params.get('o')
      const b64New = params.get('n')
      if (b64Old != null || b64New != null) {
        try {
          if (b64Old != null) setOldText(b64Decode(b64Old))
          if (b64New != null) setNewText(b64Decode(b64New))
          const url = new URL(window.location.href)
          url.search = ''
          window.history.replaceState({}, '', url.pathname)
        } catch {
          /* ignore */
        }
      }

      if (!cancelled) setReady(true)
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [patchSettings])

  const resolveFocusedSide = useCallback((): 'old' | 'new' => {
    const el = document.activeElement
    if (el?.closest?.('#editor-new')) return 'new'
    if (el?.closest?.('#editor-old')) return 'old'
    return focusedSide
  }, [focusedSide])

  const onFormatFocused = useCallback(async () => {
    if (formatting) return
    setFormatting(true)
    try {
      const { formatCode } = await import('@/lib/formatCode')
      const side = resolveFocusedSide()
      if (side === 'new') {
        setNewText(await formatCode(newText, resolvedLanguage))
      } else {
        setOldText(await formatCode(oldText, resolvedLanguage))
      }
      setActiveHistoryId(null)
    } finally {
      setFormatting(false)
    }
  }, [formatting, resolveFocusedSide, oldText, newText, resolvedLanguage])

  const onFormatBoth = useCallback(async () => {
    if (formatting) return
    setFormatting(true)
    try {
      const { formatCode } = await import('@/lib/formatCode')
      const [formattedOld, formattedNew] = await Promise.all([
        formatCode(oldText, resolvedLanguage),
        formatCode(newText, resolvedLanguage),
      ])
      setOldText(formattedOld)
      setNewText(formattedNew)
      setActiveHistoryId(null)
    } finally {
      setFormatting(false)
    }
  }, [formatting, oldText, newText, resolvedLanguage])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return

      if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
        return
      }

      // ⌘I = format focused · ⌘⌥I = format both
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault()
        if (e.altKey) void onFormatBoth()
        else void onFormatFocused()
        return
      }

      if (e.key.toLowerCase() === 'e') {
        e.preventDefault()
        patchSettings({ editorsOpen: !settings.editorsOpen })
        return
      }

      if (e.key === '1') {
        e.preventDefault()
        focusEditor('editor-old')
        setFocusedSide('old')
      }
      if (e.key === '2') {
        e.preventDefault()
        focusEditor('editor-new')
        setFocusedSide('new')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onFormatFocused, onFormatBoth, patchSettings, settings.editorsOpen])

  const onSwap = useCallback(() => {
    setOldText(newText)
    setNewText(oldText)
    setActiveHistoryId(null)
  }, [oldText, newText])

  const onClear = useCallback(() => {
    setOldText('')
    setNewText('')
    setActiveHistoryId(null)
  }, [])

  const onSelectHistory = useCallback(
    (entry: HistoryEntry) => {
      setOldText(entry.oldText)
      setNewText(entry.newText)
      setActiveHistoryId(entry.id)
      if (entry.language) {
        patchSettings({
          language: entry.language === 'auto' ? 'auto' : entry.language,
        })
      }
    },
    [patchSettings],
  )

  if (!ready) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        Loading didiff…
      </div>
    )
  }

  const diffPanel = (
    <main
      id="diff-panel"
      className="h-full min-h-0 overflow-auto bg-background"
      tabIndex={-1}
      aria-label="Diff result"
    >
      <DiffView
        oldText={debouncedOld}
        newText={debouncedNew}
        language={resolvedLanguage}
        diffStyle={settings.diffStyle}
        lineDiffType={settings.lineDiffType}
        overflow={settings.overflow}
        theme={settings.theme}
        resolvedDark={resolvedDark}
      />
    </main>
  )

  const languageLabel =
    settings.language === 'auto'
      ? `auto · ${resolvedLanguage}`
      : resolvedLanguage

  return (
    <TooltipProvider>
      <Titlebar languageLabel={languageLabel} />
      <SidebarProvider
        open={settings.sidebarOpen}
        onOpenChange={(open) => patchSettings({ sidebarOpen: open })}
        className="h-full min-h-0"
      >
        <HistorySidebar
          entries={history}
          activeId={activeHistoryId}
          onSelect={onSelectHistory}
          onRemove={(id) => {
            setHistory((prev) => removeHistoryEntry(prev, id))
            if (activeHistoryId === id) setActiveHistoryId(null)
          }}
        />

        <SidebarInset className="relative flex h-full min-h-0 flex-col overflow-hidden">
          <TitlebarSpacer />
          <SidebarRevealButton />

          {settings.editorsOpen ? (
            <ResizablePanelGroup
              orientation="vertical"
              className="h-full min-h-0 flex-1"
              id="main-split"
            >
              <ResizablePanel
                defaultSize={34}
                minSize={15}
                id="editors-panel"
                className="min-h-0"
              >
                <EditorPanes
                  oldText={oldText}
                  newText={newText}
                  onOldChange={(v) => {
                    setOldText(v)
                    setActiveHistoryId(null)
                  }}
                  onNewChange={(v) => {
                    setNewText(v)
                    setActiveHistoryId(null)
                  }}
                  language={resolvedLanguage}
                  dark={resolvedDark}
                  autoFocus
                  onFocusSide={setFocusedSide}
                />
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-border" />

              <ResizablePanel
                defaultSize={66}
                minSize={25}
                id="diff-result-panel"
                className="min-h-0"
              >
                {diffPanel}
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="h-full min-h-0 flex-1">{diffPanel}</div>
          )}

          <CommandsDock onOpen={() => setPaletteOpen(true)} />
        </SidebarInset>

        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          settings={settings}
          resolvedLanguage={resolvedLanguage}
          onPatchSettings={patchSettings}
          onSwap={onSwap}
          onClear={onClear}
          onFormatFocused={() => void onFormatFocused()}
          onFormatBoth={() => void onFormatBoth()}
          formatting={formatting}
          onClearHistory={() => {
            setHistory(clearHistory())
            setActiveHistoryId(null)
          }}
          onFocusOriginal={() => focusEditor('editor-old')}
          onFocusModified={() => focusEditor('editor-new')}
        />
      </SidebarProvider>
    </TooltipProvider>
  )
}

function b64Decode(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(padded)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
