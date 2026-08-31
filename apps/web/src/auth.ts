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
    async jwt({ token, account, user }) {
      // Se acabou de fazer login (account existe), fazemos o sync
      if (account?.provider === "google" && user) {
        try {
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

          if (response.ok) {
            const data = await response.json();
            // Salva o token gerado pelo backend no JWT do NextAuth
            token.accessToken = data.accessToken;
            token.sub = data.user.id; // Guarda o ID do nosso banco
          } else {
            console.error(
              "Erro ao sincronizar usuário com a mcp-api",
              await response.text(),
            );
          }
        } catch (error) {
          console.error("Erro de conexão com a mcp-api", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
