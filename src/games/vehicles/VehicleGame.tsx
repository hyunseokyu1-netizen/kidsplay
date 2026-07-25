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
const SOUNDS = [
  { icon: "🚗", ko: "자동차, 부릉부릉", en: "Car, vroom vroom" },
  { icon: "🚂", ko: "기차, 칙칙폭폭", en: "Train, choo choo" },
  { icon: "✈️", ko: "비행기, 슈웅", en: "Airplane, whoosh" },
  { icon: "🚒", ko: "소방차, 삐뽀삐뽀", en: "Fire truck, nee naw" },
  { icon: "🚀", ko: "로켓, 쿠우웅", en: "Rocket, blast off" },
  { icon: "⏰", ko: "알람 시계, 따르릉", en: "Alarm clock, ring ring" },
  { icon: "🖱️", ko: "마우스, 딸깍딸깍", en: "Mouse, click click" },
  { icon: "🎨", ko: "붓, 사각사각", en: "Paint brush, swish swish" },
  { icon: "🌈", ko: "빗방울, 주룩주룩", en: "Rain, pitter patter" },
  { icon: "🏠", ko: "초인종, 딩동", en: "Doorbell, ding dong" },
  { icon: "👑", ko: "왕관 종, 딸랑딸랑", en: "Crown bell, jingle" },
  { icon: "🏅", ko: "메달, 짤랑", en: "Medal, clink" },
  { icon: "🌻", ko: "물뿌리개, 촤아촤아", en: "Sprinkler, splash splash" },
  { icon: "🔤", ko: "키보드, 톡톡톡", en: "Keyboard, tap tap" },
  { icon: "🔢", ko: "계산기, 삑삑", en: "Calculator, beep beep" },
];

function choiceIndices(target: number, count: number) {
  const values = [target];
  for (let offset = 1; values.length < Math.min(5, count); offset += 1) values.push((target + offset * 4) % count);
  return Array.from(new Set(values)).sort((a, b) => ((a * 5 + target) % 13) - ((b * 5 + target) % 13));
}

export function VehicleGame({ language, onComplete }: GameProps) {
  const [level, setLevel] = useState(0);
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const count = LEVELS[level].count;
  const targetIndex = step % count;
  const target = SOUNDS[targetIndex];
  const choices = useMemo(() => choiceIndices(targetIndex, count).map((index) => SOUNDS[index]), [count, targetIndex]);

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
    speak(`맞았어요! ${target.ko}`, `That's right! ${target.en}`);
    if (step === count - 1) window.setTimeout(onComplete, 600);
    else setStep(step + 1);
  };

  return (
    <div className="vehicle-game">
      <div className="difficulty-tabs">
        {LEVELS.map((item, index) => (
          <button key={item.count} className={level === index ? "active" : ""} onClick={() => changeLevel(index)}>
            {language === "ko" ? item.ko : item.en}<small>{item.count}</small>
          </button>
        ))}
      </div>
      <div className="level-caption">{step + 1}/{count}</div>
      <p className="game-prompt">{tx(language, "소리를 듣고 탈것이나 물건을 골라요", "Listen and choose the vehicle or object")}</p>
      <button className="listen-bubble" onClick={() => speak(target.ko, target.en)} aria-label={tx(language, "소리 다시 듣기", "Play sound again")}>🔊</button>
      <div className="vehicle-road">
        {choices.map((item) => <button key={item.icon} className="vehicle-button" onClick={() => choose(item.icon)}><EmojiIcon symbol={item.icon} /><span className="road-line" /></button>)}
      </div>
    </div>
  );
}
