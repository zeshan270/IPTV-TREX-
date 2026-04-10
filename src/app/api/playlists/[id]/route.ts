import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

const updatePlaylistSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["M3U", "XTREAM"]).optional(),
  m3uUrl: z.string().url().nullable().optional(),
  serverUrl: z.string().url().nullable().optional(),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        devices: {
          include: {
            device: { select: { id: true, macAddress: true, deviceName: true, isActive: true } },
          },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error("Get playlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updatePlaylistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error("Update playlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    await prisma.playlist.delete({ where: { id } });

    return NextResponse.json({ message: "Playlist deleted" });
  } catch (error) {
    console.error("Delete playlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
