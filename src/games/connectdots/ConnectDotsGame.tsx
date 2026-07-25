"use client";

import { useEffect, useRef, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const PICTURES = [
  {
    symbol: "⭐", ko: "별", en: "star",
    points: [{ x: 350, y: 25 }, { x: 390, y: 115 }, { x: 490, y: 120 }, { x: 415, y: 185 }, { x: 445, y: 285 }, { x: 350, y: 230 }, { x: 255, y: 285 }, { x: 285, y: 185 }, { x: 210, y: 120 }, { x: 310, y: 115 }],
  },
  {
    symbol: "🏠", ko: "집", en: "house",
    points: [{ x: 175, y: 155 }, { x: 350, y: 25 }, { x: 525, y: 155 }, { x: 525, y: 315 }, { x: 420, y: 315 }, { x: 420, y: 220 }, { x: 330, y: 220 }, { x: 330, y: 315 }, { x: 175, y: 315 }],
  },
  {
    symbol: "🌳", ko: "나무", en: "tree",
    points: [{ x: 350, y: 20 }, { x: 450, y: 105 }, { x: 405, y: 170 }, { x: 500, y: 245 }, { x: 400, y: 245 }, { x: 400, y: 325 }, { x: 300, y: 325 }, { x: 300, y: 245 }, { x: 200, y: 245 }, { x: 295, y: 170 }, { x: 250, y: 105 }],
  },
  {
    symbol: "🐟", ko: "물고기", en: "fish",
    points: [{ x: 125, y: 170 }, { x: 225, y: 80 }, { x: 390, y: 70 }, { x: 510, y: 135 }, { x: 610, y: 65 }, { x: 585, y: 170 }, { x: 610, y: 275 }, { x: 510, y: 205 }, { x: 390, y: 270 }, { x: 225, y: 260 }],
  },
  {
    symbol: "🚀", ko: "로켓", en: "rocket",
    points: [{ x: 350, y: 15 }, { x: 430, y: 105 }, { x: 440, y: 215 }, { x: 525, y: 285 }, { x: 415, y: 270 }, { x: 350, y: 330 }, { x: 285, y: 270 }, { x: 175, y: 285 }, { x: 260, y: 215 }, { x: 270, y: 105 }],
  },
];

export function ConnectDotsGame({ language, onComplete }: GameProps) {
  const [stage, setStage] = useState(0);
  const picture = PICTURES[stage];
  const points = picture.points;
  const count = points.length;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [next, setNext] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#4E92CE";
    context.lineWidth = 8;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    points.slice(0, Math.max(0, next - 1)).forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    if (finished) context.lineTo(points[0].x, points[0].y);
    context.stroke();
  }, [finished, next, points]);

  const choose = (number: number) => {
    if (number !== next || finished) return;
    if (number === count) {
      setNext(number + 1);
      setFinished(true);
      window.setTimeout(() => {
        if (stage === PICTURES.length - 1) onComplete();
        else {
          setStage(stage + 1);
          setNext(1);
          setFinished(false);
        }
      }, 900);
      return;
    }
    setNext(number + 1);
  };

  return (
    <div className="connect-game">
      <div className="level-caption">{tx(language, `${stage + 1}/${PICTURES.length} · ${picture.ko}`, `${stage + 1}/${PICTURES.length} · ${picture.en}`)}</div>
      <p className="game-prompt">{finished ? tx(language, `짜잔! ${picture.ko}이(가) 완성됐어요!`, `Ta-da! You made a ${picture.en}!`) : tx(language, `${next}번을 찾아 눌러요`, `Find and tap number ${next}`)}</p>
      <div className={`connect-board ${finished ? "finished" : ""}`}>
        <canvas ref={canvasRef} width={700} height={340} />
        {points.map((point, index) => (
          <button
            key={index}
            className={`${index + 1 < next ? "done" : ""} ${index + 1 === next ? "next" : ""}`}
            style={{ left: `${(point.x / 700) * 100}%`, top: `${(point.y / 340) * 100}%` }}
            onClick={() => choose(index + 1)}
            aria-label={`${index + 1}`}
          >{index + 1}</button>
        ))}
        {finished && <div className="connect-picture"><EmojiIcon symbol={picture.symbol} /></div>}
      </div>
    </div>
  );
}
