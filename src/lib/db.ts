import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDbUrl(): string {
  if (process.env.DATABASE_URL) {
    // If it's a relative file: URL, resolve relative to project root
    const raw = process.env.DATABASE_URL;
    if (raw.startsWith("file:./") || raw.startsWith("file:dev")) {
      const filePath = raw.replace("file:", "");
      return "file:" + path.resolve(process.cwd(), filePath);
    }
    return raw;
  }
  return "file:" + path.resolve(process.cwd(), "dev.db");
}

function createPrismaClient(): PrismaClient {
  const url = getDbUrl();
  const adapter = new PrismaLibSql({ url });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
