"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Rocket, User as UserIcon } from "lucide-react";
import { ExcelConvertLogo, GoogleLogo } from "./icons";
import { useState } from "react";
import { PricingModal } from "./pricing-modal";

export function Header() {
  const { isLoggedIn, user, login, logout, isLoading } = useAuth();
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-auto flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <ExcelConvertLogo className="h-6 w-6 text-primary" />
              <span className="hidden font-bold font-headline sm:inline-block">
                ExcelConvert
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/convert"
                className="transition-colors hover:text-primary"
              >
                Convert
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {isLoading ? (
               <div className="h-9 w-9 animate-pulse rounded-full bg-muted sm:w-40 sm:rounded-md" />
            ) : isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                      <AvatarFallback>
                        <UserIcon />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setPricingModalOpen(true)}>
                    <Rocket className="mr-2 h-4 w-4" />
                    <span>Go Pro</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={login} size="sm" variant="outline">
                <GoogleLogo className="h-4 w-4" />
                <span className="hidden sm:inline whitespace-nowrap">Sign in with Google</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      <PricingModal isOpen={isPricingModalOpen} onOpenChange={setPricingModalOpen} />
    </>
  );
}
