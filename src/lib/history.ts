export type HistoryEntry = {
  id: string
  createdAt: number
  oldText: string
  newText: string
  language: string
  preview: string
}

const KEY = 'didiff:history:v1'
const MAX_ENTRIES = 40

function previewOf(oldText: string, newText: string): string {
  const sample = (newText || oldText).trim().replace(/\s+/g, ' ')
  return sample.slice(0, 72) || '(empty)'
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // ignore
  }
}

export function pushHistory(
  entries: HistoryEntry[],
  payload: { oldText: string; newText: string; language: string },
): HistoryEntry[] {
  const { oldText, newText, language } = payload
  if (!oldText.trim() && !newText.trim()) return entries
  if (oldText === newText) return entries

  const last = entries[0]
  if (
    last &&
    last.oldText === oldText &&
    last.newText === newText
  ) {
    return entries
  }

  const entry: HistoryEntry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    oldText,
    newText,
    language,
    preview: previewOf(oldText, newText),
  }

  const next = [entry, ...entries].slice(0, MAX_ENTRIES)
  saveHistory(next)
  return next
}

export function removeHistoryEntry(
  entries: HistoryEntry[],
  id: string,
): HistoryEntry[] {
  const next = entries.filter((e) => e.id !== id)
  saveHistory(next)
  return next
}

export function clearHistory(): HistoryEntry[] {
  saveHistory([])
  return []
}

export function formatHistoryTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts))
  } catch {
    return new Date(ts).toLocaleString()
  }
}
