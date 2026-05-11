import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAIL = "office@nsmarchi.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      return profile?.email === ALLOWED_EMAIL;
    },
    session({ session }) {
      return session;
    },
  },
});
