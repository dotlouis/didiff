import { useMemo } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { LANGUAGES } from '@/lib/languages'
import type {
  DiffStyle,
  LineDiffType,
  OverflowMode,
  Settings,
  ThemeMode,
} from '@/lib/settings'
import {
  AlignLeft,
  ArrowLeftRight,
  Columns2,
  Eraser,
  History,
  Languages,
  Moon,
  PanelLeft,
  Rows2,
  Sun,
  SunMoon,
  TextCursorInput,
  Trash2,
  WrapText,
} from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  resolvedLanguage: string
  onPatchSettings: (patch: Partial<Settings>) => void
  onSwap: () => void
  onClear: () => void
  onFormatFocused: () => void
  onFormatBoth: () => void
  formatting?: boolean
  onClearHistory: () => void
  onFocusOriginal: () => void
  onFocusModified: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  settings,
  resolvedLanguage,
  onPatchSettings,
  onSwap,
  onClear,
  onFormatFocused,
  onFormatBoth,
  formatting,
  onClearHistory,
  onFocusOriginal,
  onFocusModified,
}: Props) {
  const run = (fn: () => void) => {
    fn()
    onOpenChange(false)
  }

  const langLabel = useMemo(() => {
    if (settings.language === 'auto') return `Auto (${resolvedLanguage})`
    return (
      LANGUAGES.find((l) => l.id === settings.language)?.label ?? settings.language
    )
  }, [settings.language, resolvedLanguage])

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search didiff actions"
      className="sm:max-w-xl"
    >
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ editorsOpen: !settings.editorsOpen }))
              }
            >
              <TextCursorInput />
              {settings.editorsOpen
                ? 'Hide editors (keep diff full height)'
                : 'Show editors'}
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>E</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              disabled={formatting}
              onSelect={() => run(onFormatFocused)}
            >
              <AlignLeft />
              Format focused input
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>I</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              disabled={formatting}
              onSelect={() => run(onFormatBoth)}
            >
              <AlignLeft />
              Format both inputs
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>⌥</Kbd>
                  <Kbd>I</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(onSwap)}>
              <ArrowLeftRight />
              Swap original ↔ modified
            </CommandItem>
            <CommandItem onSelect={() => run(onClear)}>
              <Eraser />
              Clear both texts
            </CommandItem>
            <CommandItem onSelect={() => run(onFocusOriginal)}>
              Focus original
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>1</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(onFocusModified)}>
              Focus modified
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>2</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ sidebarOpen: !settings.sidebarOpen }))
              }
            >
              <PanelLeft />
              {settings.sidebarOpen ? 'Hide history sidebar' : 'Show history sidebar'}
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>B</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(onClearHistory)}>
              <Trash2 />
              Clear history
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Layout">
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ diffStyle: 'split' as DiffStyle }))
              }
            >
              <Columns2 />
              Split view
              {settings.diffStyle === 'split' && (
                <CommandShortcut>Current</CommandShortcut>
              )}
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ diffStyle: 'unified' as DiffStyle }))
              }
            >
              <Rows2 />
              Unified view
              {settings.diffStyle === 'unified' && (
                <CommandShortcut>Current</CommandShortcut>
              )}
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ overflow: 'wrap' as OverflowMode }))
              }
            >
              <WrapText />
              Wrap lines
              {settings.overflow === 'wrap' && (
                <CommandShortcut>Current</CommandShortcut>
              )}
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ overflow: 'scroll' as OverflowMode }))
              }
            >
              Scroll long lines
              {settings.overflow === 'scroll' && (
                <CommandShortcut>Current</CommandShortcut>
              )}
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Inline highlight">
            {(
              [
                ['char', 'Characters'],
                ['word', 'Words'],
                ['word-alt', 'Words (alt)'],
                ['none', 'None'],
              ] as const
            ).map(([value, label]) => (
              <CommandItem
                key={value}
                onSelect={() =>
                  run(() =>
                    onPatchSettings({ lineDiffType: value as LineDiffType }),
                  )
                }
              >
                {label}
                {settings.lineDiffType === value && (
                  <CommandShortcut>Current</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ theme: 'system' as ThemeMode }))
              }
            >
              <SunMoon />
              System
              {settings.theme === 'system' && (
                <CommandShortcut>Current</CommandShortcut>
              )}
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ theme: 'light' as ThemeMode }))
              }
            >
              <Sun />
              Light
              {settings.theme === 'light' && (
                <CommandShortcut>Current</CommandShortcut>
              )}
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => onPatchSettings({ theme: 'dark' as ThemeMode }))
              }
            >
              <Moon />
              Dark
              {settings.theme === 'dark' && (
                <CommandShortcut>Current</CommandShortcut>
              )}
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={`Language · ${langLabel}`}>
            {LANGUAGES.map((lang) => (
              <CommandItem
                key={lang.id}
                value={`language ${lang.label} ${lang.id}`}
                onSelect={() => run(() => onPatchSettings({ language: lang.id }))}
              >
                <Languages />
                {lang.id === 'auto'
                  ? `Auto-detect (${resolvedLanguage})`
                  : lang.label}
                {settings.language === lang.id && (
                  <CommandShortcut>Current</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="About">
            <CommandItem disabled value="about didiff history">
              <History />
              didiff · local history only
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
