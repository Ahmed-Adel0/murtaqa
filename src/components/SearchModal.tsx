"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, MapPin, BookOpen, Search, ArrowLeft, ChevronLeft, Sparkles } from "lucide-react";

// ===== DATA =====
const governorates = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "الظهران", "تبوك", "أبها", "خميس مشيط",
  "حائل", "القصيم (بريدة)", "الجوف", "نجران", "جازان",
  "ينبع", "الطائف", "الأحساء", "القطيف", "عرعر",
];

const specialties = [
  { label: "الرياضيات", icon: "📐", hot: true },
  { label: "الفيزياء", icon: "⚛️", hot: true },
  { label: "الكيمياء", icon: "🧪", hot: false },
  { label: "الأحياء", icon: "🦠", hot: false },
  { label: "اللغة العربية", icon: "📖", hot: false },
  { label: "اللغة الإنجليزية", icon: "🌐", hot: true },
  { label: "التاريخ والجغرافيا", icon: "🗺️", hot: false },
  { label: "الحاسب الآلي", icon: "💻", hot: true },
  { label: "اختبار القدرات", icon: "🎯", hot: true },
  { label: "التحصيل الدراسي", icon: "📊", hot: false },
  { label: "الفرنسية والألمانية", icon: "🇫🇷", hot: false },
  { label: "مواد الجامعة", icon: "🎓", hot: true },
  { label: "الإحصاء والإحتمالات", icon: "📈", hot: false },
  { label: "أخرى", icon: "✨", hot: false },
];

type Step = "governorate" | "specialty" | "result";

interface SearchModalProps {
  onSearch?: (governorate: string, specialty: string) => void;
}

const STORAGE_KEY = "murtaqa_search_dismissed";

