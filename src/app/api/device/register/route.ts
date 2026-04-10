import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { generateUniqueMac } from "@/lib/mac-generator";

const registerSchema = z.object({
  deviceName: z.string().min(1),
  deviceModel: z.string().optional().default(""),
  appVersion: z.string().optional().default(""),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/).optional(),
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

    const data = parsed.data;

    // If device provides a MAC, check if already registered
    if (data.macAddress) {
      const existing = await prisma.device.findUnique({
        where: { macAddress: data.macAddress },
      });
      if (existing) {
        return NextResponse.json({
          device: {
            id: existing.id,
            macAddress: existing.macAddress,
            deviceName: existing.deviceName,
            isActive: existing.isActive,
            expiresAt: existing.expiresAt,
          },
          message: "Device already registered",
        });
      }
    }

    const macAddress = data.macAddress || (await generateUniqueMac());

    const device = await prisma.device.create({
      data: {
        macAddress,
        deviceName: data.deviceName,
        deviceModel: data.deviceModel || "",
        appVersion: data.appVersion || "",
        isActive: false,
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        device: {
          id: device.id,
          macAddress: device.macAddress,
          deviceName: device.deviceName,
          isActive: device.isActive,
          expiresAt: device.expiresAt,
        },
        message: "Device registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Device register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
