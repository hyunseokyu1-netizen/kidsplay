"use client";

import { useState } from "react";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const TOTAL_ROUNDS = 10;

function valuesFor(age: GameProps["age"], round: number) {
  const limit = age === "toddler" ? 4 : age === "preschool" ? 6 : 9;
  const left = (round * 3 + 1) % limit + 1;
  const right = (round * 5 + 2) % limit + 1;
  return { left, right };
}

function choicesFor(answer: number, round: number) {
  const distractors = [Math.max(1, answer - 2), Math.max(1, answer - 1), answer + 1, answer + 2, answer + 3]
    .filter((value, index, values) => value !== answer && values.indexOf(value) === index)
    .slice(0, 3);
  const choices = distractors.slice();
  const answerPositions = [2, 0, 3, 1, 0, 3, 1, 2, 3, 0];
  choices.splice(answerPositions[round], 0, answer);
  return choices;
}

function CountCard({ value, color }: { value: number; color: string }) {
  return (
    <div className="addition-card" style={{ "--dot-color": color } as React.CSSProperties}>
      <strong>{value}</strong>
      <div className="count-dots">{Array.from({ length: value }, (_, index) => <span key={index} />)}</div>
    </div>
  );
}

export function AdditionGame({ age, language, onComplete }: GameProps) {
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const values = valuesFor(age, round);
  const answer = values.left + values.right;
  const choices = choicesFor(answer, round);

  const choose = (choice: number) => {
    if (choice !== answer) {
      setWrong(choice);
      window.setTimeout(() => setWrong(null), 450);
      return;
    }
    if (round === TOTAL_ROUNDS - 1) window.setTimeout(onComplete, 450);
    else setRound(round + 1);
  };

  return (
    <div className="addition-game">
      <p className="game-prompt">{tx(language, "그림을 세고 더한 답을 골라요", "Count the pictures and choose the sum")}</p>
      <div className="addition-progress">{Array.from({ length: TOTAL_ROUNDS }, (_, index) => <span key={index} className={index < round ? "done" : index === round ? "active" : ""} />)}</div>
      <div className="addition-equation">
        <CountCard value={values.left} color="#62B99B" /><b>＋</b><CountCard value={values.right} color="#ED8A59" /><b>＝</b><div className="addition-question">?</div>
      </div>
      <div className="addition-choices">
        {choices.map((choice) => (
          <button key={choice} className={wrong === choice ? "wrong" : ""} onClick={() => choose(choice)}>
            <strong>{choice}</strong><div className="mini-dots">{Array.from({ length: choice }, (_, index) => <span key={index} />)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
