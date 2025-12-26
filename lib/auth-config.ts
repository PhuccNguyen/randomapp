import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import User from "@/models/User";

let cachedClient: any;
let cachedPromise: any;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedPromise;
  }
  cachedClient = new MongoClient(process.env.MONGODB_URI!);
  cachedPromise = cachedClient.connect();
  return cachedPromise;
}

const clientPromise = connectToDatabase();

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
    ...(hasGoogleCredentials ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      }),
    ] : []),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Khi user sign in lần đầu, thêm user info vào token
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      // Nếu này là Google sign in, lưu thông tin account
      if (account?.provider === "google" && profile) {
        token.provider = "google";
        token.googleId = profile.sub;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Gửi thêm thông tin vào session
      if (session?.user) {
        (session.user as any).id = token.sub;
        (session.user as any).provider = token.provider;
        (session.user as any).googleId = token.googleId;
      }
      return session;
    },
    
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Ensure database connection
        const { db } = await clientPromise;
        
        if (account?.provider === "google" && profile) {
          // Kiểm tra xem user Google đã tồn tại chưa
          const existingUser = await User.findOne({
            $or: [
              { email: profile.email },
              { googleId: profile.sub }
            ]
          });
          
          if (!existingUser) {
            // Tạo user mới từ Google profile
            const newUser = new User({
              name: profile.name || profile.email?.split('@')[0],
              email: profile.email,
              googleId: profile.sub,
              provider: 'google',
              tier: 'PERSONAL',
              isActive: true,
              emailVerified: new Date(),
              profileComplete: false, // User cần điền thêm thông tin
              image: profile.image,
            });
            await newUser.save();
            console.log('✅ New Google user created:', newUser._id);
          } else if (!existingUser.googleId) {
            // Link Google account với existing user
            existingUser.googleId = profile.sub;
            existingUser.provider = 'google';
            if (!existingUser.image) {
              existingUser.image = profile.image;
            }
            await existingUser.save();
            console.log('✅ Google account linked to user:', existingUser._id);
          }
          
          return true;
        }
        
        return true;
      } catch (error) {
        console.error('❌ Sign in error:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};