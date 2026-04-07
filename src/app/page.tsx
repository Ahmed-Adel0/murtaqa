import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import Teachers from "@/components/sections/Teachers";
import RegistrationForm from "@/components/sections/RegistrationForm";
import FAQ from "@/components/sections/FAQ";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
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
        {/* Background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            {/* Brand Section */}
            <div className="md:col-span-2 text-right">
              <div className="relative h-14 w-52 mb-8 ml-auto">
                <Image
                  src="/logos/2-Photoroom.png"
                  alt="مُتقن أكاديمي"
                  fill
                  className="object-contain object-right"
                  priority
                />
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md ml-auto">
                نحن هنا لنصنع مستقبلاً أفضل لأبنائكم من خلال تعليم عالي الجودة ومتابعة دقيقة مع نخبة من المدرسين المعتمدين في المملكة.
              </p>
              <div className="flex justify-end gap-4 mt-8">
                {/* Social icons could go here */}
                <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <span className="sr-only">واتساب</span>
                  <Image src="/logos/icon.png" width={20} height={20} alt="WA" className="opacity-70 group-hover:opacity-100" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-right">
              <h4 className="text-lg font-black text-foreground mb-8">روابط سريعة</h4>
              <ul className="space-y-4">
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2 justify-end group">من نحن <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-all" /></a></li>
                <li><a href="#services" className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2 justify-end group">خدماتنا <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-all" /></a></li>
                <li><a href="#teachers" className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2 justify-end group">المعلمون <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-all" /></a></li>
                <li><a href="#register" className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2 justify-end group">تواصل معنا <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-all" /></a></li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="text-right">
              <h4 className="text-lg font-black text-foreground mb-8">معلومات التواصل</h4>
              <div className="space-y-6">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-primary font-black uppercase tracking-widest">العنوان</span>
                  <span className="text-muted-foreground font-medium">المملكة العربية السعودية، تبوك</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-primary font-black uppercase tracking-widest">البريد الإلكتروني</span>
                  <span className="text-muted-foreground font-medium">info@motqen.com</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-primary font-black uppercase tracking-widest">واتساب</span>
                  <span className="text-muted-foreground font-medium" dir="ltr">+966 50 585 5924</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
             <p className="text-muted-foreground/60 text-sm font-medium">
               جميع الحقوق محفوظة {new Date().getFullYear()} © <span className="text-primary/80">مُتقن أكاديمي</span>
             </p>
             <p className="text-muted-foreground/40 text-[10px] uppercase tracking-widest">تم التطوير بكل فخر لدعم رؤية المملكة 2030</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
