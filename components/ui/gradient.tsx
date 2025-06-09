import React from 'react'

export default function Gradient() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute top-0 right-0 w-full h-1/2 md:w-1/2 md:h-2/3 bg-gradient-to-bl from-[#E0B9E0]/30 to-transparent opacity-70 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 md:w-1/2 md:h-2/3 bg-gradient-to-tr from-[#BCCCE4]/30 to-transparent opacity-70 blur-[100px] animate-pulse"></div>
    </div>
  )
}

