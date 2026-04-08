"use client";

import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import TeacherRegisterModal from "@/components/TeacherRegisterModal";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  useEffect(() => {
    const sections = ["about", "how-it-works", "services", "teachers", "register"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
      if (window.scrollY < 100) setActiveSection("");
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="fixed top-3 md:top-6 inset-x-0 z-50 flex justify-center px-3 md:px-6 pointer-events-none">
        {/* Mobile-only Background Glow */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-primary/10 to-transparent blur-2xl md:hidden -z-10" />
        
        <nav className="glass rounded-full border border-primary/20 px-4 md:px-8 py-2 md:py-3 flex items-center justify-between w-full max-w-7xl shadow-[0_15px_40px_-15px_rgba(199,90,48,0.15)] pointer-events-auto relative overflow-hidden group">
          {/* Brand Spotlight Effect (from Identity Colors) */}
          <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-2/3 h-1.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent blur-[0.5px]" />
          <div className="absolute -bottom-[0.5px] left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <div className="flex items-center gap-2">
            <Link href="/" onClick={(e) => handleScrollTo(e, "")} className="relative h-9 w-24 md:h-12 md:w-40 transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/logos/2-Photoroom.png"
                alt="مُتقن أكاديمي"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {[
              { id: "", label: "الرئيسية", path: "/" },
              { id: "about", label: "من نحن", path: "/#about" },
              { id: "services", label: "خدماتنا", path: "/#services" },
              { id: "teachers", label: "المعلمون", path: "/teachers" },
            ].map((link) => (
              <Link
                key={link.id}
                href={link.path}
                onClick={(e) => {
                  if (link.path.startsWith("/#") || link.path === "/") {
                    handleScrollTo(e as any, link.id);
                  }
                }}
                className={`relative text-sm lg:text-base font-bold transition-all duration-300 cursor-pointer group py-2 ${
                  activeSection === link.id ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <m.div
                    layoutId="navDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(199,90,48,0.8)]"
                  />
                )}
              </Link>
            ))}
            
            <div className="flex items-center gap-3 mr-4">
              {/* Teacher Registration Button */}
              <m.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setTeacherModalOpen(true)}
                className="relative flex items-center gap-2 bg-transparent border border-primary/40 text-primary hover:border-primary hover:bg-primary/8 rounded-full px-4 py-2 text-sm font-bold cursor-pointer transition-all duration-200 overflow-hidden group/tb"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover/tb:opacity-100 transition-opacity duration-300 rounded-full" />
                <GraduationCap className="w-4 h-4 relative z-10" />
                <span className="relative z-10">سجل كمعلم</span>
              </m.button>

              <Button 
                onClick={() => { 
                  window.dispatchEvent(new CustomEvent('teacherSelected', { detail: { name: '', subject: '' } }));
                  document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); 
                }}
                size="sm" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 text-sm font-black shadow-lg shadow-primary/30 cursor-pointer hover:-translate-y-0.5 transition-all"
              >
                سجل الآن
              </Button>
            </div>
          </div>

          <button 
            className="md:hidden text-foreground p-2 rounded-full hover:bg-primary/5 active:scale-90 transition-transform" 
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            {open ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {open && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xl md:hidden pointer-events-auto"
              onClick={() => setOpen(false)}
            >
              <m.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute top-0 inset-x-0 bg-card/95 border-b border-primary/20 p-6 pt-16 flex flex-col gap-2 shadow-2xl rounded-b-[32px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Compact Header */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">القائمة</span>
                  <button 
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary active:scale-90 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {[
                  { id: "", label: "الرئيسية", path: "/" },
                  { id: "about", label: "من نحن", path: "/#about" },
                  { id: "services", label: "خدماتنا", path: "/#services" },
                  { id: "teachers", label: "المعلمون", path: "/teachers" },
                ].map((link, i) => (
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={link.id}
                  >
                    <Link
                      href={link.path}
                      onClick={(e) => {
                        if (link.path.startsWith("/#") || link.path === "/") {
                          handleScrollTo(e as any, link.id);
                        } else {
                          setOpen(false);
                        }
                      }}
                      className={`font-bold text-base py-2 flex items-center justify-between border-b border-primary/5 cursor-pointer ${
                        activeSection === link.id ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {link.label}
                      {activeSection === link.id && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                    </Link>
                  </m.div>
                ))}
                
                <m.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mt-1"
                >
                  {/* Mobile: Teacher Registration */}
                  <button
                    onClick={() => { setOpen(false); setTeacherModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 border border-primary/30 text-primary rounded-xl py-3.5 text-sm font-bold cursor-pointer hover:bg-primary/8 transition-all mb-3"
                  >
                    <GraduationCap className="w-4 h-4" />
                    سجل كمعلم
                  </button>

                  <Button 
                    onClick={() => { 
                      setOpen(false); 
                      window.dispatchEvent(new CustomEvent('teacherSelected', { detail: { name: '', subject: '' } }));
                      document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); 
                    }}
                    className="bg-primary text-primary-foreground w-full rounded-full py-5 text-base font-black shadow-md shadow-primary/20 cursor-pointer active:scale-95 transition-all"
                  >
                    سجل الآن
                  </Button>
                  <p className="text-center text-muted-foreground text-[9px] mt-3 font-medium opacity-50">مُتقن أكاديمي</p>
                </m.div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Teacher Registration Modal */}
      <TeacherRegisterModal
        isOpen={teacherModalOpen}
        onClose={() => setTeacherModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
