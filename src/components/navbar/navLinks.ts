import type { LucideIcon } from "lucide-react";
import { Home, Info, Briefcase, Users, GraduationCap } from "lucide-react";

export type NavLink = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** if true, anchor-scroll only makes sense on homepage */
  isHomeAnchor?: boolean;
};

export const publicLinks: NavLink[] = [
  { id: "", label: "الرئيسية", path: "/", icon: Home, isHomeAnchor: true },
  { id: "about", label: "من نحن", path: "/#about", icon: Info, isHomeAnchor: true },
  { id: "services", label: "خدماتنا", path: "/#services", icon: Briefcase, isHomeAnchor: true },
  { id: "teachers", label: "المعلمون", path: "/teachers", icon: Users },
  { id: "university", label: "دروس الجامعة", path: "/university-maintenance", icon: GraduationCap },
];
