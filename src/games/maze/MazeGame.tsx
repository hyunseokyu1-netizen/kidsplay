"use client";

import { useEffect, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const MAZE = [
  "1111111111",
  "1000000001",
  "1111111101",
  "1000000101",
  "1011110101",
  "1110011111",
];

type Cell = { row: number; col: number };

const cellKey = ({ row, col }: Cell) => `${row}-${col}`;

function findPath(start: Cell, goal: Cell) {
  const queue: Cell[] = [start];
  const previous: Record<string, Cell | null> = { [cellKey(start)]: null };
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    const current = queue.shift()!;
    if (current.row === goal.row && current.col === goal.col) {
      const path: Cell[] = [];
      let cursor: Cell | null = current;
      while (cursor) {
        path.unshift(cursor);
        cursor = previous[cellKey(cursor)];
      }
      return path;
    }
    directions.forEach(([rowDelta, colDelta]) => {
      const next = { row: current.row + rowDelta, col: current.col + colDelta };
      const key = cellKey(next);
      if (MAZE[next.row]?.[next.col] === "1" && !(key in previous)) {
        previous[key] = current;
        queue.push(next);
      }
    });
  }
  return [];
}

export function MazeGame({ language, onComplete }: GameProps) {
  const [player, setPlayer] = useState<Cell>({ row: 0, col: 0 });
  const [path, setPath] = useState<Cell[]>([]);
  const goal = { row: MAZE.length - 1, col: MAZE[0].length - 1 };
  const moving = path.length > 0;

  useEffect(() => {
    if (!path.length) return;
    const timer = window.setTimeout(() => {
      const [next, ...remaining] = path;
      setPlayer(next);
      setPath(remaining);
      if (!remaining.length && next.row === goal.row && next.col === goal.col) window.setTimeout(onComplete, 450);
    }, 105);
    return () => window.clearTimeout(timer);
  }, [goal.col, goal.row, onComplete, path]);

  const moveTo = (target: Cell) => {
    if (moving || MAZE[target.row][target.col] !== "1") return;
    const nextPath = findPath(player, target).slice(1);
    if (nextPath.length) setPath(nextPath);
  };

  return (
    <div className="maze-game">
      <p className="game-prompt">{tx(language, "길을 눌러 치즈까지 가요!", "Tap the path to reach the cheese!")}</p>
      <div className="maze-board" style={{ gridTemplateColumns: `repeat(${MAZE[0].length}, 1fr)` }}>
        {MAZE.map((row, rowIndex) => Array.from(row).map((cell, colIndex) => {
          const isPlayer = player.row === rowIndex && player.col === colIndex;
          const isGoal = goal.row === rowIndex && goal.col === colIndex;
          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`maze-cell ${cell === "1" ? "path" : "wall"} ${isGoal ? "goal" : ""}`}
              disabled={cell !== "1" || moving}
              onClick={() => moveTo({ row: rowIndex, col: colIndex })}
              aria-label={cell === "1" ? tx(language, "미로 길", "Maze path") : tx(language, "벽", "Wall")}
            >
              {isPlayer && <EmojiIcon symbol="🐰" label={tx(language, "토끼", "Rabbit")} />}
              {isGoal && !isPlayer && <span className="maze-cheese">▰</span>}
            </button>
          );
        }))}
      </div>
      <div className="maze-legend"><span><EmojiIcon symbol="🐰" /> {tx(language, "출발", "Start")}</span><span>▰ {tx(language, "도착", "Finish")}</span></div>
    </div>
  );
}
