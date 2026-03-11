"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Navbar({ user }: NavbarProps) {
  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/novels" className="font-semibold text-sm">
          NanoNovelWriter
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent outline-none">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium overflow-hidden">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name ?? ""} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="hidden sm:block">{user.name ?? user.email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
