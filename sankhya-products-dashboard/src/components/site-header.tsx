'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { CommandSearch, SearchTrigger } from '@/components/command-search';
import { ModeToggle } from '@/components/mode-toggle';

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-3 py-3 sm:px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

          {/* Logo GIGANTÃO */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-500">
              GIGANTÃO
            </h1>
          </div>

          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 hidden sm:block" />

          <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
