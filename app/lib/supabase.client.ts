import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '~/types/database'

export const supabase = createBrowserClient<Database>(
  window.ENV.VITE_SUPABASE_URL,
  window.ENV.VITE_SUPABASE_ANON_KEY
)

declare global {
  interface Window {
    ENV: {
      VITE_SUPABASE_URL: string
      VITE_SUPABASE_ANON_KEY: string
    }
  }
}
