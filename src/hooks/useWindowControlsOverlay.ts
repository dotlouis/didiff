import { useEffect, useState } from 'react'

export type TitlebarRect = {
  x: number
  y: number
  width: number
  height: number
}

type WCO = {
  visible: boolean
  getTitlebarAreaRect: () => DOMRect
  addEventListener: (
    type: 'geometrychange',
    listener: (ev: Event) => void,
  ) => void
  removeEventListener: (
    type: 'geometrychange',
    listener: (ev: Event) => void,
  ) => void
}

function getOverlay(): WCO | null {
  if (typeof navigator === 'undefined') return null
  const nav = navigator as Navigator & { windowControlsOverlay?: WCO }
  return nav.windowControlsOverlay ?? null
}

/**
 * Window Controls Overlay (installed desktop PWA).
 * @see https://web.dev/articles/window-controls-overlay
 */
export function useWindowControlsOverlay() {
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<TitlebarRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [controlsOnLeft, setControlsOnLeft] = useState(false)

  useEffect(() => {
    const overlay = getOverlay()
    if (!overlay) return

    const sync = () => {
      const r = overlay.getTitlebarAreaRect()
      setVisible(Boolean(overlay.visible))
      setRect({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
      })
      // x > 0 ⇒ traffic lights on the left (macOS-style)
      setControlsOnLeft(r.x > 0)
    }

    sync()
    const onGeo = () => sync()
    overlay.addEventListener('geometrychange', onGeo)

    // display-mode can change without geometry event on some builds
    const mql = window.matchMedia('(display-mode: window-controls-overlay)')
    const onMode = () => sync()
    mql.addEventListener('change', onMode)

    return () => {
      overlay.removeEventListener('geometrychange', onGeo)
      mql.removeEventListener('change', onMode)
    }
  }, [])

  return { visible, rect, controlsOnLeft, supported: getOverlay() != null }
}
