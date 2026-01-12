'use client';

import * as React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
