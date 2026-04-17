import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Email verification gate — block unverified users from the rest of the app
  if (user && !user.email_confirmed_at) {
    if (path !== '/verify-email' && !path.startsWith('/auth/callback')) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
    return response
  }
  // If verified but still on the verify page, redirect away
  if (user && user.email_confirmed_at && path === '/verify-email') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // /admin — require admin role
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
    return response
  }

  // /dashboard — require any authenticated user. The dashboard page itself
  // branches by role (student / teacher / admin / pending).
  if (path.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    return response
  }

  // /onboarding — require authenticated; skip the form if user is already a teacher/admin.
  if (path.startsWith('/onboarding')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'teacher' || profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/admin/:path*',
    '/admin',
    '/verify-email',
  ],
}
