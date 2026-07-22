import type { AgeGroup, GameInfo } from "../types";

export const GAMES: GameInfo[] = [
  { id: "coloring", icon: "🎨", title: { ko: "색칠 놀이", en: "Coloring" }, subtitle: { ko: "알록달록 칠해요", en: "Paint with colors" }, color: "#F07D91", light: "#FFF0F3" },
  { id: "puzzle", icon: "🧩", title: { ko: "퍼즐", en: "Puzzle" }, subtitle: { ko: "조각을 맞춰요", en: "Fit the pieces" }, color: "#8C78E6", light: "#F1EEFF" },
  { id: "memory", icon: "🍓", title: { ko: "짝꿍 찾기", en: "Memory" }, subtitle: { ko: "같은 그림 찾아요", en: "Find matching pairs" }, color: "#EF8D45", light: "#FFF2E8" },
  { id: "alphabet", icon: "🔤", title: { ko: "알파벳", en: "Alphabet" }, subtitle: { ko: "소리 내어 읽어요", en: "Listen and learn" }, color: "#49A6DC", light: "#EAF7FF" },
  { id: "numbers", icon: "🔢", title: { ko: "숫자 놀이", en: "Numbers" }, subtitle: { ko: "차례대로 톡톡", en: "Tap in order" }, color: "#5CBFA5", light: "#E9FAF5" },
  { id: "animals", icon: "🦁", title: { ko: "동물 친구", en: "Animals" }, subtitle: { ko: "이름과 소리를 배워요", en: "Names and sounds" }, color: "#E3A83E", light: "#FFF8E4" },
  { id: "vehicles", icon: "🚒", title: { ko: "탈것", en: "Vehicles" }, subtitle: { ko: "부릉부릉 출발", en: "Ready, set, go" }, color: "#E66D56", light: "#FFF0ED" },
  { id: "dinosaurs", icon: "🦕", title: { ko: "공룡 나라", en: "Dinosaurs" }, subtitle: { ko: "쿵쿵 공룡 탐험", en: "Explore dinosaurs" }, color: "#73AF63", light: "#EFF9EC" },
  { id: "shapes", icon: "🔺", title: { ko: "모양 찾기", en: "Shapes" }, subtitle: { ko: "동그라미 세모 네모", en: "Circle, triangle, square" }, color: "#8B79D9", light: "#F2EFFF" },
  { id: "matching", icon: "🧦", title: { ko: "그림 맞추기", en: "Matching" }, subtitle: { ko: "딱 맞는 짝을 찾아요", en: "Find the right match" }, color: "#DE75A8", light: "#FFF0F8" },
];

export const AGE_LABELS: Record<AgeGroup, { ko: string; en: string }> = {
  toddler: { ko: "2~3세", en: "Ages 2–3" },
  preschool: { ko: "4~5세", en: "Ages 4–5" },
  school: { ko: "6~7세", en: "Ages 6–7" },
};

export const STICKERS = ["🌈", "🚀", "🦄", "🏅", "🐳", "🌻", "👑", "🍀"];

export const difficultyCount = (age: AgeGroup, values: [number, number, number]) =>
  values[age === "toddler" ? 0 : age === "preschool" ? 1 : 2];

