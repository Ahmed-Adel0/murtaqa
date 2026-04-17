"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, type SidebarItem, type SidebarUser } from "./Sidebar";

export function DashboardLayout({
  title,
  subtitle,
  user,
  items,
  activeId,
  headerAction,
  children,
}: {
  title: string;
  subtitle?: string;
  user: SidebarUser;
  items: SidebarItem[];
  activeId?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-8" dir="rtl">
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[140px]" />
      </div>

      <Sidebar
        title="لوحة التحكم"
        items={items}
        activeId={activeId}
        user={user}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <main className="relative pt-24 pb-16 px-4 md:pr-[20rem] md:pl-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black">{title}</h1>
              {subtitle && <p className="text-white/40 text-sm mt-1.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {headerAction}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold transition-colors"
                aria-label="فتح القائمة"
              >
                القائمة
              </button>
            </div>
          </header>
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
