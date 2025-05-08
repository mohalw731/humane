"use client";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import Navbar from "@/components/layout/navbar/Navbar";
import { Greeting } from "@/components/ui/GetGreating";
import { useRouter } from "next/navigation";
import useUserData from "@/hooks/useUser";
import AdminRoomManager from "@/components/Admin";
import TodoList from "@/components/task";


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
<TodoList />
     <AdminRoomManager />
    </div>
  );
}