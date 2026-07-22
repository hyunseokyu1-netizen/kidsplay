"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Language } from "../types";

type SafariWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function useSpeech(language: Language) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  const playClickSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as SafariWindow).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = context;
      if (context.state === "suspended") void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(620, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(820, context.currentTime + 0.11);
      gain.gain.setValueAtTime(0.055, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.14);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.15);
    } catch { /* Some browsers block audio until a direct click. */ }
  }, []);

  return useCallback(
    (ko: string, en: string) => {
      if (typeof window === "undefined") return;
      playClickSound();
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;

      const synthesis = window.speechSynthesis;
      const voices = synthesis.getVoices();
      const koreanVoice = voices.find((voice) => /^ko([-_]|$)/i.test(voice.lang));
      const englishVoice = voices.find((voice) => /^en([-_]|$)/i.test(voice.lang));
      const canSpeakKorean = language === "ko" && (Boolean(koreanVoice) || voices.length === 0);
      const utterance = new SpeechSynthesisUtterance(canSpeakKorean ? ko : en);

      utterance.lang = canSpeakKorean ? "ko-KR" : "en-US";
      utterance.rate = 0.86;
      utterance.pitch = 1.12;
      utterance.volume = 1;
      utterance.voice = canSpeakKorean ? koreanVoice || null : englishVoice || null;
      utterance.onend = () => { if (utteranceRef.current === utterance) utteranceRef.current = null; };
      utterance.onerror = () => { if (utteranceRef.current === utterance) utteranceRef.current = null; };

      synthesis.cancel();
      synthesis.resume();
      utteranceRef.current = utterance;
      synthesis.speak(utterance);
    },
    [language, playClickSound],
  );
}
