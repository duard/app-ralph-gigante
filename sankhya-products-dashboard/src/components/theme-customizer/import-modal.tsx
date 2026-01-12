'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedDialog } from '@/components/ui/animated-dialog';
import { Textarea } from '@/components/ui/textarea';
import type { ImportedTheme } from '@/types/theme-customizer';
import { motion } from 'framer-motion';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (theme: ImportedTheme) => void;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [importText, setImportText] = React.useState('');

  const processImport = () => {
    try {
      if (!importText.trim()) {
        console.error('No CSS content provided');
        return;
      }

      // Parse CSS content into light and dark theme variables
      const lightTheme: Record<string, string> = {};
      const darkTheme: Record<string, string> = {};

      // Split CSS into sections
      const cssText = importText.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments

      // Extract :root section (light theme)
      const rootMatch = cssText.match(/:root\s*\{([^}]+)\}/);
      if (rootMatch) {
        const rootContent = rootMatch[1];
        const variableMatches = rootContent.matchAll(/--([^:]+):\s*([^;]+);/g);
        for (const match of variableMatches) {
          const [, variable, value] = match;
          lightTheme[variable.trim()] = value.trim();
        }
      }

      // Extract .dark section (dark theme)
      const darkMatch = cssText.match(/\.dark\s*\{([^}]+)\}/);
      if (darkMatch) {
        const darkContent = darkMatch[1];
        const variableMatches = darkContent.matchAll(/--([^:]+):\s*([^;]+);/g);
        for (const match of variableMatches) {
          const [, variable, value] = match;
          darkTheme[variable.trim()] = value.trim();
        }
      }

      // Store the imported theme
      const importedThemeData = { light: lightTheme, dark: darkTheme };
      onImport(importedThemeData);

      onOpenChange(false);
      setImportText('');
    } catch (error) {
      console.error('Error importing theme:', error);
    }
  };

  return (
    <AnimatedDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Import Custom CSS"
      description="Paste your CSS theme below. Include both :root (light mode) and .dark (dark mode) sections with CSS variables like --primary, --background, etc. The theme will automatically switch between light and dark modes."
      showCloseButton={true}
      className="max-w-4xl w-[90vw]"
    >
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Textarea
            id="theme-css"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-h-[400px] min-h-[300px] font-mono text-sm text-foreground overflow-y-auto resize-none"
            placeholder={`:root {
  --background: 0 0% 100%;
  --foreground: oklch(0.52 0.13 144.17);
  --primary: #3e2723;
  /* And more */
}
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: hsl(37.50 36.36% 95.69%);
  --primary: rgb(46, 125, 50);
  /* And more */
}`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
        </motion.div>
        <motion.div
          className="flex gap-2 justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={processImport}
              disabled={!importText.trim()}
              className="cursor-pointer"
            >
              Import Theme
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatedDialog>
  );
}
