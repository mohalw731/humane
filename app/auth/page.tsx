"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff, Bell } from "lucide-react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
} from "firebase/auth";
import auth, { db } from "@/configs/firebase";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import { doc, setDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Gradient from "@/components/ui/gradient";
import Navbar from "@/components/layout/navbar/Navbar";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
});

type FormData = z.infer<typeof schema>;

function AuthPageContent() {
  const searchParams = useSearchParams();
  const { isLoggedIn, loading } = useAuth(null as any);
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsLogin(mode === "login");
  }, [searchParams]);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [loading, isLoggedIn, router]);

  const toggleMode = () => {
    const newMode = isLogin ? "signup" : "login";
    router.push(`/auth?mode=${newMode}`);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      } else {
        const methods = await fetchSignInMethodsForEmail(auth, data.email);
        if (methods.length > 0) {
          setError("email", {
            type: "manual",
            message: "Email is already in use. Please try logging in.",
          });
          return;
        }
  
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const user = userCredential.user;
  
        try {
          await setDoc(doc(db, "usersData", user.uid), {
            email: user.email,
            name: data.name,
            uid: user.uid,
            createdAt: new Date().toISOString(),
          });
          console.log("User document created successfully");
        } catch (firestoreError) {
          console.error("Firestore error:", firestoreError);
          toast.error("Failed to create user profile");
          return;
        }
  
        try {
          await updateProfile(user, {
            displayName: data.name,
          });
        } catch (profileError) {
          console.error("Profile update error:", profileError);
        }
  
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  if (loading) return <Loader />;

  return (
    <main className="max-w-7xl mx-auto">
      <Navbar />
      <div className="flex min-h-[80vh] flex-col items-center justify-center ">
        <Gradient />
        <Toaster position="top-center" reverseOrder={false} />
        <Card className="relative w-full max-w-[400px] border-0 bg-black/40 backdrop-blur-xl">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? "Välkommen tillbaka" : "Skapa konto"}
              </h1>
              <p className="text-sm text-gray-400">
                {isLogin ? "Logga in för att fortsätta" : "Kom igång med Quickfeed"}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="sr-only">
                    name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Namn"
                    className="border-[#1E1F21] border bg-[#141414] text-white placeholder:text-gray-400 rounded-xl"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="border-[#1E1F21] border bg-[#141414] text-white placeholder:text-gray-400 rounded-xl"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="sr-only">
                  password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Lösenord"
                    className="border-[#1E1F21] border bg-[#141414] text-white placeholder:text-gray-400 rounded-xl pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-xl"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-[#E0B9E0] text-black hover:bg-[#E0B9E0]/80 rounded-xl py-2"
              >
                {isLogin ? "Logga in" : "Skapa konto"}
              </Button>
            </form>

            <div className="space-y-2 text-sm">
              
              <p className="text-gray-400">
                {isLogin ? "Har du inget konto?" : "Har du redan ett konto?"}{" "}
                <button
                  onClick={toggleMode}
                  className="text-white hover:text-gray-200"
                >
                  {isLogin ? "Skapa konto" : "Logga in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AuthPageContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';