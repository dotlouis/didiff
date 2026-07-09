import { useEffect } from 'react'
import type { ThemeMode } from '@/lib/settings'

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = mode === 'dark' || (mode === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'

  // Match PWA title bar / OS chrome to the app surface
  const bg = getComputedStyle(root).getPropertyValue('--background').trim()
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && bg) {
    // oklch vars work in modern Chromium theme-color
    meta.setAttribute('content', `oklch(${bg})`)
  } else if (meta) {
    meta.setAttribute('content', dark ? '#0b0d10' : '#fafafa')
  }
}

/** Apply theme class on <html>; system follows prefers-color-scheme. */
export function useTheme(mode: ThemeMode) {
  useEffect(() => {
    applyTheme(mode)

    if (mode !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])
}
