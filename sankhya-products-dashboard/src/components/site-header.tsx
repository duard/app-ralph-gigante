'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { CommandMenuTrigger } from '@/components/command-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { HeaderUserMenu } from '@/components/header-user-menu';
import { HeaderLogo } from '@/components/header-logo';
import { useAuthStore, type User } from '@/stores/auth-store';

const defaultUser: User = {
  id: '1',
  username: 'usuario',
  email: 'usuario@exemplo.com',
  name: 'Usuário',
  role: 'user',
};

export function SiteHeader() {
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4 sm:px-6 lg:gap-3 lg:px-8">
        {/* Logo */}
        <HeaderLogo variant="green" />

        <Separator orientation="vertical" className="mx-3 h-6 hidden sm:block" />

        {/* Spacer para empurrar itens para a direita */}
        <div className="flex-1" />

        {/* Menu de Navegação, Theme Toggle e User Menu alinhados à direita */}
        <div className="flex items-center gap-2">
          <CommandMenuTrigger />
          <ModeToggle />
          <HeaderUserMenu user={user ?? defaultUser} />
        </div>
      </div>
    </header>
  );
}
