import { UserRole } from "@prisma/client";

import { WorkspaceShell } from "@/components/workspace-shell";
import { requireViewerSession } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/auth/session";
import { getResearchWorkspaceData } from "@/lib/dashboard-data";
import { workspaceNavItems } from "@/lib/workspace-nav";

export default async function ResearchPage() {
  const session = await requireViewerSession(
    [UserRole.RESEARCH_ASSISTANT, UserRole.PROJECT_OWNER, UserRole.PLATFORM_ADMIN],
    "/research",
  );
  const data = await getResearchWorkspaceData(session.sub);

  return (
    <WorkspaceShell
      badge="Research operations"
      title="研究助理端"
      description="研究页已接入当前登录用户的项目归属信息，不再读取静态 mock 清单。"
      activeHref="/research"
      navItems={workspaceNavItems.map((item) => ({ ...item }))}
      viewer={{
        displayName: session.displayName,
        email: session.email,
        roleLabel: getRoleLabel(session.role),
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-card rounded-[32px] p-8">
          <span className="eyebrow">Project roster</span>
          <div className="mt-6 space-y-4">
            {data.projects.length > 0 ? (
              data.projects.map((project) => (
                <div key={project.id} className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
                  <p className="text-base font-semibold text-[var(--ink)]">{project.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{project.description || "暂无项目描述。"}</p>
                  <p className="mt-3 text-sm font-medium text-[var(--accent-warm)]">
                    {project.memberCount} 名成员 · {project.instrumentCount} 份量表 · {project.treatmentCount} 条治疗记录
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">当前账号还没有被分配到任何研究项目。</p>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[32px] p-8">
          <span className="eyebrow">Access boundaries</span>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
              <p className="text-base font-semibold text-[var(--ink)]">可做</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                管理患者加入研究项目、查看研究相关数据、在权限允许范围内进行代理录入与基础信息维护。
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
              <p className="text-base font-semibold text-[var(--ink)]">不可做</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                替代临床医生做 medication / treatment 真实性确认，也不会自动获得其他项目的具体数据查看权。
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="surface-card rounded-[32px] p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--ink)]">下一步接入</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              下一步会把项目成员管理、量表频次规则、项目私有与共享数据边界继续往数据库配置层推进。
            </p>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">
            research-first structure
          </span>
        </div>
      </section>
    </WorkspaceShell>
  );
}