import { Loader2 } from 'lucide-react'
import React from 'react'

export default function Loader() {
  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      <Loader2 size={35}  className='animate-spin text-black '/>
    </div>
  )
}
