import { createClient } from '@supabase/supabase-js'

// Admin client with service_role key — bypasses RLS for privileged operations.
// IMPORTANT: Never expose this client or the service_role key to the browser.
// This file must only be imported by Server Actions or API Routes.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Build-time safety: Next.js runs this file during SSG data collection even
// when env vars aren't set. We allow a placeholder only when the build phase
// flag is set; at real runtime (server actions / routes), we fail loudly so
// misconfiguration can't silently cause "Invalid API key" errors downstream.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

if (!isBuildPhase && (!url || !serviceKey)) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Set both in .env.local (the service role key must match the one from ' +
      'Supabase Dashboard → Project Settings → API) and restart the dev server.'
  )
}

export const supabaseAdmin = createClient(
  url || 'https://placeholder.supabase.co',
  serviceKey || 'placeholder',
)
