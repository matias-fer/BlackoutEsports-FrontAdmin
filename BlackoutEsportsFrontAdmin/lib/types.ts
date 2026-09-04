export type GameId = "valorant";

export interface GameInfo {
  id: GameId;
  name: string;
  studio: string;
  accent: string;
  tagline: string;
}

export interface MouseSettings {
  dpi: number;
  inGameSens: number;
  edpi: number;
  windowsSens: number;
  hz: number;
  resolution: string;
  aspectRatio: string;
}

export interface Crosshair {
  code: string;
  color: string;
  size: number;
  thickness: number;
  gap: number;
  outline: boolean;
  opacity: number;
  centerDot: boolean;
  outerLines: boolean;
}

export interface Gear {
  mouse: string;
  mousepad: string;
  keyboard: string;
  monitor: string;
  headset: string;
}

export interface Player {
  id: string;
  handle: string;
  realName: string;
  team: string;
  countryCode: string;
  role: string;
  game: GameId;
  settings: MouseSettings;
  crosshair?: Crosshair;
  gear: Gear;
  updatedAt: string;
}
