// Component code
"use client";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import auth from "@/configs/firebase"; // Ensure this is correctly configured
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import Sidebar from "@/components/Sidebar";

export default function Page() {
  const router = useRouter();
  const { loading } = useAuth();
  if (loading) {
    return <Loader />;
  }

  const signout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      console.log("User signed out");
      router.push("/auth"); // Redirect to the login page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex ">
      <Sidebar />
      <div className="flex flex-col max-w-6xl w-full h-screen p-10 gap-4 mx-auto">
        <div className="flex flex-col items-start justify-start gap-1">
          <h1 className="text-4xl text-slate-800 font-semibold">
            Good Morning , Mohammed
          </h1>
          <h2 className="text-slate-400 text-2xl">It's Monday, January 7</h2>
        </div>
        <form action="" className="flex items-center w-full">
          <input
            type="text"
            className="w-[70%] py-4 px-4 rounded-2xl border selected:border-gray-300 bg-slate-100"
            placeholder="Write a new task"
          />
        </form>
      </div>
    </div>
  );
}
