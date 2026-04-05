import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const isProtectedPage = 
      pathname.startsWith('/profile') || 
      pathname.startsWith('/admin') || 
      pathname.startsWith('/submit')

    const isAuthPage = pathname === '/login'

    // Redirect unauthenticated users from protected pages
    if (!user && isProtectedPage) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    }

    // Redirect authenticated users away from login page
    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  } catch (err) {
    console.error('Middleware auth error:', err)
    // On error, allow request to continue (don't block)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/submit/:path*',
    '/login',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}