import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { signInAction } from "@/lib/auth/actions";
import { redirectIfAuthenticated } from "@/lib/auth/server";

const demoAccounts = [
  {
    role: "患者账号",
    email: "patient.demo@cds.local",
    password: "demo12345",
    detail: "用于提交 CDS-S、治疗记录并查看个人趋势。",
  },
  {
    role: "医生账号",
    email: "clinician.demo@cds.local",
    password: "demo12345",
    detail: "用于审核患者提交的治疗记录和查看近期自评。",
  },
  {
    role: "研究助理账号",
    email: "research.demo@cds.local",
    password: "demo12345",
    detail: "用于查看项目成员、量表清单和项目边界。",
  },
] as const;

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getErrorMessage(error: string | undefined) {
  if (error === "missing") {
    return "请输入邮箱和密码。";
  }

  if (error === "invalid") {
    return "邮箱或密码错误，请重试。";
  }

  return null;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  await redirectIfAuthenticated();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath = resolvedSearchParams?.next ?? "";
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="surface-card-strong rounded-[40px] p-8 md:p-10">
          <span className="eyebrow">Email password sign-in</span>
          <div className="mt-8 space-y-5">
            <h1 className="display-heading text-5xl font-semibold leading-none text-[var(--ink)]">
              会话、角色分流和工作台守卫已经接入。
            </h1>
            <p className="max-w-xl text-base leading-7 text-[var(--muted)] md:text-lg">
              登录后会按角色自动跳转到患者端、医生端或研究助理端。未登录访问工作台会被中间件拦回这里，防止裸路由直达。
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className="pill pill-secondary">
              返回首页
            </Link>
            <a href="#demo-accounts" className="pill pill-primary gap-2">
              查看演示账号
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="surface-card rounded-[40px] p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[var(--ink)]">邮箱 + 密码登录</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">本版使用加密密码校验和 httpOnly 会话 Cookie，不再开放未登录预览入口。</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">
              auth live
            </span>
          </div>

          <form action={signInAction} className="mt-10 space-y-5">
            <input type="hidden" name="next" value={nextPath} />
            <label className="block space-y-3">
              <span className="text-sm font-semibold text-[var(--ink)]">邮箱</span>
              <div className="flex items-center gap-3 rounded-[24px] border border-[var(--line)] bg-white/80 px-4 py-4">
                <Mail className="h-5 w-5 text-[var(--muted)]" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full border-none bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
                  placeholder="name@study-site.org"
                />
              </div>
            </label>
            <label className="block space-y-3">
              <span className="text-sm font-semibold text-[var(--ink)]">密码</span>
              <div className="flex items-center gap-3 rounded-[24px] border border-[var(--line)] bg-white/80 px-4 py-4">
                <LockKeyhole className="h-5 w-5 text-[var(--muted)]" />
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full border-none bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
                  placeholder="请输入密码"
                />
              </div>
            </label>

            {errorMessage ? (
              <p className="rounded-[20px] border border-[rgba(191,111,63,0.25)] bg-[rgba(191,111,63,0.08)] px-4 py-3 text-sm text-[var(--accent-ink)]">
                {errorMessage}
              </p>
            ) : null}

            <button type="submit" className="pill pill-primary w-full justify-center">
              登录并进入工作台
            </button>
          </form>

          <div id="demo-accounts" className="mt-10 grid gap-4">
            {demoAccounts.map((account) => (
              <div key={account.email} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">{account.role}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{account.detail}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-[var(--accent-warm)]" />
                </div>
                <div className="mt-4 space-y-1 text-sm text-[var(--ink)]">
                  <p>邮箱：{account.email}</p>
                  <p>密码：{account.password}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}