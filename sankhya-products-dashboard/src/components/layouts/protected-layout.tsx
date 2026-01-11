"use client"

import * as React from "react"
import { Navigate } from "react-router-dom"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token")
      setIsAuthenticated(!!token)
    }

    checkAuth()

    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
