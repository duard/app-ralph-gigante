"use client"

import * as React from "react"
import { AuthProvider, useAuthContext } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarConfigProvider } from "@/contexts/sidebar-context"
import { Toaster } from "@/components/ui/sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AppLayoutProps {
  children: React.ReactNode
}

function AppContent({ children }: AppLayoutProps) {
  const { isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <SidebarConfigProvider>
      {children}
      <Toaster />
    </SidebarConfigProvider>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class" enableSystem>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}