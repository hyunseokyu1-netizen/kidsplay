"use client";

import { useEffect, useRef, useState } from "react";
import { AlphabetGame } from "../games/alphabet/AlphabetGame";
import { AnimalGame } from "../games/animals/AnimalGame";
import { ColoringGame } from "../games/coloring/ColoringGame";
import { DinosaurGame } from "../games/dinosaurs/DinosaurGame";
import { MatchingGame } from "../games/matching/MatchingGame";
import { MemoryGame } from "../games/memory/MemoryGame";
import { NumberGame } from "../games/numbers/NumberGame";
import { PuzzleGame } from "../games/puzzle/PuzzleGame";
import { GAMES, AGE_LABELS, STICKERS } from "../games/registry";
import { ShapeGame } from "../games/shapes/ShapeGame";
import { tx } from "../games/shared";
import { VehicleGame } from "../games/vehicles/VehicleGame";
import { useSpeech } from "../hooks/useSpeech";
import type { AgeGroup, GameId, Language, Progress, Settings } from "../types";

const DEFAULT_SETTINGS: Settings = { age: "preschool", minutes: 30, language: "ko", pin: "2580" };
const DEFAULT_PROGRESS: Progress = { stars: 0, completed: {}, stickers: [] };

const GAME_COMPONENTS = {
  coloring: ColoringGame,
  puzzle: PuzzleGame,
  memory: MemoryGame,
  alphabet: AlphabetGame,
  numbers: NumberGame,
  animals: AnimalGame,
  vehicles: VehicleGame,
  dinosaurs: DinosaurGame,
  shapes: ShapeGame,
  matching: MatchingGame,
};

