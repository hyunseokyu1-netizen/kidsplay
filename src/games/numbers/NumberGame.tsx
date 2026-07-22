"use client";

import { useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import { difficultyCount } from "../registry";
import type { GameProps } from "../shared";
import { tx } from "../shared";

export function NumberGame({ age, language, onComplete }: GameProps) {
  const count = difficultyCount(age, [5, 7, 10]);
  const numbers = Array.from({ length: count }, (_, index) => index + 1);
  const ordered = numbers.slice().sort((a, b) => ((a * 7) % 11) - ((b * 7) % 11));
  const [next, setNext] = useState(1);
  const speak = useSpeech(language);

  const choose = (number: number) => {
    speak(`${number}`, `${number}`);
    if (number !== next) return;
    if (number === count) window.setTimeout(onComplete, 500);
    setNext(number + 1);
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, `${next}부터 차례대로 눌러요`, `Tap the numbers in order, starting with ${next}`)}</p>
      <div className="number-path" aria-label={tx(language, "완료한 숫자", "Completed numbers")}>
        {numbers.map((number) => <span key={number} className={number < next ? "done" : ""}>{number < next ? "★" : number}</span>)}
      </div>
      <div className="choice-grid number-grid">
        {ordered.map((number) => <button key={number} className={`number-button ${number < next ? "used" : ""}`} disabled={number < next} onClick={() => choose(number)}>{number}</button>)}
      </div>
    </div>
  );
}

