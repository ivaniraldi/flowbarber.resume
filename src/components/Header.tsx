
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation'
import { BarChart, Home, Menu, Scissors, Users, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  showAnalyticsButton?: boolean;
}

export function Header({ title, children, showAnalyticsButton }: HeaderProps) {
  const pathname = usePathname()
  
  const navLinks = [
    { href: "/", label: "Início", icon: <Home className="h-4 w-4" /> },
    { href: "/plans", label: "Planos", icon: <Users className="h-4 w-4" /> },
    { href: "/analytics", label: "Análises", icon: <BarChart className="h-4 w-4" /> },
    { href: "/settings", label: "Ajustes", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b no-print">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-headline font-bold">
               <Link href="/">
                <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">Flow</span>
                <span className="text-white">Barber</span>
               </Link>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {showAnalyticsButton && (
                <>
                  <nav className="hidden md:flex items-center gap-1 sm:gap-2">
                    {navLinks.map(link => (
                       <Link href={link.href} passHref key={link.href}>
                            <Button variant={pathname === link.href ? 'secondary' : 'ghost'} size="sm">
                                {link.icon}
                                <span className="ml-2">{link.label}</span>
                            </Button>
                       </Link>
                    ))}
                  </nav>
                   <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {navLinks.map(link => (
                                    <Link href={link.href} passHref key={link.href}>
                                        <DropdownMenuItem className={pathname === link.href ? "bg-accent" : ""}>
                                            {link.icon}
                                            <span className="ml-2">{link.label}</span>
                                        </DropdownMenuItem>
                                    </Link>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                   </div>
                </>
            )}
             {children}
          </div>
        </div>
      </div>
    </header>
  );
}
