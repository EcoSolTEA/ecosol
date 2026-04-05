import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Helper para validar autenticação em API routes
 * Retorna o usuário autenticado ou erro 401
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return {
        user: null,
        error: new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401 }
        ),
      };
    }

    return { user, error: null };
  } catch (err) {
    console.error('Auth validation error:', err);
    return {
      user: null,
      error: new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500 }
      ),
    };
  }
}

/**
 * Rate limiting helper
 * Returns true if request should be blocked
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, limit = 30, window = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window });
    return false;
  }

  if (record.count >= limit) {
    return true; // Rate limited
  }

  record.count++;
  return false;
}
