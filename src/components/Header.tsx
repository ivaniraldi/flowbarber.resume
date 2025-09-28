"use client";

import { Scissors } from "lucide-react";

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
            <Scissors className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-headline font-bold">
              <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">Flow</span>
              <span className="text-white">Barber</span>
            </h1>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
