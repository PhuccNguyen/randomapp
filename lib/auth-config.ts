import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

// Check if Google OAuth credentials are properly configured
const hasGoogleCredentials = 
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id') &&
  !process.env.GOOGLE_CLIENT_SECRET.includes('your-google-client-secret');

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Gửi thêm thông tin user vào session (database strategy)
      if (session?.user && user) {
        session.user.id = user.id;
        session.user.tier = (user as any).tier || 'PERSONAL';
        session.user.isActive = (user as any).isActive ?? true; // Thêm isActive vào session
      }
      console.log('Auth callback - session:', session);
      console.log('Auth callback - user:', user);
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Tự động tạo user với tier PERSONAL khi đăng nhập Google lần đầu
        return true;
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
  },
};