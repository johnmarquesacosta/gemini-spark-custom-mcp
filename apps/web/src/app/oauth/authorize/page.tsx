'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import api from '@/lib/api';

function OAuthAuthorizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const state = searchParams.get('state');

  useEffect(() => {
    if (!accessToken) {
      // Temporarily store the original url in session storage so login can redirect back
      sessionStorage.setItem('oauth_redirect_back', window.location.pathname + window.location.search);
      router.push('/login');
    }
  }, [accessToken, router]);

  const handleAuthorize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/oauth/authorize', {
        client_id: clientId,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        state: state,
      });
      
      if (response.data?.redirect_uri) {
        // Redireciona de volta para o cliente (Gemini Spark) com o auth code
        window.location.href = response.data.redirect_uri;
      }
    } catch (err: unknown) {
      console.error('OAuth error:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Falha ao autorizar o aplicativo.');
      } else {
        setError('Falha ao autorizar o aplicativo.');
      }
      setLoading(false);
    }
  };

  if (!accessToken) {
    return <div className="p-8 text-center">Redirecionando para login...</div>;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Autorização de Aplicativo</CardTitle>
          <CardDescription>
            Um aplicativo de terceiros (Gemini Spark) deseja se conectar à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Você está conectado como <strong>{user?.name || user?.email}</strong>.
          </p>
          <p className="text-sm">
            Se você autorizar, este aplicativo poderá realizar ações em seu nome usando o protocolo MCP.
          </p>
          {error && (
            <div className="mt-4 rounded bg-red-100 p-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAuthorize} disabled={loading}>
            {loading ? 'Autorizando...' : 'Autorizar'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <OAuthAuthorizeContent />
    </Suspense>
  );
}
