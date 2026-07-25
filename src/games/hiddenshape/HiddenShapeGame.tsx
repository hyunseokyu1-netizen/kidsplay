"use client";

import { useEffect, useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const SHAPE_NAMES: Record<string, { ko: string; en: string }> = {
  circle: { ko: "동그라미", en: "circle" },
  square: { ko: "네모", en: "square" },
  triangle: { ko: "세모", en: "triangle" },
  diamond: { ko: "마름모", en: "diamond" },
  pentagon: { ko: "오각형", en: "pentagon" },
};
const ITEMS = [
  { type: "triangle", x: 12, y: 63 }, { type: "circle", x: 28, y: 30 },
  { type: "square", x: 45, y: 70 }, { type: "diamond", x: 67, y: 26 },
  { type: "pentagon", x: 82, y: 64 }, { type: "circle", x: 88, y: 18 },
  { type: "triangle", x: 53, y: 22 }, { type: "square", x: 20, y: 80 },
  { type: "diamond", x: 73, y: 78 }, { type: "pentagon", x: 38, y: 48 },
  { type: "circle", x: 57, y: 52 }, { type: "triangle", x: 92, y: 50 },
];
const TARGETS = [1, 3, 0, 4, 2, 5, 6, 3, 7, 1];

function HiddenShape({ type }: { type: string }) {
  return <span className={`hidden-shape-figure ${type}`} />;
}

export function HiddenShapeGame({ language, onComplete }: GameProps) {
  const [round, setRound] = useState(0);
  const [camera, setCamera] = useState({ x: 50, y: 50 });
  const [flash, setFlash] = useState(false);
  const speak = useSpeech(language);
  const visibleCount = Math.min(4 + Math.floor(round / 2), ITEMS.length);
  const visibleItems = ITEMS.slice(0, visibleCount);
  const targetIndex = TARGETS[round];
  const target = ITEMS[targetIndex];
  const name = SHAPE_NAMES[target.type];

  useEffect(() => {
    const timer = window.setTimeout(() => speak(`${name.ko}를 찾아보세요`, `Find the ${name.en}`), 180);
    return () => window.clearTimeout(timer);
  }, [name.en, name.ko, speak]);

  const find = (index: number) => {
    const item = ITEMS[index];
    setCamera({ x: item.x, y: item.y });
    if (index !== targetIndex) return;
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      if (round === TARGETS.length - 1) onComplete();
      else setRound(round + 1);
    }, 420);
  };

  return (
    <div className="hidden-game">
      <button className="spoken-prompt game-prompt" onClick={() => speak(`${name.ko}를 찾아보세요`, `Find the ${name.en}`)}>
        🔊 {tx(language, `${name.ko}를 찾아 카메라로 찍어요!`, `Find the ${name.en} with the camera!`)}
      </button>
      <div className="hidden-target"><span>{tx(language, "찾을 모양", "Find")}</span><HiddenShape type={target.type} /><strong>{round + 1}/{TARGETS.length} · {visibleCount}{tx(language, "개", " shapes")}</strong></div>
      <div className={`hidden-scene ${flash ? "flash" : ""}`}>
        <div className="space-planet planet-one" /><div className="space-planet planet-two" /><div className="space-rock rock-one" /><div className="space-rock rock-two" />
        {visibleItems.map((item, index) => (
          <button key={index} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => find(index)} aria-label={SHAPE_NAMES[item.type][language]}>
            <HiddenShape type={item.type} />
          </button>
        ))}
        <div className="camera-frame" style={{ left: `${camera.x}%`, top: `${camera.y}%` }}><span /><i /></div>
      </div>
    </div>
  );
}
