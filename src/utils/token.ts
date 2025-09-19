import jwt from 'jsonwebtoken';

// Define the payload type
interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
}

/**
 * Generates a signed JWT token
 * @param payload - Object containing userId, tenantId, and role
 * @returns A signed JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  // Set token to expire in 24 hours
  const token = jwt.sign(payload, secret, { expiresIn: '24h' });
  return token;
}

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token - The JWT token string to verify
 * @returns The decoded payload if verification succeeds, null otherwise
 */
export function verifyToken(token: string): JWTPayload | null {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    // Token verification failed
    return null;
  }
}