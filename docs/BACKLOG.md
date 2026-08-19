# Backlog del Proyecto Telos

Este documento contiene tareas, mejoras y bugs conocidos que se han pospuesto para futuras versiones.

## Bugs Conocidos

| # | Descripción | Severidad | Detectado |
|---|-------------|-----------|-----------|
| 1 | Al completar todas las páginas, `status` del libro no cambia a `'finished'` — queda como `'active'` | Media | 2026-08-19 |

## Futuras Mejoras (Ideas)

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
