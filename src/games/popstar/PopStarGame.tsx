"use client";

import { useMemo, useState } from "react";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const ROWS = 6;
const COLS = 8;
const COLORS = ["pink", "blue", "yellow", "green", "purple"];
type Board = Array<Array<string | null>>;

function makeBoard(): Board {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => COLORS[(Math.floor(row / 2) + Math.floor(col / 2) * 2 + (row > 3 ? 1 : 0)) % COLORS.length]),
  );
}

function groupAt(board: Board, row: number, col: number) {
  const color = board[row]?.[col];
  if (!color) return [] as Array<[number, number]>;
  const found: Array<[number, number]> = [];
  const seen: Record<string, boolean> = {};
  const queue: Array<[number, number]> = [[row, col]];
  while (queue.length) {
    const current = queue.shift()!;
    const key = `${current[0]}-${current[1]}`;
    if (seen[key] || board[current[0]]?.[current[1]] !== color) continue;
    seen[key] = true;
    found.push(current);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([rowDelta, colDelta]) => queue.push([current[0] + rowDelta, current[1] + colDelta]));
  }
  return found;
}

function collapse(board: Board) {
  const columns: Array<Array<string | null>> = [];
  for (let col = 0; col < COLS; col += 1) {
    const values = board.map((row) => row[col]).filter(Boolean) as string[];
    if (values.length) columns.push(Array(ROWS - values.length).fill(null).concat(values));
  }
  while (columns.length < COLS) columns.push(Array(ROWS).fill(null));
  return Array.from({ length: ROWS }, (_, row) => columns.map((column) => column[row]));
}

export function PopStarGame({ age, language, onComplete }: GameProps) {
  const [board, setBoard] = useState<Board>(makeBoard);
  const [score, setScore] = useState(0);
  const target = age === "toddler" ? 180 : age === "preschool" ? 320 : 480;
  const remaining = useMemo(() => board.reduce((total, row) => total + row.filter(Boolean).length, 0), [board]);

  const pop = (row: number, col: number) => {
    const group = groupAt(board, row, col);
    if (group.length < 2) return;
    const next = board.map((line) => line.slice());
    group.forEach(([groupRow, groupCol]) => { next[groupRow][groupCol] = null; });
    const newScore = score + group.length * group.length * 5;
    setBoard(collapse(next));
    setScore(newScore);
    if (newScore >= target || remaining - group.length === 0) window.setTimeout(onComplete, 550);
  };

  return (
    <div className="popstar-game">
      <div className="popstar-status"><span>{tx(language, "목표", "Target")} <strong>{target}</strong></span><span>{tx(language, "점수", "Score")} <strong>{score}</strong></span><span>{tx(language, "남은 별", "Stars")} <strong>{remaining}</strong></span></div>
      <p className="game-prompt">{tx(language, "붙어 있는 같은 색 별을 눌러요!", "Tap connected stars of the same color!")}</p>
      <div className="popstar-board">
        {board.map((row, rowIndex) => row.map((color, colIndex) => (
          <button key={`${rowIndex}-${colIndex}`} className={`pop-block ${color || "empty"}`} disabled={!color} onClick={() => pop(rowIndex, colIndex)} aria-label={color || ""}><span>★</span></button>
        )))}
      </div>
      <small className="popstar-tip">{tx(language, "많이 붙어 있을수록 점수가 커져요", "Bigger groups earn more points")}</small>
    </div>
  );
}
