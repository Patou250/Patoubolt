export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 h-14 flex items-center gap-3">
        <img src="/logo.png" alt="Patou" className="h-7" />
        <span className="font-extrabold text-primary">Patou</span>
      </div>
    </header>
  )
}