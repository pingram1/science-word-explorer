"use client";

import {
  BookOpen,
  Clock,
  Eye,
  Hand,
  Headphones,
  Languages,
  Type,
  Volume2,
} from "lucide-react";
import type { StudentSupportProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SupportPanelProps {
  profile: StudentSupportProfile;
  adaptiveMessage?: string;
  className?: string;
}

const supportItems: {
  key: keyof StudentSupportProfile;
  label: string;
  icon: typeof Volume2;
}[] = [
  { key: "slowPlayback", label: "Slow audio", icon: Volume2 },
  { key: "textToSpeech", label: "Read aloud", icon: Headphones },
  { key: "syllableHighlighting", label: "Syllable highlights", icon: Eye },
  { key: "morphemeHighlighting", label: "Word part highlights", icon: Type },
  { key: "wordBank", label: "Word bank", icon: BookOpen },
  { key: "pictureSupport", label: "Picture support", icon: Eye },
  { key: "extendedTime", label: "Extra time", icon: Clock },
  { key: "bilingualGlossary", label: "Glossary", icon: Languages },
  { key: "speechRecognitionAlternative", label: "Self-check option", icon: Hand },
];

export function SupportPanel({ profile, adaptiveMessage, className }: SupportPanelProps) {
  const active = supportItems.filter((item) => Boolean(profile[item.key]));

  if (active.length === 0 && !adaptiveMessage) return null;

  return (
    <aside
      aria-label="Active learning supports"
      className={cn(
        "rounded-xl border-2 border-science-teal/30 bg-science-teal/5 p-4",
        className,
      )}
    >
      {adaptiveMessage && (
        <div
          data-testid="adaptive-support-banner"
          className="mb-3 rounded-lg border border-science-accent/40 bg-science-accent/10 px-3 py-2 text-sm font-medium text-foreground"
        >
          {adaptiveMessage}
        </div>
      )}
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-science-teal">
        Your supports
      </h3>
      <ul className="flex flex-wrap gap-2">
        {active.map(({ key, label, icon: Icon }) => (
          <li
            key={key}
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-sm font-medium text-foreground"
          >
            <Icon className="size-4 text-science-teal" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
