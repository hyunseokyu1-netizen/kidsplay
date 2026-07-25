"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Language } from "../types";

type SafariWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function useSpeech(language: Language) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechRequestRef = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const pendingVoiceRetryRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synthesis = window.speechSynthesis;
    const updateVoices = () => {
      const voices = synthesis.getVoices();
      if (voices.length === 0) return;

      voicesRef.current = voices;
      const retry = pendingVoiceRetryRef.current;
      pendingVoiceRetryRef.current = null;
      retry?.();
    };

    updateVoices();
    synthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      synthesis.removeEventListener("voiceschanged", updateVoices);
      pendingVoiceRetryRef.current = null;
      synthesis.cancel();
      if (audioContextRef.current) void audioContextRef.current.close();
    };
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
      const request = speechRequestRef.current + 1;
      speechRequestRef.current = request;
      let started = false;
      let activeAttempt = 0;

      const currentVoices = synthesis.getVoices();
      if (currentVoices.length > 0) voicesRef.current = currentVoices;

      const startSpeaking = (useDefaultVoice = false) => {
        if (speechRequestRef.current !== request) return;

        const attempt = activeAttempt + 1;
        activeAttempt = attempt;
        const isKorean = language === "ko";
        const locale = isKorean ? "ko-KR" : "en-US";
        const matchingVoice = voicesRef.current.find((voice) => {
          const normalized = voice.lang.replace("_", "-");
          return normalized.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase());
        });
        const utterance = new SpeechSynthesisUtterance(isKorean ? ko : en);

        utterance.lang = locale;
        utterance.rate = 0.86;
        utterance.pitch = 1.12;
        utterance.volume = 1;
        // Assigning null to voice can make Chrome/Safari silently discard speech.
        if (matchingVoice && !useDefaultVoice) utterance.voice = matchingVoice;
        utterance.onstart = () => {
          if (speechRequestRef.current !== request || attempt !== activeAttempt) return;
          started = true;
          pendingVoiceRetryRef.current = null;
        };
        utterance.onend = () => {
          if (utteranceRef.current === utterance) utteranceRef.current = null;
        };
        utterance.onerror = (event) => {
          if (utteranceRef.current === utterance) utteranceRef.current = null;
          if (speechRequestRef.current !== request || attempt !== activeAttempt) return;

          console.warn("KidsPlay speech synthesis failed:", event.error);
          if (!started && matchingVoice && !useDefaultVoice) {
            window.setTimeout(() => startSpeaking(true), 0);
          }
        };

        if (synthesis.speaking || synthesis.pending) synthesis.cancel();
        synthesis.resume();
        synthesis.speak(utterance);
        utteranceRef.current = utterance;
      };

      if (voicesRef.current.length === 0) {
        pendingVoiceRetryRef.current = () => {
          if (!started && speechRequestRef.current === request) startSpeaking();
        };
      } else {
        pendingVoiceRetryRef.current = null;
      }

      // Keep this in the original click call stack so Chrome accepts the speech request.
      startSpeaking();
    },
    [language, playClickSound],
  );
}
