"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
import { getAppUrl } from "@/lib/utils"

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-3 py-3 sm:px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Mobile: Show only theme toggle and menu */}
            <div className="sm:hidden">
              <ModeToggle />
            </div>
            
            {/* Desktop: Show all buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild size="sm">
                <a
                  href="https://shadcnstore.com/blocks"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground text-xs sm:text-sm"
                >
                  <span className="hidden md:inline">Blocks</span>
                  <span className="md:hidden">B</span>
                </a>
              </Button>
              <Button variant="ghost" asChild size="sm">
                <a
                  href={getAppUrl("/landing")}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground text-xs sm:text-sm"
                >
                  <span className="hidden lg:inline">Landing</span>
                  <span className="lg:hidden">Land</span>
                </a>
              </Button>
              <Button variant="ghost" asChild size="sm">
                <a
                  href="https://github.com/silicondeck/shadcn-dashboard-landing-template"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">GitHub</span>
                  <span className="sm:hidden">GH</span>
                </a>
              </Button>
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
