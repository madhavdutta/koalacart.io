import { createServerClient } from '@supabase/ssr'
import type { Database } from '~/types/database'

export function createSupabaseServerClient(request: Request) {
  const response = new Response()
  
  const supabase = createServerClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return getCookie(request, name)
        },
        set(name, value, options) {
          response.headers.append('Set-Cookie', `${name}=${value}; ${serializeCookieOptions(options)}`)
        },
        remove(name, options) {
          response.headers.append('Set-Cookie', `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${serializeCookieOptions(options)}`)
        },
      },
    }
  )

  return { supabase, response }
}

function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) return undefined
  
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const cookie = cookies.find(c => c.startsWith(`${name}=`))
  
  return cookie ? cookie.split('=')[1] : undefined
}

function serializeCookieOptions(options: any): string {
  const parts = []
  
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`)
  if (options.domain) parts.push(`Domain=${options.domain}`)
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  
  return parts.join('; ')
}
