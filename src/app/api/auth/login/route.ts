import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, signToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function getPrisma() {
  try {
    const { default: prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Try Prisma first
    const prisma = await getPrisma();
    if (prisma) {
      const user = await prisma.adminUser.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      return NextResponse.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    }

    // Fallback: env-based auth
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (envEmail && envPassword) {
      if (email === envEmail && password === envPassword) {
        const token = signToken({ userId: "env-admin", email: envEmail, role: "SUPER_ADMIN" });
        return NextResponse.json({
          token,
          user: { id: "env-admin", email: envEmail, name: "Admin", role: "SUPER_ADMIN" },
        });
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // No DB and no env vars: allow any registration token to work
    // Check if the token was recently issued (JWT validation handles this)
    return NextResponse.json(
      { error: "No admin database available. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables in Vercel, or use a persistent database." },
      { status: 503 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
