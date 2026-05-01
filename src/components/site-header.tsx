import Link from "next/link";
import { ExternalLink } from "lucide-react";

const navItems = [
  { label: "定位", href: "#positioning" },
  { label: "工作流", href: "#workflow" },
  { label: "角色界面", href: "#roles" },
  { label: "V1 范围", href: "#scope" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-8">
      <div className="surface-card mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-bold text-white">
            CDS
          </span>
          <span className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">DPDR Platform</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--ink)]">
              {item.label}
            </Link>
          ))}
          <a
            href="https://home.depersonalization.site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition hover:text-[var(--ink)]"
          >
            人格解体之家
            <ExternalLink className="h-3 w-3" />
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="pill pill-secondary hidden md:inline-flex">
            登录预览
          </Link>
          <Link href="/patient" className="pill pill-primary">
            进入工作台
          </Link>
        </div>
      </div>
    </header>
  );
}