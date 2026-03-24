import { ShieldCheck, Database, Download } from 'lucide-react'
import { WorkspaceControls } from '@/components/workspace-controls'

export default function SettingsPage() {
  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-page-frame space-y-6">
          <section className="peridot-panel overflow-hidden">
            <div className="space-y-5 px-6 py-7 sm:px-8 sm:py-8">
              <div>
                <div className="peridot-eyebrow text-xs text-emerald-200/55">Settings</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Profiles</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-200/80" />
                  </div>
                  <div className="peridot-copy text-sm text-white/60">
                    Separate routines and analytics by user profile on this host.
                  </div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Storage</span>
                    <Database className="h-4 w-4 text-lime-200/80" />
                  </div>
                  <div className="peridot-copy text-sm text-white/60">
                    Data stays in the local SQLite workspace instead of the browser.
                  </div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Backups</span>
                    <Download className="h-4 w-4 text-teal-200/80" />
                  </div>
                  <div className="peridot-copy text-sm text-white/60">
                    Export or restore a full workspace whenever you need a safety copy.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="peridot-panel p-6 sm:p-7">
            <div className="mb-5">
              <div className="peridot-section-label text-xs text-white/45">Workspace Controls</div>
              <h2 className="peridot-panel-heading mt-2 text-2xl font-semibold text-white">Manage this Peridot host</h2>
            </div>

            <div className="mx-auto max-w-3xl">
              <WorkspaceControls />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
