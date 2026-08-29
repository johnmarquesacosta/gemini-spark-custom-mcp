import { auth, signIn } from "@/auth"
import { LogIn } from "lucide-react"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  
  // Se já estiver logado, manda pro dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[80%] rounded-full bg-violet-900/30 blur-[120px]" />
        <div className="absolute top-[60%] right-[10%] h-[60%] w-[60%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* Glassmorphic Login Card */}
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/20">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 shadow-lg shadow-violet-500/30">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mb-8 text-sm text-neutral-400">
          Sign in to access your mcp-api workspace
        </p>

        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}
        >
          <button
            type="submit"
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-[0.98]"
          >
            {/* Google SVG Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
            
            {/* Button Glow Effect */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-40"></div>
          </button>
        </form>

        <p className="mt-8 text-xs text-neutral-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
