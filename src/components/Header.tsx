
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation'
import { BarChart, Home, Scissors, Users, Settings } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  showAnalyticsButton?: boolean;
}

export function Header({ title, children, showAnalyticsButton }: HeaderProps) {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b no-print">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-headline font-bold">
               <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">Flow</span>
               <span className="text-white">Barber</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {showAnalyticsButton && (
                 <nav className="flex items-center gap-1 sm:gap-2">
                    <Link href="/" passHref>
                         <Button variant={pathname === '/' ? 'secondary' : 'ghost'} size="sm">
                            <Home className="h-4 w-4" />
                            <span className="hidden sm:inline-block ml-2">Início</span>
                        </Button>
                    </Link>
                    <Link href="/plans" passHref>
                         <Button variant={pathname === '/plans' ? 'secondary' : 'ghost'} size="sm">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline-block ml-2">Planos</span>
                        </Button>
                    </Link>
                    <Link href="/analytics" passHref>
                        <Button variant={pathname === '/analytics' ? 'secondary' : 'ghost'} size="sm">
                            <BarChart className="h-4 w-4" />
                            <span className="hidden sm:inline-block ml-2">Análises</span>
                        </Button>
                    </Link>
                    <Link href="/settings" passHref>
                        <Button variant={pathname === '/settings' ? 'secondary' : 'ghost'} size="sm">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline-block ml-2">Ajustes</span>
                        </Button>
                    </Link>
                </nav>
            )}
             {children}
          </div>
        </div>
      </div>
    </header>
  );
}
