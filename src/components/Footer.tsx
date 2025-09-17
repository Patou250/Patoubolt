export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 h-12 flex items-center justify-center text-xs text-gray-500">
        © {new Date().getFullYear()} Patou — Protéger • Partager • Éveiller
      </div>
    </footer>
  )
}