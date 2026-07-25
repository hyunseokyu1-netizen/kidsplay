"use client";

import { useEffect, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const PAIRS = [
  { left: "🐝", right: "🌼", ko: "벌과 꽃", en: "bee and flower" },
  { left: "🐶", right: "🦴", ko: "강아지와 뼈다귀", en: "dog and bone" },
  { left: "🐒", right: "🍌", ko: "원숭이와 바나나", en: "monkey and banana" },
];
const CHOICES = ["🍌", "🦴", "🌼"];

export function MatchingGame({ language, onComplete }: GameProps) {
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const pair = PAIRS[step];

  useEffect(() => { speak(`${pair.ko}를 찾아요`, `Find the ${pair.en}`); }, [speak, pair.ko, pair.en]);

  const choose = (choice: string) => {
    if (choice !== pair.right) return;
    if (step === PAIRS.length - 1) window.setTimeout(onComplete, 550);
    else setStep(step + 1);
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, "어울리는 짝을 찾아 주세요", "Find the picture that belongs together")}</p>
      <div className="matching-stage">
        <div className="match-hero"><EmojiIcon symbol={pair.left} /><button onClick={() => speak(pair.ko, pair.en)} aria-label={tx(language, "소리 듣기", "Listen")}>▶</button></div>
        <span className="match-plus">＋</span>
        <div className="match-choices">
          {CHOICES.map((choice) => <button key={choice} onClick={() => choose(choice)}><EmojiIcon symbol={choice} /></button>)}
        </div>
      </div>
    </div>
  );
}
