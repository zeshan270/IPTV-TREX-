import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [total, active, online, expired] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { isActive: true } }),
      prisma.device.count({
        where: {
          lastSeenAt: { gte: fiveMinutesAgo },
        },
      }),
      prisma.device.count({
        where: {
          expiresAt: { lt: now },
        },
      }),
    ]);

    return NextResponse.json({
      total,
      active,
      online,
      expired,
      inactive: total - active,
    });
  } catch (error) {
    console.error("Device stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
