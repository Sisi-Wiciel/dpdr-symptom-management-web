import { TreatmentConfirmationStatus, UserRole } from "@prisma/client";

import { PatientDailyInstrumentForm } from "@/components/patient-daily-instrument-form";
import { Sparkline } from "@/components/sparkline";
import { WorkspaceShell } from "@/components/workspace-shell";
import { submitTreatmentRecordAction } from "@/app/(workspace)/patient/actions";
import { requireViewerSession } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/auth/session";
import { getPatientWorkspaceData } from "@/lib/dashboard-data";
import { dailyInstrumentDefinition } from "@/lib/instrument-catalog";
import { workspaceNavItems } from "@/lib/workspace-nav";

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function formatRecordDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function getTreatmentStatusText(status: TreatmentConfirmationStatus) {
  switch (status) {
    case TreatmentConfirmationStatus.CONFIRMED:
      return "医生已确认";
    case TreatmentConfirmationStatus.CORRECTED:
      return "医生已更正";
    case TreatmentConfirmationStatus.PENDING:
    default:
      return "待医生审核";
  }
}

export default async function PatientPage() {
  const session = await requireViewerSession([UserRole.PATIENT], "/patient");
  const data = await getPatientWorkspaceData(session.sub);

  return (
    <WorkspaceShell
      badge="Patient workspace"
      title="患者端"
      description="这里现在直接从 Prisma 读取 daily CDS-S、治疗记录和历史轨迹，不再依赖 mock 数据。"
      activeHref="/patient"
      navItems={workspaceNavItems.map((item) => ({ ...item }))}
      viewer={{
        displayName: session.displayName,
        email: session.email,
        roleLabel: getRoleLabel(session.role),
      }}
    >
      <section className="surface-card rounded-[32px] p-8 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <span className="eyebrow">Today</span>
            <div>
              <h2 className="display-heading text-4xl font-semibold text-[var(--ink)] md:text-5xl">
                {data.latestResponse ? `最近一次 CDS-S 已提交于 ${formatShortDate(data.latestResponse.entryDate)}` : "今日 CDS-S 尚未提交"}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {data.project
                  ? `当前项目：${data.project.title}。患者本页支持 daily CDS-S 录入、上一份答案复用，以及治疗记录提交后进入医生审核。`
                  : "当前账号还没有可用的研究项目归属，请先在研究端分配项目。"}
              </p>
            </div>
          </div>
          <div className="rounded-[28px] border border-[var(--line)] bg-white/70 px-6 py-5 text-right">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">latest average score</p>
            <p className="display-heading mt-2 text-5xl font-semibold text-[var(--ink)]">{data.latestResponse?.totalScore?.toFixed(1) ?? "--"}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{data.latestResponse?.meta ?? "等待首次提交"}</p>
          </div>
        </div>
      </section>

      {data.project && data.dailyInstrumentVersionId ? (
        <PatientDailyInstrumentForm
          instrument={dailyInstrumentDefinition}
          projectId={data.project.id}
          instrumentVersionId={data.dailyInstrumentVersionId}
          previousAnswers={data.previousAnswers}
          entryDateDefault={new Date().toISOString().slice(0, 10)}
        />
      ) : (
        <section className="surface-card rounded-[32px] p-8">
          <h3 className="text-2xl font-semibold text-[var(--ink)]">量表尚未就绪</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">需要先为当前项目创建并激活 daily CDS-S 版本后，患者才能在此提交自评。</p>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card rounded-[32px] p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--ink)]">最近 7 天趋势</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">趋势直接读取 Prisma 中最近 7 条 daily CDS-S 响应，按 0-100 平均分回看变化。</p>
            </div>
            <p className="text-sm font-semibold text-[var(--accent-warm)]">
              {data.trendValues.length > 1 ? `最近 ${data.trendValues.length} 条记录已纳入` : "等待更多记录形成趋势"}
            </p>
          </div>
          <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-white/70 p-5">
            {data.trendValues.length > 0 ? <Sparkline values={data.trendValues} /> : <p className="text-sm text-[var(--muted)]">还没有可展示的趋势数据。</p>}
          </div>
        </article>

        <article className="surface-card rounded-[32px] p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--ink)]">治疗记录提交</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">这里提交的内容会直接进入医生审核队列，并保留 revision 与审计事件。</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">patient to clinician review</span>
          </div>
          {data.project ? (
            <form action={submitTreatmentRecordAction} className="mt-6 space-y-4">
              <input type="hidden" name="projectId" value={data.project.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="medicationName"
                  placeholder="药物名称，例如盐酸舍曲林"
                  className="rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none placeholder:text-[var(--muted)]"
                />
                <input
                  name="singleDose"
                  placeholder="单次剂量，例如 50 mg"
                  className="rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none placeholder:text-[var(--muted)]"
                />
              </div>
              <input
                name="instructions"
                placeholder="用法说明，例如 qd after breakfast"
                className="w-full rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none placeholder:text-[var(--muted)]"
              />
              <textarea
                name="adverseEffects"
                rows={3}
                placeholder="不良反应，可用换行或顿号分隔"
                className="w-full rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none placeholder:text-[var(--muted)]"
              />
              <textarea
                name="notes"
                rows={3}
                placeholder="补充说明，例如依从性、睡眠或新发体验"
                className="w-full rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none placeholder:text-[var(--muted)]"
              />
              <button type="submit" className="pill pill-primary w-full justify-center">
                提交治疗记录
              </button>
            </form>
          ) : (
            <p className="mt-6 text-sm leading-6 text-[var(--muted)]">尚未绑定研究项目，暂时不能提交治疗记录。</p>
          )}
        </article>
      </section>

      <section className="surface-card rounded-[32px] p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-[var(--ink)]">最近记录</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">现在展示的都是 Prisma 中的版本化 daily CDS-S 响应。</p>
          </div>
          <span className="text-sm text-[var(--muted)]">response history / audit ready</span>
        </div>
        <div className="mt-6 grid gap-4">
          {data.history.length > 0 ? (
            data.history.map((entry) => (
              <div key={entry.id} className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5 md:grid-cols-[180px_120px_minmax(0,1fr)] md:items-center">
                <p className="text-sm font-semibold text-[var(--ink)]">{formatRecordDate(entry.entryDate)}</p>
                <p className="display-heading text-3xl font-semibold text-[var(--accent-ink)]">{entry.totalScore?.toFixed(1) ?? "--"}</p>
                <p className="text-sm leading-6 text-[var(--muted)]">{entry.meta}</p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">还没有任何 daily CDS-S 历史记录。</p>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-card rounded-[32px] p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--ink)]">治疗记录历史</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">患者提交后会显示审核状态，医生确认或更正后这里会同步更新。</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">real treatment records</span>
          </div>
          <div className="mt-6 space-y-4">
            {data.treatments.length > 0 ? (
              data.treatments.map((record) => (
                <div key={record.id} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-[var(--ink)]">{record.medicationName}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {record.singleDose} · {record.instructions}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">
                      {getTreatmentStatusText(record.confirmationStatus)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
                    <p>不良反应：{record.adverseEffectsText}</p>
                    <p>备注：{record.notes || "无"}</p>
                    <p>
                      最近更新：{formatRecordDate(record.updatedAt)}
                      {record.confirmedByName ? ` · ${record.confirmedByName}` : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">还没有治疗记录。</p>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[32px] p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--ink)]">其他自评量表</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">根据 scale 目录内容同步到 Prisma 的自评量表目录，便于后续逐步接成正式表单。</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">self-rated catalog</span>
          </div>
          <div className="mt-6 grid gap-4">
            {data.selfRatedScaleLibrary.length > 0 ? (
              data.selfRatedScaleLibrary.map((item) => (
                <div key={item.code} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-warm)]">{item.code}</p>
                      <p className="mt-3 text-base font-semibold text-[var(--ink)]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                      <p className="mt-3 text-sm font-medium text-[var(--accent-ink)]">{item.cadence}</p>
                      {item.preview ? <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--muted)]">{item.preview}</p> : null}
                      {item.sourcePath ? <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.sourcePath}</p> : null}
                    </div>
                    <div className="shrink-0">
                      <a
                        href={`/patient/scale/${encodeURIComponent(item.code)}`}
                        className="inline-flex items-center rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-80"
                      >
                        开始答题 →
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">还没有同步到当前项目的自评量表目录。</p>
            )}
          </div>
        </article>
      </section>
    </WorkspaceShell>
  );
}