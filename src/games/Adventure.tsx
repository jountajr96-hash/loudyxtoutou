import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { logGameEvent } from "./api";

const FLOWER_SPOTS = 9;
const BRIDGE_STEPS = 6;
const STAR_GOAL = 6;

interface StageProps {
  onDone: () => void;
}

function FindFlowerStage({ onDone }: StageProps) {
  const [flowerAt] = useState(() => Math.floor(Math.random() * FLOWER_SPOTS));
  return (
    <div className="adv-stage">
      <h3>1. Find the flower 🌸</h3>
      <p>Somewhere in this little field, a flower is waiting for you.</p>
      <div className="adv-grid">
        {Array.from({ length: FLOWER_SPOTS }).map((_, i) => (
          <button key={i} className="adv-cell" onClick={() => i === flowerAt && onDone()}>
            {i === flowerAt ? "" : "🌿"}
          </button>
        ))}
      </div>
    </div>
  );
}

function BridgeStage({ onDone }: StageProps) {
  const [step, setStep] = useState(0);
  return (
    <div className="adv-stage">
      <h3>2. Cross the bridge 🌉</h3>
      <p>Take it one careful step at a time.</p>
      <div className="bridge-track">
        {Array.from({ length: BRIDGE_STEPS }).map((_, i) => (
          <span key={i} className={i < step ? "plank crossed" : "plank"}>🪵</span>
        ))}
      </div>
      <button
        className="primary"
        onClick={() => {
          const ns = step + 1;
          setStep(ns);
          if (ns >= BRIDGE_STEPS) onDone();
        }}
      >
        Step forward
      </button>
    </div>
  );
}

function StarsStage({ onDone }: StageProps) {
  const [count, setCount] = useState(0);
  const [positions, setPositions] = useState(() =>
    Array.from({ length: 5 }, () => ({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 70 }))
  );
  const collect = (i: number) => {
    setPositions((p) => p.map((pos, idx) => (idx === i ? { x: 10 + Math.random() * 80, y: 10 + Math.random() * 70 } : pos)));
    setCount((c) => {
      const nc = c + 1;
      if (nc >= STAR_GOAL) onDone();
      return nc;
    });
  };
  return (
    <div className="adv-stage">
      <h3>3. Collect the stars ⭐</h3>
      <p>{count}/{STAR_GOAL} stars collected.</p>
      <div className="adv-sky">
        {positions.map((pos, i) => (
          <button key={i} className="tap-star" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onClick={() => collect(i)}>⭐</button>
        ))}
      </div>
    </div>
  );
}

function LetterStage({ onDone }: StageProps) {
  const [opened, setOpened] = useState(false);
  return (
    <div className="adv-stage">
      <h3>4. Open the love letter 💌</h3>
      {!opened ? (
        <button className="primary" onClick={() => setOpened(true)}>Open the letter</button>
      ) : (
        <div className="adv-letter">
          <p>My Loudy, every stage of this little adventure is really just our story: a flower found by chance, a bridge we're learning to cross together, small wishes collected one by one, and words that were always waiting to be said.</p>
          <p>Thank you for being my favorite adventure.</p>
          <button className="primary" onClick={onDone}>Finish our adventure</button>
        </div>
      )}
    </div>
  );
}

const STAGES = [FindFlowerStage, BridgeStage, StarsStage, LetterStage];
const STAGE_NAMES = ["Find the flower", "Cross the bridge", "Collect the stars", "Open the love letter"];

export default function Adventure({ onExit }: { onExit: () => void }) {
  const [stage, setStage] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) logGameEvent("our-little-adventure", "Completed all 4 stages of the adventure");
  }, [finished]);

  const advance = () => {
    if (stage >= STAGES.length - 1) {
      setFinished(true);
    } else {
      setStage((s) => s + 1);
    }
  };

  const Current = STAGES[stage];

  return (
    <div className="game adventure">
      <div className="game-hud">
        <span>🗺️ Stage {Math.min(stage + 1, STAGES.length)}/{STAGES.length}</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>

      {!finished && (
        <>
          <div className="adv-progress">
            {STAGE_NAMES.map((n, i) => (
              <span key={n} className={i < stage ? "done" : i === stage ? "active" : ""}>{n}</span>
            ))}
          </div>
          <Current onDone={advance} />
        </>
      )}

      {finished && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          <h3>Our little adventure is complete.</h3>
          <p>Four stages, one story — ours. 🗺️</p>
          <button className="primary" onClick={onExit}>Back to games</button>
        </div>
      )}
    </div>
  );
}
