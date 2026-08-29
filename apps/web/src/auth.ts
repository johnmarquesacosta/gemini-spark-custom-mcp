import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/", // Usaremos a página inicial como login
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Estratégia 1: Sincronização com a mcp-api
          const response = await fetch(`${process.env.MCP_API_URL}/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-sync-secret": process.env.AUTH_SECRET || "",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
            }),
          });

          if (!response.ok) {
            console.error(
              "Erro ao sincronizar usuário com a mcp-api",
              await response.text(),
            );
            // Em produção, você pode querer retornar `false` aqui para impedir o login
            // caso o backend rejeite.
          }

          return true;
        } catch (error) {
          console.error("Erro de conexão com a mcp-api", error);
          // Retornamos true provisoriamente para não bloquear o fluxo de login
          // enquanto a mcp-api não está totalmente implementada.
          return true;
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      // Se acabou de fazer login (account existe), podemos guardar informações extras
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session }) {
      return session;
    },
  },
});
