import bcrypt from 'bcryptjs';

/**
 * Hashes a plaintext password using bcrypt
 * @param plaintextPassword - The plaintext password to hash
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(plaintextPassword: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(plaintextPassword, saltRounds);
}

/**
 * Compares a plaintext password with a hashed password
 * @param plaintextPassword - The plaintext password to compare
 * @param hashedPassword - The hashed password to compare against
 * @returns A promise that resolves to true if the passwords match, false otherwise
 */
export async function comparePassword(
  plaintextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plaintextPassword, hashedPassword);
}