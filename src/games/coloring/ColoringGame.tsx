"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const COLORS = ["#F06D87", "#F6B94C", "#61C69D", "#52A9E8", "#9179E8", "#7C523B"];

export function ColoringGame({ language, onComplete }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [painted, setPainted] = useState<Record<number, string>>({});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFF9E8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const spots = [
      { x: 180, y: 145, r: 90 },
      { x: 320, y: 155, r: 100 },
      { x: 440, y: 240, r: 72 },
      { x: 295, y: 285, r: 118 },
    ];
    spots.forEach((spot, index) => {
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fillStyle = painted[index] || "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = "#493C36";
      ctx.lineWidth = 7;
      ctx.stroke();
    });
    ctx.font = "78px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#493C36";
    ctx.fillText("🦕", 305, 242);
  }, [painted]);

  useEffect(draw, [draw]);

  const paint = (event: ReactMouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 620;
    const y = ((event.clientY - rect.top) / rect.height) * 390;
    const spots = [[180, 145, 90], [320, 155, 100], [440, 240, 72], [295, 285, 118]];
    const index = spots.findIndex(([sx, sy, radius]) => Math.hypot(x - sx, y - sy) <= radius);
    if (index >= 0) {
      const next = { ...painted, [index]: color };
      setPainted(next);
      if (Object.keys(next).length === spots.length) window.setTimeout(onComplete, 450);
    }
  };

  const autoPaint = () => {
    setPainted({ 0: COLORS[0], 1: COLORS[1], 2: COLORS[2], 3: COLORS[4] });
    window.setTimeout(onComplete, 650);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "kidsplay-coloring.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="coloring-game">
      <p className="game-prompt">{tx(language, "좋아하는 색으로 톡톡 칠해요!", "Tap each part with your favorite color!")}</p>
      <canvas ref={canvasRef} width={620} height={390} className="coloring-canvas" onClick={paint} aria-label={tx(language, "공룡 색칠 도화지", "Dinosaur coloring canvas")} />
      <div className="palette" aria-label={tx(language, "색상 선택", "Choose a color")}>
        {COLORS.map((item) => (
          <button key={item} className={`color-dot ${color === item ? "selected" : ""}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={item} />
        ))}
      </div>
      <div className="small-actions">
        <button className="soft-button" onClick={autoPaint}>✨ {tx(language, "자동 색칠", "Magic paint")}</button>
        <button className="soft-button" onClick={save}>💾 {tx(language, "그림 저장", "Save picture")}</button>
      </div>
    </div>
  );
}

