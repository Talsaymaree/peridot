'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

type AuthSessionControlsProps = {
  mobile?: boolean
}

export function AuthSessionControls({ mobile = false }: AuthSessionControlsProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isPending, startTransition] = useTransition()
  const supabaseReady = isSupabaseConfigured()

  useEffect(() => {
    if (!supabaseReady) {
      return
    }

    const supabase = createClient()
    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ?? null)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabaseReady])

  function handleSignOut() {
    startTransition(() => {
      void (async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/login'
      })()
    })
  }

  if (!supabaseReady) {
    return (
      <div className={mobile ? 'rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-4 py-3 text-sm text-[#ffdf33]/58' : 'rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-4 py-3 text-xs uppercase tracking-[0.16em] text-[#ffdf33]/45'}>
        Guest workspace
      </div>
    )
  }

  if (!user) {
    return (
      <div className={mobile ? 'grid gap-2' : 'flex items-center gap-2'}>
        <Button asChild variant="ghost" size="sm" className="zune-button h-10 px-4">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" className="peridot-accent-button h-10 rounded-xl px-4 font-semibold">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={mobile ? 'space-y-3' : 'space-y-3'}>
      <div className="rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[#ffdf33]/35">Signed in</div>
        <div className="mt-1 truncate text-sm text-[#ffdf33]/82">{user.email || 'Peridot user'}</div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={isPending}
        className="zune-button h-10 w-full justify-center px-4"
      >
        {isPending ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  )
}

