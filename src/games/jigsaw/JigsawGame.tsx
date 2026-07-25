"use client";

import { useState } from "react";
import { EmojiIcon, emojiSrc } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const ANIMALS = {
  toddler: { symbol: "🐮", ko: "젖소", en: "Cow", columns: 2, rows: 2 },
  preschool: { symbol: "🦊", ko: "여우", en: "Fox", columns: 3, rows: 2 },
  school: { symbol: "🐼", ko: "판다", en: "Panda", columns: 3, rows: 2 },
};

export function JigsawGame({ age, language, onComplete }: GameProps) {
  const animal = ANIMALS[age];
  const count = animal.columns * animal.rows;
  const pieces = Array.from({ length: count }, (_, index) => index);
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<number | null>(null);

  const pieceStyle = (index: number) => {
    const column = index % animal.columns;
    const row = Math.floor(index / animal.columns);
    return {
      backgroundImage: `url("${emojiSrc(animal.symbol)}")`,
      backgroundSize: `${animal.columns * 100}% ${animal.rows * 100}%`,
      backgroundPosition: `${animal.columns === 1 ? 0 : (column / (animal.columns - 1)) * 100}% ${animal.rows === 1 ? 0 : (row / (animal.rows - 1)) * 100}%`,
    };
  };

  const place = (piece: number, target: number) => {
    if (piece !== target || placed[piece]) return;
    const next = { ...placed, [piece]: true };
    setPlaced(next);
    setSelected(null);
    if (Object.keys(next).length === count) window.setTimeout(onComplete, 650);
  };

  return (
    <div className="jigsaw-game">
      <p className="game-prompt">{tx(language, `${animal.ko} 조각을 제자리에 맞춰요`, `Put the ${animal.en.toLowerCase()} pieces in place`)}</p>
      <div className="jigsaw-layout">
        <div className="jigsaw-picture" style={{ gridTemplateColumns: `repeat(${animal.columns}, 1fr)` }}>
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
      {Object.keys(placed).length === count && <div className="jigsaw-finished"><EmojiIcon symbol={animal.symbol} /></div>}
    </div>
  );
}
