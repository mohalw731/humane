'use client';
import Loader from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth(null as never); 
  if(loading) return <Loader />;
  if(isLoggedIn) return router.push("/dashboard");

  return (
    <div className="">
      Landing page

      <Link href="/auth">
        signup
      </Link>
    
    </div>
  );
}
