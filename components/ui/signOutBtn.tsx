'use client'
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React from 'react'
import { Button } from './button'

export default function SignOutBtn() {
    const auth = getAuth();
    const router = useRouter()
    const handleSignOut = () => {
        signOut(auth).then(() => {
            router.push("/auth")
        }).catch((error) => {
            console.log(error)
        });
    }

  return (
            <Button className="w-full mt-4 bg-red-600 text-white hover:bg-red-800 " onClick={handleSignOut}>Sign out</Button>

  )
}
