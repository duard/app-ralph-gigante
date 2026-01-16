'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { CommandSearch, SearchTrigger } from '@/components/command-search';
import { ModeToggle } from '@/components/mode-toggle';
import { HeaderUserMenu } from '@/components/header-user-menu';
import { useAuthStore } from '@/stores/auth-store';

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { user } = useAuthStore();

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
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full items-center gap-1 px-4 sm:px-6 lg:gap-3 lg:px-8">
          {/* Logo GIGANTÃO */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-500">
              GIGANTÃO
            </h1>
          </div>

          <Separator orientation="vertical" className="mx-3 h-6 hidden sm:block" />

          <div className="flex-1 min-w-0 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            {user && <HeaderUserMenu user={user} />}
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
