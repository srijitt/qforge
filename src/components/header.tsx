// src/components/header.tsx
'use client';

import Link from 'next/link';
import { FileText, Home, Settings, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as React from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate Paper', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" />
          <span className="font-bold text-lg">QForge</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 text-sm lg:gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} legacyBehavior passHref>
              <Button
                variant="ghost"
                className={cn(
                  'px-3 py-2 transition-colors hover:text-accent-foreground hover:bg-accent/80',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                    <FileText className="h-6 w-6 text-accent" />
                    <span className="font-bold text-lg">QForge</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start px-3 py-2 text-base transition-colors hover:text-accent-foreground hover:bg-accent/80',
                          pathname === item.href
                            ? 'bg-accent text-accent-foreground font-semibold'
                            : 'text-muted-foreground'
                        )}
                         onClick={() => setIsSheetOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
