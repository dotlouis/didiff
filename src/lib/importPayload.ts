/**
 * Interop with the Raycast extension.
 * Payload format written to the clipboard before opening didiff.
 */

export const MARKER = '__DIDIFF_V1__'
const LEGACY_MARKER = '__DIFDIF_V1__'

export type ImportPayload = {
  oldText: string
  newText: string
  language?: string
}

export function encodePayload(payload: ImportPayload): string {
  return `${MARKER}\n${JSON.stringify(payload)}`
}

export function decodePayload(raw: string): ImportPayload | null {
  const text = raw.trim()
  const marker = text.startsWith(MARKER)
    ? MARKER
    : text.startsWith(LEGACY_MARKER)
      ? LEGACY_MARKER
      : null
  if (!marker) return null
  try {
    const json = text.slice(marker.length).trim()
    const data = JSON.parse(json) as ImportPayload
    if (typeof data.oldText !== 'string' || typeof data.newText !== 'string') return null
    return data
  } catch {
    return null
  }
}

export async function tryImportFromClipboard(): Promise<ImportPayload | null> {
  try {
    if (!navigator.clipboard?.readText) return null
    const text = await navigator.clipboard.readText()
    return decodePayload(text)
  } catch {
    return null
  }
}
