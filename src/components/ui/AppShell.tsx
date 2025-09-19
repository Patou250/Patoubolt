export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {children}
      </div>
    </main>
  )
}