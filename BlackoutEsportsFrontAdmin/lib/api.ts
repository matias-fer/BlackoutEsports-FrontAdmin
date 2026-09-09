import "server-only";
import { GameId, Player } from "@/lib/types";

async function request<T>(path: string): Promise<T | undefined> {
  const base = (process.env.BACKEND_URL || "http://localhost:8081").replace(/\/+$/, "");
  const response = await fetch(`${base}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Backend request failed (${response.status})`);
  return response.json() as Promise<T>;
}

async function list(path: string): Promise<Player[]> {
  const result = await request<Player[]>(path);
  if (!Array.isArray(result)) throw new Error("Invalid players response");
  return result;
}

export function getPlayersByGame(game: GameId) {
  return list(`/api/games/${encodeURIComponent(game)}/players`);
}

export function getPlayer(id: string) {
  return request<Player>(`/api/players/${encodeURIComponent(id)}`);
}

export function getFeaturedPlayers(count = 4) {
  return list(`/api/games/valorant/players/featured?count=${count}`);
}

export function searchPlayers(game: GameId, query: string) {
  return list(`/api/games/${encodeURIComponent(game)}/players/search?query=${encodeURIComponent(query)}`);
}
