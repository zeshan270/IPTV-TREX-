import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const heartbeatSchema = z.object({
  appVersion: z.string().optional(),
  deviceModel: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ mac: string }> }
) {
  try {
    const { mac } = await params;
    const macAddress = decodeURIComponent(mac);

    const body = await request.json().catch(() => ({}));
    const parsed = heartbeatSchema.safeParse(body);
    const data = parsed.success ? parsed.data : {};

    const device = await prisma.device.findUnique({
      where: { macAddress },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      lastSeenAt: new Date(),
    };
    if (data.appVersion) updateData.appVersion = data.appVersion;
    if (data.deviceModel) updateData.deviceModel = data.deviceModel;

    await prisma.device.update({
      where: { macAddress },
      data: updateData,
    });

    // Check for pending commands
    const pendingCommands = await prisma.deviceCommand.count({
      where: { deviceId: device.id, status: "PENDING" },
    });

    const isExpired = device.expiresAt ? device.expiresAt < new Date() : false;

    return NextResponse.json({
      status: "ok",
      isActive: device.isActive,
      isExpired,
      pendingCommands,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Device heartbeat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
