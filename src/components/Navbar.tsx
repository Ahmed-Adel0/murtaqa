"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/types";
import { publicLinks } from "./navbar/navLinks";
import { UserMenu } from "./navbar/UserMenu";
import { MobileMenu } from "./navbar/MobileMenu";

type UserState = {
  role: Role | null;
  displayName: string | null;
  avatarUrl: string | null;
  unreadNotifs: number;
};

const EMPTY: UserState = { role: null, displayName: null, avatarUrl: null, unreadNotifs: 0 };

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserState>(EMPTY);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const hydrate = async (userId: string) => {
      const [{ data: profile }, { count }] = await Promise.all([
        supabase
          .from("profiles")
          .select("role, full_name, avatar_url")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false),
      ]);

      setUser({
        role: (profile?.role as Role) ?? null,
        displayName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        unreadNotifs: count ?? 0,
      });
      setAuthLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        hydrate(u.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        hydrate(session.user.id);
      } else {
        setUser(EMPTY);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (pathname === "/" && path.startsWith("/#")) {
      e.preventDefault();
      const id = path.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else if (pathname === "/" && path === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="fixed top-3 md:top-6 inset-x-0 z-50 flex justify-center px-3 md:px-6 pointer-events-none">
        <nav className="glass rounded-full border border-primary/20 px-4 md:px-6 py-2 md:py-2.5 flex items-center justify-between w-full max-w-7xl shadow-[0_15px_40px_-15px_rgba(199,90,48,0.15)] pointer-events-auto relative overflow-hidden">
          <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent blur-[0.5px]" />
          <div className="absolute -bottom-[0.5px] left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <Link
            href="/"
            className="relative h-9 w-24 md:h-11 md:w-36 transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src="/logos/Profile-Photoroom.png"
              alt="مرتقى أكاديمي"
              fill
              sizes="(max-width: 768px) 100vw, 440px"
              className="object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-7">
            {publicLinks.map((link) => (
              <Link
                key={link.id}
                href={link.path}
                onClick={(e) => handleAnchorClick(e, link.path)}
                className="text-sm lg:text-base font-bold text-foreground/80 hover:text-primary transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            {authLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-24 h-9 bg-white/5 rounded-full animate-pulse" />
                <div className="w-9 h-9 bg-white/5 rounded-full animate-pulse" />
              </div>
            ) : (
              <UserMenu
                role={user.role}
                displayName={user.displayName}
                avatarUrl={user.avatarUrl}
                unreadNotifs={user.unreadNotifs}
              />
            )}
          </div>

          <button
            className="md:hidden text-foreground p-2 rounded-full hover:bg-primary/5 active:scale-90 transition-transform"
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
        </nav>
      </div>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        role={user.role}
        displayName={user.displayName}
        avatarUrl={user.avatarUrl}
        unreadNotifs={user.unreadNotifs}
      />
    </>
  );
}
