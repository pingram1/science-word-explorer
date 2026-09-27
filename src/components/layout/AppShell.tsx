"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SkipLink } from "@/components/ui/SkipLink";

export type UserRole = "student" | "teacher" | "admin" | "parent" | "guest";

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

const roleLabels: Record<UserRole, string> = {
  student: "Explorer",
  teacher: "Guide",
  admin: "Curator",
  parent: "Supporter",
  guest: "Guest",
};

const roleBadgeVariants: Record<UserRole, "blue" | "teal" | "green" | "accent"> =
  {
    student: "teal",
    teacher: "blue",
    admin: "accent",
    parent: "green",
    guest: "accent",
  };

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" },
];

export interface AppShellProps {
  children: React.ReactNode;
  role?: UserRole;
  navItems?: NavItem[];
  title?: string;
}

export function AppShell({
  children,
  role = "student",
  navItems = defaultNavItems,
  title = "Science Word Explorer",
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SkipLink />
      <header className="sticky top-0 z-20 border-b-2 border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-xl bg-science-blue/15 text-science-blue"
              aria-hidden="true"
            >
              <FlaskConical className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted">Science Word Explorer</p>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
            </div>
          </div>

          <Badge variant={roleBadgeVariants[role]} aria-label={`Current role: ${roleLabels[role]}`}>
            {roleLabels[role]}
          </Badge>
        </div>

        <nav
          aria-label="Main navigation"
          className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6"
        >
          <ul className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-base font-semibold",
                      "transition-colors motion-safe:duration-200",
                      "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring focus-visible:outline-offset-2",
                      isActive
                        ? "bg-science-teal text-white"
                        : "text-foreground hover:bg-surface-muted",
                    )}
                  >
                    {Icon && <Icon className="size-4" aria-hidden="true" />}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
