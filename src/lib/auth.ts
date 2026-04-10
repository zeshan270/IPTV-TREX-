import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "iptv-trex-dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export function authenticateRequest(
  request: Request
): TokenPayload | null {
  const authHeader = request.headers.get("authorization");
  const token = getTokenFromHeader(authHeader);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
