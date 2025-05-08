"use client";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import Navbar from "@/components/layout/navbar/Navbar";
import { Greeting } from "@/components/ui/GetGreating";


export default function Page() {
  const { loading } = useAuth();
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="">
      <Navbar />
      <Greeting />
    </div>
  );
}