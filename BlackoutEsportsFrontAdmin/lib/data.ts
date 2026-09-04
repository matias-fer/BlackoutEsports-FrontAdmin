import { games, players } from "@/data/players";
import { GameId } from "@/lib/types";

export function getGames() {
  return games;
}

export function getGame(id: string) {
  return games.find((g) => g.id === id);
}

export function getPlayersByGame(game: GameId) {
  return players.filter((p) => p.game === game);
}

export function getPlayer(id: string) {
  return players.find((p) => p.id === id);
}

export function calculateEdpi(dpi: number, inGameSens: number) {
  return Math.round(dpi * inGameSens * 100) / 100;
}

export function getFeaturedPlayers(count = 4) {
  return players
    .filter((player) => player.game === "valorant")
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, count);
}

export function searchPlayers(game: GameId, query: string) {
  const q = query.trim().toLowerCase();
  const pool = getPlayersByGame(game);
  if (!q) return pool;
  return pool.filter(
    (p) =>
      p.handle.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q)
  );
}

export function countryFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
