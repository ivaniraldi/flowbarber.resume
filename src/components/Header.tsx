"use client";

import BarberPoleIcon from "./icons/BarberPoleIcon";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b no-print">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <BarberPoleIcon className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
              {title}
            </h1>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
