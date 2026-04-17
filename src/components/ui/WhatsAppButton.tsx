"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({
  phone,
  message,
  label = "واتساب",
  size = "sm",
}: {
  phone: string;
  message: string;
  label?: string;
  size?: "sm" | "md";
}) {
  if (!phone) return null;

  const sizeClasses =
    size === "md"
      ? "px-4 py-2.5 text-sm gap-2.5"
      : "px-3 py-1.5 text-xs gap-2";

  return (
    <a
      href={buildWhatsAppLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center ${sizeClasses} bg-green-600/15 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-600/25 transition-all font-bold`}
    >
      <MessageCircle className={size === "md" ? "w-5 h-5" : "w-4 h-4"} />
      {label}
    </a>
  );
}
