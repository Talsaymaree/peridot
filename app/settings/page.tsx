import { WorkspaceControls } from '@/components/workspace-controls'
import { PeridotPageChrome } from '@/components/layout/peridot-page-chrome'

export default function SettingsPage() {
  return (
    <PeridotPageChrome>
      <div className="peridot-app-page peridot-shell peridot-analytics-page peridot-settings-page peridot-calendar-match-page">
        <div className="peridot-calendar-match-frame">
          <div className="peridot-settings-shell">
            <header className="peridot-settings-header peridot-calendar-match-header">
              <div className="peridot-settings-kicker peridot-calendar-match-header-kicker">Settings</div>
              <p className="peridot-settings-description peridot-calendar-match-header-copy">
                Backup, load, and create new profiles.
              </p>
            </header>

            <WorkspaceControls />
          </div>
        </div>
      </div>
    </PeridotPageChrome>
  )
}
