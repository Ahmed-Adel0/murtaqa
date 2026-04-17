/**
 * Build a WhatsApp deep link (wa.me) with a pre-filled message.
 * Normalizes Saudi phone numbers: 05xxxxxxxx → 9665xxxxxxxx
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = phone
    .replace(/[\s\-\(\)]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "")
    .replace(/^0/, "966");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
