import React, { useState } from "react";
import { Heart, Save } from "lucide-react";
import { saveRecord, logGameEvent } from "./api";

interface Item {
  id: string;
  icon: string;
  label: string;
}

const PALETTE: Item[] = [
  { id: "sofa", icon: "🛋️", label: "Sofa" },
  { id: "bed", icon: "🛏️", label: "Bed" },
  { id: "flowers", icon: "💐", label: "Flowers" },
  { id: "photos", icon: "🖼️", label: "Photos" },
  { id: "lights", icon: "🪔", label: "Lights" },
  { id: "cat", icon: "🐱", label: "Little cat" },
  { id: "couple", icon: "👩‍❤️‍👨", label: "Couple objects" },
];

const ROWS = 3;
const COLS = 4;

export default function DreamRoom({ onExit }: { onExit: () => void }) {
  const [selected, setSelected] = useState<Item | null>(null);
  const [grid, setGrid] = useState<Record<number, Item>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const placeItem = (cell: number, item: Item | null) => {
    if (!item) return;
    setGrid((g) => ({ ...g, [cell]: item }));
  };

  const onDrop = (cell: number, e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const item = PALETTE.find((p) => p.id === id) || null;
    placeItem(cell, item);
  };

  const clearCell = (cell: number) => {
    setGrid((g) => {
      const next = { ...g };
      delete next[cell];
      return next;
    });
  };

  const filledCount = Object.keys(grid).length;

  const saveRoom = async () => {
    setSaving(true);
    const layoutObj = Object.fromEntries(
      Object.entries(grid).map(([cell, item]) => [cell, { id: item.id, label: item.label }])
    );
    const ok = await saveRecord("dream_rooms", {
      layout: JSON.stringify(layoutObj),
    });
    logGameEvent("build-our-dream-room", `Room saved with ${filledCount} items (db: ${ok ? "yes" : "local only"})`);
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="game dream-room">
      <div className="game-hud">
        <span>🏡 {filledCount}/{ROWS * COLS} placed</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>

      {!saved && (
        <>
          <p className="game-hint">Tap or drag an item, then drop it into the room. Tap a filled cell to remove it.</p>
          <div className="dream-palette">
            {PALETTE.map((it) => (
              <button
                key={it.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", it.id)}
                className={`dream-item ${selected?.id === it.id ? "picked" : ""}`}
                onClick={() => setSelected(it)}
              >
                <span>{it.icon}</span>
                {it.label}
              </button>
            ))}
          </div>

          <div className="dream-grid">
            {Array.from({ length: ROWS * COLS }).map((_, cell) => (
              <div
                key={cell}
                className={`dream-cell ${grid[cell] ? "filled" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(cell, e)}
                onClick={() => (grid[cell] ? clearCell(cell) : placeItem(cell, selected))}
              >
                {grid[cell] ? <span className="dream-cell-icon">{grid[cell].icon}</span> : <span className="dream-cell-empty">+</span>}
              </div>
            ))}
          </div>

          <button className="primary" onClick={saveRoom} disabled={saving || filledCount === 0}>
            <Save size={16} /> {saving ? "Saving our room..." : "Save this room as a memory"}
          </button>
        </>
      )}

      {saved && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          <h3>Our dream room has been saved.</h3>
          <p>{filledCount} little pieces of home, made by you, for us. 🏡</p>
          <div className="game-overlay-actions">
            <button className="secondary" onClick={() => { setSaved(false); }}>Redecorate</button>
            <button className="primary" onClick={onExit}>Back to games</button>
          </div>
        </div>
      )}
    </div>
  );
}
