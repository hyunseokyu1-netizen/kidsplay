"use client";

import { useCallback } from "react";
import type { Language } from "../types";

export function useSpeech(language: Language) {
  return useCallback(
    (ko: string, en: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(language === "ko" ? ko : en);
      utterance.lang = language === "ko" ? "ko-KR" : "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    },
    [language],
  );
}

