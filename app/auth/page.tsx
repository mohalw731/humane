"use client";

import { useState, useEffect, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import auth from "@/configs/firebase";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormData = z.infer<typeof schema>;

export default function AuthPage() {
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
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [loading, isLoggedIn, router]);

  if (loading) return <Loader />;

  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Suspense boundary here */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="w-full max-w-[360px] space-y-6">
          <div className="space-y-2 text-center">
            <div className="h-3 w-3 rounded-full bg-primary mx-auto mb-6" />
            <h1 className="text-xl font-light">
              {isLogin ? "Welcome back" : "Start your free trial"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Sign in to your account" : "No credit card required"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                className="h-12"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-12 pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full h-12 text-sm">
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={toggleMode} className="underline text-neutral-800">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </Suspense>
  );
}
