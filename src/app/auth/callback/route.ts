import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabaseServer";

// OAuth (PKCE) callback. Supabase redirects here after Google consent with a
// `code` query param. We exchange it for a session server-side, which sets the
// auth cookies via the SSR client, then redirect the user to `next`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if email is verified; if not, gate to verify-email
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        return NextResponse.redirect(`${origin}/verify-email`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
