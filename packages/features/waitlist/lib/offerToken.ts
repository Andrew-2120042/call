import { createHash, randomBytes } from "node:crypto";

export const createOfferToken = (): { token: string; tokenHash: string } => {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashOfferToken(token) };
};

export const hashOfferToken = (token: string): string => createHash("sha256").update(token).digest("hex");

// Tokens are 32 random bytes in base64url; anything else can be rejected without a database lookup.
export const isWellFormedOfferToken = (token: string): boolean => /^[A-Za-z0-9_-]{43}$/.test(token);
