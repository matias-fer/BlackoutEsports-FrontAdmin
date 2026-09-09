# Blackout Esports

Web funcional de configuraciones de jugadores pro, hecha con el arquetipo estándar de
**Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

Todos los jugadores, equipos y marcas de periféricos son **ficticios**, creados
para este prototipo.

## Estructura (arquetipo App Router)

```
app/
  layout.tsx              # layout raíz, fuentes, navbar
  page.tsx                # home: hero + grid de juegos + destacados
  globals.css
  [game]/
    page.tsx               # listado + búsqueda/orden de jugadores de un juego
    [playerId]/
      page.tsx              # ficha completa: DPI, sens, mira, periféricos
  not-found.tsx
components/
  Navbar.tsx
  PlayerBrowser.tsx        # buscador/orden, client component
  CrosshairPreview.tsx      # dibuja la mira en CSS
  SpecRow.tsx
data/
  players.ts               # "base de datos" en memoria (juegos + jugadores)
lib/
  types.ts
  data.ts                  # funciones de acceso a los datos
```

## Cómo ejecutarlo

Requiere Node.js 18.18+ (recomendado 20 LTS).

```bash
cd BlackoutEsports
npm install
npm run dev
```

Abre http://localhost:3000

Build de producción:

```bash
npm run build
npm run start
```

## Qué hace ya

- Home con los 4 juegos (Valorant, CS2, Fortnite, Apex) y jugadores destacados.
- Listado por juego con búsqueda en vivo (nombre/equipo/rol) y orden (reciente,
  nombre, DPI, sensibilidad), tabla estilo hoja de datos.
- Ficha de jugador: DPI, sensibilidad, eDPI, resolución, aspect ratio, Hz,
  periféricos y, si aplica, vista previa de la mira dibujada en CSS.
- Rutas dinámicas `[game]/[playerId]` generadas estáticamente (`generateStaticParams`).
- Diseño propio (no genérico): paleta "panel de telemetría" oscura, tipografía
  Space Grotesk + JetBrains Mono para los datos numéricos, motivo de mira/retícula.

## Qué ampliaría primero

1. **Datos reales y persistentes**: mover `data/players.ts` a una base de datos
   (Postgres/SQLite con Prisma, o un CMS headless) para poder agregar/editar
   jugadores sin tocar código y permitir contribuciones de la comunidad.
2. **Comparador de jugadores**: seleccionar 2-3 jugadores y verlos lado a lado
   (como ya haces con `comparison_card` en otras partes de esta conversación) —
   es la función más pedida en este tipo de sitios.
3. **Filtros combinados en el listado por juego**: por equipo, rol, rango de DPI
   o eDPI, no solo búsqueda de texto libre.
4. **Panel de "convertir mi sensibilidad"**: calculadora que traduce la sens/DPI
   de un jugador a la sensibilidad equivalente en tu propio juego o mouse.
5. **Imágenes reales** de jugadores/gear vía `next/image` con un CDN, y compartir
   ficha de jugador (Open Graph dinámico por jugador).


## Conexión con el backend de settings

La portada, los listados y las fichas consultan la API de BlackoutEsports-Backend
(rama feature-settings). Los jugadores de ejemplo y localStorage ya no alimentan estas pantallas.

1. Levanta el backend con `docker compose up --build` desde su raíz.
2. Copia `.env.example` a `.env.local` en esta carpeta.
3. Configura `BACKEND_URL` con la dirección del backend, sin `/api` al final.
4. Instala las dependencias y ejecuta `pnpm dev`. Para abrir ambas aplicaciones,
   ejecuta una con `pnpm dev --port 3000` y la otra con `pnpm dev --port 3001`.

Ambas aplicaciones deben apuntar a la misma instancia del backend para compartir datos.
En producción, `localhost` debe reemplazarse por una dirección accesible desde el servidor de Next.js.
Las consultas se hacen desde ese servidor, sin caché y con un tiempo límite de 10 segundos;
no requieren abrir CORS a los dos navegadores. Si la API falla, se muestra un error con reintento.
Un jugador inexistente devuelve la página 404. Los jugadores nuevos se pueden consultar sin recompilar.

Esta integración cubre las pantallas existentes de consulta. Los formularios de login y registro
no tienen autenticación conectada; el backend de settings tampoco ofrece esos endpoints.
No hay todavía pantallas de alta, edición o eliminación de jugadores en este frontend.
