"use client";

import { m, AnimatePresence } from "framer-motion";
import { X, GraduationCap, ChevronLeft, Laptop } from "lucide-react";
import Link from "next/link";

interface TeacherRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = "966505855924";

export default function TeacherRegisterModal({ isOpen, onClose }: TeacherRegisterModalProps) {
  const handleClose = () => {
    onClose();
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent("مرحباً مرتقى أكاديمي، أود الاستفسار عن الانضمام كمعلم.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <m.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white px-0">انضم إلينا كمعلم</h2>
                    <p className="text-xs text-white/40 font-medium font-tajawal">اختر وسيلة التقديم المناسبة لك</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Choice Body */}
              <div className="p-8 space-y-6">
                
                {/* Web Registration */}
                <div className="bg-blue-600/5 border border-blue-500/20 rounded-[32px] p-8 text-center space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />
                  
                  <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto relative z-10">
                    <Laptop className="w-10 h-10 text-blue-500" />
                  </div>
                  
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-black text-white">التسجيل الرقمي السريع</h3>
                    <p className="text-sm text-white/40 leading-relaxed px-4">
                      قدم طلبك عبر الموقع مباشرة، ارفع شهاداتك، واحصل على لوحة تحكم خاصة بك فور القبول.
                    </p>
                  </div>

                  <Link 
                    href="/register" 
                    onClick={handleClose}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 relative z-10"
                  >
                    ابدأ التقديم الآن
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5" />
                  <span className="relative z-10 bg-[#0a0a0b] px-6 text-[10px] text-white/20 mx-auto block w-fit font-black uppercase tracking-widest">أو التقديم اليدوي</span>
                </div>

                {/* WhatsApp Option */}
                <button 
                  onClick={openWhatsApp}
                  className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white">تواصل عبر واتساب</p>
                      <p className="text-[10px] text-white/40">تحدث مع فريق القبول مباشرة</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-white transition-all group-hover:translate-x-[-4px]" />
                </button>

                <p className="text-[10px] text-center text-white/20 pt-4">نحن نراجع جميع الطلبات خلال 24 ساعة عمل</p>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
