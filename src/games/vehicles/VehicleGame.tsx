"use client";

import { useEffect, useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import { difficultyCount } from "../registry";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const VEHICLES = [
  { icon: "🚗", ko: "자동차, 부릉부릉", en: "Car, vroom vroom" },
  { icon: "🚂", ko: "기차, 칙칙폭폭", en: "Train, choo choo" },
  { icon: "✈️", ko: "비행기, 슈웅", en: "Airplane, whoosh" },
  { icon: "🚒", ko: "소방차, 삐뽀삐뽀", en: "Fire truck, nee naw" },
];

export function VehicleGame({ age, language, onComplete }: GameProps) {
  const count = difficultyCount(age, [2, 3, 4]);
  const vehicles = VEHICLES.slice(0, count);
  const [step, setStep] = useState(0);
  const speak = useSpeech(language);
  const target = vehicles[step % vehicles.length];

  useEffect(() => { speak(target.ko, target.en); }, [speak, target.ko, target.en]);

  const choose = (icon: string) => {
    if (icon !== target.icon) return;
    if (step >= 2) window.setTimeout(onComplete, 600);
    else setStep(step + 1);
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, "소리를 듣고 탈것을 골라요", "Listen and choose the vehicle")}</p>
      <button className="listen-bubble" onClick={() => speak(target.ko, target.en)}>🔊</button>
      <div className="vehicle-road">
        {[...vehicles].reverse().map((vehicle) => <button key={vehicle.icon} className="vehicle-button" onClick={() => choose(vehicle.icon)}>{vehicle.icon}<span className="road-line" /></button>)}
      </div>
    </div>
  );
}
