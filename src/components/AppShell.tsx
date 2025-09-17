import { ReactNode } from 'react'

export default function AppShell({ sidebar, children }: { sidebar?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="flex gap-6 py-6">
          {/* Sidebar desktop */}
          {sidebar && <aside className="hidden md:block w-64 shrink-0">{sidebar}</aside>}
          {/* Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}