import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Iniciamos a resposta
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Cliente Supabase com logística de Cookies sincronizada
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

  // 3. Validação REAL no servidor (getUser é seguro contra JWT falso/expirado)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 4. Definição de Rotas Protegidas
  // Usamos regex simples para garantir que sub-rotas como /admin/qualquer-coisa caiam aqui
  const isProtectedPage = 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/submit')

  const isAuthPage = pathname === '/login'

  // 5. Lógica de Bloqueio
  if (!user && isProtectedPage) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value)
    })
    return response
  }

  // 6. Prevenção de loop no login
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return supabaseResponse
}

// 7. Matcher: Se o erro persistir, o problema está aqui.
export const config = {
  matcher: [
    /*
     * Incluímos explicitamente /admin, /profile e /submit para garantir que o Next.js
     * não tente otimizar essas rotas como estáticas e pular o middleware.
     */
    '/admin/:path*',
    '/profile/:path*',
    '/submit/:path*',
    // Mantemos a exclusão de arquivos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}