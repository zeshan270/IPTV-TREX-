import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mac: string }> }
) {
  try {
    const { mac } = await params;
    const macAddress = decodeURIComponent(mac);

    const device = await prisma.device.findUnique({
      where: { macAddress },
      select: {
        id: true,
        macAddress: true,
        deviceName: true,
        isActive: true,
        activatedAt: true,
        expiresAt: true,
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const isExpired = device.expiresAt ? device.expiresAt < new Date() : false;

    return NextResponse.json({
      macAddress: device.macAddress,
      deviceName: device.deviceName,
      isActive: device.isActive,
      isExpired,
      activatedAt: device.activatedAt,
      expiresAt: device.expiresAt,
    });
  } catch (error) {
    console.error("Device activation check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
