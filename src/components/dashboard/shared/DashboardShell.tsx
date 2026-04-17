import type { ReactNode } from "react";

export function DashboardShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-8 pt-24 pb-16 px-4 md:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">{title}</h1>
            {subtitle && <p className="text-white/40 mt-2 text-sm md:text-base">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}
