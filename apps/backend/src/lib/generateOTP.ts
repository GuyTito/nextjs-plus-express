import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { sql } from "./db";
import { type VerificationType } from "shared";

export const generateOTP = async (
  userId: string,
  email: string,
  type: VerificationType,
): Promise<string> => {
  const plaintext = randomInt(100000, 1000000).toString();
  const hashed = await bcrypt.hash(plaintext, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await sql`
    INSERT INTO verification_tokens (user_id, hashed_code, type, target, expires_at)
    VALUES (${userId}, ${hashed}, ${type}::verification_type, ${email}, ${expiresAt})
  `;

  return plaintext;
};
