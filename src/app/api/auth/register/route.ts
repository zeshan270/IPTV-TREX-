import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

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

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // First user becomes SUPER_ADMIN
    const userCount = await prisma.adminUser.count();
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
