import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

const commandSchema = z.object({
  command: z.enum([
    "ASSIGN_PLAYLIST",
    "REMOVE_PLAYLIST",
    "UPDATE_APP",
    "SEND_MESSAGE",
    "RESTART_PLAYER",
    "CLEAR_CACHE",
  ]),
  payload: z.record(z.string(), z.unknown()).optional(),
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

    const { id } = await params;
    const body = await request.json();
    const parsed = commandSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const device = await prisma.device.findUnique({ where: { id } });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const command = await prisma.deviceCommand.create({
      data: {
        deviceId: id,
        command: parsed.data.command,
        payload: parsed.data.payload ? JSON.stringify(parsed.data.payload) : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ command }, { status: 201 });
  } catch (error) {
    console.error("Send command error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
