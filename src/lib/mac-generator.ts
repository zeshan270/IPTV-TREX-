import prisma from "./db";

const MAC_PREFIX = "00:1A:79";

function randomHexPair(): string {
  return Math.floor(Math.random() * 256)
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");
}

function generateMac(): string {
  return `${MAC_PREFIX}:${randomHexPair()}:${randomHexPair()}:${randomHexPair()}`;
}

export async function generateUniqueMac(): Promise<string> {
  let mac = generateMac();
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const existing = await prisma.device.findUnique({
      where: { macAddress: mac },
    });
    if (!existing) return mac;
    mac = generateMac();
    attempts++;
  }

  throw new Error("Failed to generate unique MAC address after 100 attempts");
}

export function isValidMac(mac: string): boolean {
  return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac);
}
