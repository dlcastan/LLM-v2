# Configuración de la librería de Bunny Stream

Requisito: FR-020 y Principio II (el archivo fuente nunca debe ser accesible).

## Ajustes obligatorios (Video Library → Security / Encoding)

| Ajuste | Valor | Motivo |
|--------|-------|--------|
| Embed View Token Authentication | Activado | Solo se reproduce con token firmado emitido por el servidor |
| Token Authentication (CDN) | Activado | Impide acceder a los archivos HLS sin firma |
| MP4 Fallback | Desactivado | Evita un enlace de descarga directa |
| Keep Original Files | Desactivado | El archivo fuente no se conserva accesible |
| Allowed Referrers | Dominio del LMS | Impide embeber el video en otros sitios |
| Block Direct URL file access | Activado | Solo reproducción por embed |

## Variables de entorno

- `BUNNY_LIBRARY_ID`: id numérico de la librería.
- `BUNNY_TOKEN_KEY`: "Token Authentication Key" de la librería (nunca se versiona).
- `BUNNY_API_KEY`: API key de la cuenta, usada solo por `scripts/verify-bunny-config.ts`.

## Verificación

```bash
npm run verify:bunny
```

El script consulta la API de Bunny y termina con código 1 si algún ajuste obligatorio no cumple.
Ejecutarlo antes de cada despliegue a producción.
