"use client";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import SignOutBtn from "@/components/ui/signOutBtn";

export default function Page() {
  const { loading } = useAuth();
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="">
      <SignOutBtn />
    </div>
  );
}