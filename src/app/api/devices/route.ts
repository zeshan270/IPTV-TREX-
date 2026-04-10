import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";
import { generateUniqueMac } from "@/lib/mac-generator";

const createDeviceSchema = z.object({
  deviceName: z.string().min(1),
  deviceModel: z.string().optional().default(""),
  appVersion: z.string().optional().default(""),
  macAddress: z.string().optional(),
  isActive: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional().default(""),
});

export async function GET(request: Request) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // active, inactive, expired

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { deviceName: { contains: search } },
        { macAddress: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (status === "expired") {
      where.expiresAt = { lt: new Date() };
    }

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        include: {
          playlists: {
            include: { playlist: { select: { id: true, name: true, type: true } } },
          },
          _count: { select: { commands: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.device.count({ where }),
    ]);

    return NextResponse.json({
      devices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List devices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createDeviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const macAddress = data.macAddress || (await generateUniqueMac());

    const existing = await prisma.device.findUnique({
      where: { macAddress },
    });
    if (existing) {
      return NextResponse.json({ error: "MAC address already exists" }, { status: 409 });
    }

    const device = await prisma.device.create({
      data: {
        macAddress,
        deviceName: data.deviceName,
        deviceModel: data.deviceModel || "",
        appVersion: data.appVersion || "",
        isActive: data.isActive,
        activatedAt: data.isActive ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        notes: data.notes || "",
      },
    });

    return NextResponse.json({ device }, { status: 201 });
  } catch (error) {
    console.error("Create device error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
