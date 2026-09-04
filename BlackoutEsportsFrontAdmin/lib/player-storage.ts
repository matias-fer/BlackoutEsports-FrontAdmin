"use client";

import { useEffect, useState } from "react";
import { Player } from "@/lib/types";

const storageKeys = ["Data", "players", "blackout-esports-players"];

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return Boolean(
    player.id &&
      player.handle &&
      player.game &&
      player.settings &&
      player.gear
  );
}

function readStoredPlayers() {
  for (const key of storageKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const candidates = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && "players" in parsed
          ? (parsed as { players: unknown }).players
          : parsed && typeof parsed === "object" && "data" in parsed
            ? (parsed as { data: unknown }).data
            : [];
      const players = Array.isArray(candidates) && candidates.filter(isPlayer);
      if (players && players.length > 0) return players;
    } catch {
      continue;
    }
  }

  return null;
}

export function useStoredPlayers(fallback: Player[]) {
  const [players, setPlayers] = useState(fallback);

  useEffect(() => {
    const syncPlayers = () => {
      const storedPlayers = readStoredPlayers();
      if (storedPlayers) setPlayers(storedPlayers);
    };

    syncPlayers();
    window.addEventListener("storage", syncPlayers);
    return () => window.removeEventListener("storage", syncPlayers);
  }, []);

  return players;
}