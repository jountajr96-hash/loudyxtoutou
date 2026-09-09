import React, { useEffect, useRef, useState } from "react";
import { Heart, Shield } from "lucide-react";
import { logGameEvent } from "./api";

interface Obj {
  id: number;
  x: number;
  y: number;
  kind: "rain" | "star";
  speed: number;
}

const WIN_LEVEL = 3;
const HEART_W = 10;

export default function SaveHeart({ onExit }: { onExit: () => void }) {
  const [heartX, setHeartX] = useState(50);
  const [objs, setObjs] = useState<Obj[]>([]);
  const [lives, setLives] = useState(3);
  const [stars, setStars] = useState(0);
  const [level, setLevel] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const heartRef = useRef(50);
  const fieldRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const spawnRef = useRef(0);
  const statusRef = useRef<"playing" | "won" | "lost">("playing");
  const levelRef = useRef(1);
  const livesRef = useRef(3);

  useEffect(() => { heartRef.current = heartX; }, [heartX]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  const moveHeart = (clientX: number) => {
    const field = fieldRef.current;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setHeartX(Math.max(HEART_W / 2, Math.min(100 - HEART_W / 2, pct)));
  };

  useEffect(() => {
    const field = fieldRef.current;
    const onMove = (e: MouseEvent) => moveHeart(e.clientX);
    const onTouch = (e: TouchEvent) => { if (e.touches[0]) moveHeart(e.touches[0].clientX); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setHeartX((x) => Math.max(HEART_W / 2, x - 6));
      if (e.key === "ArrowRight") setHeartX((x) => Math.min(100 - HEART_W / 2, x + 6));
    };
    field?.addEventListener("mousemove", onMove);
    field?.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      field?.removeEventListener("mousemove", onMove);
      field?.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // level-up every 15s, timer
  useEffect(() => {
    const t = setInterval(() => {
      if (statusRef.current !== "playing") return;
      setSeconds((s) => {
        const ns = s + 1;
        if (ns % 15 === 0) setLevel((l) => Math.min(WIN_LEVEL + 1, l + 1));
        return ns;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (level > WIN_LEVEL && statusRef.current === "playing") {
      setStatus("won");
      logGameEvent("save-loudys-heart", `Survived to level ${level - 1} with ${stars} stars`);
    }
  }, [level, stars]);

  useEffect(() => {
    if (lives <= 0 && statusRef.current === "playing") {
      setStatus("lost");
      logGameEvent("save-loudys-heart", `Heart needed help — ${stars} stars collected`);
    }
  }, [lives, stars]);

  useEffect(() => {
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (statusRef.current === "playing") {
        spawnRef.current += dt;
        const spawnRate = Math.max(0.35, 0.9 - levelRef.current * 0.15);
        setObjs((prev) => {
          let next = prev.map((o) => ({ ...o, y: o.y + o.speed * dt * 100 }));
          if (spawnRef.current > spawnRate) {
            spawnRef.current = 0;
            idRef.current += 1;
            const isStar = Math.random() < 0.4;
            next = [
              ...next,
              {
                id: idRef.current,
                x: 6 + Math.random() * 88,
                y: -8,
                kind: isStar ? "star" : "rain",
                speed: (0.4 + Math.random() * 0.3) * (1 + levelRef.current * 0.18),
              },
            ];
          }
          const survivors: Obj[] = [];
          let hitRain = 0;
          let gotStars = 0;
          for (const o of next) {
            const inRow = o.y > 82 && o.y < 96;
            const inX = Math.abs(o.x - heartRef.current) < HEART_W / 2 + 3;
            if (inRow && inX) {
              if (o.kind === "star") gotStars += 1;
              else hitRain += 1;
            } else if (o.y < 104) {
              survivors.push(o);
            }
          }
          if (gotStars) setStars((s) => s + gotStars);
          if (hitRain) setLives((l) => Math.max(0, l - hitRain));
          return survivors;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="game save-heart">
      <div className="game-hud">
        <span>{"❤️".repeat(Math.max(0, lives))}{"🖤".repeat(Math.max(0, 3 - lives))}</span>
        <span>⭐ {stars}</span>
        <span>Lv {Math.min(level, WIN_LEVEL)}</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>
      <div className="rain-field" ref={fieldRef}>
        {objs.map((o) => (
          <div key={o.id} className={`falling-obj ${o.kind}`} style={{ left: `${o.x}%`, top: `${o.y}%` }}>
            {o.kind === "star" ? "⭐" : "☔"}
          </div>
        ))}
        <div className="protected-heart" style={{ left: `${heartX}%` }}>
          <Shield size={16} /> 💗
        </div>
      </div>
      {status !== "playing" && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          {status === "won" ? (
            <>
              <h3>Thank you for always protecting my heart.</h3>
              <p>You collected {stars} stars along the way. ⭐</p>
            </>
          ) : (
            <>
              <h3>The heart needs a little more protecting.</h3>
              <p>You collected {stars} stars — try again?</p>
            </>
          )}
          <div className="game-overlay-actions">
            <button className="primary" onClick={onExit}>Back to games</button>
          </div>
        </div>
      )}
      {status === "playing" && <p className="game-hint">Dodge the rain ☔, collect the stars ⭐. Survive 3 levels.</p>}
    </div>
  );
}
