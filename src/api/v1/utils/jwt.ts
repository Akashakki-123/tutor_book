import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtUserPayload } from '../types/index.js';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'default_jwt_secret';
const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token
 */
export function generateToken(payload: JwtUserPayload, options?: SignOptions): string {
  const signOptions: SignOptions = {
    expiresIn: (options?.expiresIn || DEFAULT_EXPIRES_IN) as SignOptions['expiresIn'],
    ...options,
  };
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

// Alias to preserve original function name
export const signJwt = generateToken;

/**
 * Verify and decode a JWT token
 * Returns decoded payload if valid, null otherwise
 */
export function verifyToken(token: string): JwtUserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null) {
      return decoded as JwtUserPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// Alias to preserve original function name
export const verifyJwt = verifyToken;

