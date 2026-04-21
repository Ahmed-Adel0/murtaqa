"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Bell, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Realtime: listen for new notifications
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel("admin-notifs-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as any, ...prev]);
          }
        )
        .subscribe();
    })();

    return () => { channel?.unsubscribe(); };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#060607] flex items-center justify-center text-white">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-20 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <ArrowRight className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-black">إشعارات الإدارة</h1>
           </div>
           {notifications.some(n => !n.is_read) && (
             <button 
               onClick={markAllRead}
               className="text-xs text-blue-500 hover:underline flex items-center gap-2"
             >
               <CheckCircle2 className="w-4 h-4" />
               تحديد الكل كمقروء
             </button>
           )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-[40px] py-24 text-center">
             <Bell className="w-16 h-16 text-white/5 mx-auto mb-6" />
             <p className="text-white/20 text-xl font-bold">لا توجد إشعارات حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
             {notifications.map((n) => (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={n.id} 
                 className={`p-6 rounded-[32px] border transition-all ${n.is_read ? 'bg-white/[0.02] border-white/5' : 'bg-blue-600/5 border-blue-600/20'}`}
               >
                  <div className="flex items-start gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.is_read ? 'bg-white/5 text-white/20' : 'bg-blue-600/20 text-blue-500'}`}>
                        <Bell className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className={`font-bold ${n.is_read ? 'text-white/40' : 'text-white'}`}>{n.title}</h4>
                           <span className="text-[10px] text-white/20">
                             {format(new Date(n.created_at), 'eeee, d MMMM - HH:mm', { locale: ar })}
                           </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${n.is_read ? 'text-white/30' : 'text-white/70'}`}>{n.message}</p>
                        {n.link && (
                          <Link href={n.link} className="inline-block mt-4 text-[10px] font-black text-blue-500 hover:underline">
                             عرض التفاصيل ←
                          </Link>
                        )}
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
