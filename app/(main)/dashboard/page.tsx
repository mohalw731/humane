"use client";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import Navbar from "@/components/layout/navbar/Navbar";
import { Greeting } from "@/components/ui/GetGreating";
import { useRouter } from "next/navigation";
import useUserData from "@/hooks/useUser";
import AdminRoomManager from "@/components/Admin";


export default function Page() {
  const { loading, isLoggedIn } = useAuth();
  const {user, loading: userDataLoading} = useUserData()
  const router = useRouter();
  if (loading || userDataLoading) return <Loader />;
  // if (!isLoggedIn) return router.push("/auth?mode=login");

  return (
    <div className="">
      <Navbar />
      <Greeting />
     {!user?.isAdmin && (
       <div className="flex flex-col items-center justify-center h-screen">
       <h1 className="text-2xl text-white font-light">User ID: {user?.uid}</h1>
       <h1 className="text-2xl text-white font-light">Email: {user?.email}</h1>
       <h1 className="text-2xl text-white font-light">Name: {user?.name}</h1>
       <h1 className="text-2xl text-white font-light">Is Admin: {user?.isAdmin ? "Yes" : "No"}</h1>
       </div>
     )}

     <AdminRoomManager />
    </div>
  );
}