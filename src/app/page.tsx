import Link from "next/link";
import { ArrowRight, ClipboardPlus, ShieldCheck, Stethoscope } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { landingMetrics, workflowSteps } from "@/lib/mock-data";

const roleCards = [
  {
    title: "患者工作流",
    href: "/patient",
    icon: ClipboardPlus,
    description: "每日 CDS-S、自上次答案导入、补录标记、历史趋势与当前治疗记录。",
  },
  {
    title: "医生工作台",
    href: "/doctor",
    icon: Stethoscope,
    description: "查看待确认治疗记录、修正与审计视图、项目级反馈配置入口。",
  },
  {
    title: "研究助理界面",
    href: "/research",
    icon: ShieldCheck,
    description: "分配患者进入项目、维护研究节奏、处理受限代理录入。",
  },
];

const scopeHighlights = [
  "公开官网和应用区共用一套视觉语言，避免把研究平台做成普通营销站。",
  "患者端优先保证移动端打卡体验，医生和研究助理则优先桌面端审阅效率。",
  "量表内容采用版本化配置结构，后续补正式条目时不需要推翻页面与数据库。",
  "数据模型已为共享数据与项目私有数据预留 scope 能力。",
];

export default function HomePage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="px-4 md:px-8">
        <section className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-card hero-grid overflow-hidden rounded-[40px] p-8 md:p-12">
            <div className="max-w-3xl space-y-8">
              <span className="eyebrow">Research-first DPDR monitoring</span>
              <div className="space-y-6">
                <h1 className="display-heading max-w-4xl text-5xl font-semibold leading-none tracking-tight text-[var(--ink)] md:text-7xl">
                  为 DPDR 患者自我监测、医生审核与研究项目协同建立同一套临床级界面。
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                  首版不从“内容门户”开始，而是先把最关键的日常量表、治疗记录、确认链路和审计结构做出来。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signin" className="pill pill-primary gap-2">
                  进入登录预览
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#roles" className="pill pill-secondary">
                  查看三类角色界面
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {landingMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section id="positioning" className="mx-auto mt-24 max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Product stance"
            title="不是“心理健康内容页”，而是围绕真实追踪、确认和研究归属来搭建。"
            description="这版实现从数据收集链路出发：首页就直接说明患者每天要做什么、医生要确认什么、研究助理要管理什么，而不是先铺一套泛医疗风格的信息站。"
          />
          <div className="data-grid">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="surface-card rounded-[32px] p-8">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-warm)]">
                  0{index + 1}
                </span>
                <h3 className="mt-5 text-2xl font-semibold text-[var(--ink)]">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--muted)]">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roles" className="mx-auto mt-24 max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Role surfaces"
            title="三类角色先并排落地，把 V1 最短闭环跑通。"
            description="当前实现先给出患者、医生、研究助理三种页面外壳和关键卡片，后面继续替换为真实数据库与权限逻辑。"
          />
          <div className="grid gap-6 xl:grid-cols-3">
            {roleCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link key={card.title} href={card.href} className="surface-card group rounded-[32px] p-8 transition hover:-translate-y-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-ink)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-8 space-y-4">
                    <h3 className="text-2xl font-semibold text-[var(--ink)]">{card.title}</h3>
                    <p className="text-base leading-7 text-[var(--muted)]">{card.description}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-warm)]">
                      查看界面
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="scope" className="mx-auto mt-24 max-w-7xl">
          <div className="surface-card-strong rounded-[40px] p-8 md:p-12">
            <SectionHeading
              eyebrow="Implementation scope"
              title="第一批已经开始进入“可跑的应用骨架”，而不是停留在需求文档。"
              description="当前提交已经包含工程初始化、Next.js 路由结构、Prisma 初始模型、首页与三类工作台的演示界面。接下来会按同一骨架继续补登录、项目上下文、量表引擎和数据库读写。"
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {scopeHighlights.map((item) => (
                <div key={item} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5 text-sm leading-7 text-[var(--ink)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}