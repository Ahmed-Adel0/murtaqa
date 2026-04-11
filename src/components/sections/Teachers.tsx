"use client";

import { m } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  CalendarCheck,
  GraduationCap,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { teachers } from "@/lib/teachers-data";

// Top 3 teachers by rating + experience
const topTeachers = [...teachers]
  .sort(
    (a, b) =>
      b.experienceYears - a.experienceYears ||
      parseFloat(b.rating) - parseFloat(a.rating),
  )
  .slice(0, 3);

const Teachers = () => {
  return (
    <section
      id="teachers"
      className="py-20 md:py-32 relative overflow-hidden bg-background"
    >
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-section-alt to-transparent" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge
            variant="outline"
            className="mb-4 border-primary/20 text-primary px-4 py-1.5 rounded-full bg-primary/5 font-bold"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-2" />
            نخبة المدرسين
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-4">
            تعرف على <span className="text-primary">أفضل المدرسين</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            فريق من المدرسين المؤهلين والمعتمدين — كل واحد منهم قصة نجاح بحد
            ذاتها
          </p>
        </div>

        {/* Top 3 Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {topTeachers.map((t, i) => (
            <m.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="group bg-card border border-border hover:border-primary/40 rounded-3xl overflow-hidden transition-all duration-400 hover:shadow-2xl hover:shadow-primary/8"
            >
              {/* Image */}
              <div className="relative h-64 bg-gradient-to-b from-muted/40 to-muted/10 overflow-hidden">
                <Image
                  src={t.img}
                  alt={t.name}
                  fill
                  className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-70" />
                {/* #1 crown for first */}
                {i === 0 && (
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 text-sm font-black">
                    👑
                  </div>
                )}
                <span className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                  {t.badge}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
                    <Image src={t.img} alt="" fill className="object-cover" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="font-black text-foreground text-sm leading-snug">
                      {t.name}
                    </h3>
                    <p className="text-[10px] text-primary font-bold mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3 justify-end">
                  {t.subjects.slice(0, 3).map((s, j) => (
                    <span
                      key={j}
                      className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-1 bg-muted/30 rounded-xl p-2 mb-4 text-center">
                  <div>
                    <div className="text-xs font-black flex items-center justify-center gap-0.5">
                      {t.rating}{" "}
                      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="text-[8px] text-muted-foreground">
                      تقييم
                    </div>
                  </div>
                  <div className="border-x border-border">
                    <div className="text-xs font-black">
                      {t.experienceYears}س
                    </div>
                    <div className="text-[8px] text-muted-foreground">خبرة</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black flex items-center justify-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-primary" />
                      {t.city}
                    </div>
                    <div className="text-[8px] text-muted-foreground">
                      المدينة
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("teacherSelected", {
                        detail: { name: t.name, subject: t.subjects[0] },
                      }),
                    );
                    document
                      .getElementById("register")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black rounded-xl py-3 text-sm transition-all duration-200 cursor-pointer shadow-sm shadow-primary/20"
                >
                  <CalendarCheck className="w-4 h-4" />
                  احجز معه الآن
                </button>
              </div>
            </m.div>
          ))}
        </div>

        {/* CTA to full page */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-10"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(42,169,224,0.08),transparent_60%)]" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-right">
            <div>
              <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-2">
                +90 مدرس بانتظارك
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
                تصفح جميع المدرسين
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                فلتر حسب المدينة والمادة والمرحلة والتقييم وأونلاين/أوفلاين —
                اعثر على مدرسك المثالي.
              </p>
            </div>
            <Link
              href="/teachers"
              className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 py-4 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              عرض جميع المدرسين
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default Teachers;
