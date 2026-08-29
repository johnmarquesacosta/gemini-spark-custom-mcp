"use client";

import { useState } from "react";
import { approveAuthorization } from "../../actions/oauth";

export function ConsentClient({
  client_id,
  redirect_uri,
  state,
  code_challenge,
}: {
  client_id: string;
  redirect_uri: string;
  state?: string;
  code_challenge: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await approveAuthorization({
        client_id,
        redirect_uri,
        code_challenge,
      });
      
      const finalUrl = new URL(url);
      if (state) {
        finalUrl.searchParams.set("state", state);
      }
      
      window.location.href = finalUrl.toString();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handleDeny = () => {
    const url = new URL(redirect_uri);
    url.searchParams.set("error", "access_denied");
    if (state) {
      url.searchParams.set("state", state);
    }
    window.location.href = url.toString();
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-4">
        <button
          onClick={handleDeny}
          disabled={loading}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          {loading ? "Approving..." : "Authorize"}
        </button>
      </div>
    </div>
  );
}
