import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'protect'|'share'|'awaken'|'ghost', size?: 'sm'|'md'|'lg' }

export default function Button({ variant='primary', size='md', className='', ...props }: Props) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm:'px-3 py-1.5 text-sm', md:'px-4 py-2', lg:'px-5 py-2.5 text-base' }
  const variants:any = {
    primary: 'bg-primary text-white hover:brightness-95',
    protect: 'bg-protect text-white hover:brightness-95',
    share:   'bg-share text-white hover:brightness-95',
    awaken:  'bg-awaken text-gray-900 hover:brightness-95',
    ghost:   'bg-transparent text-gray-700 hover:bg-gray-100'
  }
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />
}