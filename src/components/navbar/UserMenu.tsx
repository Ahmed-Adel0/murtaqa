"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  LogOut,
  LogIn,
  UserPlus,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/types";

export function UserMenu({
  role,
  displayName,
  avatarUrl,
  unreadNotifs,
}: {
  role: Role | null;
  displayName: string | null;
  avatarUrl: string | null;
  unreadNotifs: number;
}) {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!role) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <button className="flex items-center gap-1.5 text-sm font-bold text-foreground/70 hover:text-primary px-3 py-2 rounded-full transition-colors outline-none">
            <LogIn className="w-4 h-4" />
            دخول
          </button>
        </Link>
        <Link href="/register">
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 text-sm font-black shadow-lg shadow-primary/20 transition-all outline-none">
            <UserPlus className="w-4 h-4" />
            إنشاء حساب
          </button>
        </Link>
      </div>
    );
  }

  const firstName = displayName?.split(" ")[0] ?? "حسابي";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full pl-4 pr-1 py-1 text-sm font-bold transition-all outline-none">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 border border-white/10 relative shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" />
            ) : (
              <UserCircle className="w-7 h-7 text-primary/60" />
            )}
          </div>
          <span className="hidden lg:inline">{firstName}</span>
          {unreadNotifs > 0 && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-label={`${unreadNotifs} غير مقروء`} />
          )}
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>
          {role === "admin" ? "مسؤول النظام" : role === "teacher" ? "المعلم" : "الطالب"}
        </DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="w-4 h-4 text-white/40" />
            لوحة التحكم
          </Link>
        </DropdownMenuItem>

        {role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              لوحة الإدارة
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <Bell className="w-4 h-4 text-white/40" />
            الإشعارات
            {unreadNotifs > 0 && (
              <span className="ms-auto w-5 h-5 rounded-full bg-blue-500 text-[10px] font-black flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={signOut} className="text-red-400 focus:text-red-300">
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
