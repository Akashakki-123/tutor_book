import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtUserPayload } from "../types/index.js";

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || (() => {
  throw new Error("JWT_SECRET is not defined in environment variables");
})();

const DEFAULT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export function generateToken(payload: JwtUserPayload, options?: SignOptions): string {
  const signOptions: SignOptions = {
    expiresIn: options?.expiresIn || DEFAULT_EXPIRES_IN,
    ...options,
  };
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export const signJwt = generateToken;

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null) {
      return decoded as JwtUserPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export const verifyJwt = verifyToken;
