import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from 'lib/mongodb';

// Extend the NextAuth types for custom properties
declare module 'next-auth' {
  interface Session {
    username: string;
  }
  interface User {
    username: string;
  }
}

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          username: profile.login,
          email: profile.email,
          image: profile.avatar_url,
          followers: profile.followers,
          verified: true
        };
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      session.username = user.username;
      return session;
    }
  }
});
