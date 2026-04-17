"use client";

import { motion } from "framer-motion";
import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function UniversityMaintenance() {
  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-8 flex flex-col items-center justify-center p-6" dir="rtl">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-blue-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
      >
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: [10, -10, 10] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 md:w-32 md:h-32 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-8 md:mb-10 shadow-2xl backdrop-blur-md"
        >
          <Wrench className="w-12 h-12 md:w-16 md:h-16 text-blue-500" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 md:mb-6 leading-snug"
        >
          المنصة حالياً <br className="sm:hidden" /><span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">تحت التحديث</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-base sm:text-lg md:text-xl mb-10 md:mb-12 leading-relaxed"
        >
          نعمل حالياً على تطوير تجربة قسم الجامعة وإضافة ميزات جديدة رائعة لنضمن لكم أفضل تجربة تعليمية في المملكة. سنعود قريباً!
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          <Link 
            href="/"
            className="group flex items-center justify-center gap-3 bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all duration-300 w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            العودة للرئيسية
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}
