import React, { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { logGameEvent } from "./api";

type Kind = "normal" | "gold" | "broken";

interface Falling {
  id: number;
  x: number;
  y: number;
  kind: Kind;
  speed: number;
}

const GOAL = 25;
const FIELD_W = 100; // percentage-based field
const BASKET_W = 16; // percentage width of basket

function randomKind(): Kind {
  const r = Math.random();
  if (r < 0.12) return "gold";
  if (r < 0.28) return "broken";
  return "normal";
}

export default function CatchHearts({ onExit }: { onExit: () => void }) {
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<Falling[]>([]);
  const [caught, setCaught] = useState(0);
  const [points, setPoints] = useState(0);
  const [finished, setFinished] = useState(false);
  const idRef = useRef(0);
  const basketRef = useRef(50);
  const fieldRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const spawnRef = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    basketRef.current = basketX;
  }, [basketX]);

  const moveBasket = (clientX: number) => {
    const field = fieldRef.current;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(BASKET_W / 2, Math.min(100 - BASKET_W / 2, pct));
    setBasketX(clamped);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => moveBasket(e.clientX);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) moveBasket(e.touches[0].clientX);
    };
    const field = fieldRef.current;
    field?.addEventListener("mousemove", onMove);
    field?.addEventListener("touchmove", onTouch, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setBasketX((x) => Math.max(BASKET_W / 2, x - 6));
      if (e.key === "ArrowRight") setBasketX((x) => Math.min(100 - BASKET_W / 2, x + 6));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      field?.removeEventListener("mousemove", onMove);
      field?.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!finishedRef.current) {
        spawnRef.current += dt;
        setItems((prev) => {
          let next = prev.map((it) => ({ ...it, y: it.y + it.speed * dt * 100 }));
          if (spawnRef.current > 0.55) {
            spawnRef.current = 0;
            idRef.current += 1;
            next = [
              ...next,
              {
                id: idRef.current,
                x: 6 + Math.random() * (FIELD_W - 12),
                y: -8,
                kind: randomKind(),
                speed: 0.35 + Math.random() * 0.35,
              },
            ];
          }
          const caughtNow: Falling[] = [];
          const survivors: Falling[] = [];
          for (const it of next) {
            const inBasketRow = it.y > 84 && it.y < 96;
            const inBasketX = Math.abs(it.x - basketRef.current) < BASKET_W / 2 + 3;
            if (inBasketRow && inBasketX) {
              caughtNow.push(it);
            } else if (it.y < 104) {
              survivors.push(it);
            }
          }
          if (caughtNow.length) {
            let addPoints = 0;
            let addCaught = 0;
            for (const c of caughtNow) {
              if (c.kind === "gold") {
                addPoints += 50;
                addCaught += 1;
              } else if (c.kind === "broken") {
                addPoints -= 15;
              } else {
                addPoints += 10;
                addCaught += 1;
              }
            }
            setPoints((p) => Math.max(0, p + addPoints));
            if (addCaught) setCaught((c) => c + addCaught);
          }
          return survivors;
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (caught >= GOAL && !finished) {
      finishedRef.current = true;
      setFinished(true);
      logGameEvent("catch-my-hearts", `Caught ${caught} hearts, ${points} points`);
    }
  }, [caught, finished, points]);

  return (
    <div className="game catch-hearts">
      <div className="game-hud">
        <span>💗 {caught}/{GOAL}</span>
        <span>✨ {points} pts</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>
      <div className="catch-field" ref={fieldRef}>
        {items.map((it) => (
          <div
            key={it.id}
            className={`falling-heart ${it.kind}`}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
          >
            {it.kind === "gold" ? "💛" : it.kind === "broken" ? "💔" : "💗"}
          </div>
        ))}
        <div className="basket" style={{ left: `${basketX}%` }}>
          🧺
        </div>
      </div>
      {finished && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          <h3>You caught {caught} little pieces of my love.</h3>
          <p>{points} points of pure heart. 💗</p>
          <button className="primary" onClick={onExit}>Back to games</button>
        </div>
      )}
      {!finished && <p className="game-hint">Move your mouse, finger, or arrow keys to slide the basket.</p>}
    </div>
  );
}
