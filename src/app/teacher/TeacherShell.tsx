"use client";

import {
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const teacherNav = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/intervention", label: "Intervention", icon: Users },
  { href: "/teacher/reports", label: "Reports", icon: ClipboardList },
];

export function TeacherShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="teacher" title="Teacher Dashboard" navItems={teacherNav}>
      {children}
    </AppShell>
  );
}
