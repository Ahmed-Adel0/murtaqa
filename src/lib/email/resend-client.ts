import { Resend } from "resend";

let _resend: Resend | null = null;

/**
 * Lazy-initialized Resend client.
 * Returns null when RESEND_API_KEY is not configured (dev environments).
 */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) {
    _resend = new Resend(key);
  }
  return _resend;
}
