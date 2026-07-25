import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("https://kidsplay.test/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the KidsPlay parent screen", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>KidsPlay — 우리 아이의 작은 놀이터<\/title>/i);
  assert.match(html, /놀이 준비하기/);
  assert.match(html, /전체 화면으로 시작/);
  assert.match(html, /색칠 놀이/);
  assert.match(html, /공룡 나라/);
  assert.match(html, /그림 맞추기/);
  assert.match(html, /href="\/manifest\.webmanifest"/);
  assert.match(html, /content="https?:\/\/[^\"]+\/og\.png"/);
  assert.doesNotMatch(html, /부모 PIN|Parent PIN/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
});

test("includes all seventeen game modules in the client payload", async () => {
  const response = await render();
  const html = await response.text();
  const gameLabels = [
    "색칠 놀이", "퍼즐", "짝꿍 찾기", "알파벳", "숫자 놀이", "동물 친구", "탈것", "공룡 나라", "모양 찾기", "그림 맞추기",
    "미로 찾기", "동물 직소", "더하기 카드", "숫자 선 잇기", "별 팡팡", "모양 달리기", "숨은 모양",
  ];
  for (const label of gameLabels) assert.match(html, new RegExp(label));
  assert.doesNotMatch(html, /그림 그리기/);
});

test("uses a multiplication challenge instead of a fixed parent password", async () => {
  const source = await readFile(new URL("../src/components/KidsPlayApp.tsx", import.meta.url), "utf8");
  assert.match(source, /left \* right/);
  assert.match(source, /곱셈 문제를 풀어 주세요/);
  assert.match(source, /setTimeout\(onExitRequest, 1000\)/);
  assert.match(source, /className="math-close"/);
  assert.doesNotMatch(source, /!timedOut && <button className="math-close"/);
  assert.doesNotMatch(source, /3초간 누르기|hold for 3 seconds/);
  assert.doesNotMatch(source, /2580|expectedPin|settings\.pin/);
});

