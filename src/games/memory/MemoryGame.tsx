"use client";

import { useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import { difficultyCount } from "../registry";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const ICONS = ["🍓", "🍋", "🍇", "🥝", "🍒", "🥕"];

export function MemoryGame({ age, language, onComplete }: GameProps) {
  const pairCount = difficultyCount(age, [2, 3, 4]);
  const cards = ICONS.slice(0, pairCount).flatMap((icon, index) => [{ icon, id: `${index}-a` }, { icon, id: `${index}-b` }]);
  const ordered = cards.filter((_, index) => index % 2 === 0).concat(cards.filter((_, index) => index % 2 === 1).reverse());
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  const flip = (id: string) => {
    if (open.length === 0) {
      setOpen([id]);
      return;
    }
    const nextOpen = [open[0], id];
    setOpen(nextOpen);
    const first = ordered.find((card) => card.id === open[0]);
    const second = ordered.find((card) => card.id === id);
    if (first?.icon === second?.icon) {
      const nextMatched = [...matched, first!.icon];
      window.setTimeout(() => {
        setMatched(nextMatched);
        setOpen([]);
        if (nextMatched.length === pairCount) window.setTimeout(onComplete, 450);
      }, 300);
    } else {
      window.setTimeout(() => setOpen([]), 700);
    }
  };

  return (
    <div>
      <p className="game-prompt">{tx(language, "같은 그림 두 장을 찾아요", "Find two cards with the same picture")}</p>
      <div className="memory-grid" style={{ maxWidth: pairCount <= 2 ? 500 : 700 }}>
        {ordered.map((card) => {
          const visible = open.includes(card.id) || matched.includes(card.icon);
          return (
            <button key={card.id} className={`memory-card ${visible ? "open" : ""}`} disabled={visible || open.length === 2} onClick={() => flip(card.id)}>
              <span>{visible ? <EmojiIcon symbol={card.icon} /> : "?"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
