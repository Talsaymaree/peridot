import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { PeridotPageChrome } from '@/components/layout/peridot-page-chrome'

export default async function DashboardPage() {
  return (
    <PeridotPageChrome>
      <DashboardOverview />
    </PeridotPageChrome>
  )
}
