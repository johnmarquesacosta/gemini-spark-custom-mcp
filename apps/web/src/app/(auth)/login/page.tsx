"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api, { getApiUrl } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      const res = await api.post("/auth/login", data);
      setAccessToken(res.data.accessToken);

      const userRes = await api.get("/auth/me");
      setUser(userRes.data);

      const redirectBack = sessionStorage.getItem("oauth_redirect_back");
      if (redirectBack) {
        sessionStorage.removeItem("oauth_redirect_back");
        router.push(redirectBack);
      } else {
        router.push("/profile");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Invalid credentials. Please try again.",
      );
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${getApiUrl()}/auth/google`;
  };

  return (
    <Card className="bg-background/60 dark:bg-black/40 text-card-foreground shadow-2xl backdrop-blur-2xl border-white/20 dark:border-white/10 relative overflow-hidden transition-all">
      {/* Decorative gradient blur inside card */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
      
      <CardHeader className="space-y-1 relative z-10">
        <CardTitle className="text-2xl font-semibold tracking-tight text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-900/20 border-red-900/50 text-red-400"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2 group">
            <Label htmlFor="email" className="group-focus-within:text-primary transition-colors">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="bg-background/50 border-muted focus-visible:ring-primary/30 hover:border-primary/50 transition-all"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2 group">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="group-focus-within:text-primary transition-colors">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              className="bg-background/50 border-muted focus-visible:ring-primary/30 hover:border-primary/50 transition-all"
              {...register("password")} 
            />
            {errors.password && (
              <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full relative overflow-hidden group" disabled={isSubmitting}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : "Sign in"}
            </span>
            <div className="absolute inset-0 bg-primary-foreground/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-background/50 hover:bg-background/80 transition-colors"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <div className="text-sm text-muted-foreground text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
