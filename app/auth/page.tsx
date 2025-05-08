"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import auth, { db } from "@/configs/firebase";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Gradient from "@/components/ui/gradient";
import Navbar from "@/components/layout/navbar/Navbar";

// Schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Minst 8 tecken"),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(1, "Namn krävs"),
});

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loading } = useAuth(null as any);

  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [showPassword, setShowPassword] = useState(false);

  const schema = isLogin ? loginSchema : signupSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsLogin(mode === "login");
  }, [searchParams]);



  const toggleMode = () => {
    router.push(`/auth?mode=${isLogin ? "signup" : "login"}`);
  };

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast.success("Inloggning lyckades!");
        router.push("/dashboard");
      } else {
        const existing = await fetchSignInMethodsForEmail(auth, data.email);
        if (existing.length > 0) {
          setError("email", {
            type: "manual",
            message: "E-postadressen används redan.",
          });
          return;
        }

        const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCred.user;

        await Promise.all([
          updateProfile(user, { displayName: data.name }),
          setDoc(doc(db, "usersData", user.uid), {
            uid: user.uid,
            email: user.email,
            name: data.name,
            isAdmin: false,
            createdAt: new Date().toISOString(),
          }),
        ]);

        toast.success("Konto skapat!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Något gick fel.");
    }
  };

  if (loading) return <Loader />;

  return (
    <main className="max-w-7xl mx-auto">
      <Navbar />
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Gradient />
        <Toaster position="top-center" />
        <Card className="w-full max-w-[400px] border-0 bg-black/40 backdrop-blur-xl">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                {isLogin ? "Välkommen tillbaka" : "Skapa konto"}
              </h1>
              <p className="text-sm text-gray-400">
                {isLogin ? "Logga in för att fortsätta" : "Kom igång med Quickfeed"}
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Input
                    placeholder="Namn"
                    className="bg-[#141414] border-[#1E1F21] text-white placeholder:text-gray-400 rounded-xl"
                    {...register("name")}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  className="bg-[#141414] border-[#1E1F21] text-white placeholder:text-gray-400 rounded-xl"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
              </div>
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
    className="absolute inset-y-0 right-3 flex items-center"
  >
    {showPassword ? (
      <EyeOff className="h-5 w-5 text-gray-400" />
    ) : (
      <Eye className="h-5 w-5 text-gray-400" />
    )}
  </button>
</div>

              <Button type="submit" className="w-full bg-[#E0B9E0] text-black hover:bg-[#E0B9E0]/80 rounded-xl py-2">
                {isLogin ? "Logga in" : "Skapa konto"}
              </Button>
            </form>
            <p className="text-sm text-gray-400">
              {isLogin ? "Har du inget konto?" : "Har du redan ett konto?"}{" "}
              <button onClick={toggleMode} className="text-white hover:underline">
                {isLogin ? "Skapa konto" : "Logga in"}
              </button>
            </p>
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

export const dynamic = "force-dynamic";
