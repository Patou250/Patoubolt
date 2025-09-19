export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 h-12 flex items-center justify-center">
        <p className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} Patou — Protéger • Partager • Éveiller
        </p>
      </div>
    </footer>
  )
}