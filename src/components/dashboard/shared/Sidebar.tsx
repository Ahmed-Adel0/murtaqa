"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, UserCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export type SidebarItem = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
} & (
  | { href: string; onSelect?: never }
  | { onSelect: () => void; href?: never }
);

export type SidebarUser = {
  displayName: string | null;
  avatarUrl: string | null;
  roleLabel: string;
};

export function Sidebar({
  title,
  items,
  activeId,
  user,
  open,
  onClose,
}: {
  title: string;
  items: SidebarItem[];
  activeId?: string;
  user: SidebarUser;
  open: boolean;
  onClose: () => void;
}) {
  const firstInitial = user.displayName?.trim()[0] ?? "?";

  const body = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/5">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">{title}</p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-primary/10 border border-white/10 relative shrink-0">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-primary/60">
                {firstInitial}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{user.displayName ?? "مستخدم"}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">{user.roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const base =
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all outline-none";
          const stateClass = isActive
            ? "bg-primary/15 text-primary border border-primary/20 shadow-inner shadow-primary/5"
            : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent";

          const content = (
            <>
              <span className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-white/40")}>
                {item.icon}
              </span>
              <span className="flex-1 text-right">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-[10px] font-black bg-blue-500 text-white rounded-full px-2 py-0.5 min-w-[22px] text-center">
                  {item.badge}
                </span>
              )}
            </>
          );

          if ("href" in item && item.href) {
            return (
              <Link key={item.id} href={item.href} onClick={onClose} className={cn(base, stateClass)}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.onSelect?.();
                onClose();
              }}
              className={cn(base, stateClass)}
            >
              {content}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-400/80 hover:text-red-300 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-right">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-24 right-4 lg:right-8 bottom-6 w-72 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[28px] overflow-hidden z-30">
        {body}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute top-0 bottom-0 right-0 w-[80%] max-w-[320px] bg-[#0d0d10] border-l border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="h-full pt-12">{body}</div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SidebarMobileTrigger({ onOpen, label }: { onOpen: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold transition-colors"
      aria-label="فتح القائمة"
    >
      <UserCircle className="w-4 h-4 text-white/60" />
      {label}
    </button>
  );
}
