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
      include: {
        playlists: {
          include: {
            playlist: true,
          },
          orderBy: { isPrimary: "desc" },
        },
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    if (!device.isActive) {
      return NextResponse.json({ error: "Device is not activated" }, { status: 403 });
    }

    if (device.expiresAt && device.expiresAt < new Date()) {
      return NextResponse.json({ error: "Device subscription has expired" }, { status: 403 });
    }

    const playlists = device.playlists
      .filter((dp: any) => dp.playlist.isActive)
      .map((dp: any) => ({
        id: dp.playlist.id,
        name: dp.playlist.name,
        type: dp.playlist.type,
        m3uUrl: dp.playlist.m3uUrl,
        serverUrl: dp.playlist.serverUrl,
        username: dp.playlist.username,
        password: dp.playlist.password,
        isPrimary: dp.isPrimary,
        assignedAt: dp.assignedAt,
      }));

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error("Device playlists error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
