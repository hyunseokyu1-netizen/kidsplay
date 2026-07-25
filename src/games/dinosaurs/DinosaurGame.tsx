"use client";

import { useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const DINOS = [
  { icon: "🦖", ko: "티라노사우루스", en: "Tyrannosaurus" },
  { icon: "🦕", ko: "브라키오사우루스", en: "Brachiosaurus" },
  { icon: "🐊", ko: "스테고사우루스", en: "Stegosaurus" },
];
const DINO_COLORS = ["#67B86B", "#EE8D65", "#778DE3", "#D778A7"];

export function DinosaurGame({ language, onComplete }: GameProps) {
  const [phase, setPhase] = useState<"name" | "puzzle" | "color">("name");
  const [pieces, setPieces] = useState(0);
  const [dinoColor, setDinoColor] = useState(DINO_COLORS[0]);
  const speak = useSpeech(language);

  if (phase === "name") {
    return (
      <div>
        <p className="game-prompt">{tx(language, "목이 긴 공룡을 찾아요", "Find the dinosaur with a long neck")}</p>
        <div className="choice-grid dino-grid">
          {DINOS.map((dino, index) => <button key={dino.ko} className="dino-button" onClick={() => { speak(dino.ko, dino.en); if (index === 1) window.setTimeout(() => setPhase("puzzle"), 450); }}><EmojiIcon symbol={dino.icon} /><small>{language === "ko" ? dino.ko : dino.en}</small></button>)}
        </div>
      </div>
    );
  }

  if (phase === "puzzle") {
    return (
      <div>
        <p className="game-prompt">{tx(language, "공룡 뼈 조각을 모두 맞춰요", "Put all the dinosaur bones together")}</p>
        <div className="bone-board"><span className={pieces > 0 ? "found" : ""}><EmojiIcon symbol="🦴" /></span><span className={pieces > 1 ? "found" : ""}><EmojiIcon symbol="🦴" /></span><span className={pieces > 2 ? "found" : ""}><EmojiIcon symbol="🦴" /></span></div>
        <button className="dig-button" onClick={() => { const next = pieces + 1; setPieces(next); if (next === 3) window.setTimeout(() => setPhase("color"), 500); }}><EmojiIcon symbol="🪨" /><small>{tx(language, "톡톡 발굴!", "Tap to dig!")}</small></button>
      </div>
    );
  }

  return (
    <div>
      <p className="game-prompt">{tx(language, "공룡에게 멋진 색을 선물해요", "Give the dinosaur a wonderful color")}</p>
      <div className="big-dino" style={{ backgroundColor: dinoColor }}><EmojiIcon symbol="🦕" /></div>
      <div className="palette">
        {DINO_COLORS.map((color) => <button key={color} className="color-dot" style={{ background: color }} onClick={() => { setDinoColor(color); window.setTimeout(onComplete, 650); }} aria-label={color} />)}
      </div>
    </div>
  );
}
