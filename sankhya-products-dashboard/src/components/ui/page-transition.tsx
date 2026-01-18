'use client';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return <div className={`min-h-full ${className}`}>{children}</div>;
}
