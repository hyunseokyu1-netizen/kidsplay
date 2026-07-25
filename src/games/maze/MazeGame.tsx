"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

type Cell = { row: number; col: number };
type Maze = { grid: string[]; start: Cell; goal: Cell };

const TOTAL_LEVELS = 10;
const cellKey = ({ row, col }: Cell) => `${row}-${col}`;

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createMaze(level: number): Maze {
  const rows = 7 + Math.floor(level / 3) * 2;
  const cols = 11 + Math.floor(level / 2) * 2;
  const cells = Array.from({ length: rows }, () => Array(cols).fill("0"));
  const random = seeded(7319 + level * 977);
  const stack: Cell[] = [{ row: 1, col: 1 }];
  cells[1][1] = "1";

  while (stack.length) {
    const current = stack[stack.length - 1];
    const candidates = [
      { row: current.row + 2, col: current.col },
      { row: current.row - 2, col: current.col },
      { row: current.row, col: current.col + 2 },
      { row: current.row, col: current.col - 2 },
    ].filter((next) => next.row > 0 && next.row < rows - 1 && next.col > 0 && next.col < cols - 1 && cells[next.row][next.col] === "0");

    if (!candidates.length) {
      stack.pop();
      continue;
    }
    const next = candidates[Math.floor(random() * candidates.length)];
    cells[(current.row + next.row) / 2][(current.col + next.col) / 2] = "1";
    cells[next.row][next.col] = "1";
    stack.push(next);
  }

  return {
    grid: cells.map((row) => row.join("")),
    start: { row: 1, col: 1 },
    goal: { row: rows - 2, col: cols - 2 },
  };
}

function findPath(maze: string[], start: Cell, goal: Cell) {
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
      if (maze[next.row]?.[next.col] === "1" && !(key in previous)) {
        previous[key] = current;
        queue.push(next);
      }
    });
  }
  return [];
}

export function MazeGame({ language, onComplete }: GameProps) {
  const [level, setLevel] = useState(0);
  const maze = useMemo(() => createMaze(level), [level]);
  const [player, setPlayer] = useState<Cell>(maze.start);
  const [path, setPath] = useState<Cell[]>([]);
  const moving = path.length > 0;

  const selectLevel = useCallback((nextLevel: number) => {
    setPlayer({ row: 1, col: 1 });
    setPath([]);
    setLevel(nextLevel);
  }, []);

  useEffect(() => {
    if (!path.length) return;
    const timer = window.setTimeout(() => {
      const [next, ...remaining] = path;
      setPlayer(next);
      setPath(remaining);
      if (!remaining.length && next.row === maze.goal.row && next.col === maze.goal.col) {
        window.setTimeout(() => {
          if (level === TOTAL_LEVELS - 1) onComplete();
          else selectLevel(level + 1);
        }, 500);
      }
    }, 82);
    return () => window.clearTimeout(timer);
  }, [level, maze.goal.col, maze.goal.row, onComplete, path, selectLevel]);

  const moveTo = (target: Cell) => {
    if (moving || maze.grid[target.row][target.col] !== "1") return;
    const nextPath = findPath(maze.grid, player, target).slice(1);
    if (nextPath.length) setPath(nextPath);
  };

  return (
    <div className="maze-game">
      <div className="level-strip" aria-label={tx(language, "미로 단계", "Maze levels")}>
        {Array.from({ length: TOTAL_LEVELS }, (_, index) => (
          <button key={index} className={level === index ? "active" : ""} disabled={moving} onClick={() => selectLevel(index)}>{index + 1}</button>
        ))}
      </div>
      <p className="game-prompt">{tx(language, `미로 ${level + 1}단계 · 길을 눌러 치즈까지 가요!`, `Maze ${level + 1} · Tap the path to the cheese!`)}</p>
      <div
        className="maze-board"
        style={{
          gridTemplateColumns: `repeat(${maze.grid[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${maze.grid.length}, 1fr)`,
        }}
      >
        {maze.grid.map((row, rowIndex) => Array.from(row).map((cell, colIndex) => {
          const isPlayer = player.row === rowIndex && player.col === colIndex;
          const isGoal = maze.goal.row === rowIndex && maze.goal.col === colIndex;
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