function ParentScreen({
  settings,
  progress,
  selectedGame,
  onSettings,
  onSelectGame,
  onStart,
}: {
  settings: Settings;
  progress: Progress;
  selectedGame: GameId | null;
  onSettings: (settings: Settings) => void;
  onSelectGame: (game: GameId | null) => void;
  onStart: () => void;
}) {
  const language = settings.language;
  return (
    <main className="parent-page">
      <div className="parent-shell">
        <section className="welcome-panel">
          <div className="brand"><span className="brand-mark">K</span><strong>KidsPlay</strong></div>
          <div className="mascot-scene" aria-hidden="true">
            <span className="cloud cloud-one">☁</span><span className="cloud cloud-two">☁</span>
            <div className="sun">☀</div>
            <div className="mascot">🦕</div>
            <div className="ground"><span>🌼</span><span>🌷</span><span>🌼</span></div>
          </div>
          <h1>{tx(language, "우리 아이의 작은 놀이터", "A little playground for your child")}</h1>
          <p>{tx(language, "누르고, 듣고, 생각하며 즐겁게 배워요.", "Tap, listen, think, and learn through play.")}</p>
          <div className="progress-card">
            <span>⭐ <strong>{progress.stars}</strong> {tx(language, "별", "stars")}</span>
            <span>{progress.stickers.length ? progress.stickers.join(" ") : "🌱"}</span>
          </div>
        </section>

        <section className="setup-panel">
          <div className="setup-heading">
            <span className="parent-badge">🔒 {tx(language, "부모님 화면", "Parent area")}</span>
            <div className="language-switch" aria-label={tx(language, "언어", "Language")}>
              <button className={language === "ko" ? "active" : ""} onClick={() => onSettings({ ...settings, language: "ko" })}>한국어</button>
              <button className={language === "en" ? "active" : ""} onClick={() => onSettings({ ...settings, language: "en" })}>English</button>
            </div>
          </div>
          <h2>{tx(language, "놀이 준비하기", "Get ready to play")}</h2>

          <fieldset>
            <legend><span>1</span>{tx(language, "아이의 나이를 골라 주세요", "Choose your child's age")}</legend>
            <div className="segment-control age-control">
              {(Object.keys(AGE_LABELS) as AgeGroup[]).map((age) => (
                <button key={age} className={settings.age === age ? "active" : ""} onClick={() => onSettings({ ...settings, age })}>{AGE_LABELS[age][language]}</button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend><span>2</span>{tx(language, "놀이 시간을 정해 주세요", "Set play time")}</legend>
            <div className="segment-control time-control">
              {[15, 30, 45, 60].map((minutes) => (
                <button key={minutes} className={settings.minutes === minutes ? "active" : ""} onClick={() => onSettings({ ...settings, minutes })}>{minutes}{tx(language, "분", "m")}</button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend><span>3</span>{tx(language, "먼저 할 놀이", "Choose a first activity")} <small>{tx(language, "선택", "optional")}</small></legend>
            <div className="game-picker">
              <button className={selectedGame === null ? "active" : ""} onClick={() => onSelectGame(null)}>🏡<small>{tx(language, "놀이터", "Playground")}</small></button>
              {GAMES.map((game) => (
                <button key={game.id} className={selectedGame === game.id ? "active" : ""} onClick={() => onSelectGame(game.id)}>{game.icon}<small>{game.title[language]}</small></button>
              ))}
            </div>
          </fieldset>

          <label className="pin-setting">
            <span>{tx(language, "부모 PIN", "Parent PIN")}</span>
            <input inputMode="numeric" maxLength={4} value={settings.pin} onChange={(event) => onSettings({ ...settings, pin: event.target.value.replace(/\D/g, "").slice(0, 4) })} aria-label={tx(language, "네 자리 부모 PIN", "Four-digit parent PIN")} />
          </label>

          <button className="start-button" disabled={settings.pin.length !== 4} onClick={onStart}>
            <span>▶</span>{tx(language, "전체 화면으로 시작", "Start full screen")}
          </button>
          <p className="parent-tip">🖱 {tx(language, "시작 후에는 마우스만으로 놀 수 있어요", "After starting, everything works with the mouse")}</p>
        </section>
      </div>
    </main>
  );
}

function KidHeader({ language, remaining, progress, onExitRequest }: { language: Language; remaining: number; progress: Progress; onExitRequest: () => void }) {
  const holdTimer = useRef<number | null>(null);
  const startHold = () => {
    holdTimer.current = window.setTimeout(onExitRequest, 3000);
  };
  const stopHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };
  const minutes = Math.max(0, Math.ceil(remaining / 60));
  return (
    <header className="kid-header">
      <button className="parent-corner left" onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={startHold} onTouchEnd={stopHold} aria-label={tx(language, "부모 메뉴: 3초간 누르기", "Parent menu: hold for 3 seconds")}>🔒</button>
      <div className="kid-brand"><span>K</span> KidsPlay</div>
      <div className="kid-status"><span>⭐ {progress.stars}</span><span>⏱ {minutes}{tx(language, "분", "m")}</span></div>
      <button className="parent-corner right" onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={startHold} onTouchEnd={stopHold} aria-label={tx(language, "부모 메뉴: 3초간 누르기", "Parent menu: hold for 3 seconds")}>🔒</button>
    </header>
  );
}

function KidsHub({ language, progress, onChoose }: { language: Language; progress: Progress; onChoose: (game: GameId) => void }) {
  const speak = useSpeech(language);
  return (
    <main className="kids-hub">
      <div className="hub-title">
        <span className="hello-mascot">🐣</span>
        <div><p>{tx(language, "안녕, 꼬마 탐험가!", "Hello, little explorer!")}</p><h1>{tx(language, "오늘은 무엇을 해볼까?", "What shall we play today?")}</h1></div>
      </div>
      <div className="game-grid">
        {GAMES.map((game) => (
          <button
            key={game.id}
            className="game-card"
            style={{ "--card-color": game.color, "--card-light": game.light } as React.CSSProperties}
            onMouseEnter={() => undefined}
            onClick={() => { speak(game.title.ko, game.title.en); onChoose(game.id); }}
          >
            <span className="game-icon">{game.icon}</span>
            <span className="game-copy"><strong>{game.title[language]}</strong><small>{game.subtitle[language]}</small></span>
            <span className="card-stars">{progress.completed[game.id] ? "★" : "☆"}</span>
          </button>
        ))}
      </div>
      <p className="hub-hint">🔒 {tx(language, "부모님 메뉴는 위쪽 모서리를 3초간 눌러 주세요", "Parents: hold a top corner for 3 seconds")}</p>
    </main>
  );
}

function GameStage({ gameId, settings, progress, onHome, onComplete, onExitRequest, remaining }: { gameId: GameId; settings: Settings; progress: Progress; onHome: () => void; onComplete: () => void; onExitRequest: () => void; remaining: number }) {
  const game = GAMES.find((item) => item.id === gameId)!;
  const Component = GAME_COMPONENTS[gameId];
  return (
    <div className="game-page" style={{ "--game-color": game.color, "--game-light": game.light } as React.CSSProperties}>
      <KidHeader language={settings.language} remaining={remaining} progress={progress} onExitRequest={onExitRequest} />
      <div className="game-toolbar">
        <button className="home-button" onClick={onHome} aria-label={tx(settings.language, "놀이터로 가기", "Go to playground")}>🏠</button>
        <div className="game-title-pill"><span>{game.icon}</span><strong>{game.title[settings.language]}</strong></div>
        <div className="round-dots"><span className="active" /><span /><span /></div>
      </div>
      <main className="game-surface"><Component age={settings.age} language={settings.language} onComplete={onComplete} /></main>
    </div>
  );
}

function ExitGate({ language, expectedPin, timedOut, onClose, onExit }: { language: Language; expectedPin: string; timedOut: boolean; onClose: () => void; onExit: () => void }) {
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);
  const press = (number: string) => {
    if (pin.length >= 4) return;
    const next = pin + number;
    setPin(next);
    setWrong(false);
    if (next.length === 4) {
      if (next === expectedPin) window.setTimeout(onExit, 250);
      else window.setTimeout(() => { setWrong(true); setPin(""); }, 350);
    }
  };
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={tx(language, "부모 확인", "Parent check")}>
      <div className="pin-modal">
        <div className="pin-icon">{timedOut ? "⏰" : "🔐"}</div>
        <h2>{timedOut ? tx(language, "놀이 시간이 끝났어요", "Play time is over") : tx(language, "부모님 확인", "Grown-up check")}</h2>
        <p>{tx(language, "부모 PIN 네 자리를 눌러 주세요", "Enter the four-digit parent PIN")}</p>
        <div className={`pin-dots ${wrong ? "wrong" : ""}`}>{[0, 1, 2, 3].map((index) => <span key={index}>{pin.length > index ? "●" : "○"}</span>)}</div>
        <div className="pin-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => <button key={number} onClick={() => press(String(number))}>{number}</button>)}
          {!timedOut && <button className="pin-cancel" onClick={onClose}>✕</button>}
          <button onClick={() => press("0")}>0</button>
          <button onClick={() => setPin(pin.slice(0, -1))}>⌫</button>
        </div>
      </div>
    </div>
  );
}

function SuccessCard({ language, stars, sticker, onNext, onHome }: { language: Language; stars: number; sticker: string | null; onNext: () => void; onHome: () => void }) {
  const speak = useSpeech(language);
  useEffect(() => { speak("정말 잘했어요!", "Wonderful job!"); }, [speak]);
  return (
    <div className="modal-backdrop success-backdrop" role="dialog" aria-modal="true">
      <div className="success-card">
        <div className="confetti" aria-hidden="true">●　▲　★　●　▲</div>
        <span className="success-mascot">🦄</span>
        <h2>{tx(language, "정말 잘했어요!", "Wonderful job!")}</h2>
        <div className="earned-stars">{Array.from({ length: stars }, (_, index) => <span key={index}>★</span>)}</div>
        {sticker && <p className="new-sticker">{tx(language, "새 스티커!", "New sticker!")} <span>{sticker}</span></p>}
        <div className="success-actions">
          <button className="soft-button" onClick={onHome}>🏠 {tx(language, "놀이터", "Playground")}</button>
          <button className="next-button" onClick={onNext}>{tx(language, "다음 놀이", "Next game")} <span>▶</span></button>
        </div>
      </div>
    </div>
  );
}

export function KidsPlayApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [mode, setMode] = useState<"parent" | "kids">("parent");
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [remaining, setRemaining] = useState(DEFAULT_SETTINGS.minutes * 60);
  const [sessionEnd, setSessionEnd] = useState<number | null>(null);
  const [exitGate, setExitGate] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [success, setSuccess] = useState<{ stars: number; sticker: string | null } | null>(null);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const savedSettings = window.localStorage.getItem("kidsplay-settings");
        const savedProgress = window.localStorage.getItem("kidsplay-progress");
        if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
        if (savedProgress) setProgress({ ...DEFAULT_PROGRESS, ...JSON.parse(savedProgress) });
      } catch { /* Local storage can be disabled in private browsing. */ }
    }, 0);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("kidsplay-settings", JSON.stringify(settings)); } catch { /* no-op */ }
  }, [settings]);
  useEffect(() => {
    try { window.localStorage.setItem("kidsplay-progress", JSON.stringify(progress)); } catch { /* no-op */ }
  }, [progress]);

  useEffect(() => {
    if (mode !== "kids" || !sessionEnd) return;
    const update = () => {
      const seconds = Math.max(0, Math.ceil((sessionEnd - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) { setTimedOut(true); setExitGate(true); }
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [mode, sessionEnd]);

  useEffect(() => {
    if (mode !== "kids") return;
    const prevent = (event: Event) => event.preventDefault();
    const preventKey = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("dblclick", prevent);
    document.addEventListener("wheel", prevent, { passive: false });
    document.addEventListener("keydown", preventKey);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("dblclick", prevent);
      document.removeEventListener("wheel", prevent);
      document.removeEventListener("keydown", preventKey);
    };
  }, [mode]);

  const start = () => {
    const seconds = settings.minutes * 60;
    setRemaining(seconds);
    setSessionEnd(Date.now() + seconds * 1000);
    setActiveGame(selectedGame);
    setMode("kids");
    setTimedOut(false);
    const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
    const request = root.requestFullscreen || root.webkitRequestFullscreen;
    if (request) Promise.resolve(request.call(root)).catch(() => undefined);
  };

  const exit = () => {
    setExitGate(false);
    setTimedOut(false);
    setSuccess(null);
    setMode("parent");
    setActiveGame(null);
    setSessionEnd(null);
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
    const exitFullscreen = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (exitFullscreen) Promise.resolve(exitFullscreen.call(doc)).catch(() => undefined);
  };

  const complete = () => {
    if (!activeGame || success) return;
    const stars = settings.age === "toddler" ? 1 : settings.age === "preschool" ? 2 : 3;
    const newTotal = progress.stars + stars;
    const stickerIndex = Math.floor(newTotal / 6) - 1;
    const unlocked = stickerIndex >= 0 ? STICKERS[stickerIndex % STICKERS.length] : null;
    const sticker = unlocked && !progress.stickers.includes(unlocked) ? unlocked : null;
    setProgress({ stars: newTotal, completed: { ...progress.completed, [activeGame]: (progress.completed[activeGame] || 0) + 1 }, stickers: sticker ? [...progress.stickers, sticker] : progress.stickers });
    setSuccess({ stars, sticker });
  };

  const nextGame = () => {
    if (!activeGame) return;
    const current = GAMES.findIndex((game) => game.id === activeGame);
    setActiveGame(GAMES[(current + 1) % GAMES.length].id);
    setSuccess(null);
  };

  if (mode === "parent") return <ParentScreen settings={settings} progress={progress} selectedGame={selectedGame} onSettings={setSettings} onSelectGame={setSelectedGame} onStart={start} />;

  return (
    <div className="kid-mode">
      {activeGame ? (
        <GameStage gameId={activeGame} settings={settings} progress={progress} remaining={remaining} onHome={() => setActiveGame(null)} onComplete={complete} onExitRequest={() => setExitGate(true)} />
      ) : (
        <><KidHeader language={settings.language} remaining={remaining} progress={progress} onExitRequest={() => setExitGate(true)} /><KidsHub language={settings.language} progress={progress} onChoose={setActiveGame} /></>
      )}
      {success && <SuccessCard language={settings.language} stars={success.stars} sticker={success.sticker} onNext={nextGame} onHome={() => { setSuccess(null); setActiveGame(null); }} />}
      {exitGate && <ExitGate language={settings.language} expectedPin={settings.pin} timedOut={timedOut} onClose={() => setExitGate(false)} onExit={exit} />}
    </div>
  );
}
