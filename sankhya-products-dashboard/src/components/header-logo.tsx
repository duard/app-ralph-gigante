import * as React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'

type LogoVariant =
  | 'default'
  | 'white'
  | 'black'
  | 'gradient'
  | 'green'
  | 'blue'
  | 'red'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'cyan'
  | 'pink'

interface HeaderLogoProps {
  variant?: LogoVariant
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function HeaderLogo({ variant = 'gradient', size = 'md' }: HeaderLogoProps) {
  return (
    <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
      <Logo variant={variant} size={size} />
    </Link>
  )
}
