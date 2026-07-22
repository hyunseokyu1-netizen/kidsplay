"use client";

import { useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const SHAPES = [
  { id: "circle", ko: "동그라미", en: "circle" },
  { id: "triangle", ko: "세모", en: "triangle" },
  { id: "square", ko: "네모", en: "square" },
];

export function ShapeGame({ language, onComplete }: GameProps) {
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const target = SHAPES[step];

  const choose = (id: string) => {
    if (id !== target.id) return;
    speak(`맞았어요! ${target.ko}`, `That's right! ${target.en}`);
    if (step === 2) window.setTimeout(onComplete, 600);
    else setStep(step + 1);
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, `${target.ko}를 찾아요`, `Find the ${target.en}`)}</p>
      <div className="shape-row">
        {[...SHAPES].reverse().map((shape) => <button key={shape.id} className="shape-button" onClick={() => choose(shape.id)}><span className={`shape ${shape.id}`} /></button>)}
      </div>
    </div>
  );
}

