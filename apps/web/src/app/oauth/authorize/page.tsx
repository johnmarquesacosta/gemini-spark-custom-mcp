import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import { ConsentClient } from "./client";

export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    state?: string;
    code_challenge?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/"); // Or whatever your login page is
  }

  const { client_id, redirect_uri, state, code_challenge } = await searchParams;

  if (!client_id || !redirect_uri || !code_challenge) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Request</h1>
          <p className="text-gray-600">Missing required OAuth parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authorization Request
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{client_id}</span> wants to access your MCP resources.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-8 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Signed in as:
          </p>
          <div className="flex items-center gap-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {session.user.name}
              </p>
              <p className="text-sm text-gray-500">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        <ConsentClient 
          client_id={client_id}
          redirect_uri={redirect_uri}
          state={state}
          code_challenge={code_challenge}
        />
      </div>
    </div>
  );
}