test("ships the requested interactive game mechanics", async () => {
  const maze = await readFile(new URL("../src/games/maze/MazeGame.tsx", import.meta.url), "utf8");
  const jigsaw = await readFile(new URL("../src/games/jigsaw/JigsawGame.tsx", import.meta.url), "utf8");
  const addition = await readFile(new URL("../src/games/addition/AdditionGame.tsx", import.meta.url), "utf8");
  const coloring = await readFile(new URL("../src/games/coloring/ColoringGame.tsx", import.meta.url), "utf8");
  const dots = await readFile(new URL("../src/games/connectdots/ConnectDotsGame.tsx", import.meta.url), "utf8");
  const popstar = await readFile(new URL("../src/games/popstar/PopStarGame.tsx", import.meta.url), "utf8");
  const running = await readFile(new URL("../src/games/running/RunningGame.tsx", import.meta.url), "utf8");
  const hidden = await readFile(new URL("../src/games/hiddenshape/HiddenShapeGame.tsx", import.meta.url), "utf8");
  const memory = await readFile(new URL("../src/games/memory/MemoryGame.tsx", import.meta.url), "utf8");
  const puzzle = await readFile(new URL("../src/games/puzzle/PuzzleGame.tsx", import.meta.url), "utf8");

  assert.match(maze, /findPath/);
  assert.match(maze, /TOTAL_LEVELS = 10/);
  assert.match(maze, /gridTemplateRows/);
  assert.match(jigsaw, /onDrop/);
  assert.equal((jigsaw.match(/symbol: "/g) ?? []).length, 12);
  assert.match(jigsaw, /jigsaw-reference/);
  assert.match(addition, /values\.left \+ values\.right/);
  assert.match(addition, /TOTAL_ROUNDS = 10/);
  assert.match(addition, /answerPositions/);
  assert.match(coloring, /getContext\("2d"\)/);
  assert.doesNotMatch(coloring, /자유 그림|Free draw/);
  assert.match(dots, /lineTo/);
  assert.equal((dots.match(/symbol: "/g) ?? []).length, 5);
  assert.match(popstar, /group\.length \* group\.length/);
  assert.match(popstar, /if \(group\.length < 2\) return/);
  assert.match(running, /runner-character/);
  assert.match(running, /runner-speed-lines/);
  assert.match(running, /runner-trees/);
  assert.match(running, /setSeconds\(5\)/);
  assert.match(running, /RECORD_KEY/);
  assert.match(hidden, /camera-frame/);
  assert.match(hidden, /TARGETS = \[1, 3, 0, 4, 2, 5, 6, 3, 7, 1\]/);
  assert.match(hidden, /speak\(`\$\{name\.ko\}를 찾아보세요`/);
  assert.match(memory, /cards: 8/);
  assert.match(memory, /cards: 16/);
  assert.match(memory, /cards: 32/);
  assert.match(puzzle, /\[4, 6, 8, 10, 12\]/);
});

test("offers expanded coloring pages, brush sizes, and zoom", async () => {
  const source = await readFile(new URL("../src/games/coloring/ColoringGame.tsx", import.meta.url), "utf8");
  assert.match(source, /const BRUSH_SIZES = \[18, 36, 58\]/);
  assert.match(source, /zoom >= 1\.5/);
  assert.match(source, /\/coloring\/robot\.svg/);
  assert.match(source, /className="coloring-zoom-layer"/);
  assert.match(source, /transform: `scale\(\$\{zoom\}\)`/);
  assert.match(source, /drawContained\(context, outline, 1\)/);
  assert.equal((source.match(/src: "\/coloring\//g) ?? []).length, 14);
  assert.equal((source.match(/#[0-9A-F]{6}/g) ?? []).length >= 12, true);
});

test("offers three difficulty levels for longer learning games", async () => {
  const alphabet = await readFile(new URL("../src/games/alphabet/AlphabetGame.tsx", import.meta.url), "utf8");
  const numbers = await readFile(new URL("../src/games/numbers/NumberGame.tsx", import.meta.url), "utf8");
  const animals = await readFile(new URL("../src/games/animals/AnimalGame.tsx", import.meta.url), "utf8");
  const vehicles = await readFile(new URL("../src/games/vehicles/VehicleGame.tsx", import.meta.url), "utf8");
  const dinosaurs = await readFile(new URL("../src/games/dinosaurs/DinosaurGame.tsx", import.meta.url), "utf8");

  assert.match(alphabet, /count: 26/);
  assert.match(numbers, /count: 10/);
  assert.match(numbers, /count: 30/);
  assert.match(numbers, /count: 50/);
  assert.match(animals, /count: 15/);
  assert.match(vehicles, /count: 15/);
  assert.match(dinosaurs, /count: 10/);
});

test("prefers local browser voices and safely resets Chrome's speech queue", async () => {
  const speech = await readFile(new URL("../src/hooks/useSpeech.ts", import.meta.url), "utf8");

  assert.match(speech, /addEventListener\("voiceschanged", updateVoices\)/);
  assert.match(speech, /voice\.localService \? 4 : 0/);
  assert.match(speech, /if \(matchingVoice && !useDefaultVoice\) utterance\.voice = matchingVoice/);
  assert.match(speech, /window\.setTimeout\(enqueue, SPEECH_QUEUE_DELAY_MS\)/);
  assert.match(speech, /SPEECH_START_TIMEOUT_MS/);
  assert.match(speech, /synthesis\.speak\(utterance\)/);
  assert.match(speech, /startSpeaking\(\);\s*$/m);
  assert.doesNotMatch(speech, /utterance\.voice\s*=\s*.*\|\|\s*null/);
  assert.doesNotMatch(speech, /synthesis\.cancel\(\);\s*synthesis\.speak\(utterance\)/);
  assert.doesNotMatch(speech, /setTimeout\(startSpeaking,\s*45\)/);
});

test("supports compact legacy laptop screens and image-based emoji", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/components/KidsPlayApp.tsx", import.meta.url), "utf8");
  const emoji = await readFile(new URL("../src/components/EmojiIcon.tsx", import.meta.url), "utf8");

  assert.match(css, /min-width: 900px\) and \(max-height: 820px/);
  assert.match(css, /\.game-surface \{ height: calc\(100vh - 146px\)/);
  assert.match(app, /<EmojiIcon symbol=\{game\.icon\}/);
  assert.match(emoji, /\/emoji\/\$\{emojiCode\(symbol\)\}\.svg/);
});
