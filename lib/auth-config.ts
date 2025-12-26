import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

// Check if Google OAuth credentials are properly configured
const hasGoogleCredentials = 
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id') &&
  !process.env.GOOGLE_CLIENT_SECRET.includes('your-google-client-secret');

export const authOptions: NextAuthOptions = {
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
        // Connect to database with timeout
        await connectDB();
        
        if (account?.provider === "google" && profile) {
          console.log('🔍 Checking for existing Google user:', profile.email);
          
          // Kiểm tra xem user Google đã tồn tại chưa
          const existingUser = await Promise.race([
            User.findOne({
              $or: [
                { email: profile.email },
                { googleId: profile.sub }
              ]
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database query timeout')), 8000)
            )
          ]);
          
          if (!existingUser) {
            console.log('✅ Creating new Google user');
            
            // Tạo username từ email hoặc Google name
            let username = profile.email?.split('@')[0] || profile.name?.toLowerCase().replace(/\s+/g, '');
            
            // Đảm bảo username unique
            let counter = 0;
            let uniqueUsername = username;
            while (await User.findOne({ username: uniqueUsername })) {
              counter++;
              uniqueUsername = `${username}${counter}`;
            }
            
            // Tạo user mới từ Google profile
            const newUser = new User({
              name: profile.name || profile.email?.split('@')[0],
              email: profile.email,
              username: uniqueUsername,
              googleId: profile.sub,
              provider: 'google',
              tier: 'PERSONAL',
              isActive: true,
              emailVerified: new Date(),
              profileComplete: false,
              image: profile.image,
            });
            
            await newUser.save();
            console.log('✅ New Google user created:', newUser._id);
          } else {
            console.log('👤 Existing user found');
            if (!existingUser.googleId) {
              // Link Google account với existing user
              existingUser.googleId = profile.sub;
              existingUser.provider = 'google';
              if (!existingUser.image) {
                existingUser.image = profile.image;
              }
              await existingUser.save();
              console.log('✅ Google account linked to user:', existingUser._id);
            }
          }
          
          return true;
        }
        
        return true;
      } catch (error: any) {
        console.error('❌ Sign in error:', error.message);
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