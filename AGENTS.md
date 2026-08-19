# Guía para agentes de Telos

## Propósito

Telos es una PWA móvil para registrar el progreso de lectura de un libro y estimar el tiempo y la fecha de finalización. Funciona sin backend, cuentas ni sincronización remota; los datos se almacenan localmente en IndexedDB.

## Fuentes de contexto

- Este archivo contiene las reglas operativas que deben seguir los agentes.
- `docs/definicion-sistema.md` describe la visión, objetivos y alcance.
- `docs/arquitectura.md` describe la arquitectura técnica y el despliegue.
- `docs/modelo-datos.md` describe el esquema de IndexedDB.
- `docs/versiones/` contiene requisitos por versión.
- `docs/convenciones.md` contiene las convenciones de código y documentación.
- `docs/tracker.md` registra el estado del desarrollo.

Cuando exista una contradicción, prevalecen el código ejecutado y las decisiones más recientes documentadas. La contradicción debe corregirse en el archivo correspondiente.

## Arquitectura actual

- `index.html`: interfaz de la aplicación de una sola página.
- `styles.css`: estilos propios y tema visual; Bootstrap 5 se carga por CDN.
- `app.js`: estado de la UI, eventos, flujo de vistas, cronómetro, cálculos y renderizado.
- `db.js`: acceso a IndexedDB y operaciones de libros y registros.
- `sw.js`: caché y funcionamiento offline.
- `manifest.json`: configuración instalable de la PWA.

No hay framework JavaScript, `package.json`, proceso de build, API ni servidor de aplicación.

## Reglas de mantenimiento del contexto

1. Antes de modificar código, leer este archivo y la documentación relevante para la tarea.
2. Si cambia la arquitectura, el modelo de datos, una convención o una regla de trabajo, actualizar primero este archivo y los documentos de `docs/` afectados.
3. Si cambia solo la implementación de una funcionalidad, actualizar el código y `docs/tracker.md` cuando corresponda.
4. Después de cambios relevantes, actualizar el resumen persistente del repositorio para que no contradiga el código.
5. No borrar ni sobrescribir cambios existentes del usuario.
6. No crear commits ni ramas salvo petición explícita.
7. Mantener los cambios pequeños, coherentes con el código existente y sin refactorizaciones ajenas a la tarea.

## Convenciones esenciales

- Código y nombres técnicos en inglés.
- Textos visibles, comentarios y documentación en español.
- JavaScript vanilla con nombres `camelCase`; constantes en `UPPER_SNAKE_CASE`.
- IDs y clases propias en `kebab-case`; variables CSS con prefijo `--telos-`.
- Mantener separadas las responsabilidades: `db.js` gestiona datos y `app.js` gestiona UI y presentación.
- Preferir Bootstrap antes de añadir CSS propio.
- Mantener diseño responsive y orientado a móvil.

## Persistencia

La base se llama `telos-db` y actualmente está en la versión 1. Tiene los almacenes `books` y `logs`.

- `books`: libro, páginas totales, fecha objetivo, velocidad por página, estado y fecha de creación.
- `logs`: libro, fecha, última página leída y fecha de creación.
- Debe existir como máximo un registro por libro y fecha; guardarlo de nuevo actualiza el registro existente.
- Todo cambio de esquema requiere actualizar `docs/modelo-datos.md`, incrementar `DB_VERSION` e implementar la migración correspondiente en `db.js`.

## Estado conocido que debe revisarse al tocar estas áreas

### Código

- **`sw.js`** no implementa limpieza de cachés antiguos mediante `activate`. Puede acumular versiones anteriores.
- **`app.js`** tiene 383 líneas (guía del proyecto: 100-150). Considerar separar en módulos si crece más.
- **`styles.css`** usa `!important` en reglas de botones e inputs (violación de convenciones.md).
- Al completar todas las páginas se muestra "Completado", pero el libro no cambia explícitamente a `status: 'finished'`.

### Documentación

- **`docs/arquitectura.md:53`** menciona "ES modules" pero la aplicación usa scripts globales.
- **`docs/arquitectura.md:80-82`** lista un directorio `icons/` que no existe en el repositorio.
- **`docs/modelo-datos.md`** no incluye el campo `targetDate` en el DDL, aunque existe en el código.
- **`docs/BACKLOG.md`** está vacío; las mejoras pendientes se registran en `docs/tracker.md`.

### PWA

- **`manifest.json`** tiene `icons: []`. Sin iconos la app no se puede instalar desde el navegador.

## Validación

Para cambios de interfaz o comportamiento, verificar la aplicación en un navegador y comprobar la consola. Para cambios de PWA, revisar instalación, caché y modo offline. Para cambios de IndexedDB, probar creación, actualización y lectura de datos existentes.

Al finalizar, indicar qué archivos se modificaron y qué validación se ejecutó.
