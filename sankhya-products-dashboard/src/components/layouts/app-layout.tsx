"use client"

import * as React from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarConfigProvider } from "@/contexts/sidebar-context"
import { Toaster } from "@/components/ui/sonner"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class" enableSystem>
        <AuthProvider>
          <SidebarConfigProvider>
            {children}
            <Toaster />
          </SidebarConfigProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}