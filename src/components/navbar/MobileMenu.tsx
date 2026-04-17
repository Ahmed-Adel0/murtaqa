"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
  UserCircle,
  Bell,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/types";
import { publicLinks } from "./navLinks";

export function MobileMenu({
  open,
  onClose,
  role,
  displayName,
  avatarUrl,
  unreadNotifs,
}: {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  displayName: string | null;
  avatarUrl: string | null;
  unreadNotifs: number;
}) {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/85 backdrop-blur-xl md:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute top-0 inset-x-0 bg-card/95 border-b border-primary/20 p-6 pt-10 rounded-b-[32px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              {role ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-white/10 relative">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="" fill className="object-cover" />
                    ) : (
                      <UserCircle className="w-10 h-10 text-primary/60" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{displayName ?? "مستخدم"}</p>
                    <p className="text-[10px] text-white/40 uppercase">
                      {role === "admin" ? "مسؤول" : role === "teacher" ? "معلم" : "طالب"}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                  القائمة
                </span>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 px-1">المنصة</p>
              {publicLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    href={link.path}
                    onClick={onClose}
                    className="flex items-center gap-3 font-bold text-sm py-3 px-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-white/40" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-white/5 pt-5 space-y-1">
              {role ? (
                <>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 px-1">حسابي</p>
                  {role === "teacher" || role === "student" ? (
                    <Link
                      href="/dashboard"
                      onClick={onClose}
                      className="flex items-center gap-3 font-bold text-sm py-3 px-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-white/40" />
                      لوحة التحكم
                    </Link>
                  ) : null}
                {/*   {role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 font-bold text-sm py-3 px-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      لوحة الإدارة
                    </Link>
                  )} */}
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 font-bold text-sm py-3 px-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-white/40" />
                    الإشعارات
                    {unreadNotifs > 0 && (
                      <span className="ms-auto w-5 h-5 rounded-full bg-blue-500 text-[10px] font-black flex items-center justify-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 font-bold text-sm py-3 px-2 rounded-xl text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center gap-3 font-bold text-sm py-3 px-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-white/40" />
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black rounded-xl py-3.5 mt-3 shadow-lg shadow-primary/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    إنشاء حساب جديد
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
