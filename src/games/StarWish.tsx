import React, { useEffect, useRef, useState } from "react";
import { Heart, Send } from "lucide-react";
import { saveRecord, logGameEvent } from "./api";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
}

const GOAL = 15;

export default function StarWish({ onExit }: { onExit: () => void }) {
  const [stars, setStars] = useState<Star[]>([]);
  const [collected, setCollected] = useState(0);
  const [ready, setReady] = useState(false);
  const [wish, setWish] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const idRef = useRef(0);

  const spawnStar = () => {
    idRef.current += 1;
    setStars((s) => [
      ...s,
      { id: idRef.current, x: 5 + Math.random() * 90, y: 5 + Math.random() * 82, size: 16 + Math.random() * 14 },
    ]);
  };

  useEffect(() => {
    for (let i = 0; i < 8; i++) spawnStar();
  }, []);

  const collect = (id: number) => {
    setStars((s) => s.filter((st) => st.id !== id));
    setCollected((c) => {
      const nc = c + 1;
      if (nc >= GOAL) setReady(true);
      return nc;
    });
    setTimeout(spawnStar, 250 + Math.random() * 500);
  };

  const submitWish = async () => {
    if (!wish.trim() || saving) return;
    setSaving(true);
    const ok = await saveRecord("wishes", {
      wish: wish.trim(),
    });
    logGameEvent("star-collector-wish", `Wish saved (db: ${ok ? "yes" : "local only"}): ${wish.trim().slice(0, 60)}`);
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="game star-wish">
      <div className="game-hud">
        <span>⭐ {collected}/{GOAL}</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>

      {!ready && (
        <>
          <p className="game-hint">Tap the stars scattered across our night sky.</p>
          <div className="night-sky">
            {stars.map((s) => (
              <button
                key={s.id}
                className="tap-star"
                style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }}
                onClick={() => collect(s.id)}
              >
                ⭐
              </button>
            ))}
          </div>
        </>
      )}

      {ready && !saved && (
        <div className="wish-form">
          <h3>You gathered enough stars for a wish. ⭐</h3>
          <p>Write your wish below — it will be saved in our little universe.</p>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="I wish for..."
            rows={5}
          />
          <button className="primary" onClick={submitWish} disabled={saving || !wish.trim()}>
            <Send size={16} /> {saving ? "Saving your wish..." : "Save my wish"}
          </button>
        </div>
      )}

      {saved && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          <h3>Your wish has been saved in our little universe.</h3>
          <p>May it come true, my love. ⭐</p>
          <button className="primary" onClick={onExit}>Back to games</button>
        </div>
      )}
    </div>
  );
}
