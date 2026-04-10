import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

const createPlaylistSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["M3U", "XTREAM"]),
  m3uUrl: z.string().url().optional(),
  serverUrl: z.string().url().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean().optional().default(true),
}).refine(
  (data) => {
    if (data.type === "M3U") return !!data.m3uUrl;
    if (data.type === "XTREAM") return !!data.serverUrl && !!data.username && !!data.password;
    return false;
  },
  { message: "M3U type requires m3uUrl; XTREAM type requires serverUrl, username, and password" }
);

export async function GET(request: Request) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlists = await prisma.playlist.findMany({
      include: {
        _count: { select: { devices: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error("List playlists error:", error);
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
    const parsed = createPlaylistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const playlist = await prisma.playlist.create({
      data: {
        name: data.name,
        type: data.type,
        m3uUrl: data.m3uUrl || null,
        serverUrl: data.serverUrl || null,
        username: data.username || null,
        password: data.password || null,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    console.error("Create playlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
