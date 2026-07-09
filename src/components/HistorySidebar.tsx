import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { formatHistoryTime, type HistoryEntry } from '@/lib/history'
import { History, PanelLeftClose, Trash2 } from 'lucide-react'

type Props = {
  entries: HistoryEntry[]
  activeId?: string | null
  onSelect: (entry: HistoryEntry) => void
  onRemove: (id: string) => void
}

export function HistorySidebar({
  entries,
  activeId,
  onSelect,
  onRemove,
}: Props) {
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-2 py-2">
        <div className="flex items-center gap-1">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1 text-sm font-medium">
            <History className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">History</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={toggleSidebar}
            aria-label="Hide history sidebar"
            title="Hide sidebar (⌘B)"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </div>
        <p className="px-1 text-xs text-muted-foreground">Local only · this browser</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Previous diffs</SidebarGroupLabel>
          <SidebarGroupContent>
            {entries.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                Diffs you paste will appear here.
              </p>
            ) : (
              <SidebarMenu>
                {entries.map((entry) => (
                  <SidebarMenuItem key={entry.id} className="group/item relative">
                    <SidebarMenuButton
                      isActive={activeId === entry.id}
                      onClick={() => onSelect(entry)}
                      tooltip={entry.preview}
                      className="h-auto items-start py-2"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                        <span className="truncate text-xs font-medium">
                          {entry.preview}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatHistoryTime(entry.createdAt)}
                          {entry.language && entry.language !== 'auto'
                            ? ` · ${entry.language}`
                            : ''}
                        </span>
                      </div>
                    </SidebarMenuButton>
                    <button
                      type="button"
                      className="absolute top-1.5 right-1 rounded p-1 text-muted-foreground opacity-0 hover:bg-sidebar-accent hover:text-foreground group-hover/item:opacity-100"
                      aria-label="Remove from history"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(entry.id)
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

/** Floating edge control when the sidebar is closed. */
export function SidebarRevealButton() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar()
  const shown = isMobile ? !openMobile : !open
  if (!shown) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="fixed top-3 left-3 z-30 size-8 rounded-full border-border/80 bg-background/90 shadow-md backdrop-blur-md"
      onClick={toggleSidebar}
      aria-label="Show history sidebar"
      title="Show history (⌘B)"
    >
      <History className="size-4" />
    </Button>
  )
}
