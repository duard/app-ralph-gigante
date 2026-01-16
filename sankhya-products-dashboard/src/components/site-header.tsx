'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { CommandMenuTrigger } from '@/components/command-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { HeaderUserMenu } from '@/components/header-user-menu';
import { Logo } from '@/components/ui/logo';
import { useAuthStore } from '@/stores/auth-store';

export function SiteHeader() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4 sm:px-6 lg:gap-3 lg:px-8">
        {/* Logo */}
        <Logo variant="gradient" size="md" />

        <Separator orientation="vertical" className="mx-3 h-6 hidden sm:block" />

        {/* Spacer para empurrar itens para a direita */}
        <div className="flex-1" />

        {/* Menu de Navegação, Theme Toggle e User Menu alinhados à direita */}
        <div className="flex items-center gap-2">
          <CommandMenuTrigger />
          <ModeToggle />
          {user && <HeaderUserMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
