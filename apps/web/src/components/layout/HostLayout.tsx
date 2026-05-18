import { Outlet } from 'react-router-dom'
import { HostSidebar } from './HostSidebar'

export function HostLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-2">
      <HostSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
