import { cn } from "@/lib/utils";

export interface SkipLinkProps {
  href?: string;
  children?: string;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50",
        "rounded-xl bg-science-blue px-4 py-3 text-base font-semibold text-white",
        "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white focus-visible:outline-offset-2",
        className,
      )}
    >
      {children}
    </a>
  );
}
