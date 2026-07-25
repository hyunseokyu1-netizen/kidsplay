"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmojiIcon } from "../../components/EmojiIcon";
import type { GameProps } from "../shared";
import { tx } from "../shared";

const SHAPES = ["circle", "square", "triangle", "diamond", "pentagon"];
const RECORD_KEY = "kidsplay-shape-runner-record";

function Shape({ type }: { type: string }) {
  return <span className={`runner-shape ${type}`} />;
}

export function RunningGame({ language, onComplete }: GameProps) {
  const [turn, setTurn] = useState(0);
  const [seconds, setSeconds] = useState(5);
  const [ended, setEnded] = useState(false);
  const [record, setRecord] = useState(0);
  const distance = turn * 10;
  const target = SHAPES[(turn * 3 + 1) % SHAPES.length];
  const choices = useMemo(() => {
    const rotated = SHAPES.slice(turn % SHAPES.length).concat(SHAPES.slice(0, turn % SHAPES.length));
    const next = rotated.slice(0, 4);
    if (!next.includes(target)) next[turn % 4] = target;
    return next;
  }, [target, turn]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setRecord(Number(window.localStorage.getItem(RECORD_KEY)) || 0); } catch { /* Device storage may be disabled. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const finishRun = useCallback(() => {
    setEnded(true);
    if (distance > record) {
      setRecord(distance);
      try { window.localStorage.setItem(RECORD_KEY, String(distance)); } catch { /* Device storage may be disabled. */ }
    }
  }, [distance, record]);

  useEffect(() => {
    if (ended) return;
    const timer = window.setTimeout(() => {
      if (seconds <= 1) finishRun();
      else setSeconds(seconds - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [ended, finishRun, seconds]);

  const choose = (shape: string) => {
    if (shape !== target) {
      finishRun();
      return;
    }
    setTurn(turn + 1);
    setSeconds(5);
  };

  const retry = () => {
    setTurn(0);
    setSeconds(5);
    setEnded(false);
  };

  return (
    <div className="runner-game">
      <div className="runner-status"><span>{tx(language, "거리", "Distance")} <strong>{distance}m</strong></span><span>{tx(language, "기록", "Record")} <strong>{record}m</strong></span><span className={seconds <= 2 ? "urgent" : ""}>{tx(language, "남은 시간", "Time")} <strong>{seconds}</strong></span></div>
      <p className="game-prompt">{tx(language, "5초 안에 같은 모양을 눌러 계속 달려요!", "Match the shape within 5 seconds and keep running!")}</p>
      <div className="runner-scene">
        <div className="runner-clouds" aria-hidden="true"><span /><span /><span /></div>
        <div className="distance-signs"><span>{distance + 10}m</span><span>{distance + 20}m</span><span>{distance + 30}m</span></div>
        <div className="runner-hills"><span /><span /><span /></div>
        <div className="runner-trees" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="runner-speed-lines" aria-hidden="true"><span /><span /><span /></div>
        <div key={turn} className="runner-character"><EmojiIcon symbol="🐣" /><i /><b /></div>
        <div className="runner-bubble"><Shape type={target} /></div>
        <div className="runner-road" />
        {ended && (
          <div className="runner-result">
            <strong>{distance >= record && distance > 0 ? tx(language, "새 기록!", "New record!") : tx(language, "달리기 끝!", "Run finished!")}</strong>
            <b>{distance}m</b>
            <small>{tx(language, `최고 기록 ${Math.max(record, distance)}m`, `Best ${Math.max(record, distance)}m`)}</small>
            <div><button onClick={retry}>↻ {tx(language, "다시 달리기", "Run again")}</button><button onClick={onComplete}>★ {tx(language, "완료", "Finish")}</button></div>
          </div>
        )}
      </div>
      <div className="runner-choices">
        {choices.map((shape) => <button key={shape} disabled={ended} onClick={() => choose(shape)}><Shape type={shape} /></button>)}
      </div>
    </div>
  );
}
