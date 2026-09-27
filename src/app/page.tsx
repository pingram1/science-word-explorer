import Link from "next/link";
import { Microscope, FlaskConical, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, var(--science-teal-light) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 50%, var(--science-blue-light) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 0% 80%, var(--science-green-light) 0%, transparent 45%)",
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-science-teal shadow-sm backdrop-blur-sm">
          <Sparkles className="size-4" aria-hidden="true" />
          5th Grade Science Vocabulary
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Science Word{" "}
          <span className="bg-gradient-to-r from-science-blue to-science-teal bg-clip-text text-transparent">
            Explorer
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Embark on a structured literacy adventure through matter, ecosystems,
          the water cycle, and more. Listen, decode, spell, and apply science
          vocabulary like a real explorer.
        </p>

        <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          <DemoCard
            href="/demo/student"
            testId="demo-student-entry"
            icon={<Microscope className="size-8 text-science-blue" />}
            title="Student Demo"
            description="Pick a demo student and start your word journey."
            variant="primary"
          />
          <DemoCard
            href="/demo/teacher"
            testId="demo-teacher-entry"
            icon={<FlaskConical className="size-8 text-science-teal" />}
            title="Teacher Demo"
            description="View class progress as Ms. Rivera."
            variant="secondary"
          />
          <DemoCard
            href="/demo/admin"
            icon={<BookOpen className="size-8 text-science-accent" />}
            title="Content Manager"
            description="Manage vocabulary as Dr. Chen."
            variant="accent"
          />
        </div>

        <p className="mt-12 max-w-lg text-sm text-muted">
          Demo mode uses local seed data — no account required. Choose a role to
          explore the full Science Word Explorer experience.
        </p>
      </main>

      <footer className="relative z-10 border-t border-border bg-surface/60 py-4 text-center text-sm text-muted backdrop-blur-sm">
        StartRight Tutoring · Science Word Explorer
      </footer>
    </div>
  );
}

function DemoCard({
  href,
  testId,
  icon,
  title,
  description,
  variant,
}: {
  href: string;
  testId?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: "primary" | "secondary" | "accent";
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      className="group flex flex-col items-center rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-science-blue/40 hover:shadow-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring focus-visible:outline-offset-2"
    >
      <div className="mb-4 rounded-xl bg-surface-muted p-4 transition-colors group-hover:bg-science-blue/10">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      <Button variant={variant} size="sm" className="mt-4 w-full pointer-events-none">
        Enter
      </Button>
    </Link>
  );
}
