"use client";

import { useMemo, useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const LEVELS = [
  { count: 6, ko: "초급", en: "Beginner" },
  { count: 13, ko: "중급", en: "Intermediate" },
  { count: 26, ko: "고급", en: "Advanced" },
];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const EXAMPLES = [
  "apple", "bear", "cat", "dog", "elephant", "fish", "giraffe", "hat", "ice cream", "juice", "kite", "lion", "moon",
  "nest", "orange", "panda", "queen", "rocket", "sun", "turtle", "umbrella", "violin", "whale", "xylophone", "yo-yo", "zebra",
];

function shuffledLetters(letters: string[], seed: number) {
  return letters.slice().sort((a, b) => ((a.charCodeAt(0) * 13 + seed * 7) % 29) - ((b.charCodeAt(0) * 13 + seed * 7) % 29));
}

export function AlphabetGame({ language, onComplete }: GameProps) {
  const [level, setLevel] = useState(0);
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const letters = useMemo(() => LETTERS.slice(0, LEVELS[level].count), [level]);
  const target = letters[step];
  const ordered = useMemo(() => shuffledLetters(letters, level), [letters, level]);

  const changeLevel = (index: number) => {
    setLevel(index);
    setStep(0);
  };

  const choose = (letter: string) => {
    const index = LETTERS.indexOf(letter);
    speak(`${letter}, ${EXAMPLES[index]}`, `${letter}, ${EXAMPLES[index]}`);
    if (letter !== target) return;
    if (step === letters.length - 1) window.setTimeout(onComplete, 600);
    else setStep(step + 1);
  };

  return (
    <div className={`alphabet-game alphabet-level-${level + 1}`}>
      <div className="difficulty-tabs">
        {LEVELS.map((item, index) => (
          <button key={item.count} className={level === index ? "active" : ""} onClick={() => changeLevel(index)}>
            {language === "ko" ? item.ko : item.en}<small>{item.count}</small>
          </button>
        ))}
      </div>
      <div className="level-caption">{step + 1}/{letters.length}</div>
      <p className="game-prompt">{tx(language, `${target}를 찾아 톡!`, `Tap the letter ${target}!`)}</p>
      <button className="listen-bubble" onClick={() => speak(`${target}를 찾아보세요`, `Find the letter ${target}`)}>🔊</button>
      <div className="choice-grid letter-grid">
        {ordered.map((letter) => <button key={letter} className="letter-button" onClick={() => choose(letter)}>{letter}</button>)}
      </div>
    </div>
  );
}
