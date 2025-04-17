'use client';
import { useEffect } from "react";
import Loader from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { loading, isLoggedIn } = useAuth(null as never);
  if(isLoggedIn) router.push("/dashboard");
  if (loading) return <Loader />;

  return (
    <div>
      Landing page
      <Link href="/auth">signup</Link>
    </div>
  );
}
