import { notFound } from "next/navigation";
import Link from "next/link";
import { calculateEdpi, getGame, countryFlag } from "@/lib/data";
import { getPlayer, getPlayersByGame } from "@/lib/api";

export const dynamic = "force-dynamic";
import SpecRow from "@/components/SpecRow";
import CrosshairPreview from "@/components/CrosshairPreview";


export default async function PlayerPage({
  params,
}: {
  params: { game: string; playerId: string };
}) {
  const game = getGame(params.game);
  const player = await getPlayer(params.playerId);
  if (!game || !player || player.game !== game.id) return notFound();

  const teammates = (await getPlayersByGame(player.game)).filter(
    (p) => p.id !== player.id
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <Link
        href={`/${game.id}`}
        className="font-mono text-xs text-mute hover:text-signal"
      >
        ← {game.name}
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {countryFlag(player.countryCode)}
            </span>
            <h1 className="text-4xl font-medium text-paper">{player.handle}</h1>
          </div>
          <p className="mt-2 text-sm text-mute">
            {player.realName} · {player.team} · {player.role}
          </p>
        </div>
        <span
          className="rounded-sm border px-3 py-1 font-mono text-xs"
          style={{ borderColor: game.accent, color: game.accent }}
        >
          {game.name}
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mute">
            Ratón &amp; pantalla
          </h2>
          <div className="rounded-md border border-line bg-panel">
            <SpecRow label="DPI" value={player.settings.dpi} />
            <SpecRow label="Sensibilidad in-game" value={player.settings.inGameSens} />
            <SpecRow
              label="eDPI"
              value={calculateEdpi(player.settings.dpi, player.settings.inGameSens)}
            />
            <SpecRow label="Sensibilidad de Windows" value={player.settings.windowsSens} />
            <SpecRow label="Resolución" value={player.settings.resolution} />
            <SpecRow label="Aspect ratio" value={player.settings.aspectRatio} />
            <SpecRow label="Frecuencia" value={`${player.settings.hz} Hz`} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mute">
            Periféricos
          </h2>
          <div className="rounded-md border border-line bg-panel">
            <SpecRow label="Mouse" value={player.gear.mouse} />
            <SpecRow label="Mousepad" value={player.gear.mousepad} />
            <SpecRow label="Teclado" value={player.gear.keyboard} />
            <SpecRow label="Monitor" value={player.gear.monitor} />
            <SpecRow label="Auriculares" value={player.gear.headset} />
          </div>
        </section>
      </div>

      {player.crosshair && (
        <section className="mt-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mute">
            Mira
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]">
            <CrosshairPreview crosshair={player.crosshair} />
            <div className="rounded-md border border-line bg-panel">
              <SpecRow label="Color" value={player.crosshair.color} />
              <SpecRow label="Tamaño" value={player.crosshair.size} />
              <SpecRow label="Grosor" value={player.crosshair.thickness} />
              <SpecRow label="Separación" value={player.crosshair.gap} />
              <SpecRow
                label="Contorno"
                value={player.crosshair.outline ? "Activado" : "Desactivado"}
              />
              <SpecRow label="Código de mira" value={player.crosshair.code} />
            </div>
          </div>
        </section>
      )}

      <p className="mt-6 font-mono text-xs text-mute">
        Última actualización: {player.updatedAt}
      </p>

      <section className="mt-14">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-mute">
          Otros jugadores de {game.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {teammates.map((p) => (
            <Link
              key={p.id}
              href={`/${game.id}/${p.id}`}
              className="rounded-sm border border-line px-3 py-1.5 text-sm text-mute transition-colors hover:border-signal hover:text-signal"
            >
              {p.handle}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
