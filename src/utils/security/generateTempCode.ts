import { generateSecureToken } from "../security";

export function generateTempCode(): string {
  // Generates 8-character secure token
  return generateSecureToken(8);
}
