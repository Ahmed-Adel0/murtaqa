"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "how-it-works", "services", "teachers", "register"];
      let current = "";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 150) {
          current = section;
        }
      }
      if (window.scrollY < 200) current = ""; // Top of page
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="fixed top-0 md:top-4 inset-x-0 z-50 flex justify-center px-0 md:px-4 pointer-events-none">
      <nav className="glass md:rounded-full border-b md:border border-primary/20 px-6 py-3 md:py-2 flex items-center justify-between w-full max-w-7xl shadow-2xl shadow-primary/10 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={(e) => handleScrollTo(e, "")} className="relative h-10 w-28 md:h-12 md:w-40 transition-transform hover:scale-105 active:scale-95">
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
            { id: "", label: "الرئيسية" },
            { id: "about", label: "من نحن" },
            { id: "services", label: "خدماتنا" },
            { id: "teachers", label: "المعلمون" },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleScrollTo(e, link.id)}
              className={`relative text-sm lg:text-base font-bold transition-all duration-300 cursor-pointer group py-2 ${
                activeSection === link.id ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.label}
              {activeSection === link.id && (
                <motion.div
                  layoutId="navDot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </a>
          ))}
          
          <div className="flex items-center gap-3 mr-4">
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
          className="md:hidden text-foreground p-2 rounded-xl bg-primary/5 border border-primary/10 active:scale-90 transition-transform" 
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-40 bg-background/60 md:hidden pointer-events-auto"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-card border-l border-primary/10 p-8 pt-24 flex flex-col gap-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { id: "", label: "الرئيسية" },
                { id: "about", label: "من نحن" },
                { id: "services", label: "خدماتنا" },
                { id: "teachers", label: "المعلمون" },
              ].map((link, i) => (
                <motion.a
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleScrollTo(e, link.id)}
                  className={`font-black text-2xl py-2 flex items-center justify-between border-b border-primary/5 cursor-pointer ${
                    activeSection === link.id ? "text-primary" : "text-foreground"
                  }`}
                >
                  {link.label}
                  {activeSection === link.id && <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(199,90,48,0.5)]" />}
                </motion.a>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto"
              >
                <Button 
                  onClick={() => { 
                    setOpen(false); 
                    window.dispatchEvent(new CustomEvent('teacherSelected', { detail: { name: '', subject: '' } }));
                    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); 
                  }}
                  className="bg-primary text-primary-foreground w-full rounded-2xl py-7 text-xl font-black shadow-xl shadow-primary/20 cursor-pointer"
                >
                  سجل الآن
                </Button>
                <p className="text-center text-muted-foreground text-xs mt-6 font-medium">مُتقن أكاديمي - تميز في التعليم</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
