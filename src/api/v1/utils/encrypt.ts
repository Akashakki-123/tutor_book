import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

/**
 * Hash password synchronously (compatible with original encryptPassword)
 */
export function encryptPassword(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verify password synchronously (compatible with original verifyPassword)
 */
export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

/**
 * Hash password asynchronously
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password asynchronously
 */
export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

