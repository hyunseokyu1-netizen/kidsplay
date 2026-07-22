"use client";

import { useEffect, useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import { difficultyCount } from "../registry";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const ANIMALS = [
  { icon: "🐶", ko: "강아지, 멍멍!", en: "Dog, woof woof!" },
  { icon: "🐱", ko: "고양이, 야옹!", en: "Cat, meow!" },
  { icon: "🐮", ko: "소, 음메!", en: "Cow, moo!" },
  { icon: "🦁", ko: "사자, 어흥!", en: "Lion, roar!" },
  { icon: "🐸", ko: "개구리, 개굴개굴!", en: "Frog, ribbit!" },
];

export function AnimalGame({ age, language, onComplete }: GameProps) {
  const count = difficultyCount(age, [3, 4, 5]);
  const animals = ANIMALS.slice(0, count);
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const target = animals[step % Math.min(3, animals.length)];

  useEffect(() => { speak(target.ko, target.en); }, [speak, target.ko, target.en]);

  const choose = (icon: string) => {
    if (icon !== target.icon) return;
    speak(`정답! ${target.ko}`, `Great! ${target.en}`);
    if (step >= 2) window.setTimeout(onComplete, 650);
    else setStep(step + 1);
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, "어떤 동물의 소리일까요?", "Which animal makes this sound?")}</p>
      <button className="sound-orb" onClick={() => speak(target.ko, target.en)} aria-label={tx(language, "동물 소리 다시 듣기", "Play animal sound again")}>🔊<small>{tx(language, "다시 듣기", "Listen")}</small></button>
      <div className="choice-grid animal-grid">
        {[...animals].reverse().map((animal) => <button key={animal.icon} className="animal-button" onClick={() => choose(animal.icon)}>{animal.icon}</button>)}
      </div>
    </div>
  );
}
