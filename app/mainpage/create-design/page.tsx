import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DesignCreationFlow } from "@/components/design-creation-flow"

export default function CreateDesignPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1">
        <DesignCreationFlow />
      </div>
    </div>
  )
}
