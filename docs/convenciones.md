# Telos — Convenciones y Reglas del Proyecto

Este documento es la referencia obligatoria para todo el desarrollo. Se sigue siempre.

---

## 1. Idioma

| Contexto                        | Idioma   |
|---------------------------------|----------|
| Código fuente (nombres)         | Inglés   |
| Comentarios en el código        | Español  |
| Documentación (`docs/`)         | Español  |
| Mensajes de commit              | Español  |
| Textos visibles en la UI        | Español  |

---

## 2. Nombrado

### JavaScript

| Elemento         | Convención         | Ejemplo                    |
|------------------|--------------------|----------------------------|
| Variables        | `camelCase`        | `pageCount`, `isCompleted` |
| Constantes       | `UPPER_SNAKE_CASE` | `DB_NAME`, `DB_VERSION`    |
| Funciones        | `camelCase`        | `addBook()`, `getAll()`    |
| Clases           | `PascalCase`       | `BookTracker`              |
| Archivos/módulos | `kebab-case`       | `db.js`, `app.js`          |
| Booleans         | prefijo `is/has`   | `isActive`, `hasLogs`      |

### CSS

| Elemento              | Convención         | Ejemplo                       |
|-----------------------|--------------------|-------------------------------|
| Clases Bootstrap      | usar tal cual      | `.btn`, `.list-group-item`    |
| Clases custom         | `kebab-case`       | `.telos-header`, `.book-card` |
| Variables custom      | `--kebab-case`     | `--telos-color-primary`       |
| IDs                   | `kebab-case`       | `#progress-list`, `#input`    |

> Las clases custom llevan prefijo `telos-` cuando hay riesgo de colisión con Bootstrap.

### HTML

| Elemento         | Convención         | Ejemplo                     |
|------------------|--------------------|-----------------------------|
| IDs              | `kebab-case`       | `id="progress-list"`        |
| Data attributes  | `kebab-case`       | `data-book-id="3"`          |

### Archivos

| Tipo             | Convención         | Ejemplo                     |
|------------------|--------------------|-----------------------------|
| HTML/CSS/JS      | `kebab-case`       | `index.html`, `app.js`      |
| Documentación    | `kebab-case`       | `modelo-datos.md`           |

---

## 3. Clean Code (Uncle Bob)

### Principios fundamentales

- **Nombres descriptivos** — El nombre de una variable, función o clase debe explicar su propósito sin necesidad de comentario.
- **Funciones pequeñas** — Una función hace UNA cosa. Si necesitas comentar un bloque dentro de una función, extráelo a otra función.
- **Sin comentarios obvios** — No `// incrementa el contador`. Sí `// IndexedDB requiere transacción explícita para escritura`.
- **Sin números mágicos** — Usar constantes con nombre. `DB_VERSION = 1`, no `1` suelto.
- **Sin código muerto** — No dejar código comentado. Git lo recuerda todo.

### Estructura de funciones

```javascript
// ✅ Bien: nombre descriptivo, hace una cosa
function calculateEstimatedEndDate(bookId) { ... }

// ❌ Mal: nombre genérico, hace demasiado
function handleClick(e) {
    // buscar libro, actualizar log, cambiar estado, recalcular fechas, actualizar UI...
}
```

### SOLID (adaptado a módulos JS)

| Principio | Aplicación en Telos |
|-----------|---------------------|
| **S** — Responsabilidad única | `db.js` = datos, `app.js` = UI y lógica de presentación |
| **O** — Abierto/cerrado | Las funciones de `db.js` no asumen nada de la UI |
| **D** — Inversión de dependencias | `app.js` depende de las funciones de `db.js`, nunca al revés |

---

## 4. Organización del Código

### Estructura de un archivo JS

```javascript
// ===========================================
// [Nombre del módulo] — [Descripción breve]
// ===========================================

// --- Constantes ---

// --- Estado / Variables del módulo ---

// --- Funciones privadas (helpers) ---

// --- Funciones públicas (API del módulo) ---

// --- Inicialización ---
```

### Reglas

- **Un módulo, una responsabilidad.**
- **Exportar solo lo necesario.** El resto es privado al módulo.
- **Dependencias al inicio** del archivo.
- **Máximo ~100-150 líneas por archivo** como guía. Si crece, considerar dividir.

---

## 5. CSS + Bootstrap

- **Bootstrap primero** — Usar clases de Bootstrap siempre que cubran la necesidad. CSS custom solo para lo que Bootstrap no resuelva.
- **Mobile-first** — Bootstrap ya es mobile-first. Los estilos custom siguen la misma filosofía.
- **Variables CSS** — Sobreescribir variables de Bootstrap en `:root` para personalizar el tema. Variables custom propias con prefijo `--telos-`.
- **Sin `!important`** — Si lo necesitas, la especificidad está mal.
- **`styles.css` es complementario** — No replicar lo que Bootstrap ya ofrece.

---

## 6. HTML

- **Semántico** — Usar `<main>`, `<section>`, `<header>`, `<button>`, no `<div>` para todo.
- **Accesible** — Todos los inputs con `<label>`, botones con texto o `aria-label`.
- **IDs únicos y descriptivos** — Para facilitar testing y referencia desde JS.

---

## 7. Control de Versiones (Git)

### Commits

- **Atómicos** — Un commit = un cambio lógico.
- **Mensaje en español**, formato: `tipo: descripción breve`
  - Tipos: `feat`, `fix`, `docs`, `refactor`, `style`, `test`

### Ramas

- `main` — Código desplegado y estable.

---

## 8. Documentación

- **`docs/` como fuente de verdad** — Toda decisión relevante queda documentada.
- **Actualizar antes de implementar** — Primero el doc (modelo de datos, requisitos), luego el código.
- **Enlaces cruzados** — Los documentos se referencian entre sí.

---

## 9. Testing

- **Lighthouse** — Auditoría PWA antes de cada versión.
- Verificación manual en navegador (consola de IndexedDB).

---

*Este documento se revisa y actualiza conforme evolucione el proyecto.*
