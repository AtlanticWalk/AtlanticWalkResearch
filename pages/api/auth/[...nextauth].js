import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUser } from '../../../lib/kv';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await getUser(credentials.email);
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.email,
          email: user.email,
          isSubscribed: user.isSubscribed,
          stripeCustomerId: user.stripeCustomerId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isSubscribed = user.isSubscribed;
        token.stripeCustomerId = user.stripeCustomerId;
        token.lastChecked = Date.now();
      }
      // Re-check subscription status from DB every 5 minutes
      if (token.email && (!token.lastChecked || Date.now() - token.lastChecked > 5 * 60 * 1000)) {
        const dbUser = await getUser(token.email);
        if (dbUser) {
          token.isSubscribed = dbUser.isSubscribed;
          token.stripeCustomerId = dbUser.stripeCustomerId;
          token.lastChecked = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isSubscribed = token.isSubscribed;
        session.user.stripeCustomerId = token.stripeCustomerId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
};

export default NextAuth(authOptions);
