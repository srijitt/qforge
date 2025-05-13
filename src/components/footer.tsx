// src/components/footer.tsx
'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-14 flex items-center justify-center">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          Made with
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          by <span className="font-semibold text-accent">srijitt</span>
        </span>
      </div>
    </footer>
  );
}
