import Link from "next/link";
import { notFound } from "next/navigation";

import { UserRole } from "@prisma/client";

import { ScaleQuestionnaireForm } from "@/components/scale-questionnaire-form";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireViewerSession } from "@/lib/auth/server";
import { getRoleLabel } from "@/lib/auth/session";
import { selfRatedInstrumentDefinitions } from "@/lib/instrument-catalog";
import { workspaceNavItems } from "@/lib/workspace-nav";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function ScalePage({ params }: Props) {
  const { code } = await params;
  const session = await requireViewerSession([UserRole.PATIENT], "/patient");

  const decodedCode = decodeURIComponent(code);
  const instrument = selfRatedInstrumentDefinitions[decodedCode];

  if (!instrument) {
    notFound();
  }

  return (
    <WorkspaceShell
      badge="Patient workspace"
      title="患者端"
      description="自评量表答题"
      activeHref="/patient"
      navItems={workspaceNavItems}
      viewer={{
        displayName: session.displayName,
        email: session.email,
        roleLabel: getRoleLabel(session.role),
      }}
    >
      <section className="surface-card rounded-[32px] p-8">
        <div className="flex items-center gap-3">
          <Link href="/patient" className="text-sm font-semibold text-[var(--accent-ink)] hover:underline">
            ← 返回患者工作台
          </Link>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{instrument.code}</p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">{instrument.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{instrument.summary}</p>
        <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
          本次作答结果仅供参考，不能替代专业临床评估。填写完成后会显示参考得分及说明，作答数据不会自动上传。
        </p>
      </section>

      <ScaleQuestionnaireForm instrument={instrument} />
    </WorkspaceShell>
  );
}
