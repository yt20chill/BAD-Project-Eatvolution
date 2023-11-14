import * as bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * @params plainPassword: supplied when signup
 */
export async function hashPassword(plainPassword: string) {
  const hash: string = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hash;
}
