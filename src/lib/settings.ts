export type DiffStyle = 'split' | 'unified'
export type LineDiffType = 'char' | 'word' | 'word-alt' | 'none'
export type OverflowMode = 'wrap' | 'scroll'
export type ThemeMode = 'system' | 'dark' | 'light'

export type Settings = {
  language: string
  diffStyle: DiffStyle
  lineDiffType: LineDiffType
  overflow: OverflowMode
  editorsOpen: boolean
  theme: ThemeMode
  sidebarOpen: boolean
}

const KEY = 'didiff:settings:v1'
const LEGACY_KEY = 'difdif:settings:v1'

export const DEFAULT_SETTINGS: Settings = {
  language: 'auto',
  diffStyle: 'split',
  lineDiffType: 'char',
  overflow: 'wrap',
  editorsOpen: true,
  theme: 'system',
  sidebarOpen: true,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<Settings> & { themeType?: ThemeMode }
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      // migrate old themeType field
      theme: parsed.theme ?? parsed.themeType ?? DEFAULT_SETTINGS.theme,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // private mode / quota
  }
}
