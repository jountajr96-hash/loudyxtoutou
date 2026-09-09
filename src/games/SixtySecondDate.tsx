import React, { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { logGameEvent } from "./api";

interface Action {
  id: string;
  icon: string;
  label: string;
  prompt: string;
}

const ACTIONS: Action[] = [
  { id: "flower", icon: "🌸", label: "Pick a flower", prompt: "Tap the flower before it wilts!" },
  { id: "heart", icon: "💗", label: "Catch a heart", prompt: "Tap the heart before it floats away!" },
  { id: "gift", icon: "🎁", label: "Choose a gift", prompt: "Pick the gift you'd give me." },
  { id: "question", icon: "❓", label: "Answer a question", prompt: "Do you still love me? (trick question)" },
  { id: "star", icon: "✨", label: "Find a hidden star", prompt: "Tap the star hiding in the sky." },
];

const DURATION = 60;

export default function SixtySecondDate({ onExit }: { onExit: () => void }) {
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [current, setCurrent] = useState<Action>(ACTIONS[0]);
  const [starPos, setStarPos] = useState({ x: 50, y: 50 });
  const finishedRef = useRef(false);

  const nextAction = () => {
    const pick = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    setCurrent(pick);
    if (pick.id === "star") {
      setStarPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 60 });
    }
  };

  const start = () => {
    setStarted(true);
    setTimeLeft(DURATION);
    setCompleted([]);
    finishedRef.current = false;
    setFinished(false);
    nextAction();
  };

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finishedRef.current = true;
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  useEffect(() => {
    if (finished) {
      logGameEvent("60-second-date", `Completed ${completed.length} romantic actions`);
    }
  }, [finished, completed.length]);

  const doAction = () => {
    if (!started || finished) return;
    setCompleted((c) => [...c, current.id]);
    nextAction();
  };

  return (
    <div className="game sixty-date">
      <div className="game-hud">
        <span>⏱ {timeLeft}s</span>
        <span>💞 {completed.length}</span>
        <button className="game-exit" onClick={onExit}>× Exit</button>
      </div>

      {!started && !finished && (
        <div className="date-intro">
          <h3>The 60-Second Date ⏱️</h3>
          <p>You have one minute to complete as many romantic little actions as you can.</p>
          <button className="primary" onClick={start}>Start our minute</button>
        </div>
      )}

      {started && !finished && (
        <div className="date-stage">
          <p className="date-prompt">{current.prompt}</p>
          <button
            className={`date-action-btn ${current.id === "star" ? "floating" : ""}`}
            style={current.id === "star" ? { left: `${starPos.x}%`, top: `${starPos.y}%` } : undefined}
            onClick={doAction}
          >
            <span className="date-icon">{current.icon}</span>
            {current.label}
          </button>
          <div className="date-progress">
            {ACTIONS.map((a) => (
              <span key={a.id} className={completed.includes(a.id) ? "done" : ""}>{a.icon}</span>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="game-overlay">
          <Heart size={30} fill="currentColor" />
          <h3>Our date lasted one minute, but my love lasts forever.</h3>
          <p>You completed {completed.length} little romantic moments. 💞</p>
          <div className="game-overlay-actions">
            <button className="secondary" onClick={start}>Date again</button>
            <button className="primary" onClick={onExit}>Back to games</button>
          </div>
        </div>
      )}
    </div>
  );
}
