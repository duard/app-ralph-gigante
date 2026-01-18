'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  direction?: 'bottom' | 'top' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[calc(100%-2rem)]',
};

const directionClasses = {
  bottom: 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t',
  top: 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b',
  right: 'inset-y-0 right-0 w-3/4 sm:max-w-sm border-l',
  left: 'inset-y-0 left-0 w-3/4 sm:max-w-sm border-r',
};

export function AnimatedDrawer({
  isOpen,
  onClose,
  children,
  className,
  direction = 'bottom',
  size = 'lg',
}: AnimatedDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed z-50 flex h-auto flex-col bg-background shadow-lg',
          directionClasses[direction],
          (direction === 'bottom' || direction === 'top') && sizeClasses[size],
          className
        )}
      >
        {direction === 'bottom' && (
          <div className="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>

        {direction === 'top' && (
          <div className="bg-muted mx-auto mb-4 h-2 w-[100px] shrink-0 rounded-full" />
        )}
      </div>
    </>
  );
}
