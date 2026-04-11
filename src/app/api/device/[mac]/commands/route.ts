import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const ackSchema = z.object({
  commandId: z.string(),
  status: z.enum(["DELIVERED", "EXECUTED", "FAILED"]),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mac: string }> }
) {
  try {
    const { mac } = await params;
    const macAddress = decodeURIComponent(mac);

    const device = await prisma.device.findUnique({
      where: { macAddress },
      select: { id: true },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const commands = await prisma.deviceCommand.findMany({
      where: {
        deviceId: device.id,
        status: "PENDING",
      },
      orderBy: { createdAt: "asc" },
    });

    // Parse JSON payload strings back to objects
    const parsedCommands = commands.map((cmd: { payload: string | null; [key: string]: unknown }) => ({
      ...cmd,
      payload: cmd.payload ? JSON.parse(cmd.payload) : null,
    }));

    return NextResponse.json({ commands: parsedCommands });
  } catch (error) {
    console.error("Get device commands error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ mac: string }> }
) {
  try {
    const { mac } = await params;
    const macAddress = decodeURIComponent(mac);

    const device = await prisma.device.findUnique({
      where: { macAddress },
      select: { id: true },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = ackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { commandId, status } = parsed.data;

    const command = await prisma.deviceCommand.findFirst({
      where: {
        id: commandId,
        deviceId: device.id,
      },
    });

    if (!command) {
      return NextResponse.json({ error: "Command not found" }, { status: 404 });
    }

    const updated = await prisma.deviceCommand.update({
      where: { id: commandId },
      data: {
        status,
        executedAt: status === "EXECUTED" || status === "FAILED" ? new Date() : null,
      },
    });

    return NextResponse.json({ command: updated });
  } catch (error) {
    console.error("Ack device command error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
