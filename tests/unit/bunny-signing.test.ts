import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { MAX_TTL_SECONDS, signEmbedUrl } from "@/lib/video/bunny";

const base = { libraryId: "123", videoId: "vid-1", tokenKey: "key-xyz" };

describe("firma de URLs de Bunny Stream (FR-020, FR-022)", () => {
  it("genera token SHA-256 de clave + videoId + expiración", () => {
    const now = new Date("2026-10-14T12:00:00Z");
    const { url, expiresAt } = signEmbedUrl({ ...base, ttlSeconds: 600, now });
    const expires = Math.floor(now.getTime() / 1000) + 600;
    const token = createHash("sha256").update(`key-xyz${"vid-1"}${expires}`).digest("hex");

    expect(url).toBe(`https://iframe.mediadelivery.net/embed/123/vid-1?token=${token}&expires=${expires}`);
    expect(expiresAt).toBe(new Date(expires * 1000).toISOString());
  });

  it("usa 10 minutos por defecto", () => {
    const now = new Date("2026-10-14T12:00:00Z");
    const { expiresAt } = signEmbedUrl({ ...base, now });
    expect(new Date(expiresAt).getTime() - now.getTime()).toBe(600_000);
  });

  it("nunca excede 15 minutos de vigencia (RNF-01)", () => {
    expect(MAX_TTL_SECONDS).toBe(900);
    expect(() => signEmbedUrl({ ...base, ttlSeconds: 901 })).toThrow();
    expect(() => signEmbedUrl({ ...base, ttlSeconds: 0 })).toThrow();
  });

  it("no incluye la clave de seguridad en la URL", () => {
    const { url } = signEmbedUrl(base);
    expect(url).not.toContain("key-xyz");
  });
});
