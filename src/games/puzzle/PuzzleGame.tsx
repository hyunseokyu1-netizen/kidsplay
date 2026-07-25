"use client";

import { useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import { difficultyCount } from "../registry";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const PIECES = ["🦁", "🐸", "🐰", "🐼", "🦊", "🐳"];

export function PuzzleGame({ age, language, onComplete }: GameProps) {
  const count = difficultyCount(age, [3, 4, 6]);
  const pieces = PIECES.slice(0, count);
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const place = (piece: string, target: string) => {
    if (piece !== target || placed.includes(piece)) return;
    const next = [...placed, piece];
    setPlaced(next);
    setSelected(null);
    if (next.length === pieces.length) window.setTimeout(onComplete, 400);
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, "친구를 같은 그림 위에 놓아 주세요", "Put each friend on its matching spot")}</p>
      <div className="puzzle-targets">
        {pieces.map((piece) => (
          <button
            key={piece}
            className={`puzzle-target ${placed.includes(piece) ? "filled" : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => place(event.dataTransfer.getData("text/plain"), piece)}
            onClick={() => selected && place(selected, piece)}
            aria-label={tx(language, `${piece} 자리`, `${piece} spot`)}
          >
            {placed.includes(piece)
              ? <EmojiIcon symbol={piece} />
              : <span className="ghost-piece"><EmojiIcon symbol={piece} /></span>}
          </button>
        ))}
      </div>
      <div className="puzzle-pieces">
        {[...pieces].reverse().map((piece) => !placed.includes(piece) && (
          <button
            key={piece}
            draggable
            className={`puzzle-piece ${selected === piece ? "selected-piece" : ""}`}
            onDragStart={(event) => event.dataTransfer.setData("text/plain", piece)}
            onClick={() => setSelected(piece)}
          ><EmojiIcon symbol={piece} /></button>
        ))}
      </div>
    </div>
  );
}
