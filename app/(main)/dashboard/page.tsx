"use client";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import SignOutBtn from "@/components/ui/signOutBtn";
import Navbar from "@/components/layout/navbar/Navbar";

export default function Page() {
  const { loading } = useAuth();
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="">
      <Navbar />
      <SignOutBtn />
    </div>
  );
}