"use client";

import { useMemo, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import { useSpeech } from "../../hooks/useSpeech";
import type { GameProps } from "../shared";

const LEVELS = [
  { count: 3, ko: "초급", en: "Beginner" },
  { count: 6, ko: "중급", en: "Intermediate" },
  { count: 10, ko: "고급", en: "Advanced" },
];
const DINOS = [
  { icon: "🦖", ko: "티라노사우루스", en: "Tyrannosaurus", clueKo: "큰 이빨과 튼튼한 뒷다리가 있어요", clueEn: "It has huge teeth and strong back legs" },
  { icon: "🦕", ko: "브라키오사우루스", en: "Brachiosaurus", clueKo: "목이 아주 길어요", clueEn: "It has a very long neck" },
  { icon: "🐊", ko: "스테고사우루스", en: "Stegosaurus", clueKo: "등에 커다란 골판이 줄지어 있어요", clueEn: "It has large plates along its back" },
  { icon: "🦕", ko: "트리케라톱스", en: "Triceratops", clueKo: "얼굴에 세 개의 뿔이 있어요", clueEn: "It has three horns on its face" },
  { icon: "🦖", ko: "벨로키랍토르", en: "Velociraptor", clueKo: "몸집은 작지만 아주 빠르게 달려요", clueEn: "It is small and runs very fast" },
  { icon: "🐊", ko: "안킬로사우루스", en: "Ankylosaurus", clueKo: "갑옷 같은 등과 곤봉 꼬리가 있어요", clueEn: "It has armored skin and a club tail" },
  { icon: "🦕", ko: "파라사우롤로푸스", en: "Parasaurolophus", clueKo: "머리 뒤로 길쭉한 볏이 있어요", clueEn: "It has a long crest behind its head" },
  { icon: "🦖", ko: "스피노사우루스", en: "Spinosaurus", clueKo: "등에 돛처럼 큰 돌기가 있어요", clueEn: "It has a sail-like fin on its back" },
  { icon: "🐊", ko: "파키케팔로사우루스", en: "Pachycephalosaurus", clueKo: "머리가 단단하고 둥글어요", clueEn: "It has a hard, round head" },
  { icon: "🦕", ko: "아파토사우루스", en: "Apatosaurus", clueKo: "긴 목과 아주 긴 꼬리가 있어요", clueEn: "It has a long neck and a very long tail" },
];

function choicesFor(step: number, count: number) {
  const indices = [step];
  for (let offset = 1; indices.length < Math.min(3, count); offset += 1) indices.push((step + offset * 2) % count);
  return Array.from(new Set(indices)).map((index) => DINOS[index]).sort((a, b) => ((a.ko.length + step) % 7) - ((b.ko.length + step) % 7));
}

export function DinosaurGame({ language, onComplete }: GameProps) {
  const [level, setLevel] = useState(0);
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const count = LEVELS[level].count;
  const target = DINOS[step];
  const choices = useMemo(() => choicesFor(step, count), [count, step]);

  const changeLevel = (index: number) => {
    setLevel(index);
    setStep(0);
  };

  const choose = (name: string) => {
    const selected = DINOS.find((dino) => dino.ko === name)!;
    speak(selected.ko, selected.en);
    if (name !== target.ko) return;
    if (step === count - 1) window.setTimeout(onComplete, 650);
    else setStep(step + 1);
  };

  return (
    <div className="dinosaur-game">
      <div className="difficulty-tabs">
        {LEVELS.map((item, index) => (
          <button key={item.count} className={level === index ? "active" : ""} onClick={() => changeLevel(index)}>
            {language === "ko" ? item.ko : item.en}<small>{item.count}</small>
          </button>
        ))}
      </div>
      <div className="level-caption">{step + 1}/{count}</div>
      <button className="spoken-prompt game-prompt" onClick={() => speak(target.clueKo, target.clueEn)}>
        🔊 {language === "ko" ? target.clueKo : target.clueEn}
      </button>
      <div className="choice-grid dino-grid">
        {choices.map((dino) => (
          <button key={dino.ko} className="dino-button" onClick={() => choose(dino.ko)}>
            <EmojiIcon symbol={dino.icon} /><small>{language === "ko" ? dino.ko : dino.en}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
