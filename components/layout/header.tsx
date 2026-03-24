'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BarChart3, Calendar, Home, Layers3, Menu, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Routines', href: '/routines', icon: Layers3 },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const currentSection = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const mobileTitle = currentSection?.name || 'Peridot'

  if (
    pathname.startsWith('/profiles') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth')
  ) {
    return null
  }

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const { body } = document
    const previousOverflow = body.style.overflow

    if (isMenuOpen) {
      body.style.overflow = 'hidden'
    }

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-80 lg:overflow-y-auto lg:peridot-sidebar-shell">
        <div className="flex h-full flex-col">
          <div className="flex h-20 shrink-0 items-center border-b border-black/5 px-7 dark:border-white/10">
            <div>
              <div className="peridot-section-label text-[10px] text-white/45">Peridot</div>
              <h1 className="mt-1 text-2xl font-semibold">Workspace</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-5 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`zune-nav-item flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'border border-white/20 bg-white/14 text-white'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className={`inline-flex h-9 w-9 items-center justify-center border ${isActive ? 'border-white/14 bg-white/10' : 'border-transparent bg-transparent'}`}>
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Settings */}
          <div className="border-t border-white/10 p-6">
            <div className="peridot-panel-soft p-4">
              <div className="peridot-section-label text-xs text-white/45">Settings</div>
              <p className="peridot-copy mt-3 text-sm text-white/58">
                Manage profiles, backups, and your local workspace in one dedicated place.
              </p>
              <Button asChild className="mt-4 h-11 w-full border border-white/10 bg-white/5 px-4 text-white hover:bg-white/10">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Open Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex min-h-[4.5rem] items-center justify-between border-b border-white/10 bg-black/45 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0 pr-3">
            <div className="text-[10px] uppercase tracking-[0.24em] leading-[1.5] text-white/45">Peridot</div>
            <h1 className="text-base font-semibold leading-tight text-white sm:text-lg">{mobileTitle}</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="zune-button h-10 w-10 p-0"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close menu"
              className="peridot-focus-scrim absolute inset-0"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute inset-x-0 top-[4.5rem] px-4 pb-4 sm:px-6">
              <div className="peridot-mobile-nav-card overflow-hidden">
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/42">Navigation</div>
                </div>
                <nav className="grid gap-1 p-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`peridot-mobile-nav-link flex min-h-[3.5rem] items-center gap-3 px-4 py-3 text-[15px] font-medium ${
                          isActive
                            ? 'border-white/16 bg-white/12 text-white'
                            : 'bg-transparent text-white/72 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <span className={`inline-flex h-8 w-8 items-center justify-center border ${isActive ? 'border-white/14 bg-white/10' : 'border-transparent bg-transparent'}`}>
                          <item.icon className="h-4 w-4 shrink-0" />
                        </span>
                        <span className="flex-1 leading-tight">{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                <div className="border-t border-white/10 p-2">
                  <Button asChild className="h-11 w-full border border-white/10 bg-white/[0.04] px-4 text-white hover:bg-white/[0.08]">
                    <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Open Settings
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
