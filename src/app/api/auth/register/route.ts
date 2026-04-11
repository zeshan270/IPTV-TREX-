import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, signToken } from "@/lib/auth";

const MAX_ADMINS = 5;

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

async function getPrisma() {
  try {
    const { default: prisma } = await import("@/lib/db");
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

// GET: Check how many admins exist
export async function GET() {
  try {
    const prisma = await getPrisma();
    if (prisma) {
      const count = await prisma.adminUser.count();
      return NextResponse.json({ count, maxAdmins: MAX_ADMINS });
    }
    // Fallback: check if env admin exists
    const envEmail = process.env.ADMIN_EMAIL;
    return NextResponse.json({ count: envEmail ? 1 : 0, maxAdmins: MAX_ADMINS });
  } catch (error) {
    console.error("Admin count error:", error);
    const envEmail = process.env.ADMIN_EMAIL;
    return NextResponse.json({ count: envEmail ? 1 : 0, maxAdmins: MAX_ADMINS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Try Prisma first
    const prisma = await getPrisma();
    if (prisma) {
      const userCount = await prisma.adminUser.count();
      if (userCount >= MAX_ADMINS) {
        return NextResponse.json({ error: `Maximum number of admins (${MAX_ADMINS}) reached` }, { status: 403 });
      }

      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      const role = userCount === 0 ? "SUPER_ADMIN" : "ADMIN";
      const passwordHash = await hashPassword(password);

      const user = await prisma.adminUser.create({
        data: { email, passwordHash, name, role },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });

      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      return NextResponse.json({ token, user }, { status: 201 });
    }

    // Fallback: env-based registration (store nothing, just validate and return token)
    // On Vercel without a persistent DB, we allow registration and return a token
    // The admin should set ADMIN_EMAIL and ADMIN_PASSWORD env vars for persistent auth
    const passwordHash = await hashPassword(password);
    const userId = "env-admin-" + Date.now();
    const role = "SUPER_ADMIN";

    const token = signToken({ userId, email, role });

    // Store in env hint
    console.log(`[ADMIN REGISTER] New admin registered: ${email} / name: ${name}`);
    console.log(`[ADMIN REGISTER] Set these env vars for persistent auth:`);
    console.log(`  ADMIN_EMAIL=${email}`);
    console.log(`  ADMIN_PASSWORD_HASH=${passwordHash}`);

    return NextResponse.json({
      token,
      user: { id: userId, email, name, role, createdAt: new Date().toISOString() },
      notice: "Registration successful. For persistent admin auth on Vercel, set ADMIN_EMAIL and ADMIN_PASSWORD as environment variables.",
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
