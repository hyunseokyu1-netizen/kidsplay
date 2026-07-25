"use client";

import { useEffect, useRef, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const STAR_POINTS = [
  { x: 350, y: 25 }, { x: 390, y: 125 }, { x: 500, y: 125 }, { x: 410, y: 190 }, { x: 445, y: 310 },
  { x: 350, y: 238 }, { x: 255, y: 310 }, { x: 290, y: 190 }, { x: 200, y: 125 }, { x: 310, y: 125 },
];

export function ConnectDotsGame({ age, language, onComplete }: GameProps) {
  const count = age === "toddler" ? 6 : age === "preschool" ? 8 : 10;
  const points = STAR_POINTS.slice(0, count);
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
      window.setTimeout(onComplete, 900);
      return;
    }
    setNext(number + 1);
  };

  return (
    <div className="connect-game">
      <p className="game-prompt">{finished ? tx(language, "짜잔! 별이 완성됐어요!", "Ta-da! You made a star!") : tx(language, `${next}번을 찾아 눌러요`, `Find and tap number ${next}`)}</p>
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
        {finished && <div className="connect-picture"><EmojiIcon symbol="🏅" /></div>}
      </div>
    </div>
  );
}
