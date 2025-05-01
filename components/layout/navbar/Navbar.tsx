"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Links } from "./links";
import { Menu, X } from "lucide-react";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const handleMenuToggle = () => {
    setOpen(!open);
  };
  return (
    <main className="flex justify-between items-center ">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="logo"
          width={45}
          height={45}
          className="z-20 relative top-[-10px]"
        />
      </Link>

      <ul className="md:flex gap-7 hidden">
        {Links.map((link) => (
          <li key={link.name}>
            <Link href={link.href}>{link.name}</Link>
          </li>
        ))}
      </ul>

      <button className="bg-[#E0B9E0] px-6 py-2 rounded-full  text-[#141414]  hover:bg-[#DFA2DF] transition-all duration-300 ease-in-out hidden md:block">
        <Link href="/auth?mode=login">Logga in</Link>
      </button>

      <button className="md:hidden block z-20">
        {!open ? (
          <Menu size={35} onClick={handleMenuToggle} />
        ) : (
          <X size={35} onClick={handleMenuToggle} />
        )}
      </button>

      {open && <MobileMenu />}
    </main>
  );
}
