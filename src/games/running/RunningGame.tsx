"use client";

import { useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const SHAPES = ["circle", "square", "triangle", "diamond", "pentagon"];

function Shape({ type }: { type: string }) {
  return <span className={`runner-shape ${type}`} />;
}

export function RunningGame({ language, onComplete }: GameProps) {
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const target = SHAPES[(step * 2 + 1) % SHAPES.length];
  const choices = SHAPES.slice().sort((a, b) => ((a.length + step * 3) % 7) - ((b.length + step * 3) % 7)).slice(0, 4);
  if (!choices.includes(target)) choices[step % 4] = target;

  const choose = (shape: string) => {
    if (shape !== target) {
      setWrong(shape);
      window.setTimeout(() => setWrong(null), 400);
      return;
    }
    if (step === 4) {
      window.setTimeout(onComplete, 550);
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="runner-game">
      <p className="game-prompt">{tx(language, "친구가 말한 모양을 눌러 달려요!", "Choose the shape and help our friend run!")}</p>
      <div className="runner-scene">
        <div className="runner-progress">{Array.from({ length: 5 }, (_, index) => <span className={index < step ? "done" : ""} key={index}>★</span>)}</div>
        <div className="runner-hills"><span /><span /><span /></div>
        <div className="runner-character" style={{ left: `${12 + step * 16}%` }}><EmojiIcon symbol="🐣" /></div>
        <div className="runner-bubble"><Shape type={target} /></div>
        <div className="runner-road" />
      </div>
      <div className="runner-choices">
        {choices.map((shape) => <button key={shape} className={wrong === shape ? "wrong" : ""} onClick={() => choose(shape)}><Shape type={shape} /></button>)}
      </div>
    </div>
  );
}
