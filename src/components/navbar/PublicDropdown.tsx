"use client";

import Link from "next/link";
import { ChevronDown, Compass } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { publicLinks } from "./navLinks";

export function PublicDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-bold text-foreground/80 hover:text-primary transition-colors px-3 py-2 rounded-full hover:bg-primary/5 outline-none">
          <Compass className="w-4 h-4" />
          استكشف المنصة
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>المنصة</DropdownMenuLabel>
        {publicLinks.map((link) => {
          const Icon = link.icon;
          return (
            <DropdownMenuItem key={link.id} asChild>
              <Link href={link.path}>
                <Icon className="w-4 h-4 text-white/40" />
                {link.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/register">انضم إلينا</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
