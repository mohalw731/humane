"use client";
import Navbar from "@/components/layout/navbar/Navbar";
import Gradient from "@/components/ui/gradient";
import Loader from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { loading, isLoggedIn } = useAuth(null as never);
  if (isLoggedIn) router.push("/dashboard");
  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto ">
      <Navbar />
      <main className="flex relative justify-start items-center h-[calc(100vh-250px)]">
        <Gradient />
        <div className="max-w-[890px] text-white flex flex-col md:gap-6 gap-4  ">
          <h1 className="md:text-7xl text-[35px] text-white font-light">
            Från <span className="text-primary">samtal</span> till insikt på
            några <span className="text-secondary">sekunder.</span>
          </h1>
          <p className="md:text-lg text-sm text-white max-w-xl ">
            Quickfeed analyserar varje säljsamtal automatiskt och visar exakt
            vad som funkar – innan du du tappar nästa kund.
          </p>
          <div className="flex justify-start gap-3">
            <Link
              href="/sign-up"
              className="bg-[#E0B9E0] py-2 px-6 text-black text-md hover:bg-[#E0B9E0]/80 transition-colors rounded-full"
            >
              Starta testperiod
            </Link>
            <button className="border border-[#E0B9E0] md:py-2 md:px-6 md:text-base text-sm py-1 px-4 text-white hover:bg-[#E0B9E0] transition-colors rounded-full hover:text-black">
              Boka demo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
