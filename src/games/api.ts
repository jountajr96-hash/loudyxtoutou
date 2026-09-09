// Small helper used by every mini-game to (optionally) persist progress
// to the MySQL-backed API. If the API/DB is not configured (e.g. while
// just running `npm run dev` without the Node server), every call fails
// silently so the games always stay fully playable offline.

export async function saveRecord(table: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`/api/${table}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function logGameEvent(game: string, result: string) {
  // Best-effort game-completion log. Never throws, never blocks the UI.
  saveRecord("game_scores", { game, result }).catch(() => {});
}
