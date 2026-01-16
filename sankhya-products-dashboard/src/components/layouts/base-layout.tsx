'use client';

import { SiteHeader } from '@/components/site-header';
import { ThemeCustomizer, ThemeCustomizerTrigger } from '@/components/theme-customizer';
import * as React from 'react';

import { BreadcrumbNav } from '@/components/breadcrumb-nav';

interface BaseLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function BaseLayout({ children, title, description }: BaseLayoutProps) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col pt-16">
        <div className="px-4 lg:px-6 py-4">
          <BreadcrumbNav />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {title && (
                <div className="px-4 lg:px-6">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && <p className="text-muted-foreground">{description}</p>}
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Theme Customizer */}
      <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
      <ThemeCustomizer open={themeCustomizerOpen} onOpenChange={setThemeCustomizerOpen} />
    </div>
  );
}
