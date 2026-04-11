import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import dynamic from "next/dynamic";
import Image from "next/image";
import SearchModal from "@/components/SearchModal";

// Lazy load below-the-fold components
const About = dynamic(() => import("@/components/sections/About"), { ssr: true });
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks"), { ssr: true });
const Services = dynamic(() => import("@/components/sections/Services"), { ssr: true });
const Teachers = dynamic(() => import("@/components/sections/Teachers"), { ssr: true });
const RegistrationForm = dynamic(() => import("@/components/sections/RegistrationForm"), { ssr: true });
const FAQ = dynamic(() => import("@/components/sections/FAQ"), { ssr: true });

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <SearchModal />
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      
      <Services />
      <Teachers />
      <RegistrationForm />
      <FAQ />
      
      {/* Premium Footer */}
      <footer className="relative bg-[#02080a] border-t border-primary/10 pt-24 pb-12 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Brand Section */}
            <div className="lg:col-span-2 text-right">
              <div className="relative h-16 w-60 mb-8 ml-auto">
                <Image
                  src="/logos/Profile-Photoroom.png"
                  alt="مُرتقى أكاديمي"
                  fill
                  sizes="(max-width: 768px) 100vw, 740px"
                  className="object-contain object-right"
                  priority
                />
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md ml-auto">
                نحن هنا لنصنع مستقبلاً أفضل لأبنائكم من خلال تعليم عالي الجودة ومتابعة دقيقة مع نخبة من المدرسين المعتمدين في المملكة.
              </p>
              {/* Removed requested icon group from here */}
            </div>

            {/* Quick Links */}
            <div className="text-right flex flex-col items-start">
              <h4 className="text-lg font-black text-foreground mb-8 relative inline-block">
                روابط سريعة
                <div className="absolute -bottom-2 right-0 w-12 h-1 bg-primary rounded-full" />
              </h4>
              <ul className="space-y-4 w-full">
                {[
                  { name: "من نحن", href: "#about" },
                  { name: "خدماتنا", href: "#services" },
                  { name: "المعلمون", href: "#teachers" },
                  { name: "تواصل معنا", href: "#register" }
                ].map((link) => (
                  <li key={link.name} className="flex justify-start">
                    <a 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-all flex items-center gap-3 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Details */}
            <div className="text-right flex flex-col items-start">
              <h4 className="text-lg font-black text-foreground mb-8 relative inline-block">
                معلومات التواصل
                <div className="absolute -bottom-2 right-0 w-12 h-1 bg-primary rounded-full" />
              </h4>
              <div className="space-y-6 w-full">
                <div className="flex flex-col items-start gap-1 group">
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">العنوان</span>
                  <span className="text-muted-foreground font-medium text-sm sm:base">المملكة العربية السعودية</span>
                </div>
                {/* <div className="flex flex-col items-start gap-1 group">
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">البريد الإلكتروني</span>
                  <span className="text-muted-foreground font-medium text-sm sm:base">[EMAIL_ADDRESS]</span>
                </div> */}
                <div className="flex flex-col items-start gap-1 group">
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">واتساب</span>
                  <span className="text-muted-foreground font-medium text-lg" dir="ltr">+966 50 585 5924</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-muted-foreground/60 text-sm font-medium order-2 md:order-1">
               جميع الحقوق محفوظة {new Date().getFullYear()} © <span className="text-primary/80">مُرتقى أكاديمي</span>
             </div>
             <div className="flex items-center gap-4 order-1 md:order-2">
                <div className="h-[1px] w-8 bg-primary/20 hidden sm:block" />
                <p className="text-muted-foreground/40 text-[9px] uppercase tracking-[0.2em]">دعم رؤية المملكة 2030</p>
                <div className="h-[1px] w-8 bg-primary/20 hidden sm:block" />
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
