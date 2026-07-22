"use client";

import { useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import { difficultyCount } from "../registry";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const WORDS: Record<string, [string, string]> = {
  A: ["에이, 사과", "A, apple"], B: ["비, 곰", "B, bear"], C: ["씨, 고양이", "C, cat"], D: ["디, 강아지", "D, dog"],
  E: ["이, 코끼리", "E, elephant"], F: ["에프, 물고기", "F, fish"], G: ["지, 기린", "G, giraffe"], H: ["에이치, 모자", "H, hat"],
};

export function AlphabetGame({ age, language, onComplete }: GameProps) {
  const count = difficultyCount(age, [4, 6, 8]);
  const letters = LETTERS.slice(0, count);
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const target = letters[step % Math.min(3, count)];

  const choose = (letter: string) => {
    const words = WORDS[letter];
    speak(words[0], words[1]);
    if (letter !== target) return;
    if (step >= 2) window.setTimeout(onComplete, 600);
    else setStep(step + 1);
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, `${target}를 찾아 톡!`, `Tap the letter ${target}!`)}</p>
      <button className="listen-bubble" onClick={() => speak(`${target}를 찾아보세요`, `Find the letter ${target}`)}>🔊</button>
      <div className="choice-grid letter-grid">
        {[...letters].reverse().map((letter) => <button key={letter} className="letter-button" onClick={() => choose(letter)}>{letter}</button>)}
      </div>
    </div>
  );
}

