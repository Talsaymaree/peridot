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
              <div className="peridot-section-label peridot-meta text-[10px] text-white/45">Peridot</div>
              <h1 className="peridot-display mt-1 text-[2rem] font-semibold tracking-[-0.04em]">Workspace</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-5 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`zune-nav-item peridot-cinematic flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'border border-white/20 bg-white/14 text-white'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className={`inline-flex h-9 w-9 items-center justify-center border ${isActive ? 'border-white/14 bg-white/10' : 'border-transparent bg-transparent'}`}>
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="peridot-display flex-1 text-[1.05rem] leading-none tracking-[-0.03em]">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Settings */}
          <div className="border-t border-white/10 p-6">
            <div className="peridot-panel-soft peridot-tactical-card p-4">
              <div className="peridot-section-label peridot-meta text-xs text-white/45">Settings</div>
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
            <div className="peridot-meta text-[10px] leading-[1.5] text-white/45">Peridot</div>
            <h1 className="peridot-display text-[1.35rem] font-semibold leading-none text-white sm:text-[1.55rem]">{mobileTitle}</h1>
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
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="peridot-focus-scrim absolute inset-0"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto">
              <div className="min-h-full">
                <div className="peridot-mobile-nav-card peridot-tactical-card min-h-full w-full overflow-hidden rounded-none border-x-0 border-b-0 border-t border-white/10">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                    <div>
                      <div className="peridot-meta text-[10px] text-white/42">Navigation</div>
                      <div className="peridot-display mt-2 text-[1.65rem] font-semibold leading-none text-white">Peridot</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMenuOpen(false)}
                      className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] p-0 text-white hover:bg-white/[0.08]"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid gap-5 p-4 sm:p-5">
                    <nav className="grid gap-2">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`peridot-mobile-nav-link peridot-cinematic flex min-h-[4rem] items-center gap-3 px-4 py-3 text-[15px] font-medium ${
                              isActive
                                ? 'border-white/18 bg-white/14 text-white shadow-[0_14px_28px_rgba(0,0,0,0.14)]'
                                : 'bg-transparent text-white/78 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
                            }`}
                          >
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${isActive ? 'border-white/14 bg-white/10' : 'border-white/8 bg-white/[0.02]'}`}>
                              <item.icon className="h-4 w-4 shrink-0" />
                            </span>
                            <span className="peridot-display flex-1 text-[1.15rem] leading-none">{item.name}</span>
                          </Link>
                        )
                      })}
                    </nav>

                    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-3">
                      <div className="peridot-meta text-[10px] text-white/42">Workspace</div>
                      <p className="mt-2 text-sm leading-6 text-white/65">Profiles, imports, backups, and local settings live in one place.</p>
                      <Button asChild className="mt-4 h-11 w-full border border-white/10 bg-white/[0.04] px-4 text-white hover:bg-white/[0.08]">
                        <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Open Settings
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
