'use client';
import Navbar from "@/components/layout/navbar/Navbar";
import Gradient from "@/components/ui/gradient";
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
    <main className="max-w-7xl mx-auto ">
      <Gradient />
      <Navbar />
    </main>
  );
}
