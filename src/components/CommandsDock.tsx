import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'
import { CommandIcon } from 'lucide-react'

type Props = {
  onOpen: () => void
}

/**
 * MacOS-dock-like floating command trigger:
 * - visible a few seconds on load
 * - slides away
 * - reappears when pointer nears bottom-center
 */
export function CommandsDock({ onOpen }: Props) {
  const [visible, setVisible] = useState(true)
  const [hot, setHot] = useState(true) // force show on boot
  const hideTimer = useRef<number | null>(null)

  useEffect(() => {
    // After boot, allow hide and schedule hide
    hideTimer.current = window.setTimeout(() => {
      setHot(false)
      setVisible(false)
    }, 2800)
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const nearBottom = e.clientY > h - 72
      const nearCenter = Math.abs(e.clientX - w / 2) < Math.min(220, w * 0.28)
      const inZone = nearBottom && nearCenter
      setVisible(inZone || hot)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [hot])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-4"
      aria-hidden={!visible}
    >
      {/* Hover capture strip so the dock can reappear */}
      <div
        className="pointer-events-auto absolute inset-x-[20%] bottom-0 h-10"
        onPointerEnter={() => setVisible(true)}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onOpen}
        onPointerEnter={() => setVisible(true)}
        className={cn(
          'pointer-events-auto h-10 gap-2 rounded-full border border-border/80 bg-background/90 px-4 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 ease-out dark:shadow-black/40',
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-10 scale-95 opacity-0',
        )}
        aria-label="Open command palette"
      >
        <CommandIcon className="size-3.5 opacity-70" />
        <span className="text-sm font-medium">Commands</span>
        <KbdGroup className="ml-0.5">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
    </div>
  )
}
