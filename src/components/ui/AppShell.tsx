export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {children}
      {/* Footer global simple si besoin */}
    </div>
  )
}