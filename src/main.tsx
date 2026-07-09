import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Apply theme before first paint to avoid flash
;(function bootstrapTheme() {
  try {
    const raw =
      localStorage.getItem('didiff:settings:v1') ??
      localStorage.getItem('difdif:settings:v1')
    const theme = raw
      ? ((JSON.parse(raw) as { theme?: string; themeType?: string }).theme ??
        (JSON.parse(raw) as { themeType?: string }).themeType ??
        'system')
      : 'system'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = theme === 'dark' || (theme === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  } catch {
    /* ignore */
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
