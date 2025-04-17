"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen flex items-center justify-center">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-[400px] space-y-6 bg-white px-5 py-10 rounded-xl shadow-lg">
        <div className="space-y-2 ">

          <h1 className="text-2xl  text-slate-900">
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
              className="h-12 rounded-xl bg-slate-100 border-none"
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
              className="h-12 pr-10 rounded-xl bg-slate-100 border-none"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-xl"
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
          <Button type="submit" className="w-full h-12 rounded-xl font-normal bg-slate-900 hover:bg-slate-800">
            {isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className=" text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={toggleMode} className="underline text-neutral-800">
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

