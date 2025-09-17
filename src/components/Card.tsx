export function Card({ className='', children }:{className?:string; children:any}) {
  return <div className={`bg-white border border-gray-100 rounded-xl shadow-md ${className}`}>{children}</div>
}
export function CardBody({ className='', children }:{className?:string; children:any}) {
  return <div className={`p-4 md:p-6 ${className}`}>{children}</div>
}
export function CardHeader({ title, action }:{title:string; action?:any}) {
  return (
    <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2 border-b border-gray-100 flex items-center justify-between">
      <h3 className="font-semibold">{title}</h3>{action}
    </div>
  )
}