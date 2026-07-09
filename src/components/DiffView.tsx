import {
  memo,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react'
import type { FileContents } from '@pierre/diffs/react'
import type { DiffStyle, LineDiffType, OverflowMode, ThemeMode } from '@/lib/settings'
import { filenameForLang } from '@/lib/languages'

type MultiFileDiffProps = {
  oldFile: FileContents
  newFile: FileContents
  options?: Record<string, unknown>
  style?: CSSProperties
}

type Props = {
  oldText: string
  newText: string
  language: string
  diffStyle: DiffStyle
  lineDiffType: LineDiffType
  overflow: OverflowMode
  theme: ThemeMode
  resolvedDark: boolean
}

function DiffViewInner({
  oldText,
  newText,
  language,
  diffStyle,
  lineDiffType,
  overflow,
  theme,
  resolvedDark,
}: Props) {
  const [MultiFileDiff, setMultiFileDiff] = useState<ComponentType<MultiFileDiffProps> | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    void import('@pierre/diffs/react').then((mod) => {
      if (!cancelled) setMultiFileDiff(() => mod.MultiFileDiff as ComponentType<MultiFileDiffProps>)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const name = filenameForLang(language === 'auto' ? 'text' : language)
  const lang = language === 'auto' || language === 'text' ? undefined : language

  const oldFile = useMemo<FileContents>(
    () => ({
      name,
      contents: oldText,
      ...(lang ? { lang: lang as FileContents['lang'] } : {}),
      cacheKey: `old:${language}:${hashLite(oldText)}`,
    }),
    [oldText, name, lang, language],
  )

  const newFile = useMemo<FileContents>(
    () => ({
      name,
      contents: newText,
      ...(lang ? { lang: lang as FileContents['lang'] } : {}),
      cacheKey: `new:${language}:${hashLite(newText)}`,
    }),
    [newText, name, lang, language],
  )

  const themeType = theme === 'system' ? 'system' : theme

  const options = useMemo(
    () => ({
      diffStyle,
      lineDiffType,
      overflow,
      themeType,
      expandUnchanged: true,
      diffIndicators: 'classic' as const,
      theme: {
        dark: 'github-dark',
        light: 'github-light',
      },
    }),
    [diffStyle, lineDiffType, overflow, themeType],
  )

  const empty = !oldText && !newText

  if (empty) {
    return (
      <div className="grid h-full place-items-center p-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="mb-1 text-base font-semibold tracking-tight">
            Paste two texts to diff
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Original first, then modified. Character-level changes highlight inside long lines.
          </p>
          <p className="text-xs text-muted-foreground">
            Press <span className="font-medium text-foreground">⌘K</span> for commands.
          </p>
        </div>
      </div>
    )
  }

  if (!MultiFileDiff) {
    return (
      <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">
        Rendering diff…
      </div>
    )
  }

  return (
    <div className="diff-host min-h-full" data-theme={resolvedDark ? 'dark' : 'light'}>
      <MultiFileDiff
        key={`${language}:${diffStyle}:${lineDiffType}:${overflow}:${themeType}:${resolvedDark}`}
        oldFile={oldFile}
        newFile={newFile}
        options={options}
        style={{ display: 'block', minHeight: '100%' }}
      />
    </div>
  )
}

function hashLite(s: string): string {
  let h = 2166136261
  const step = Math.max(1, Math.floor(s.length / 256))
  for (let i = 0; i < s.length; i += step) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= s.length
  return (h >>> 0).toString(36)
}

export const DiffView = memo(DiffViewInner)
