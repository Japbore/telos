# Telos — Modelo de Datos

## Motor de Almacenamiento

**IndexedDB** — Base de datos NoSQL integrada en el navegador. Transaccional, asíncrona, soporta índices.

- **Base de datos:** `telos-db`
- **Versión:** `1`

---

## DDL (Pseudo-SQL para IndexedDB)

Este DDL es la **fuente de verdad** del modelo de datos. Cualquier cambio en la estructura de IndexedDB debe reflejarse aquí primero.

```sql
-- ============================================
-- Telos Database Schema — IndexedDB
-- Versión: 1
-- Última actualización: 2026-04-13
-- ============================================

CREATE DATABASE telos-db VERSION 1;

-- --------------------------------------------
-- Object Store: books
-- Descripción: Libros registrados en el sistema
-- --------------------------------------------
CREATE OBJECT STORE books (
    id            INTEGER     PRIMARY KEY AUTOINCREMENT,
    title         TEXT        NOT NULL,       -- Título del libro
    totalPages    INTEGER     NOT NULL,       -- Número total de páginas a leer
    pageSpeedMs   INTEGER     NOT NULL,       -- Tiempo que tarda el usuario en leer 1 página (en milisegundos)
    status        TEXT        DEFAULT 'active',-- Estado del libro: 'active', 'finished', 'reset'
    createdAt     INTEGER     NOT NULL        -- Timestamp (Date.now())
);

CREATE INDEX idx_books_status  ON books (status);

-- --------------------------------------------
-- Object Store: logs
-- Descripción: Avances de lectura por día
-- --------------------------------------------
CREATE OBJECT STORE logs (
    id            INTEGER     PRIMARY KEY AUTOINCREMENT,
    bookId        INTEGER     NOT NULL,       -- Relación con el libro
    date          TEXT        NOT NULL,       -- Fecha del registro en formato 'YYYY-MM-DD'
    lastPageRead  INTEGER     NOT NULL,       -- Última página alcanzada y registrada en este día
    createdAt     INTEGER     NOT NULL        -- Timestamp (Date.now())
);

CREATE INDEX idx_logs_bookId ON logs (bookId);
CREATE INDEX idx_logs_bookId_date ON logs (bookId, date); -- Útil para mantener 1 registro por día
```

---

## Mapeo DDL → Código JavaScript

El pseudo-DDL anterior se implementará así en `db.js`:

```javascript
// Abrir/crear la base de datos
const request = indexedDB.open('telos-db', 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // CREATE OBJECT STORE books
    const storeBooks = db.createObjectStore('books', {
        keyPath: 'id',
        autoIncrement: true
    });
    storeBooks.createIndex('status', 'status', { unique: false });

    // CREATE OBJECT STORE logs
    const storeLogs = db.createObjectStore('logs', {
        keyPath: 'id',
        autoIncrement: true
    });
    storeLogs.createIndex('bookId', 'bookId', { unique: false });
    // Considerar crear un índice compuesto o manejar la unicidad diaria a nivel de código
    storeLogs.createIndex('bookId_date', ['bookId', 'date'], { unique: true });
};
```

---

## Reglas de Mantenimiento

1. **Todo cambio de schema empieza aquí** — Editar el DDL primero, luego el código.
2. **Incrementar versión** — Al cambiar el schema, subir la versión de la DB y actualizar `onupgradeneeded`.
3. **Manejo de registros diarios** — Solo debe haber un registro válido por día y por libro activo. Si se guarda un avance y ya había un log para la misma fecha (ej, '2026-04-13'), la aplicación sobreescribirá o actualizará ese último `lastPageRead`. Esto se puede hacer gracias al Unique Index en `['bookId', 'date']` o mediante lógica en `db.js`.

---

## Historial de Cambios

| Versión DB | Fecha      | Cambio                        |
|------------|------------|-------------------------------|
| 1          | 2026-04-13 | Schema inicial: object store `books` y `logs` |

---

*Este documento es la fuente de verdad del modelo de datos.*
