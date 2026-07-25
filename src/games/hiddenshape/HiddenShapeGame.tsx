"use client";

import { useState } from "react";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const ITEMS = [
  { type: "triangle", x: 12, y: 63 },
  { type: "circle", x: 28, y: 30 },
  { type: "square", x: 45, y: 70 },
  { type: "diamond", x: 67, y: 26 },
  { type: "pentagon", x: 82, y: 64 },
  { type: "circle", x: 88, y: 18 },
];

function HiddenShape({ type }: { type: string }) {
  return <span className={`hidden-shape-figure ${type}`} />;
}

export function HiddenShapeGame({ language, onComplete }: GameProps) {
  const [round, setRound] = useState(0);
  const [camera, setCamera] = useState({ x: 50, y: 50 });
  const [captured, setCaptured] = useState<number[]>([]);
  const targetIndex = [3, 0, 4, 2, 1][round];
  const target = ITEMS[targetIndex];

  const find = (index: number) => {
    const item = ITEMS[index];
    setCamera({ x: item.x, y: item.y });
    if (index !== targetIndex) return;
    window.setTimeout(() => {
      const next = [...captured, index];
      setCaptured(next);
      if (round === 4) window.setTimeout(onComplete, 500);
      else setRound(round + 1);
    }, 420);
  };

  return (
    <div className="hidden-game">
      <p className="game-prompt">{tx(language, "숨은 모양을 눌러 카메라로 찍어요!", "Tap the hidden shape to move the camera!")}</p>
      <div className="hidden-target"><span>{tx(language, "찾을 모양", "Find")}</span><HiddenShape type={target.type} /><strong>{round + 1}/5</strong></div>
      <div className="hidden-scene">
        <div className="space-planet planet-one" /><div className="space-planet planet-two" /><div className="space-rock rock-one" /><div className="space-rock rock-two" />
        {ITEMS.map((item, index) => !captured.includes(index) && (
          <button key={index} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => find(index)} aria-label={item.type}><HiddenShape type={item.type} /></button>
        ))}
        <div className="camera-frame" style={{ left: `${camera.x}%`, top: `${camera.y}%` }}><span /><i /></div>
      </div>
    </div>
  );
}
