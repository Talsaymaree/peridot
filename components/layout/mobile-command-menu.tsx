'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Calendar, Home, Inbox, Layers3, Settings } from 'lucide-react'

type MobileCommandAction = {
  label: string
  href: string
  icon: LucideIcon
  positionClassName: 'peridot-routine-command--top' | 'peridot-routine-command--left' | 'peridot-routine-command--right'
}

type MobileCommandDeck = {
  ariaLabel: string
  hubLabel: string
  actions: [MobileCommandAction, MobileCommandAction, MobileCommandAction]
}

const commandDecks: MobileCommandDeck[] = [
  {
    ariaLabel: 'Primary navigation',
    hubLabel: 'Core',
    actions: [
      { label: 'Dashboard', href: '/dashboard', icon: Home, positionClassName: 'peridot-routine-command--top' },
      { label: 'BOARD', href: '/tasks', icon: Inbox, positionClassName: 'peridot-routine-command--left' },
      { label: 'Calendar', href: '/calendar', icon: Calendar, positionClassName: 'peridot-routine-command--right' },
    ],
  },
  {
    ariaLabel: 'Workspace navigation',
    hubLabel: 'Workspace',
    actions: [
      { label: 'Routines', href: '/routines', icon: Layers3, positionClassName: 'peridot-routine-command--top' },
      { label: 'Analytics', href: '/analytics', icon: BarChart3, positionClassName: 'peridot-routine-command--left' },
      { label: 'Settings', href: '/settings', icon: Settings, positionClassName: 'peridot-routine-command--right' },
    ],
  },
]

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileCommandMenu({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div className="peridot-mobile-command-menu" role="navigation" aria-label="Mobile navigation">
      {commandDecks.map((deck) => (
        <div key={deck.ariaLabel} className="peridot-routine-command-deck peridot-mobile-command-deck" role="group" aria-label={deck.ariaLabel}>
          <div className="peridot-routine-command-deck-inner">
            <svg
              className="peridot-routine-command-frame"
              viewBox="0 0 400 440"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <filter id={`peridot-mobile-cyan-glow-${deck.hubLabel}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                d="M112 62 H288 V188 L234 222 H166 L112 188 Z"
                className="peridot-routine-frame-shape peridot-routine-frame-top is-cyan"
                filter={`url(#peridot-mobile-cyan-glow-${deck.hubLabel})`}
              />

              <path
                d="M34 248 H184 V394 H34 Z"
                className="peridot-routine-frame-shape peridot-routine-frame-left is-cyan"
                filter={`url(#peridot-mobile-cyan-glow-${deck.hubLabel})`}
              />

              <path
                d="M216 248 H366 V394 H216 Z"
                className="peridot-routine-frame-shape peridot-routine-frame-right is-cyan"
                filter={`url(#peridot-mobile-cyan-glow-${deck.hubLabel})`}
              />

              <path
                d="M154 248 L166 222 H234 L246 248 L216 274 H184 Z"
                className="peridot-routine-frame-shape peridot-routine-frame-hub-plate is-cyan"
                filter={`url(#peridot-mobile-cyan-glow-${deck.hubLabel})`}
              />
            </svg>

            {deck.actions.map((action) => {
              const isCurrent = isCurrentPath(pathname, action.href)
              const Icon = action.icon
              return (
                <Link
                  key={`${deck.hubLabel}-${action.label}`}
                  href={action.href}
                  onClick={onNavigate}
                  className={`peridot-routine-command peridot-routine-command-link is-nav ${action.positionClassName}${isCurrent ? ' is-current' : ''}`}
                >
                  <span className="peridot-routine-command-label">{action.label}</span>
                  <span className="peridot-routine-command-badge">
                    <Icon className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}

            <div className="peridot-routine-command-hub" aria-hidden="true">
              <span>{deck.hubLabel}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
