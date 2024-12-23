// Component code
"use client";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import auth from "@/configs/firebase"; // Ensure this is correctly configured
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";

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
    <div>
      <h1>Dashboard</h1>
      <button onClick={signout}>Logout</button>
    </div>
  );
}
