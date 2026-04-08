'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const supabaseReady = isSupabaseConfigured()
  const nextPath = useMemo(() => searchParams.get('next') || '/dashboard', [searchParams])
  const isSignup = mode === 'signup'

  function oauthRedirect() {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
  }

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    startTransition(() => {
      void (async () => {
        try {
          const supabase = createClient()

          if (isSignup) {
            const { data, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: fullName.trim(),
                },
                emailRedirectTo: oauthRedirect(),
              },
            })

            if (signUpError) {
              throw signUpError
            }

            if (data.session) {
              router.replace(nextPath)
              router.refresh()
              return
            }

            setMessage('Account created. Check your email to confirm your sign up, then come back to continue.')
            return
          }

          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            throw signInError
          }

          router.replace(nextPath)
          router.refresh()
        } catch (authError) {
          setError(authError instanceof Error ? authError.message : 'Unable to continue right now.')
        }
      })()
    })
  }

  function handleOAuth(provider: 'google' | 'apple') {
    setError(null)
    setMessage(null)

    startTransition(() => {
      void (async () => {
        try {
          const supabase = createClient()
          const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: oauthRedirect(),
            },
          })

          if (oauthError) {
            throw oauthError
          }
        } catch (authError) {
          setError(authError instanceof Error ? authError.message : 'Unable to start sign in.')
        }
      })()
    })
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="peridot-panel overflow-hidden">
          <div className="h-full px-6 py-8 sm:px-8 sm:py-10">
            <div className="text-xs uppercase tracking-[0.22em] text-[#ffdf33]/70">Peridot</div>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-[#ffdf33] sm:text-5xl">
              {isSignup ? 'Create an account and back up your flows.' : 'Sign in and keep your schedule synced.'}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#66ff99]/62 sm:text-base">
              Save routines, track task completions in analytics, and keep your recovery plan available across devices.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="peridot-panel-soft p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#ffdf33]/45">Backups</div>
                <div className="mt-3 text-sm leading-6 text-[#ffdf33]/70">Keep routines and schedules tied to your account instead of the current browser.</div>
              </div>
              <div className="peridot-panel-soft p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#ffdf33]/45">Analytics</div>
                <div className="mt-3 text-sm leading-6 text-[#ffdf33]/70">Completed tasks are now stored and rolled into daily and weekly activity totals.</div>
              </div>
              <div className="peridot-panel-soft p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#ffdf33]/45">Access</div>
                <div className="mt-3 text-sm leading-6 text-[#ffdf33]/70">Use Google, Apple, or email so the same plan follows you wherever you log in.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="peridot-panel-deep px-6 py-8 sm:px-8 sm:py-10">
          <div className="text-xs uppercase tracking-[0.22em] text-[#ffdf33]/45">{isSignup ? 'Sign Up' : 'Sign In'}</div>
          <h2 className="mt-3 text-3xl font-semibold text-[#ffdf33]">{isSignup ? 'Create your Peridot account' : 'Welcome back'}</h2>
          <p className="mt-3 text-sm leading-7 text-[#ffdf33]/60">
            {isSignup ? 'Choose how you want to create your account.' : 'Pick a sign-in method to restore your routines and schedules.'}
          </p>

          {!supabaseReady ? (
            <div className="mt-6 rounded-[1.2rem] border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-5 py-5">
              <div className="text-base font-semibold text-[#ffdf33]">Supabase isn&apos;t configured yet.</div>
              <p className="mt-2 text-sm leading-6 text-[#ffdf33]/58">
                Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable Google, Apple, and email auth.
              </p>
              <div className="mt-5">
                <Link href="/dashboard" className="inline-flex rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/5 px-4 py-2 text-sm font-medium text-[#ffdf33] transition hover:bg-[#33b7db]/10">
                  Continue as guest
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-3">
                <Button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={isPending}
                  className="h-12 rounded-2xl border border-[#33b7db]/10 bg-[#33b7db]/7 text-[#ffdf33] hover:bg-[#33b7db]/12"
                >
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  onClick={() => handleOAuth('apple')}
                  disabled={isPending}
                  className="h-12 rounded-2xl border border-[#33b7db]/10 bg-black/25 text-[#ffdf33] hover:bg-black/35"
                >
                  Continue with Apple
                </Button>
              </div>

              <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#ffdf33]/35">
                <span className="h-px flex-1 bg-[#33b7db]/10" />
                or use email
                <span className="h-px flex-1 bg-[#33b7db]/10" />
              </div>

              <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                {isSignup ? (
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-[#ffdf33]/75">Full name</label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="zune-input h-12 rounded-2xl border-[#33b7db]/10 bg-[#33b7db]/[0.04] text-[#ffdf33]"
                      placeholder="Jordan Smith"
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[#ffdf33]/75">Email</label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="zune-input h-12 rounded-2xl border-[#33b7db]/10 bg-[#33b7db]/[0.04] text-[#ffdf33]"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[#ffdf33]/75">Password</label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="zune-input h-12 rounded-2xl border-[#33b7db]/10 bg-[#33b7db]/[0.04] text-[#ffdf33]"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                {isSignup ? (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-[#ffdf33]/75">Confirm password</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="zune-input h-12 rounded-2xl border-[#33b7db]/10 bg-[#33b7db]/[0.04] text-[#ffdf33]"
                      placeholder="Repeat your password"
                    />
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-[1rem] border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}

                {message ? (
                  <div className="peridot-success-note rounded-[1rem] px-4 py-3 text-sm">
                    {message}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="peridot-accent-button h-12 w-full rounded-2xl font-semibold"
                >
                  {isPending ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 text-sm text-[#ffdf33]/55">
            {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
            <Link
              href={isSignup ? '/login' : '/signup'}
              className="peridot-accent-link font-medium"
            >
              {isSignup ? 'Sign in here' : 'Create one here'}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}


