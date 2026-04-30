import { UserRole } from "@prisma/client";

import { reviewTreatmentRecordAction } from "@/app/(workspace)/doctor/actions";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireViewerSession } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/auth/session";
import { getDoctorWorkspaceData } from "@/lib/dashboard-data";
import { workspaceNavItems } from "@/lib/workspace-nav";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function DoctorPage() {
  const session = await requireViewerSession([UserRole.CLINICIAN], "/doctor");
  const data = await getDoctorWorkspaceData(session.sub);

  return (
    <WorkspaceShell
      badge="Clinician review"
      title="医生端"
      description="医生页现在直接读取 Prisma 的待审核治疗记录，并可在页面内完成确认或更正。"
      activeHref="/doctor"
      navItems={workspaceNavItems.map((item) => ({ ...item }))}
      viewer={{
        displayName: session.displayName,
        email: session.email,
        roleLabel: getRoleLabel(session.role),
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-card rounded-[32px] p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Review queue</span>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">待审核治疗记录</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {data.project ? `${data.project.title} 的患者治疗记录会先进入这个审核队列。` : "当前医生账号尚未被加入任何项目。"}
              </p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">{data.pendingRecords.length} pending</span>
          </div>
          <div className="mt-6 space-y-4">
            {data.pendingRecords.length > 0 ? (
              data.pendingRecords.map((item) => (
                <form key={item.id} action={reviewTreatmentRecordAction} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
                  <input type="hidden" name="recordId" value={item.id} />
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-[var(--ink)]">{item.patientName}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.patientEmail}</p>
                      <p className="mt-2 text-sm font-medium text-[var(--accent-warm)]">{item.projectTitle}</p>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">
                      {item.confirmationStatus}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      name="medicationName"
                      defaultValue={item.medicationName}
                      className="rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none"
                    />
                    <input
                      name="singleDose"
                      defaultValue={item.singleDose}
                      className="rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none"
                    />
                  </div>
                  <input
                    name="instructions"
                    defaultValue={item.instructions}
                    className="mt-4 w-full rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none"
                  />
                  <textarea
                    name="adverseEffects"
                    rows={2}
                    defaultValue={item.adverseEffectsText}
                    className="mt-4 w-full rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none"
                  />
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={item.notes ?? ""}
                    className="mt-4 w-full rounded-[20px] border border-[var(--line)] bg-white px-4 py-4 text-sm outline-none"
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
                    <p>最近更新：{formatDate(item.updatedAt)}</p>
                    <div className="flex flex-wrap gap-3">
                      <button name="decision" value="CONFIRMED" type="submit" className="pill pill-secondary">
                        确认无误
                      </button>
                      <button name="decision" value="CORRECTED" type="submit" className="pill pill-primary">
                        更正后保存
                      </button>
                    </div>
                  </div>
                </form>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">当前没有待审核治疗记录。</p>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[32px] p-8">
          <span className="eyebrow">Recent self-reports</span>
          <div className="mt-6 space-y-5">
            {data.recentResponses.length > 0 ? (
              data.recentResponses.map((response) => (
                <div key={response.id} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-[var(--ink)]">{response.patientName}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{formatDate(response.entryDate)}</p>
                    </div>
                    <span className="display-heading text-3xl font-semibold text-[var(--accent-ink)]">{response.totalScore?.toFixed(1) ?? "--"}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">状态：{response.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">还没有可供医生参考的最新自评。</p>
            )}
          </div>
        </article>
      </section>

      <section className="surface-card rounded-[32px] p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--ink)]">其他他评量表目录</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              HAMA 与 HAMD 已按医生他评分类同步到 Prisma，并在这里展示对应的文本预览，后续可继续接成正式表单流程。
            </p>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">clinician-rated catalog</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.clinicianScaleLibrary.length > 0 ? (
            data.clinicianScaleLibrary.map((item) => (
              <div key={item.code} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-warm)]">{item.code}</p>
                <p className="mt-3 text-base font-semibold text-[var(--ink)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                <p className="mt-3 text-sm font-medium text-[var(--accent-ink)]">{item.cadence}</p>
                {item.preview ? <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--muted)]">{item.preview}</p> : null}
                {item.sourcePath ? <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.sourcePath}</p> : null}
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">当前项目还没有同步到可用的他评量表目录。</p>
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}