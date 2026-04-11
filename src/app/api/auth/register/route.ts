import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

const MAX_ADMINS = 5;

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

// GET: Check how many admins exist
export async function GET() {
  try {
    const count = await prisma.adminUser.count();
    return NextResponse.json({ count, maxAdmins: MAX_ADMINS });
  } catch (error) {
    console.error("Admin count error:", error);
    return NextResponse.json({ count: 0, maxAdmins: MAX_ADMINS });
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

    // Validate email format (extra check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check admin count limit
    const userCount = await prisma.adminUser.count();
    if (userCount >= MAX_ADMINS) {
      return NextResponse.json(
        { error: `Maximum number of admins (${MAX_ADMINS}) reached` },
        { status: 403 }
      );
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // First user becomes SUPER_ADMIN, rest become ADMIN
    const role = userCount === 0 ? "SUPER_ADMIN" : "ADMIN";

    const passwordHash = await hashPassword(password);

    const user = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
