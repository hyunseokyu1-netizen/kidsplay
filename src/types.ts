export type AgeGroup = "toddler" | "preschool" | "school";
export type Language = "ko" | "en";

export type GameId =
  | "coloring"
  | "puzzle"
  | "memory"
  | "alphabet"
  | "numbers"
  | "animals"
  | "vehicles"
  | "dinosaurs"
  | "shapes"
  | "matching";

export type GameInfo = {
  id: GameId;
  icon: string;
  title: { ko: string; en: string };
  subtitle: { ko: string; en: string };
  color: string;
  light: string;
};

export type Settings = {
  age: AgeGroup;
  minutes: number;
  language: Language;
  pin: string;
};

export type Progress = {
  stars: number;
  completed: Partial<Record<GameId, number>>;
  stickers: string[];
};

