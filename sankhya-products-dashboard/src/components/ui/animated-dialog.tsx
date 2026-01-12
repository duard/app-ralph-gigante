'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AnimatedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  title?: string;
  description?: string;
}

export function AnimatedDialog({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  title,
  description,
}: AnimatedDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: -20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg sm:max-w-lg',
              className
            )}
          >
            {(title || description || showCloseButton) && (
              <div className="flex flex-col gap-2 text-center sm:text-left">
                {title && <h2 className="text-lg leading-none font-semibold">{title}</h2>}
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
              </div>
            )}

            <div className="flex flex-col gap-4">{children}</div>

            {showCloseButton && (
              <motion.button
                className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </motion.button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
