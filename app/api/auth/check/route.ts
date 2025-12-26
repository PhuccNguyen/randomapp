import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      return NextResponse.json({ 
        authenticated: true, 
        user: session.user 
      });
    } else {
      return NextResponse.json({ 
        authenticated: false 
      });
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Failed to check session' 
    }, { status: 500 });
  }
}
