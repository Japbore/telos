# Backlog del Proyecto Telos

Este documento contiene tareas, mejoras y bugs conocidos que se han pospuesto para futuras versiones.

## Bugs Conocidos

| # | Descripción | Severidad | Detectado |
|---|-------------|-----------|-----------|
| 1 | Al completar todas las páginas, `status` del libro no cambia a `'finished'` — queda como `'active'` | Media | 2026-08-19 |
| 2 | La tabla del historial de lectura (divs con `flex`) no se alinea como tabla: las columnas tienen anchos desiguales entre sí y entre filas. El `flex` no respeta el ancho de columna de forma uniforme. | Media | 2026-08-19 |

## Futuras Mejoras (Ideas)

### Funcionalidad

- **Detalle de tiempo por registro (HU-06, RF-08):** En el historial de lectura, mostrar junto a cada entrada el tiempo estimado de lectura de ese día (`incremento_págs × vel_test`) y el tiempo medio diario entre esa entrada y la anterior. Referencia: `docs/versiones/v0.2.md`.

### PWA

- Añadir iconos PNG (192px y 512px) y actualizar `manifest.json` para que la app sea instalable.
- Implementar limpieza de cachés antiguos en `sw.js` mediante handler `activate`.

### Código

- Refactorizar `app.js` (383 líneas) en módulos más pequeños si crece más.
- Eliminar uso de `!important` en `styles.css` y usar mayor especificidad en su lugar.

### Documentación

- Corregir `docs/arquitectura.md`: cambiar "ES modules" por "scripts globales".
- Eliminar referencia a directorio `icons/` en `docs/arquitectura.md` o crearlo.
- Añadir campo `targetDate` al DDL de `docs/modelo-datos.md`.

## Changelog del Backlog

| Fecha | Cambio |
|-------|--------|
| 2026-08-19 | Backlog inicial — items derivados de auditoría técnica |
