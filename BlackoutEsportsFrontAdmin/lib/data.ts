import { games } from "@/data/players";

export function getGames() { return games; }
export function getGame(id: string) { return games.find((g) => g.id === id); }
export function calculateEdpi(dpi: number, inGameSens: number) {
  return Math.round(dpi * inGameSens * 100) / 100;
}
export function countryFlag(code: string) {
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
