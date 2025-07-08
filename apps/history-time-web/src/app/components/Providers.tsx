'use client';

import { ThemeProvider } from '../contexts/ThemeContext';
import { UnifiedAuthProvider } from '../hooks/useUnifiedAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UnifiedAuthProvider>{children}</UnifiedAuthProvider>
    </ThemeProvider>
  );
}