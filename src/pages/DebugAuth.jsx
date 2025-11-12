import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DebugAuth() {
  const [info, setInfo] = useState({ user: null, session: null, loading: true })

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const { data: sessionData } = await supabase.auth.getSession()
      setInfo({ user: userData?.user ?? null, session: sessionData?.session ?? null, loading: false })
    }
    load()

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setInfo(prev => ({ ...prev, session, loading: false }))
    })

    return () => listener?.subscription?.unsubscribe?.()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    const { data: userData } = await supabase.auth.getUser()
    const { data: sessionData } = await supabase.auth.getSession()
    setInfo({ user: userData?.user ?? null, session: sessionData?.session ?? null, loading: false })
  }

  return (
    <div style={{ padding: 16 , color: 'black' }}>
      <h2>DEBUG — Supabase Auth</h2>
      {info.loading ? <p>loading...</p> : (
        <>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12  }}>
            {JSON.stringify(info, null, 2)}
          </pre>
          <div style={{ marginTop: 8 }}>
            <button onClick={handleSignOut}>Sign out</button>
          </div>
          <p style={{ marginTop: 12, color: '#666' }}>If `user` is null, you are NOT logged in. If `user.email` is not the admin email, change policy/create user as below.</p>
        </>
      )}
    </div>
  )
}
