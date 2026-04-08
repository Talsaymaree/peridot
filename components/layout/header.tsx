'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BarChart3, Calendar, Home, Inbox, Layers3, Menu, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MobileCommandMenu } from '@/components/layout/mobile-command-menu'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'BOARD', href: '/tasks', icon: Inbox },
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
  const shouldHideHeader =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/routines') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/profiles') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth')

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

  if (shouldHideHeader) {
    return null
  }

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-80 lg:overflow-y-auto lg:peridot-sidebar-shell">
        <div className="flex h-full flex-col">
          <div className="flex h-20 shrink-0 items-center border-b border-black/5 px-7 dark:border-[#33b7db]/10">
            <div>
              <div className="peridot-section-label peridot-meta text-[10px] text-[#ffdf33]/45">Peridot</div>
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
                      ? 'border border-[#33b7db]/20 bg-[#33b7db]/14 text-[#ffdf33]'
                      : 'text-[#ffdf33]/70 hover:bg-[#33b7db]/8 hover:text-[#ffdf33]'
                  }`}
                >
                  <span className={`inline-flex h-9 w-9 items-center justify-center border ${isActive ? 'border-[#33b7db]/14 bg-[#33b7db]/10' : 'border-transparent bg-transparent'}`}>
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="peridot-display flex-1 text-[1.05rem] leading-none tracking-[-0.03em]">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Settings */}
          <div className="border-t border-[#33b7db]/10 p-6">
            <div className="peridot-panel-soft peridot-tactical-card p-4">
              <div className="peridot-section-label peridot-meta text-xs text-[#ffdf33]/45">Settings</div>
              <p className="peridot-copy mt-3 text-sm text-[#ffdf33]/58">
                Manage profiles, backups, and your local workspace in one dedicated place.
              </p>
              <Button asChild className="mt-4 h-11 w-full border border-[#33b7db]/10 bg-[#33b7db]/5 px-4 text-[#ffdf33] hover:bg-[#33b7db]/10">
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
        {!isMenuOpen && (
          <div className="sticky top-0 z-40 flex min-h-[4.5rem] items-center justify-between border-b border-[#33b7db]/10 bg-black/45 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="min-w-0 pr-3">
              <div className="peridot-meta text-[10px] leading-[1.5] text-[#ffdf33]/45">Peridot</div>
              <h1 className="peridot-display text-[1.35rem] font-semibold leading-none text-[#ffdf33] sm:text-[1.55rem]">{mobileTitle}</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(true)}
              className="zune-button h-10 w-10 p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        {isMenuOpen && (
          <div className="fixed inset-0 z-[120] bg-[#000000] lg:hidden">
            <div className="peridot-mobile-nav-card relative flex h-dvh w-screen flex-col overflow-y-auto">
              <div className="peridot-mobile-nav-topbar">
                <span className="peridot-mobile-nav-wordmark">PERIDOT</span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="peridot-mobile-nav-topbar-toggle"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="peridot-mobile-nav-body">
                <MobileCommandMenu pathname={pathname} onNavigate={() => setIsMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}


