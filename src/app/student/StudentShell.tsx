"use client";

import {
  BookOpen,
  Home,
  Map,
  RotateCcw,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { AccessibilityProvider } from "@/components/layout/AccessibilityProvider";

const studentNavItems: NavItem[] = [
  { href: "/student", label: "Home", icon: Home },
  { href: "/student/units", label: "Units", icon: BookOpen },
  { href: "/student/review", label: "Review", icon: RotateCcw },
  { href: "/student/journey", label: "Journey", icon: Map },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  return (
    <AccessibilityProvider>
      <AppShell role="student" navItems={studentNavItems} title="Explorer Dashboard">
        {children}
      </AppShell>
    </AccessibilityProvider>
  );
}
