import React, { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { logGameEvent } from "./api";

type Mode = "easy" | "hard";

const DECOYS = ["🌸", "✨", "🎀", "🦋", "🌙", "🍓", "🌹", "☁️"];

export default function HiddenKiss({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);
  const [kissAt, setKissAt] = useState(0);
  const [bonusAt, setBonusAt] = useState<number | null>(null);
  const [found, setFound] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [decoys, setDecoys] = useState<string[]>([]);
  const totalRounds = 5;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const newRound = (m: Mode) => {
    const c = m === "easy" ? 4 : 5;
    const r = m === "easy" ? 3 : 4;
    setCols(c);
    setRows(r);
    const total = c * r;
    const kiss = Math.floor(Math.random() * total);
    let bonus: number | null = null;
    if (Math.random() < 0.3) {
      do { bonus = Math.floor(Math.random() * total); } while (bonus === kiss);
    }
    setKissAt(kiss);
    setBonusAt(bonus);
    setDecoys(Array.from({ length: total }, () => DECOYS[Math.floor(Math.random() * DECOYS.length)]));
    setTimeLeft(m === "easy" ? 8 : 5);
  };

  const start = (m: Mode) => {
    setMode(m);
    setFound(0);
    setRound(1);
    setStatus("playing");
    newRound(m);
  };

  useEffect(() => {
    if (!mode || status !== "playing") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          setStatus("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [mode, round, status]);

  useEffect(() => {
    if (status === "lost") {
      logGameEvent("find-hidden-kiss", `Found ${found} kisses in ${mode} mode before missing round ${round}`);
    }
    if (status === "won") {
      logGameEvent("find-hidden-kiss", `Found all kisses in ${mode} mode with ${found} bonus catches`);
    }
  }, [status]);

  const clickCell = (i: number) => {
    if (status !== "playing" || !mode) return;
    if (i === kissAt) {
      const nf = found + 1;
      setFound(nf);
      if (round >= totalRounds) {
        clearTimer();
        setStatus("won");
      } else {
        setRound((r) => r + 1);
        newRound(mode);
      }
    } else if (i === bonusAt) {
      setFound((f) => f + 2);
      setBonusAt(null);
    }
  };

  if (!mode) {
    return (
      <div className="game hidden-kiss">
        <div className="game-hud">
          <span>💋 Find the Hidden Kiss</span>
          <button className="game-exit" onClick={onExit}>× Exit</button>
        </div>
        <div className="date-intro">
          <h3>Choose your difficulty</h3>
          <p>A kiss is hiding somewhere. Find it before time runs out — 5 rounds, harder each time.</p>
          <div className="game-overlay-actions">
            <button className="secondary" onClick={() => start("easy")}>Easy mode</button>
            <button className="primary" onClick={() => start("hard")}>Hard mode</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game hidden-kiss">
      <div className="game-hud">
        <span>💋 {found} found</span>
        <span>Round {Math.min(round, totalRounds)}/{totalRounds}</span>
        <span>⏱ {timeLeft}s</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>

      {status === "playing" && (
        <div className="kiss-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {decoys.map((d, i) => (
            <button key={i} className="kiss-cell" onClick={() => clickCell(i)}>
              {i === bonusAt ? "✨" : d}
            </button>
          ))}
        </div>
      )}

      {status !== "playing" && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          {status === "won" ? (
            <>
              <h3>You found every hidden kiss. 💋</h3>
              <p>{found} kisses collected in {mode} mode.</p>
            </>
          ) : (
            <>
              <h3>The kiss got away this time.</h3>
              <p>You found {found} before it hid too well. Try again?</p>
            </>
          )}
          <div className="game-overlay-actions">
            <button className="secondary" onClick={() => start(mode)}>Play again</button>
            <button className="primary" onClick={onExit}>Back to games</button>
          </div>
        </div>
      )}
    </div>
  );
}
