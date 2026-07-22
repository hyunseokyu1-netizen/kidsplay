"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const COLORS = ["#F06D87", "#F6B94C", "#61C69D", "#52A9E8", "#9179E8", "#7C523B"];
const BOARD_WIDTH = 620;
const BOARD_HEIGHT = 390;

const COLORING_PAGES = [
  { src: "/coloring/butterfly.svg", icon: "🦋", ko: "나비", en: "Butterfly" },
  { src: "/coloring/owl.svg", icon: "🦉", ko: "부엉이", en: "Owl" },
  { src: "/coloring/car.svg", icon: "🚗", ko: "자동차", en: "Car" },
  { src: "/coloring/rocket.svg", icon: "🚀", ko: "로켓", en: "Rocket" },
  { src: "/coloring/elephant.svg", icon: "🐘", ko: "코끼리", en: "Elephant" },
  { src: "/coloring/fish.svg", icon: "🐠", ko: "물고기", en: "Fish" },
  { src: "/coloring/hen.svg", icon: "🐔", ko: "암탉", en: "Hen" },
];

function drawContained(context: CanvasRenderingContext2D, image: HTMLImageElement) {
  const width = image.naturalWidth || BOARD_WIDTH;
  const height = image.naturalHeight || BOARD_HEIGHT;
  const scale = Math.min(BOARD_WIDTH / width, BOARD_HEIGHT / height) * 0.76;
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  context.drawImage(image, (BOARD_WIDTH - drawWidth) / 2, (BOARD_HEIGHT - drawHeight) / 2, drawWidth, drawHeight);
}

export function ColoringGame({ language, onComplete }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outlineRef = useRef<HTMLImageElement>(null);
  const painting = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasPaint, setHasPaint] = useState(false);
  const page = COLORING_PAGES[pageIndex];

  const resetBoard = () => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    setHasPaint(false);
  };

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * BOARD_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * BOARD_HEIGHT,
    };
  };

  const startPainting = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    painting.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    lastPoint.current = point;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = isEraser ? 1 : 0.78;
    if (!hasPaint) {
      context.globalAlpha = 1;
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
      context.globalAlpha = isEraser ? 1 : 0.78;
    }
    context.fillStyle = isEraser ? "#FFFFFF" : color;
    context.beginPath();
    context.arc(point.x, point.y, 18, 0, Math.PI * 2);
    context.fill();
    setHasPaint(true);
  };

  const continuePainting = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!painting.current || !lastPoint.current) return;
    const point = pointFromEvent(event);
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = isEraser ? 1 : 0.78;
    context.strokeStyle = isEraser ? "#FFFFFF" : color;
    context.lineWidth = isEraser ? 48 : 36;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPoint.current = point;
  };

  const stopPainting = () => {
    painting.current = false;
    lastPoint.current = null;
  };

  const autoPaint = () => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    resetBoard();
    context.globalAlpha = 0.72;
    const spots = [
      [120, 95, 95], [265, 100, 105], [420, 100, 110], [545, 100, 85],
      [95, 270, 105], [245, 275, 115], [410, 270, 120], [550, 275, 90],
    ];
    spots.forEach(([x, y, radius], index) => {
      context.fillStyle = COLORS[index % COLORS.length];
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    setHasPaint(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    const outline = outlineRef.current;
    if (!canvas || !outline) return;
    const output = document.createElement("canvas");
    output.width = BOARD_WIDTH;
    output.height = BOARD_HEIGHT;
    const context = output.getContext("2d");
    if (!context) return;
    context.drawImage(canvas, 0, 0);
    context.globalCompositeOperation = "multiply";
    drawContained(context, outline);
    context.globalCompositeOperation = "source-over";
    const link = document.createElement("a");
    link.download = `kidsplay-${page.en.toLowerCase()}.png`;
    link.href = output.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="coloring-game">
      <p className="game-prompt">{tx(language, "그림을 고르고 쓱쓱 색칠해요!", "Choose a picture and paint it!")}</p>
      <div className="coloring-pages" aria-label={tx(language, "색칠 그림 선택", "Choose a coloring page")}>
        {COLORING_PAGES.map((item, index) => (
          <button key={item.src} className={pageIndex === index ? "active" : ""} onClick={() => { resetBoard(); setPageIndex(index); }}>
            <span>{item.icon}</span><small>{language === "ko" ? item.ko : item.en}</small>
          </button>
        ))}
      </div>
      <div className="coloring-board">
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          className="coloring-canvas"
          onPointerDown={startPainting}
          onPointerMove={continuePainting}
          onPointerUp={stopPainting}
          onPointerCancel={stopPainting}
          onPointerLeave={stopPainting}
          aria-label={tx(language, `${page.ko} 색칠 도화지`, `${page.en} coloring canvas`)}
        />
        <Image ref={outlineRef} key={page.src} src={page.src} alt="" fill sizes="620px" unoptimized draggable={false} className="coloring-outline" style={{ objectFit: "contain", transform: "scale(0.76)" }} />
      </div>
      <div className="palette" aria-label={tx(language, "색상 선택", "Choose a color")}>
        {COLORS.map((item) => (
          <button key={item} className={`color-dot ${color === item && !isEraser ? "selected" : ""}`} style={{ background: item }} onClick={() => { setColor(item); setIsEraser(false); }} aria-label={item} />
        ))}
        <button className={`eraser-button ${isEraser ? "selected" : ""}`} onClick={() => setIsEraser(true)} aria-label={tx(language, "지우개", "Eraser")}><span>🧽</span><small>{tx(language, "지우개", "Eraser")}</small></button>
      </div>
      <div className="small-actions coloring-actions">
        <button className="soft-button" onClick={autoPaint}>✨ {tx(language, "자동 색칠", "Magic paint")}</button>
        <button className="soft-button" disabled={!hasPaint} onClick={resetBoard}>↻ {tx(language, "다시 칠하기", "Start over")}</button>
        <button className="soft-button" disabled={!hasPaint} onClick={save}>💾 {tx(language, "그림 저장", "Save picture")}</button>
        <button className="done-button" disabled={!hasPaint} onClick={onComplete}>⭐ {tx(language, "다 했어요!", "All done!")}</button>
      </div>
    </div>
  );
}
