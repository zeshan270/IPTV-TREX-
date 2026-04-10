import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

const updateDeviceSchema = z.object({
  deviceName: z.string().min(1).optional(),
  deviceModel: z.string().optional(),
  appVersion: z.string().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  notes: z.string().optional(),
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

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        playlists: {
          include: { playlist: true },
        },
        commands: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error("Get device error:", error);
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
    const parsed = updateDeviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.deviceName !== undefined) updateData.deviceName = data.deviceName;
    if (data.deviceModel !== undefined) updateData.deviceModel = data.deviceModel;
    if (data.appVersion !== undefined) updateData.appVersion = data.appVersion;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
      if (data.isActive && !existing.activatedAt) {
        updateData.activatedAt = new Date();
      }
    }

    const device = await prisma.device.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ device });
  } catch (error) {
    console.error("Update device error:", error);
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

    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    await prisma.device.delete({ where: { id } });

    return NextResponse.json({ message: "Device deleted" });
  } catch (error) {
    console.error("Delete device error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
