# Telos — Tracker de Desarrollo

## Estado Actual: v0.1.0 — MVP Básico

### Tareas

| #  | Tarea                                  | Estado     | Versión | Notas |
|----|----------------------------------------|------------|---------|-------|
| 1  | Definir modelo de datos (`books`, `logs`) | ✅ Completado | v0.1.0  |       |
| 2  | Crear `index.html` con estructura UI   | ✅ Completado | v0.1.0  | 4 vistas: setup, test, dashboard, config |
| 3  | Crear `styles.css` con diseño y tema   | ✅ Completado | v0.1.0  | Tema glass-morphism, variables `--telos-*` |
| 4  | Implementar CRUD en `db.js`            | ✅ Completado | v0.1.0  | `books` y `logs`, unique index bookId+date |
| 5  | Implementar lógica de alta de libro    | ✅ Completado | v0.1.0  | Incluye fecha objetivo opcional |
| 6  | Implementar test de velocidad de página| ✅ Completado | v0.1.0  | Cronómetro + entrada manual |
| 7  | Implementar cálculos de tiempo y fecha | ✅ Completado | v0.1.0  | Estimación global y reciente |
| 8  | Crear `sw.js` (Service Worker)         | ✅ Completado | v0.1.0  | Cache first, network fallback |
| 9  | Crear `manifest.json` y config PWA     | ✅ Completado | v0.1.0  | Sin icons — pendiente |

### Tareas Pendientes (Mejoras conocidas)

| #  | Tarea                                  | Prioridad | Notas |
|----|----------------------------------------|-----------|-------|
| 10 | Añadir iconos PWA (`manifest.json` + directorio `icons/`) | Alta | Sin iconos no se puede instalar |
| 11 | Limpiar cachés antiguos en `sw.js` (handler `activate`) | Media | Evita acumulación de cachés |
| 12 | Marcar `status: 'finished'` al completar todas las páginas | Media | Actualmente queda como `active` |
| 13 | Refactorizar `app.js` (383 líneas, guía: 100-150) | Baja | Separar en módulos si crece más |
| 14 | Eliminar `!important` en CSS (viola convenciones.md) | Baja | Aumentar especificidad en su lugar |
| 15 | Actualizar `docs/arquitectura.md`: menciona ES modules pero se usan scripts globales | Baja | Corregir documentación |
| 16 | Mostrar tiempo estimado de lectura y tiempo medio diario en cada registro del historial | Alta | HU-06, RF-08 — v0.2, ver `docs/versiones/v0.2.md`. Implementado en `app.js`, pendiente de prueba manual. |
| 17 | Historial compacto: alineación en una sola fila, fecha ajustada, botón Borrar en la misma línea | Alta | RF-09 — v0.2, ver `docs/versiones/v0.2.md` |

### Leyenda

- ⬚ Pendiente
- 🔨 En progreso
- ✅ Completado
- ⏸ Bloqueado

---

## Auditoría Técnica (2026-08-19)

Se realizó un análisis completo del estado del proyecto. La funcionalidad core de v0.1.0 está **implementada y funcional**. No hay bugs críticos. Los problemas son de documentación desactualizada y mejoras técnicas menores.

### Discrepancias Código ↔ Documentación

| Documento | Problema | Acción necesaria |
|-----------|----------|------------------|
| `docs/tracker.md` | Mostraba casi todo como pendiente | Corregido en esta actualización |
| `docs/arquitectura.md:53` | Dice "ES modules" pero app usa scripts globales | Corregir |
| `docs/arquitectura.md:80-82` | Lista directorio `icons/` que no existe | Crear iconos o eliminar referencia |
| `docs/modelo-datos.md` | No incluye campo `targetDate` en el DDL | Añadir al DDL y al pseudo-SQL |
| `docs/BACKLOG.md` | Vacío | Registrar mejoras pendientes |

---

## Historial

| Fecha      | Cambio                                         |
|------------|-------------------------------------------------|
| 2026-04-13 | Documentación base completada y planteamiento inicial |
| 2026-08-19 | Auditoría completa: todas las tareas v0.1.0 marcadas como completadas. Añadidas tareas pendientes y discrepancias documentadas |

---

*Actualizar este fichero conforme se avance en el desarrollo.*
