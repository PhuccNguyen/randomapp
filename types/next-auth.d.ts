// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tier?: string;
      isActive?: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    tier?: string;
    isActive?: boolean;
  }
}
