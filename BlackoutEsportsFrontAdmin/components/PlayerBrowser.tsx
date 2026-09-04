"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Player } from "@/lib/types";
import { calculateEdpi, countryFlag } from "@/lib/data";
import { useStoredPlayers } from "@/lib/player-storage";

type SortKey = "handle" | "dpi" | "sens" | "updated";

export default function PlayerBrowser({ players }: { players: Player[] }) {
  const storedPlayers = useStoredPlayers(players);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = storedPlayers.filter(
      (p) =>
        !q ||
        p.handle.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
    );
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "handle":
          return a.handle.localeCompare(b.handle);
        case "dpi":
          return b.settings.dpi - a.settings.dpi;
        case "sens":
          return b.settings.inGameSens - a.settings.inGameSens;
        default:
          return a.updatedAt < b.updatedAt ? 1 : -1;
      }
    });
    return list;
  }, [storedPlayers, query, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por jugador, equipo o rol..."
          className="w-full rounded-sm border border-line bg-panel px-4 py-2.5 text-sm text-paper placeholder:text-mute focus:border-signal sm:max-w-sm"
        />
        <div className="flex items-center gap-2 text-xs text-mute">
          <span className="font-mono uppercase tracking-widest">orden</span>
          {(
            [
              ["updated", "reciente"],
              ["handle", "nombre"],
              ["dpi", "dpi"],
              ["sens", "sens"],
            ] as [SortKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`rounded-sm border px-2.5 py-1 font-mono transition-colors ${
                sort === key
                  ? "border-signal text-signal"
                  : "border-line text-mute hover:text-paper"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="rounded-md border border-line bg-panel px-5 py-8 text-center text-sm text-mute">
          Sin resultados para &quot;{query}&quot;. Prueba con otro nombre, equipo o rol.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-xs uppercase tracking-widest text-mute">
                <th className="px-4 py-3 font-mono font-normal">Jugador</th>
                <th className="hidden px-4 py-3 font-mono font-normal sm:table-cell">Equipo</th>
                <th className="hidden px-4 py-3 font-mono font-normal md:table-cell">Rol</th>
                <th className="px-4 py-3 font-mono font-normal">DPI</th>
                <th className="px-4 py-3 font-mono font-normal">Sens</th>
                <th className="hidden px-4 py-3 font-mono font-normal sm:table-cell">eDPI</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line bg-panel2 last:border-b-0 hover:bg-panel"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/${p.game}/${p.id}`}
                      className="flex items-center gap-2 text-paper hover:text-signal"
                    >
                      <span aria-hidden>{countryFlag(p.countryCode)}</span>
                      <span className="font-medium">{p.handle}</span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-mute sm:table-cell">{p.team}</td>
                  <td className="hidden px-4 py-3 text-mute md:table-cell">{p.role}</td>
                  <td className="px-4 py-3 font-mono text-signal">{p.settings.dpi}</td>
                  <td className="px-4 py-3 font-mono text-signal">{p.settings.inGameSens}</td>
                  <td className="hidden px-4 py-3 font-mono text-mute sm:table-cell">
                    {calculateEdpi(p.settings.dpi, p.settings.inGameSens)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
