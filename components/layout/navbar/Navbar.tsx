"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Links } from "./links";
import { LogOut, Menu, Settings, X } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import useUserData from "@/hooks/useUser";
import { useAudioTranscriber } from "@/context/AudioTranscriberProvider";
import { FiPlus } from "react-icons/fi";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openIcon, setOpenIcon] = useState(false);
  const { isLoggedIn } = useAuth();
  const { user } = useUserData();
  const auth = getAuth();
  const router = useRouter();
  const firstNameLetter = user?.name?.charAt(0);
  const { setShowSettings, setShowUploadModal } = useAudioTranscriber();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push("/auth");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleMenuToggle = () => {
    setOpen(!open);
  };

  return (
    <main className="flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="logo"
          width={45}
          height={45}
          className="z-20 relative top-[-10px]"
        />
      </Link>

      {!isLoggedIn && (
        <>
          <ul className={`md:flex gap-7 hidden z-20`}>
            {Links.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
          <button className="bg-[#E0B9E0] px-6 py-2 rounded-full text-[#141414] hover:bg-[#DFA2DF] transition-all duration-300 ease-in-out hidden md:block">
            <Link href="/auth?mode=login">Logga in</Link>
          </button>
          <button className="md:hidden block z-20">
            {!open ? (
              <Menu size={35} onClick={handleMenuToggle} />
            ) : (
              <X size={35} onClick={handleMenuToggle} />
            )}
          </button>
        </>
      )}

      {isLoggedIn && (
        <div className="relative flex items-center gap-2 flex-col ">
          <div className="flex gap-2 items-center flex-row-reverse">

            <button
              className="text-xl bg-[#E0B9E0] size-10 rounded-full hover:bg-[#DFA2DF] text-black"
              onClick={() => setOpenIcon(!openIcon)}
            >
              {firstNameLetter}
            </button>


            <button onClick={() => setShowUploadModal(true)} className="md:hidden block">
              <span className="flex items-center justify-center w-10 h-10 bg-secondary  text-black rounded-full">
                <FiPlus className="text-2xl md:text-3xl" />
              </span>
            </button>


          </div>
          {openIcon && (
            <div className="px-2 py-3 flex items-center justify-center text-white absolute top-12 right-0 z-20 rounded-md shadow-lg bg-[#18181B] ring-1 ring-black ring-opacity-5 border border-[#2D2D30]  ">
              <ul className="flex flex-col gap-2 w-52">
                <li className="flex gap-2 items-center hover:bg-[#E0B9E0] px-4 py-2 rounded-md transition-all duration-300 ease-in-out cursor-pointer hover:text-black" onClick={() => {
                  setShowSettings(true)
                  setOpenIcon(false)
                }}>
                  <Settings size={20} />{" "}
                  <span >
                    Inställningar
                  </span>
                </li>
                <li
                  className="flex gap-2 items-center hover:bg-[#E0B9E0] px-4 py-2 rounded-md transition-all duration-300 ease-in-out cursor-pointer hover:text-black"
                  onClick={handleSignOut}
                >
                  <LogOut size={20} /> <span>Logga ut</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {open && <MobileMenu />}
    </main>
  );
}
