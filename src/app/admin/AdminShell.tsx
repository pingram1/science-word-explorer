"use client";

import { LayoutDashboard, Library } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const adminNav = [
  { href: "/admin", label: "Content home", icon: LayoutDashboard },
  { href: "/admin/vocabulary", label: "Vocabulary", icon: Library },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="admin" title="Content Manager" navItems={adminNav}>
      {children}
    </AppShell>
  );
}
