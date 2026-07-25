"use client";

import { useEffect, useMemo, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const LEVELS = [
  { count: 5, ko: "초급", en: "Beginner" },
  { count: 10, ko: "중급", en: "Intermediate" },
  { count: 15, ko: "고급", en: "Advanced" },
];
const ANIMALS = [
  { icon: "🐶", ko: "강아지, 멍멍!", en: "Dog, woof woof!" },
  { icon: "🐱", ko: "고양이, 야옹!", en: "Cat, meow!" },
  { icon: "🐮", ko: "소, 음메!", en: "Cow, moo!" },
  { icon: "🦁", ko: "사자, 어흥!", en: "Lion, roar!" },
  { icon: "🐸", ko: "개구리, 개굴개굴!", en: "Frog, ribbit!" },
  { icon: "🐼", ko: "판다, 끙끙!", en: "Panda, grumble!" },
  { icon: "🐰", ko: "토끼, 깡충깡충!", en: "Rabbit, hop hop!" },
  { icon: "🐊", ko: "악어, 으르렁!", en: "Crocodile, growl!" },
  { icon: "🐳", ko: "고래, 푸우!", en: "Whale, whoosh!" },
  { icon: "🐣", ko: "병아리, 삐약삐약!", en: "Chick, peep peep!" },
  { icon: "🦉", ko: "부엉이, 부엉부엉!", en: "Owl, hoot hoot!" },
  { icon: "🦊", ko: "여우, 캥캥!", en: "Fox, yip yip!" },
  { icon: "🐝", ko: "꿀벌, 윙윙!", en: "Bee, buzz buzz!" },
  { icon: "🦖", ko: "티라노, 크아앙!", en: "T-rex, roar!" },
  { icon: "🦕", ko: "브라키오, 쿵쿵!", en: "Brachiosaurus, stomp stomp!" },
];

function roundChoices(targetIndex: number, count: number) {
  const indices = [targetIndex];
  for (let offset = 1; indices.length < Math.min(5, count); offset += 1) indices.push((targetIndex + offset * 3) % count);
  return Array.from(new Set(indices)).sort((a, b) => ((a * 7 + targetIndex) % 11) - ((b * 7 + targetIndex) % 11));
}

export function AnimalGame({ language, onComplete }: GameProps) {
  const [level, setLevel] = useState(0);
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const count = LEVELS[level].count;
  const targetIndex = step % count;
  const target = ANIMALS[targetIndex];
  const choices = useMemo(() => roundChoices(targetIndex, count).map((index) => ANIMALS[index]), [count, targetIndex]);

  useEffect(() => {
    const timer = window.setTimeout(() => speak(target.ko, target.en), 220);
    return () => window.clearTimeout(timer);
  }, [speak, target.en, target.ko]);

  const changeLevel = (index: number) => {
    setLevel(index);
    setStep(0);
  };

  const choose = (icon: string) => {
    if (icon !== target.icon) return;
    speak(`정답! ${target.ko}`, `Great! ${target.en}`);
    if (step === count - 1) window.setTimeout(onComplete, 650);
    else setStep(step + 1);
  };

  return (
    <div className="animal-game">
      <div className="difficulty-tabs">
        {LEVELS.map((item, index) => (
          <button key={item.count} className={level === index ? "active" : ""} onClick={() => changeLevel(index)}>
            {language === "ko" ? item.ko : item.en}<small>{item.count}</small>
          </button>
        ))}
      </div>
      <div className="level-caption">{step + 1}/{count}</div>
      <p className="game-prompt">{tx(language, "어떤 동물의 소리일까요?", "Which animal makes this sound?")}</p>
      <button className="sound-orb" onClick={() => speak(target.ko, target.en)} aria-label={tx(language, "동물 소리 다시 듣기", "Play animal sound again")}>🔊<small>{tx(language, "다시 듣기", "Listen")}</small></button>
      <div className="choice-grid animal-grid">
        {choices.map((animal) => <button key={animal.icon} className="animal-button" onClick={() => choose(animal.icon)}><EmojiIcon symbol={animal.icon} /></button>)}
      </div>
    </div>
  );
}
