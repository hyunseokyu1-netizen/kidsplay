import type { AgeGroup, Language } from "../types";

export type GameProps = {
  age: AgeGroup;
  language: Language;
  onComplete: () => void;
};

export const tx = (language: Language, ko: string, en: string) =>
  language === "ko" ? ko : en;

