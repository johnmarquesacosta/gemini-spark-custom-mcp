import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-white/20"
              />
            )}
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Bem-vindo, {session.user.name}!</h2>
          <p className="mt-2 text-neutral-400">
            Seu login com o Google foi concluído com sucesso.
          </p>
          <div className="mt-6 rounded-lg bg-black/50 p-4 font-mono text-sm text-neutral-300 mb-6">
            <p>Email: {session.user.email}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="/dashboard/mcp"
              className="group block rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
            >
              <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">
                MCP Resources
              </h3>
              <p className="mt-2 text-sm text-neutral-400">
                Manage your Tools and Prompts for the Model Context Protocol.
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
