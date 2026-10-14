import { createHash } from "node:crypto";

/** Vigencia máxima de un enlace de video: 15 minutos (RNF-01, FR-022). */
export const MAX_TTL_SECONDS = 900;
export const DEFAULT_TTL_SECONDS = 600;

interface SignInput {
  libraryId: string;
  videoId: string;
  tokenKey: string;
  ttlSeconds?: number;
  now?: Date;
}

/**
 * URL de embed de Bunny Stream con Token Authentication:
 * token = SHA-256 hex de (tokenKey + videoId + expires). Solo se emite en el servidor.
 */
export function signEmbedUrl({
  libraryId,
  videoId,
  tokenKey,
  ttlSeconds = DEFAULT_TTL_SECONDS,
  now = new Date(),
}: SignInput): { url: string; expiresAt: string } {
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0 || ttlSeconds > MAX_TTL_SECONDS) {
    throw new Error(`ttlSeconds debe estar entre 1 y ${MAX_TTL_SECONDS}`);
  }
  const expires = Math.floor(now.getTime() / 1000) + ttlSeconds;
  const token = createHash("sha256").update(`${tokenKey}${videoId}${expires}`).digest("hex");

  return {
    url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`,
    expiresAt: new Date(expires * 1000).toISOString(),
  };
}
