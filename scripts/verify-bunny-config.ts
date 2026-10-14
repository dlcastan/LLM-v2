/**
 * Verifica que la librería de Bunny Stream cumple la configuración obligatoria
 * (FR-020, Principio II). Termina con código 1 si algún ajuste no cumple.
 */
const libraryId = process.env.BUNNY_LIBRARY_ID;
const apiKey = process.env.BUNNY_API_KEY;

if (!libraryId || !apiKey) {
  console.error("Faltan BUNNY_LIBRARY_ID o BUNNY_API_KEY");
  process.exit(1);
}

interface Library {
  EnableTokenAuthentication?: boolean;
  EnableMP4Fallback?: boolean;
  KeepOriginalFiles?: boolean;
  AllowedReferrers?: string[];
}

async function main() {
  const res = await fetch(`https://api.bunny.net/videolibrary/${libraryId}`, {
    headers: { AccessKey: apiKey!, accept: "application/json" },
  });
  if (!res.ok) {
    console.error(`No se pudo consultar la librería (HTTP ${res.status})`);
    process.exit(1);
  }
  const lib = (await res.json()) as Library;

  const checks: Array<[string, boolean]> = [
    ["Token Authentication activado", lib.EnableTokenAuthentication === true],
    ["MP4 Fallback desactivado", lib.EnableMP4Fallback === false],
    ["Keep Original Files desactivado", lib.KeepOriginalFiles === false],
    ["Referer restringido", Array.isArray(lib.AllowedReferrers) && lib.AllowedReferrers.length > 0],
  ];

  let failed = false;
  for (const [name, ok] of checks) {
    console.log(`${ok ? "OK  " : "FALLA"} ${name}`);
    if (!ok) failed = true;
  }
  process.exit(failed ? 1 : 0);
}

main();
