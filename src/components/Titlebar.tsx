import { useWindowControlsOverlay } from '@/hooks/useWindowControlsOverlay'
import { cn } from '@/lib/utils'

type Props = {
  languageLabel?: string
}

/**
 * Custom title bar content for Window Controls Overlay PWAs.
 * Hidden in browser tabs / non-WCO standalone.
 */
export function Titlebar({ languageLabel }: Props) {
  const { visible, controlsOnLeft } = useWindowControlsOverlay()

  if (!visible) return null

  return (
    <header
      className={cn(
        'titlebar fixed z-50 flex items-center gap-2 border-b border-border/60 bg-background text-foreground',
        controlsOnLeft ? 'titlebar-controls-left' : 'titlebar-controls-right',
      )}
      style={{
        left: 'env(titlebar-area-x, 0)',
        top: 'env(titlebar-area-y, 0)',
        width: 'env(titlebar-area-width, 100%)',
        height: 'env(titlebar-area-height, 33px)',
      }}
      aria-label="Window title bar"
    >
      <div
        className={cn(
          'flex h-full min-w-0 flex-1 items-center gap-2 px-3 text-xs',
          controlsOnLeft ? 'pl-1' : 'pr-1',
        )}
      >
        <span className="truncate font-medium tracking-tight">didiff</span>
        {languageLabel ? (
          <span className="truncate text-muted-foreground">{languageLabel}</span>
        ) : null}
      </div>
    </header>
  )
}

/** Spacer so page content sits below the overlay title bar when WCO is active. */
export function TitlebarSpacer() {
  const { visible } = useWindowControlsOverlay()
  if (!visible) return null
  return (
    <div
      aria-hidden
      className="shrink-0"
      style={{ height: 'env(titlebar-area-height, 0px)' }}
    />
  )
}
