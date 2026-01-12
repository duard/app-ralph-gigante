'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export function AnimatedDrawer({
  isOpen,
  onClose,
  children,
  className,
  direction = 'bottom',
  size = 'lg',
}: AnimatedDrawerProps) {
  const getAnimationProps = () => {
    switch (direction) {
      case 'bottom':
        return {
          initial: { y: '100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
          className: `inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t`,
        };
      case 'top':
        return {
          initial: { y: '-100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '-100%', opacity: 0 },
          className: `inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b`,
        };
      case 'right':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '100%', opacity: 0 },
          className: `inset-y-0 right-0 w-3/4 sm:max-w-sm border-l`,
        };
      case 'left':
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 },
          className: `inset-y-0 left-0 w-3/4 sm:max-w-sm border-r`,
        };
      default:
        return {
          initial: { y: '100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
          className: `inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t`,
        };
    }
  };

  const animationProps = getAnimationProps();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            {...animationProps}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              'fixed z-50 flex h-auto flex-col bg-background shadow-lg',
              animationProps.className,
              direction === 'bottom' || direction === 'top' ? sizeClasses[size] : '',
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
