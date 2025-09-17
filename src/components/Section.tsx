export default function Section({ title, subtitle, children }:{title?:string; subtitle?:string; children:any}) {
  return (
    <section className="mb-8 md:mb-10">
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  )
}