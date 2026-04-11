import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

async function getPrisma() {
  try {
    const { default: prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const payload = authenticateRequest(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try Prisma first
    const prisma = await getPrisma();
    if (prisma) {
      const user = await prisma.adminUser.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    // Fallback: return token payload as user info
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.email.split("@")[0],
        role: payload.role,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
