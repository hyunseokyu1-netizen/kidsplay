"use client";

/* eslint-disable @next/next/no-img-element -- Local outline images are layered over a legacy-compatible canvas. */

import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const WIDTH = 700;
const HEIGHT = 390;
const COLORS = ["#222222", "#6D4C41", "#E85D75", "#F38B4A", "#F5C84C", "#72C66B", "#46B99B", "#4EB3D8", "#4D82D8", "#7969D3", "#B963C5", "#F2A8C6"];
const SIZES = [10, 24, 44];
const TEMPLATES = [
  { src: "/coloring/butterfly.svg", ko: "나비", en: "Butterfly" },
  { src: "/coloring/car.svg", ko: "자동차", en: "Car" },
  { src: "/coloring/flower.svg", ko: "꽃", en: "Flower" },
  { src: "/coloring/fish.svg", ko: "물고기", en: "Fish" },
  { src: "/coloring/cat.svg", ko: "고양이", en: "Cat" },
  { src: "/coloring/dog.svg", ko: "강아지", en: "Dog" },
  { src: "/coloring/rocket.svg", ko: "로켓", en: "Rocket" },
  { src: "/coloring/train.svg", ko: "기차", en: "Train" },
  { src: "/coloring/airplane.svg", ko: "비행기", en: "Airplane" },
  { src: "/coloring/castle.svg", ko: "성", en: "Castle" },
  { src: "/coloring/robot.svg", ko: "로봇", en: "Robot" },
  { src: "/coloring/owl.svg", ko: "부엉이", en: "Owl" },
  { src: "/coloring/elephant.svg", ko: "코끼리", en: "Elephant" },
  { src: "/coloring/hen.svg", ko: "암탉", en: "Hen" },
];

export function DrawingGame({ language, onComplete }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[2]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const [template, setTemplate] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  const coordinates = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * WIDTH, y: ((clientY - rect.top) / rect.height) * HEIGHT };
  };

  const start = (clientX: number, clientY: number) => {
    drawing.current = true;
    last.current = coordinates(clientX, clientY);
    paint(last.current, last.current);
  };

  const paint = (from: { x: number; y: number } | null, to: { x: number; y: number } | null) => {
    const context = canvasRef.current?.getContext("2d");
    if (!context || !from || !to) return;
    context.globalCompositeOperation = eraser ? "destination-out" : "source-over";
    context.strokeStyle = color;
    context.lineWidth = eraser ? size + 18 : size;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x + 0.01, to.y + 0.01);
    context.stroke();
    setHasDrawn(true);
  };

  const move = (clientX: number, clientY: number) => {
    if (!drawing.current) return;
    const point = coordinates(clientX, clientY);
    paint(last.current, point);
    last.current = point;
  };

  const stop = () => { drawing.current = false; last.current = null; };
  const clear = () => {
    const context = canvasRef.current?.getContext("2d");
    if (context) context.clearRect(0, 0, WIDTH, HEIGHT);
    setHasDrawn(false);
  };
  const onMouseDown = (event: ReactMouseEvent<HTMLCanvasElement>) => start(event.clientX, event.clientY);
  const onMouseMove = (event: ReactMouseEvent<HTMLCanvasElement>) => move(event.clientX, event.clientY);
  const onTouchStart = (event: ReactTouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    start(touch.clientX, touch.clientY);
  };
  const onTouchMove = (event: ReactTouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    move(touch.clientX, touch.clientY);
  };

  return (
    <div className="drawing-game">
      <p className="game-prompt">{tx(language, "좋아하는 색으로 마음껏 그려요!", "Draw anything with your favorite colors!")}</p>
      <div className="drawing-templates">
        {TEMPLATES.map((item, index) => <button key={item.en} className={template === index ? "active" : ""} onClick={() => { clear(); setTemplate(index); }}>{language === "ko" ? item.ko : item.en}</button>)}
      </div>
      <div className="drawing-layout">
        <div className="drawing-tools">
          <button className={eraser ? "active" : ""} onClick={() => setEraser(!eraser)}><span>⌫</span><small>{tx(language, "지우개", "Eraser")}</small></button>
          {SIZES.map((brush) => <button key={brush} className={!eraser && size === brush ? "active" : ""} onClick={() => { setSize(brush); setEraser(false); }}><span className="drawing-brush" style={{ width: brush, height: brush }} /></button>)}
        </div>
        <div className="drawing-paper">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stop} onMouseLeave={stop} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={stop} />
          <img src={TEMPLATES[template].src} alt="" draggable={false} />
        </div>
        <div className="drawing-colors">
          {COLORS.map((item) => <button key={item} className={color === item && !eraser ? "active" : ""} style={{ background: item }} onClick={() => { setColor(item); setEraser(false); }} aria-label={item} />)}
        </div>
      </div>
      <div className="small-actions"><button className="soft-button" disabled={!hasDrawn} onClick={clear}>↻ {tx(language, "새로 그리기", "Clear")}</button><button className="done-button" disabled={!hasDrawn} onClick={onComplete}>★ {tx(language, "완성!", "Finished!")}</button></div>
    </div>
  );
}
