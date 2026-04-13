# Telos — Definición del Sistema

## ¿Qué es Telos?

Telos es una utilidad para calcular el tiempo de lectura que necesitas para terminar ese libro que te ocupa ahora mismo. Es una **PWA (Progressive Web App)** que no requiere servidor backend: todos los datos se almacenan localmente en el dispositivo del usuario.

## Objetivos

1. **Simplicidad** — Una app mínima y funcional, sin ruido.
2. **Sin servidor** — Cero coste de infraestructura backend. Solo hosting estático de HTML/CSS/JS.
3. **Offline first** — Funciona sin conexión a internet después de la primera carga.
4. **Instalable** — Se puede "instalar" en el móvil desde el navegador como una app nativa.
5. **Privacidad total** — Los datos nunca salen del dispositivo.

## Alcance

| Incluido                              | Excluido                              |
|---------------------------------------|---------------------------------------|
| Registro de lectura y estimación par aun libro | Cuentas de usuario / autenticación    |
| Almacenamiento local (IndexedDB)      | Sincronización entre dispositivos     |
| Funcionamiento offline                | Backend / API                         |
| Instalación como PWA                  | Notificaciones push                   |
| Hosting estático gratuito             | Integración con tiendas/supermercados |

## Usuarios Objetivo

Cualquier persona que quiera registrar su avance y previsión de fin de lectura de un libro, sin necesidad de crearse una cuenta ni depender de servicios externos.

## Restricciones Técnicas

- **Sin frameworks JS**: HTML + JS vanilla. Bootstrap 5 por CDN para UI.
- **Sin dependencias npm**: No hay proceso de build.
- **Sin base de datos remota**: Solo IndexedDB en el navegador.
- **Hosting gratuito**: GitHub Pages (o similar: Netlify, Cloudflare Pages).

---

*Documento vivo — se actualizará conforme evolucione la visión del sistema.*
