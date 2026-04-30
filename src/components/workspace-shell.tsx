import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/lib/auth/actions";

type WorkspaceNavItem = {
  label: string;
  href: string;
  detail: string;
};

type WorkspaceShellProps = {
  badge: string;
  title: string;
  description: string;
  activeHref: string;
  navItems: WorkspaceNavItem[];
  viewer?: {
    displayName: string;
    email: string;
    roleLabel: string;
  };
  children: ReactNode;
};

export function WorkspaceShell({
  badge,
  title,
  description,
  activeHref,
  navItems,
  viewer,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="surface-card flex flex-col gap-6 rounded-[32px] p-6 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="space-y-4">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              返回官网
            </Link>
            <div className="space-y-3">
              <span className="eyebrow">{badge}</span>
              <div>
                <h1 className="display-heading text-3xl font-semibold text-[var(--ink)]">{title}</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
              </div>
            </div>
          </div>
          <nav className="space-y-3">
            {navItems.map((item) => {
              const active = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-[24px] border px-4 py-4 transition ${
                    active
                      ? "border-transparent bg-[var(--ink)] text-white"
                      : "border-[var(--line)] bg-white/50 text-[var(--ink)] hover:bg-white/80"
                  }`}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className={`mt-2 text-sm leading-6 ${active ? "text-white/72" : "text-[var(--muted)]"}`}>
                    {item.detail}
                  </p>
                </Link>
              );
            })}
          </nav>
          {viewer ? (
            <div className="mt-auto rounded-[24px] border border-[var(--line)] bg-white/70 px-4 py-4">
              <p className="text-sm font-semibold text-[var(--ink)]">{viewer.displayName}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{viewer.email}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-warm)]">{viewer.roleLabel}</p>
              <form action={signOutAction} className="mt-4">
                <button type="submit" className="w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]">
                  退出登录
                </button>
              </form>
            </div>
          ) : null}
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}