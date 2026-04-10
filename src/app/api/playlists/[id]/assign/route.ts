import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

const assignSchema = z.object({
  deviceIds: z.array(z.string()).min(1, "At least one device ID is required"),
  isPrimary: z.boolean().optional().default(false),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: playlistId } = await params;
    const body = await request.json();
    const parsed = assignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const { deviceIds, isPrimary } = parsed.data;

    // Verify all devices exist
    const devices = await prisma.device.findMany({
      where: { id: { in: deviceIds } },
      select: { id: true },
    });

    const foundIds = new Set(devices.map((d) => d.id));
    const missingIds = deviceIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: "Some devices not found", missingIds },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primaries for these devices
    if (isPrimary) {
      await prisma.devicePlaylist.updateMany({
        where: { deviceId: { in: deviceIds }, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Upsert assignments
    const results = await Promise.all(
      deviceIds.map(async (deviceId) => {
        const existing = await prisma.devicePlaylist.findUnique({
          where: { deviceId_playlistId: { deviceId, playlistId } },
        });

        if (existing) {
          return prisma.devicePlaylist.update({
            where: { id: existing.id },
            data: { isPrimary },
          });
        }

        return prisma.devicePlaylist.create({
          data: { deviceId, playlistId, isPrimary },
        });
      })
    );

    return NextResponse.json({
      message: `Playlist assigned to ${results.length} device(s)`,
      assignments: results,
    });
  } catch (error) {
    console.error("Assign playlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
