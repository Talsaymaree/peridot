'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MobileCommandMenu } from '@/components/layout/mobile-command-menu'

type PeridotPageChromeProps = {
  children: React.ReactNode
}

export function PeridotPageChrome({ children }: PeridotPageChromeProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isAnalyticsPage = pathname === '/analytics'

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return

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
    <div className="peridot-page-chrome">
      <div className={`peridot-page-chrome-content${isAnalyticsPage ? ' is-analytics' : ''}`}>{children}</div>

      <div className="peridot-page-chrome-bar">
        <span className="peridot-page-chrome-wordmark">PERIDOT</span>
        <button
          type="button"
          className="peridot-page-chrome-toggle"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="peridot-page-chrome-menu">
          <MobileCommandMenu pathname={pathname} onNavigate={() => setIsMenuOpen(false)} />
        </div>
      ) : null}
    </div>
  )
}
