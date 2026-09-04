"use client";

import Link from "next/link";
import { calculateEdpi, getFeaturedPlayers, getGames, countryFlag } from "@/lib/data";
import { useStoredPlayers } from "@/lib/player-storage";

export default function HomePage() {
  const games = getGames();
  const featured = useStoredPlayers(getFeaturedPlayers(4));

  return (
    <main>
      <section className="relative overflow-hidden border-b border-line bg-grid bg-grid bg-panel">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-signal">
            base de datos de configuraciones
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-medium leading-[1.05] text-paper sm:text-6xl">
            El setup exacto de los pros, jugador por jugador.
          </h1>
          <p className="mt-5 max-w-lg text-mute">
            DPI, sensibilidad, resolución, mira y periféricos — todo lo que
            necesitas para replicar cómo juegan, ordenado por título.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {games.map((g) => (
              <Link
                key={g.id}
                href={`/${g.id}`}
                className="rounded-sm border border-line px-4 py-2 text-sm text-paper transition-colors hover:border-signal hover:text-signal"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((g) => (
            <Link
              key={g.id}
              href={`/${g.id}`}
              className="group rounded-md border border-line bg-panel p-5 transition-colors hover:border-signal"
            >
              <div
                className="h-1 w-8 rounded-full"
                style={{ backgroundColor: g.accent }}
              />
              <h2 className="mt-4 text-lg font-medium text-paper">{g.name}</h2>
              <p className="mt-1 text-xs text-mute">{g.studio}</p>
              <p className="mt-3 text-sm text-mute">{g.tagline}</p>
              <span className="mt-4 inline-block font-mono text-xs text-signal opacity-0 transition-opacity group-hover:opacity-100">
                ver jugadores
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-mute">
          Actualizados recientemente
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/${p.game}/${p.id}`}
              className="rounded-md border border-line bg-panel2 p-5 transition-colors hover:border-signal"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg" aria-hidden>
                  {countryFlag(p.countryCode)}
                </span>
                <span className="font-mono text-[11px] text-mute">
                  {p.updatedAt}
                </span>
              </div>
              <h3 className="mt-3 text-base font-medium text-paper">
                {p.handle}
              </h3>
              <p className="text-xs text-mute">
                {p.team} · {p.role}
              </p>
              <p className="mt-3 font-mono text-sm text-signal">
                {p.settings.dpi} DPI · {p.settings.inGameSens} sens · {calculateEdpi(p.settings.dpi, p.settings.inGameSens)} eDPI
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
