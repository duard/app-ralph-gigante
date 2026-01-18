import { cn } from '@/lib/utils'

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

interface LogoProps {
  className?: string
  variant?: LogoVariant
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

const variantClasses: Record<LogoVariant, string> = {
  default: 'text-primary',
  white: 'text-white',
  black: 'text-black dark:text-white',
  gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  // Cores explícitas com suporte dark/light mode
  green: 'text-green-600 dark:text-green-500',
  blue: 'text-blue-600 dark:text-blue-500',
  red: 'text-red-600 dark:text-red-500',
  yellow: 'text-yellow-600 dark:text-yellow-500',
  orange: 'text-orange-600 dark:text-orange-500',
  purple: 'text-purple-600 dark:text-purple-500',
  cyan: 'text-cyan-600 dark:text-cyan-500',
  pink: 'text-pink-600 dark:text-pink-500',
}

export function Logo({ className, variant = 'default', size = 'md' }: LogoProps) {

  return (
    <div className={cn('font-stop select-none', className)}>
      <span className={cn('font-bold tracking-wider', sizeClasses[size], variantClasses[variant])}>
        GIGANTÃO-teste
      </span>
    </div>
  )
}
