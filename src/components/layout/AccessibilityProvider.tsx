"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FontSize = "normal" | "large" | "xlarge";
export type Spacing = "normal" | "relaxed";

export interface SupportProfile {
  fontSize?: FontSize;
  spacing?: Spacing;
  reducedMotion?: boolean;
  useOpenDyslexic?: boolean;
}

export interface AccessibilitySettings {
  fontSize: FontSize;
  spacing: Spacing;
  reducedMotion: boolean;
  useOpenDyslexic: boolean;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void;
  setSpacing: (spacing: Spacing) => void;
  setReducedMotion: (enabled: boolean) => void;
  setUseOpenDyslexic: (enabled: boolean) => void;
  applySupportProfile: (profile: SupportProfile) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

const STORAGE_KEY = "swe-accessibility-settings";

const defaultSettings: AccessibilitySettings = {
  fontSize: "normal",
  spacing: "normal",
  reducedMotion: false,
  useOpenDyslexic: false,
};

function loadStoredSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    /* use defaults */
  }

  return {
    ...defaultSettings,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function applyDomSettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  root.dataset.fontSize = settings.fontSize;
  root.dataset.spacing = settings.spacing;
  root.dataset.reducedMotion = String(settings.reducedMotion);
  root.dataset.dyslexicFont = String(settings.useOpenDyslexic);
}

export interface AccessibilityProviderProps {
  children: ReactNode;
  initialProfile?: SupportProfile;
}

export function AccessibilityProvider({
  children,
  initialProfile,
}: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => ({
    ...defaultSettings,
    ...initialProfile,
  }));

  useEffect(() => {
    const stored = loadStoredSettings();
    const merged = initialProfile
      ? { ...stored, ...initialProfile }
      : stored;
    setSettings(merged);
  }, [initialProfile]);

  useEffect(() => {
    applyDomSettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private browsing / quota */
    }
  }, [settings]);

  const setFontSize = useCallback((fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  }, []);

  const setSpacing = useCallback((spacing: Spacing) => {
    setSettings((prev) => ({ ...prev, spacing }));
  }, []);

  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion }));
  }, []);

  const setUseOpenDyslexic = useCallback((useOpenDyslexic: boolean) => {
    setSettings((prev) => ({ ...prev, useOpenDyslexic }));
  }, []);

  const applySupportProfile = useCallback((profile: SupportProfile) => {
    setSettings((prev) => ({ ...prev, ...profile }));
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...settings,
      setFontSize,
      setSpacing,
      setReducedMotion,
      setUseOpenDyslexic,
      applySupportProfile,
    }),
    [
      settings,
      setFontSize,
      setSpacing,
      setReducedMotion,
      setUseOpenDyslexic,
      applySupportProfile,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
