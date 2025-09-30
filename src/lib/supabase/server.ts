import 'server-only'
import { createClient } from '@supabase/supabase-js'

let _supabaseServer: ReturnType<typeof createClient> | null = null

function getSupabaseServer() {
  if (_supabaseServer) return _supabaseServer

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  _supabaseServer = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return _supabaseServer
}

// Proxy object that calls getSupabaseServer() on each property access
export const supabaseServer = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseServer()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
