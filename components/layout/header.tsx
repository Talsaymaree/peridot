'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BarChart3, Calendar, Home, Layers3, Menu, Settings, X } from 'lucide-react'
import { useState } from 'react'

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

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-80 lg:overflow-y-auto">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/10">
            <h1 className="text-2xl font-bold zune-text-glow">Peridot</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`zune-nav-item flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 text-white zune-glow border border-white/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
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
              <Button asChild className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white hover:bg-white/10">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Open Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-b border-white/10 bg-black/90 backdrop-blur-sm">
            <nav className="grid gap-2 px-4 py-4 sm:grid-cols-2 sm:px-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`zune-nav-item flex min-h-[3.25rem] items-center rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 sm:text-base ${
                      isActive
                        ? 'bg-white/20 text-white zune-glow border border-white/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="leading-tight">{item.name}</span>
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

      </div>
    </>
  )
}
