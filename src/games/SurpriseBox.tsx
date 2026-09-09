import React, { useEffect, useRef, useState } from "react";
import { Heart, Gift } from "lucide-react";
import { logGameEvent } from "./api";

type ChallengeId = "taps" | "quiz" | "type" | "reaction" | "slider";

interface Box {
  id: ChallengeId;
  title: string;
}

const BOXES: Box[] = [
  { id: "taps", title: "Box 1" },
  { id: "quiz", title: "Box 2" },
  { id: "type", title: "Box 3" },
  { id: "reaction", title: "Box 4" },
  { id: "slider", title: "Box 5" },
];

function TapChallenge({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  return (
    <div className="box-challenge">
      <p>Tap the heart 5 times.</p>
      <button className="box-tap" onClick={() => { const nn = n + 1; setN(nn); if (nn >= 5) onDone(); }}>💗 {n}/5</button>
    </div>
  );
}

function QuizChallenge({ onDone }: { onDone: () => void }) {
  const [wrong, setWrong] = useState(false);
  return (
    <div className="box-challenge">
      <p>Who is Toutou's favorite person?</p>
      <div className="game-overlay-actions">
        <button className="secondary" onClick={() => { setWrong(true); setTimeout(() => setWrong(false), 900); }}>Someone else</button>
        <button className="primary" onClick={onDone}>Loudy</button>
      </div>
      {wrong && <small style={{ color: "#e5a7ba" }}>Wrong answer, try again 😉</small>}
    </div>
  );
}

function TypeChallenge({ onDone }: { onDone: () => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="box-challenge">
      <p>Type the word <b>LOVE</b> to unlock this box.</p>
      <input
        className="box-input"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          if (e.target.value.trim().toUpperCase() === "LOVE") onDone();
        }}
        placeholder="Type here..."
      />
    </div>
  );
}

function ReactionChallenge({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  const [missed, setMissed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delay = 900 + Math.random() * 1800;
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div className="box-challenge">
      <p>Wait for it... then catch the heart!</p>
      {visible ? (
        <button className="box-tap" onClick={onDone}>💗 Catch it!</button>
      ) : (
        <button
          className="box-tap dim"
          onClick={() => { setMissed(true); setTimeout(() => setMissed(false), 700); }}
        >
          Wait...
        </button>
      )}
      {missed && <small style={{ color: "#e5a7ba" }}>Too soon! Wait for the heart 💗</small>}
    </div>
  );
}

function SliderChallenge({ onDone }: { onDone: () => void }) {
  const [val, setVal] = useState(0);
  return (
    <div className="box-challenge">
      <p>Fill the love meter to 100%.</p>
      <input
        className="box-slider"
        type="range"
        min={0}
        max={100}
        value={val}
        onChange={(e) => {
          const v = Number(e.target.value);
          setVal(v);
          if (v >= 100) onDone();
        }}
      />
      <small>{val}%</small>
    </div>
  );
}

export default function SurpriseBox({ onExit }: { onExit: () => void }) {
  const [completed, setCompleted] = useState<ChallengeId[]>([]);
  const [open, setOpen] = useState<ChallengeId | null>(null);
  const [goldenOpen, setGoldenOpen] = useState(false);
  const allDone = completed.length === BOXES.length;

  useEffect(() => {
    if (allDone) logGameEvent("surprise-box", "Unlocked the Golden Box");
  }, [allDone]);

  const finish = (id: ChallengeId) => {
    setCompleted((c) => (c.includes(id) ? c : [...c, id]));
    setOpen(null);
  };

  const renderChallenge = (id: ChallengeId) => {
    switch (id) {
      case "taps": return <TapChallenge onDone={() => finish(id)} />;
      case "quiz": return <QuizChallenge onDone={() => finish(id)} />;
      case "type": return <TypeChallenge onDone={() => finish(id)} />;
      case "reaction": return <ReactionChallenge onDone={() => finish(id)} />;
      case "slider": return <SliderChallenge onDone={() => finish(id)} />;
    }
  };

  return (
    <div className="game surprise-box">
      <div className="game-hud">
        <span>🎁 {completed.length}/{BOXES.length} opened</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>

      {!goldenOpen && (
        <>
          <p className="game-hint">Open every box to unlock the Golden Box.</p>
          <div className="box-row">
            {BOXES.map((b) => (
              <button
                key={b.id}
                className={`surprise-box-item ${completed.includes(b.id) ? "opened" : ""}`}
                onClick={() => !completed.includes(b.id) && setOpen(b.id)}
              >
                <span>{completed.includes(b.id) ? "💌" : "🎁"}</span>
                {b.title}
              </button>
            ))}
          </div>

          {allDone && (
            <button className="golden-box" onClick={() => setGoldenOpen(true)}>
              <Gift size={22} /> Open the Golden Box
            </button>
          )}

          {open && (
            <div className="overlay" onClick={() => setOpen(null)}>
              <div className="full-letter" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setOpen(null)}>×</button>
                <span>MINI CHALLENGE</span>
                <h2>{BOXES.find((b) => b.id === open)?.title}</h2>
                {renderChallenge(open)}
              </div>
            </div>
          )}
        </>
      )}

      {goldenOpen && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          <h3>You opened the Golden Box. ✨</h3>
          <p>Inside is the biggest surprise of all: every little challenge you just did was really just me finding new ways to say I love you.</p>
          <button className="primary" onClick={onExit}>Back to games</button>
        </div>
      )}
    </div>
  );
}
