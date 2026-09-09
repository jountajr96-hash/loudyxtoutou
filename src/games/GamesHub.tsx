import React, { useState } from "react";
import { Gamepad2 } from "lucide-react";
import CatchHearts from "./CatchHearts";
import SaveHeart from "./SaveHeart";
import SixtySecondDate from "./SixtySecondDate";
import DreamRoom from "./DreamRoom";
import StarWish from "./StarWish";
import HiddenKiss from "./HiddenKiss";
import SurpriseBox from "./SurpriseBox";
import Adventure from "./Adventure";

type GameId =
  | "catch-hearts"
  | "save-heart"
  | "sixty-date"
  | "dream-room"
  | "star-wish"
  | "hidden-kiss"
  | "surprise-box"
  | "adventure";

interface GameMeta {
  id: GameId;
  icon: string;
  title: string;
  tagline: string;
}

const GAMES: GameMeta[] = [
  { id: "catch-hearts", icon: "💗", title: "Catch My Hearts", tagline: "Catch falling hearts in your basket." },
  { id: "save-heart", icon: "🛡️", title: "Save Loudy's Heart", tagline: "Dodge the rain, collect the stars." },
  { id: "sixty-date", icon: "⏱️", title: "The 60-Second Date", tagline: "One minute, as much love as possible." },
  { id: "dream-room", icon: "🏡", title: "Build Our Dream Room", tagline: "Decorate a little room, just for us." },
  { id: "star-wish", icon: "⭐", title: "Star Collector", tagline: "Collect stars, then make a wish." },
  { id: "hidden-kiss", icon: "💋", title: "Find the Hidden Kiss", tagline: "It's hiding somewhere — find it in time." },
  { id: "surprise-box", icon: "🎁", title: "The Surprise Box", tagline: "Open every box to unlock the golden one." },
  { id: "adventure", icon: "🗺️", title: "Our Little Adventure", tagline: "A short journey through four little stages." },
];

export default function GamesHub() {
  const [active, setActive] = useState<GameId | null>(null);

  const close = () => setActive(null);

  const renderGame = () => {
    switch (active) {
      case "catch-hearts": return <CatchHearts onExit={close} />;
      case "save-heart": return <SaveHeart onExit={close} />;
      case "sixty-date": return <SixtySecondDate onExit={close} />;
      case "dream-room": return <DreamRoom onExit={close} />;
      case "star-wish": return <StarWish onExit={close} />;
      case "hidden-kiss": return <HiddenKiss onExit={close} />;
      case "surprise-box": return <SurpriseBox onExit={close} />;
      case "adventure": return <Adventure onExit={close} />;
      default: return null;
    }
  };

  return (
    <section id="games" className="section games-section">
      <div className="section-head">
        <span>07</span>
        <h2>Little Games, Made With Love</h2>
        <p>Eight tiny games, made just for Loudy. Tap one to play.</p>
      </div>
      <div className="games-grid">
        {GAMES.map((g) => (
          <button key={g.id} className="game-card" onClick={() => setActive(g.id)}>
            <span className="game-card-icon">{g.icon}</span>
            <h3>{g.title}</h3>
            <p>{g.tagline}</p>
            <span className="game-card-play"><Gamepad2 size={14} /> Play</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="overlay game-overlay-wrap" onClick={close}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()}>
            {renderGame()}
          </div>
        </div>
      )}
    </section>
  );
}
