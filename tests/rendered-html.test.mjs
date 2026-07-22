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

test("includes all ten game modules in the client payload", async () => {
  const response = await render();
  const html = await response.text();
  const gameLabels = ["색칠 놀이", "퍼즐", "짝꿍 찾기", "알파벳", "숫자 놀이", "동물 친구", "탈것", "공룡 나라", "모양 찾기", "그림 맞추기"];
  for (const label of gameLabels) assert.match(html, new RegExp(label));
});

test("uses a multiplication challenge instead of a fixed parent password", async () => {
  const source = await readFile(new URL("../src/components/KidsPlayApp.tsx", import.meta.url), "utf8");
  assert.match(source, /left \* right/);
  assert.match(source, /곱셈 문제를 풀어 주세요/);
  assert.match(source, /setTimeout\(onExitRequest, 1000\)/);
  assert.doesNotMatch(source, /3초간 누르기|hold for 3 seconds/);
  assert.doesNotMatch(source, /2580|expectedPin|settings\.pin/);
});
