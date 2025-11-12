// src/hooks/useAuth.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function useAuth() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true

    // get current user on load
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data?.user ?? null)
    })

    // listen to changes and upsert profile when a user becomes active
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        // upsert profile row (id = auth user id) — policy requires id === auth.uid()
        supabase.from('profiles').upsert({
          id: u.id,
          full_name: u.user_metadata?.full_name ?? '',
          phone: u.phone ?? ''
        }).catch(e => console.error('profile upsert error', e))
      }
    })

    return () => {
      mounted = false
      try { listener?.subscription?.unsubscribe() } catch (e) {}
    }
  }, [])

  return user
}
