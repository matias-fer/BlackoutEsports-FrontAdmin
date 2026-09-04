import { GameInfo, Player } from "@/lib/types";

// Nota: todos los jugadores y equipos son ficticios, creados para este prototipo.

export const games: GameInfo[] = [
  {
    id: "valorant",
    name: "Valorant",
    studio: "Riot Games",
    accent: "#E32636",
    tagline: "Duelos de precisión táctica, 5v5.",
  },
];

export const players: Player[] = [
  {
    id: "prinzcl",
    handle: "Prinzcl",
    realName: "Maximiliano",
    team: "Blackout Esports",
    countryCode: "CL",
    role: "Duelista",
    game: "valorant",
    settings: {
      dpi: 1600,
      inGameSens: 0.11,
      edpi: 256,
      windowsSens: 6,
      hz: 360,
      resolution: "1920x1080",
      aspectRatio: "16:9 Nativa",
    },
    crosshair: {
      code: "0;c;1;s;1;P;o;1;f;0;0l;4;0v;4;0o;2;0a;1;0f;0;1b;0;S;o;1",
      color: "#00FF00",
      size: 4,
      thickness: 4,
      gap: 2,
      outline: true,
      opacity: 1,
      centerDot: false,
      outerLines: false,
    },
    gear: {
      mouse: "Rodent RX Superlight",
      mousepad: "Glide XL",
      keyboard: "Tenkey Zero HE",
      monitor: "Vantage 24.5\" 360Hz",
      headset: "Aural Pro X",
    },
    updatedAt: "2026-06-14",
  },
];
