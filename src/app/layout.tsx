import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { LazyMotion, domAnimation } from "framer-motion";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "مُرتقى أكاديمي | المنصة الرائدة للتميز التعليمي",
  description:
    "المنصة الرائدة للتميز التعليمي في المملكة العربية السعودية، توفر دروساً عالية الجودة مع نخبة من المدرسين المعتمدين.",
  icons: {
    icon: "/logos/Profile.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} antialiased`}>
      <body className="font-tajawal">
        <LazyMotion features={domAnimation}>{children}</LazyMotion>
      </body>
    </html>
  );
}
