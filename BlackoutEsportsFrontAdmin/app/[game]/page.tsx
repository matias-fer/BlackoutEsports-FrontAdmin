import { notFound } from "next/navigation";
import { getGame, getGames, getPlayersByGame } from "@/lib/data";
import PlayerBrowser from "@/components/PlayerBrowser";
import { GameId } from "@/lib/types";

export function generateStaticParams() {
  return getGames().map((g) => ({ game: g.id }));
}

export default function GamePage({ params }: { params: { game: string } }) {
  const game = getGame(params.game);
  if (!game) return notFound();

  const players = getPlayersByGame(game.id as GameId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div
        className="mb-1 h-1 w-10 rounded-full"
        style={{ backgroundColor: game.accent }}
      />
      <h1 className="mt-4 text-3xl font-medium text-paper">{game.name}</h1>
      <p className="mt-2 max-w-lg text-sm text-mute">{game.tagline}</p>
      <p className="mt-1 font-mono text-xs text-mute">
        {players.length} jugadores registrados
      </p>

      <div className="mt-10">
        <PlayerBrowser players={players} />
      </div>
    </main>
  );
}
