"use client";

import { useEffect, useMemo, useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const SHAPES = [
  { id: "circle", ko: "동그라미", en: "circle" },
  { id: "triangle", ko: "세모", en: "triangle" },
  { id: "square", ko: "네모", en: "square" },
  { id: "diamond", ko: "마름모", en: "diamond" },
  { id: "pentagon", ko: "오각형", en: "pentagon" },
];

export function ShapeGame({ language, onComplete }: GameProps) {
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const target = SHAPES[step];
  const choices = useMemo(() => {
    const count = Math.min(3 + step, SHAPES.length);
    const rotated = SHAPES.slice(step).concat(SHAPES.slice(0, step));
    return rotated.slice(0, count).sort((a, b) => ((a.id.length + step) % 5) - ((b.id.length + step) % 5));
  }, [step]);

  useEffect(() => {
    const timer = window.setTimeout(() => speak(`${target.ko}를 찾아요`, `Find the ${target.en}`), 180);
    return () => window.clearTimeout(timer);
  }, [speak, target.en, target.ko]);

  const choose = (id: string) => {
    if (id !== target.id) return;
    speak(`맞았어요! ${target.ko}`, `That's right! ${target.en}`);
    if (step === SHAPES.length - 1) window.setTimeout(onComplete, 600);
    else setStep(step + 1);
  };

  return (
    <div>
      <div className="level-caption">{tx(language, `모양 ${step + 1}/${SHAPES.length}`, `Shape ${step + 1}/${SHAPES.length}`)}</div>
      <button className="spoken-prompt game-prompt" onClick={() => speak(`${target.ko}를 찾아요`, `Find the ${target.en}`)}>
        🔊 {tx(language, `${target.ko}를 찾아요`, `Find the ${target.en}`)}
      </button>
      <div className={`shape-row shape-count-${choices.length}`}>
        {choices.map((shape) => <button key={shape.id} className="shape-button" onClick={() => choose(shape.id)} aria-label={language === "ko" ? shape.ko : shape.en}><span className={`shape ${shape.id}`} /></button>)}
      </div>
    </div>
  );
}
