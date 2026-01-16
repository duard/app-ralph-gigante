import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'default' | 'white' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

export function Logo({ className, variant = 'default', size = 'md' }: LogoProps) {
  const variantClasses = {
    default: 'text-primary',
    white: 'text-white',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  }

  return (
    <div className={cn('font-stop select-none', className)}>
      <span className={cn('font-bold tracking-wider', sizeClasses[size], variantClasses[variant])}>
        GIGANTÃO
      </span>
    </div>
  )
}
