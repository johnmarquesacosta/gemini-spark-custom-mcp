"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResendForm = z.infer<typeof resendSchema>;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResendForm>({
    resolver: zodResolver(resendSchema),
  });

  const hasFired = useRef(false);

  useEffect(() => {
    const verifyToken = async (verificationToken: string) => {
      setStatus("verifying");
      try {
        await api.post("/auth/verify-email", { token: verificationToken });
        setStatus("success");
        setMessage("Your email has been successfully verified. You can now sign in.");
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. The link may be invalid or expired.");
      }
    };

    if (token && !hasFired.current) {
      hasFired.current = true;
      verifyToken(token);
    }
  }, [token]);

  const onResend = async (data: ResendForm) => {
    try {
      setStatus("idle");
      setMessage(null);
      await api.post("/auth/resend-verification", data);
      setStatus("success");
      setMessage("If the email is registered and unverified, a new link has been sent. Please check your inbox.");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setStatus("error");
      setMessage(error.response?.data?.message || "Failed to resend verification email.");
    }
  };

  if (status === "verifying") {
    return (
      <Card className="bg-card text-card-foreground shadow-sm backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Verifying Email...</CardTitle>
          <CardDescription>Please wait while we verify your email address.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground shadow-sm backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          {token && status === "error" 
            ? "There was an issue verifying your email."
            : "Check your email for the verification link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={status === "success" ? "default" : "destructive"} 
                 className={status === "success" ? "bg-green-900/20 border-green-900/50 text-green-400" : "bg-red-900/20 border-red-900/50 text-red-400"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {status === "success" && token ? (
          <Link href="/login" className={buttonVariants({ className: "w-full" })}>Go to Login</Link>
        ) : (
          <form onSubmit={handleSubmit(onResend)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Enter your email address to resend the verification link.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Resend Verification Email"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          Back to <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
