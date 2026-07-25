"use client";

import { useEffect, useRef, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const PICTURES = [
  {
    symbol: "⭐", ko: "별", en: "star",
    points: [{ x: 350, y: 25 }, { x: 390, y: 125 }, { x: 500, y: 125 }, { x: 410, y: 190 }, { x: 445, y: 310 }, { x: 350, y: 238 }],
  },
  {
    symbol: "🏠", ko: "집", en: "house",
    points: [{ x: 210, y: 155 }, { x: 350, y: 35 }, { x: 500, y: 155 }, { x: 470, y: 155 }, { x: 470, y: 305 }, { x: 230, y: 305 }, { x: 230, y: 155 }],
  },
  {
    symbol: "🌳", ko: "나무", en: "tree",
    points: [{ x: 350, y: 25 }, { x: 455, y: 135 }, { x: 405, y: 135 }, { x: 485, y: 245 }, { x: 390, y: 245 }, { x: 390, y: 315 }, { x: 310, y: 315 }, { x: 310, y: 245 }],
  },
  {
    symbol: "🐟", ko: "물고기", en: "fish",
    points: [{ x: 185, y: 170 }, { x: 270, y: 90 }, { x: 420, y: 80 }, { x: 510, y: 170 }, { x: 610, y: 85 }, { x: 590, y: 170 }, { x: 610, y: 255 }, { x: 510, y: 170 }, { x: 420, y: 260 }],
  },
  {
    symbol: "🚀", ko: "로켓", en: "rocket",
    points: [{ x: 350, y: 20 }, { x: 420, y: 100 }, { x: 430, y: 220 }, { x: 500, y: 280 }, { x: 405, y: 270 }, { x: 350, y: 325 }, { x: 295, y: 270 }, { x: 200, y: 280 }, { x: 270, y: 220 }, { x: 280, y: 100 }],
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
