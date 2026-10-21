import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export function encryptPassword(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
