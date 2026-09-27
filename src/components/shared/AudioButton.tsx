"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  applyNaturalVoice,
  loadVoices,
  type SpeechSpeed,
} from "@/lib/speech/natural-voice";

export type { SpeechSpeed };

export interface AudioButtonProps {
  text: string;
  label?: string;
  speed?: SpeechSpeed;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AudioButton({
  text,
  label = "Listen",
  speed = "normal",
  className,
  size = "md",
}: AudioButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
    if ("speechSynthesis" in window) {
      void loadVoices();
    }
  }, []);

  const speakGenerationRef = useRef(0);

  const stop = useCallback(() => {
    speakGenerationRef.current += 1;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const generation = speakGenerationRef.current + 1;
    speakGenerationRef.current = generation;
    window.speechSynthesis.cancel();

    const voices = await loadVoices();
    if (generation !== speakGenerationRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    applyNaturalVoice(utterance, voices, speed);
    utterance.onend = () => {
      if (generation === speakGenerationRef.current) {
        setIsSpeaking(false);
      }
    };
    utterance.onerror = () => {
      if (generation === speakGenerationRef.current) {
        setIsSpeaking(false);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [text, speed]);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      void speak();
    }
  }, [isSpeaking, speak, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
        aria-label="Text-to-speech not supported in this browser"
      >
        <Volume2 className="size-5" aria-hidden="true" />
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant={isSpeaking ? "secondary" : "outline"}
      size={size}
      onClick={toggle}
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? `Stop reading: ${label}` : `Read aloud: ${label}`}
      className={cn(className)}
    >
      {isSpeaking ? (
        <Pause className="size-5" aria-hidden="true" />
      ) : (
        <Volume2 className="size-5" aria-hidden="true" />
      )}
      {isSpeaking ? "Stop" : label}
    </Button>
  );
}
