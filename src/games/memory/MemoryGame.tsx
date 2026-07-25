"use client";

import { useMemo, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const ICONS = ["🍓", "🍋", "🍇", "🥝", "🍒", "🥕", "🐰", "🐼", "🦊", "🐸", "🐶", "🐱", "🐵", "🐳", "🦄", "🐊"];
const LEVELS = [
  { ko: "초급", en: "Beginner", cards: 8 },
  { ko: "중급", en: "Intermediate", cards: 16 },
  { ko: "고급", en: "Advanced", cards: 32 },
];

function orderedCards(level: number) {
  const pairCount = LEVELS[level].cards / 2;
  const cards = ICONS.slice(0, pairCount).flatMap((icon, index) => [{ icon, id: `${index}-a` }, { icon, id: `${index}-b` }]);
  return cards.slice().sort((a, b) => {
    const valueA = (a.id.charCodeAt(0) * 17 + a.id.charCodeAt(2) * 31 + level * 13) % 47;
    const valueB = (b.id.charCodeAt(0) * 17 + b.id.charCodeAt(2) * 31 + level * 13) % 47;
    return valueA - valueB;
  });
}

export function MemoryGame({ language, onComplete }: GameProps) {
  const [level, setLevel] = useState(0);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const cards = useMemo(() => orderedCards(level), [level]);
  const pairCount = cards.length / 2;

  const startLevel = (nextLevel: number) => {
    setLevel(nextLevel);
    setOpen([]);
    setMatched([]);
  };

  const flip = (id: string) => {
    if (open.length === 0) {
      setOpen([id]);
      return;
    }
    if (open[0] === id) return;
    const nextOpen = [open[0], id];
    setOpen(nextOpen);
    const first = cards.find((card) => card.id === open[0]);
    const second = cards.find((card) => card.id === id);
    if (first?.icon === second?.icon) {
      const nextMatched = [...matched, first!.icon];
      window.setTimeout(() => {
        setMatched(nextMatched);
        setOpen([]);
        if (nextMatched.length === pairCount) {
          window.setTimeout(() => {
            if (level === LEVELS.length - 1) onComplete();
            else startLevel(level + 1);
          }, 450);
        }
      }, 260);
    } else {
      window.setTimeout(() => setOpen([]), 650);
    }
  };

  const columns = level === 0 ? 4 : level === 1 ? 4 : 8;

  return (
    <div className={`memory-game memory-level-${level + 1}`}>
      <div className="difficulty-tabs">
        {LEVELS.map((item, index) => <button key={item.en} className={level === index ? "active" : ""} onClick={() => startLevel(index)}>{language === "ko" ? item.ko : item.en}<small>{item.cards}</small></button>)}
      </div>
      <p className="game-prompt">{tx(language, `같은 그림 두 장을 찾아요 · ${cards.length}장`, `Find matching pairs · ${cards.length} cards`)}</p>
      <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {cards.map((card) => {
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
