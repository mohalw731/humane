import React from 'react'
import { Links } from './links'
import Link from 'next/link'

export default function MobileMenu() {
  return (
    <div className='bg-[#141414] w-full h-screen fixed top-0 left-0  flex flex-col justify-center px-5 md:hidden z-10'>
      <ul>
        {Links.map((link) => (
          <li key={link.name} className='text-white text-5xl my-5'>
            <Link href={link.href}>{link.name}</Link>
          </li>
        ))}
      </ul>
      <button className="bg-[#E0B9E0] px-6 py-2 rounded-full  text-[#141414]  hover:bg-[#DFA2DF] transition-all duration-300 ease-in-out mt-10">
        <Link href="/auth?mode=login">Logga in</Link>
      </button>
    </div>
  )
}
