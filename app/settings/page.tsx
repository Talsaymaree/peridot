import { WorkspaceControls } from '@/components/workspace-controls'

export default function SettingsPage() {
  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-page-frame space-y-6">
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
