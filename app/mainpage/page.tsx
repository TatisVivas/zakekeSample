import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default function MainPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <DashboardContent />
    </div>
  )
}