export default function SearchModal({ onSearch }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("governorate");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [govSearch, setGovSearch] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Removed auto-opening effect to prevent modal from showing on page load
  /* 
  useEffect(() => {
    // Show modal on first visit
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);
  */

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleOpen = useCallback(() => {
    // Reset to step 1 each time opened manually
    setStep("governorate");
    setSelectedGov("");
    setSelectedSpec("");
    setGovSearch("");
    setIsOpen(true);
    setShowTooltip(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const handleSelectGov = (gov: string) => {
    setSelectedGov(gov);
    setStep("specialty");
  };

  const handleSelectSpec = (spec: string) => {
    setSelectedSpec(spec);
    setStep("result");
    onSearch?.(selectedGov, spec);
  };

  const handleScrollToTeachers = () => {
    handleClose();
    setTimeout(() => {
      document.getElementById("teachers")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleScrollToRegister = () => {
    handleClose();
    setTimeout(() => {
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const filteredGovs = governorates.filter((g) =>
    g.includes(govSearch) || govSearch === ""
  );

  const stepIndex = step === "governorate" ? 0 : step === "specialty" ? 1 : 2;

  return (
    <>
      {/* ===== FLOATING SEARCH BUTTON ===== */}
      {/* 
        IMPORTANT: The outer wrapper has a FIXED size equal to the button (w-14 h-14).
        Tooltip and label are absolute so they NEVER shift the button position.
      */}
      <div
        className={`fixed bottom-6 left-6 z-[150] transition-all duration-500 transform ${
          scrolled ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-50 pointer-events-none"
        }`}
        style={{ width: 56, height: 56 }}
      >
        {/* Tooltip — absolutely positioned ABOVE, never affects button layout */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <m.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(100%+12px)] left-0 bg-card border border-primary/25 rounded-2xl px-4 py-3 shadow-xl shadow-black/30 w-[170px] text-right pointer-events-none"
              style={{ willChange: "opacity, transform" }}
            >
              <p className="text-xs font-black text-foreground whitespace-nowrap">ابحث عن مدرسك</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">اختر مدينتك والمادة</p>
              {/* Arrow pointing down */}
              <div className="absolute -bottom-[7px] left-5 w-3 h-3 bg-card border-b border-r border-primary/20 rotate-45" />
            </m.div>
          )}
        </AnimatePresence>

        {/* Label — absolutely positioned BELOW, never affects button layout */}
       {/*  <div
          className="absolute top-[calc(100%+6px)] left-0 w-14 text-center pointer-events-none"
          style={{ opacity: isOpen ? 0 : 0.7, transition: "opacity 0.2s" }}
        >
          <span className="text-[9px] font-black text-primary leading-tight block">ابحث</span>
        </div> */}

     {/*     {!isOpen && (
          <span
            className="absolute inset-0 rounded-2xl bg-primary/30 pointer-events-none"
            style={{ animation: "search-pulse 2.8s ease-out infinite" }}
          />
        )}

         <button
          onClick={isOpen ? handleClose : handleOpen}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative w-14 h-14 rounded-2xl bg-primary flex items-center justify-center cursor-pointer overflow-hidden"
          style={{
            boxShadow: "0 8px 32px -4px rgba(42,169,224,0.40)",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="بحث عن مدرس"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/12 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <AnimatePresence mode="wait">
            {isOpen ? (
              <m.span
                key="x"
                initial={{ rotate: -80, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 80, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.16 }}
                style={{ display: "flex" }}
              >
                <X className="w-6 h-6 text-white" />
              </m.span>
            ) : (
              <m.span
                key="s"
                initial={{ rotate: 80, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -80, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.16 }}
                style={{ display: "flex" }}
              >
                <Search className="w-6 h-6 text-white" />
              </m.span>
            )}
          </AnimatePresence>
        </button> */}
      </div>


    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            key="sb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-lg"
            onClick={handleClose}
          />

          {/* Modal */}
          <m.div
            key="sm"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-card border border-primary/20 rounded-3xl shadow-[0_40px_100px_-10px_rgba(42,169,224,0.2)] overflow-hidden pointer-events-auto flex flex-col"
              style={{ maxHeight: "88vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 shrink-0">
                {/* Close */}
                <button
                  onClick={handleClose}
                  className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Step indicator (back button for step 2) */}
                {step === "specialty" && (
                  <button
                    onClick={() => { setStep("governorate"); setSelectedSpec(""); }}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                )}

                {/* Icon & Title */}
                <div className="flex flex-col items-center text-center gap-2 pt-2">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-1 border border-primary/20">
                      <Search className="w-7 h-7 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <m.div
                      key={step}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step === "governorate" && (
                        <>
                          <h2 className="text-lg font-black text-foreground">ابحث عن مدرسك المثالي</h2>
                          <p className="text-xs text-muted-foreground mt-1">ابدأ باختيار مدينتك أو محافظتك</p>
                        </>
                      )}
                      {step === "specialty" && (
                        <>
                          <h2 className="text-lg font-black text-foreground">
                            <span className="text-primary">{selectedGov}</span> ✓
                          </h2>
                          <p className="text-xs text-muted-foreground mt-1">الآن اختر المادة أو التخصص المطلوب</p>
                        </>
                      )}
                      {step === "result" && (
                        <>
                          <h2 className="text-lg font-black text-foreground">وجدنا ما تبحث عنه! 🎉</h2>
                          <p className="text-xs text-muted-foreground mt-1">
                            مدرسين <span className="text-primary font-bold">{selectedSpec}</span> في <span className="text-primary font-bold">{selectedGov}</span>
                          </p>
                        </>
                      )}
                    </m.div>
                  </AnimatePresence>

                  {/* Step Progress */}
                  <div className="flex items-center gap-2 mt-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i <= stepIndex
                            ? "bg-primary w-6"
                            : "bg-white/10 w-3"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-5 pb-6">
                <AnimatePresence mode="wait">
                  {/* STEP 1: Governorate */}
                  {step === "governorate" && (
                    <m.div
                      key="gov"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Search input */}
                      <div className="relative mb-4">
                        <input
                          type="text"
                          placeholder="ابحث عن مدينتك..."
                          value={govSearch}
                          onChange={(e) => setGovSearch(e.target.value)}
                          className="w-full bg-background/60 border border-primary/20 rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                          autoFocus
                        />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {filteredGovs.map((gov) => (
                          <m.button
                            key={gov}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSelectGov(gov)}
                            className="flex items-center gap-2 bg-background/40 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground/80 hover:text-primary transition-all duration-200 text-right cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                            <span className="truncate">{gov}</span>
                          </m.button>
                        ))}
                      </div>

                      {filteredGovs.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          لا توجد نتائج — <button onClick={() => handleSelectGov(govSearch)} className="text-primary font-bold underline cursor-pointer">إضافة "{govSearch}"</button>
                        </div>
                      )}

                      <button
                        onClick={handleClose}
                        className="w-full mt-4 text-center text-xs text-muted-foreground/50 hover:text-muted-foreground py-2 transition-colors cursor-pointer"
                      >
                        تخطي — تصفح الموقع مباشرة
                      </button>
                    </m.div>
                  )}

                  {/* STEP 2: Specialty */}
                  {step === "specialty" && (
                    <m.div
                      key="spec"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-2"
                    >
                      {specialties.map((s) => (
                        <m.button
                          key={s.label}
                          whileHover={{ scale: 1.015, x: -4 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSelectSpec(s.label)}
                          className="flex items-center gap-3 bg-background/40 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-xl px-4 py-3 text-sm font-bold text-foreground/80 hover:text-primary transition-all duration-200 cursor-pointer w-full text-right"
                        >
                          <span className="text-base shrink-0">{s.icon}</span>
                          <span className="flex-1">{s.label}</span>
                          {s.hot && (
                            <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full shrink-0">الأكثر طلبًا</span>
                          )}
                          <BookOpen className="w-3.5 h-3.5 text-primary/20 shrink-0" />
                        </m.button>
                      ))}
                    </m.div>
                  )}

                  {/* STEP 3: Result */}
                  {step === "result" && (
                    <m.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-5 py-4"
                    >
                      {/* Result Card */}
                      <div className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/25 rounded-2xl p-5 text-center">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="text-sm font-black text-foreground mb-1">نبحث لك عن:</p>
                        <p className="text-lg font-black text-primary mb-0.5">{selectedSpec}</p>
                        <p className="text-xs text-muted-foreground">في <span className="font-bold text-foreground">{selectedGov}</span></p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 w-full">
                        {[
                          { val: "+90", label: "مدرس متاح" },
                          { val: "4.9★", label: "متوسط التقييم" },
                          { val: "24h", label: "رد سريع" },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-background/40 border border-white/5 rounded-xl p-3 text-center">
                            <div className="text-base font-black text-primary">{stat.val}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-col gap-3 w-full">
                        <m.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleScrollToTeachers}
                          className="w-full bg-primary text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <Search className="w-4 h-4" />
                          تصفح المدرسين الآن
                        </m.button>
                        <button
                          onClick={handleScrollToRegister}
                          className="w-full bg-background/40 border border-primary/20 text-primary font-bold py-3 rounded-xl text-sm hover:bg-primary/8 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          احجز مدرسًا الآن
                        </button>
                      </div>

                      <button
                        onClick={handleClose}
                        className="text-xs text-muted-foreground/40 hover:text-muted-foreground underline cursor-pointer transition-colors"
                      >
                        إغلاق
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
