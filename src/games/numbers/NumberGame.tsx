"use client";

import { useMemo, useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const LEVELS = [
  { count: 10, ko: "초급", en: "Beginner" },
  { count: 30, ko: "중급", en: "Intermediate" },
  { count: 50, ko: "고급", en: "Advanced" },
];

function shuffledNumbers(count: number) {
  return Array.from({ length: count }, (_, index) => index + 1)
    .sort((a, b) => ((a * 17) % (count + 7)) - ((b * 17) % (count + 7)));
}

export function NumberGame({ language, onComplete }: GameProps) {
  const [level, setLevel] = useState(0);
  const [next, setNext] = useState(1);
  const count = LEVELS[level].count;
  const ordered = useMemo(() => shuffledNumbers(count), [count]);
  const speak = useSpeech(language);

  const changeLevel = (index: number) => {
    setLevel(index);
    setNext(1);
  };

  const choose = (number: number) => {
    speak(`${number}`, `${number}`);
    if (number !== next) return;
    if (number === count) window.setTimeout(onComplete, 500);
    else setNext(number + 1);
  };

  return (
    <div className={`number-game number-level-${level + 1}`}>
      <div className="difficulty-tabs">
        {LEVELS.map((item, index) => (
          <button key={item.count} className={level === index ? "active" : ""} onClick={() => changeLevel(index)}>
            {language === "ko" ? item.ko : item.en}<small>{item.count}</small>
          </button>
        ))}
      </div>
      <p className="game-prompt">{tx(language, `${next}을(를) 찾아 차례대로 눌러요`, `Find ${next} and keep tapping in order`)}</p>
      <div className="number-progress"><strong>{Math.min(next - 1, count)}</strong><span>/ {count}</span></div>
      <div className="choice-grid number-grid">
        {ordered.map((number) => (
          <button key={number} className={`number-button ${number < next ? "used" : ""}`} disabled={number < next} onClick={() => choose(number)}>
            {number < next ? "★" : number}
          </button>
        ))}
      </div>
    </div>
  );
}
