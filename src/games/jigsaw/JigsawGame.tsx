"use client";

import { useState } from "react";
import { EmojiIcon, emojiSrc } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const ANIMALS = [
  { symbol: "🐮", ko: "젖소", en: "Cow" },
  { symbol: "🦊", ko: "여우", en: "Fox" },
  { symbol: "🐼", ko: "판다", en: "Panda" },
  { symbol: "🦁", ko: "사자", en: "Lion" },
  { symbol: "🐰", ko: "토끼", en: "Rabbit" },
  { symbol: "🐸", ko: "개구리", en: "Frog" },
  { symbol: "🐶", ko: "강아지", en: "Dog" },
  { symbol: "🐱", ko: "고양이", en: "Cat" },
  { symbol: "🐵", ko: "원숭이", en: "Monkey" },
  { symbol: "🐳", ko: "고래", en: "Whale" },
  { symbol: "🦄", ko: "유니콘", en: "Unicorn" },
  { symbol: "🐊", ko: "악어", en: "Crocodile" },
];

function sizeFor(stage: number) {
  if (stage < 3) return { columns: 2, rows: 2 };
  if (stage < 7) return { columns: 3, rows: 2 };
  return { columns: 3, rows: 3 };
}

export function JigsawGame({ language, onComplete }: GameProps) {
  const [stage, setStage] = useState(0);
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const animal = ANIMALS[stage];
  const size = sizeFor(stage);
  const count = size.columns * size.rows;
  const pieces = Array.from({ length: count }, (_, index) => index);

  const pieceStyle = (index: number) => {
    const column = index % size.columns;
    const row = Math.floor(index / size.columns);
    return {
      backgroundImage: `url("${emojiSrc(animal.symbol)}")`,
      backgroundSize: `${size.columns * 100}% ${size.rows * 100}%`,
      backgroundPosition: `${size.columns === 1 ? 0 : (column / (size.columns - 1)) * 100}% ${size.rows === 1 ? 0 : (row / (size.rows - 1)) * 100}%`,
    };
  };

  const nextAnimal = () => {
    if (stage === ANIMALS.length - 1) {
      onComplete();
      return;
    }
    setStage(stage + 1);
    setPlaced({});
    setSelected(null);
  };

  const place = (piece: number, target: number) => {
    if (piece !== target || placed[piece]) return;
    const next = { ...placed, [piece]: true };
    setPlaced(next);
    setSelected(null);
    if (Object.keys(next).length === count) window.setTimeout(nextAnimal, 650);
  };

  return (
    <div className="jigsaw-game">
      <div className="level-caption">{tx(language, `${stage + 1}/${ANIMALS.length} · ${count}조각`, `${stage + 1}/${ANIMALS.length} · ${count} pieces`)}</div>
      <p className="game-prompt">{tx(language, `${animal.ko} 조각을 제자리에 맞춰요`, `Put the ${animal.en.toLowerCase()} pieces in place`)}</p>
      <div className="jigsaw-layout">
        <div className="jigsaw-reference">
          <small>{tx(language, "완성 그림", "Picture")}</small>
          <EmojiIcon symbol={animal.symbol} label={language === "ko" ? animal.ko : animal.en} />
          <strong>{language === "ko" ? animal.ko : animal.en}</strong>
        </div>
        <div className="jigsaw-picture" style={{ gridTemplateColumns: `repeat(${size.columns}, 1fr)`, gridTemplateRows: `repeat(${size.rows}, 1fr)` }}>
          {pieces.map((piece) => (
            <button
              key={piece}
              className={`jigsaw-slot ${placed[piece] ? "filled" : ""}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => place(Number(event.dataTransfer.getData("text/plain")), piece)}
              onClick={() => selected !== null && place(selected, piece)}
              aria-label={tx(language, `${piece + 1}번 조각 자리`, `Piece ${piece + 1} spot`)}
            >
              {placed[piece] && <span className="jigsaw-crop" style={pieceStyle(piece)} />}
              {!placed[piece] && <strong>{piece + 1}</strong>}
            </button>
          ))}
        </div>
        <div className="jigsaw-tray">
          {pieces.slice().reverse().map((piece) => !placed[piece] && (
            <button
              key={piece}
              draggable
              className={`jigsaw-piece ${selected === piece ? "selected" : ""}`}
              onDragStart={(event) => event.dataTransfer.setData("text/plain", String(piece))}
              onClick={() => setSelected(piece)}
              aria-label={tx(language, `${piece + 1}번 조각`, `Piece ${piece + 1}`)}
            >
              <span className="jigsaw-crop" style={pieceStyle(piece)} />
            </button>
          ))}
          {!Object.keys(placed).length && <small>{tx(language, "조각을 누른 뒤 같은 번호 칸을 눌러도 돼요", "Tap a piece, then tap the matching number")}</small>}
        </div>
      </div>
    </div>
  );
}
