import "server-only";

import { InstrumentAdministration, MembershipRole, Prisma, ResponseStatus, UserRole } from "@prisma/client";

import { clinicianRatedScaleCards, selfRatedScaleCards } from "@/lib/instrument-catalog";
import { prisma } from "@/lib/prisma";

type JsonRecord = Record<string, unknown>;

function asJsonRecord(value: Prisma.JsonValue | null): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function getSchemaText(schema: Prisma.JsonValue | null, key: string) {
  const record = asJsonRecord(schema);
  const value = record?.[key];
  return typeof value === "string" ? value : undefined;
}

function createMarkdownPreview(markdown: string | undefined) {
  if (!markdown) {
    return "";
  }

  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .slice(0, 4)
    .join("\n");
}

function mapScaleLibraryEntry(
  instrument: {
    code: string;
    title: string;
    description: string | null;
    administration: InstrumentAdministration;
    versions: Array<{ schema: Prisma.JsonValue }>;
  },
) {
  const activeSchema = instrument.versions[0]?.schema ?? null;
  const markdown = getSchemaText(activeSchema, "markdown");

  return {
    code: instrument.code,
    title: instrument.title,
    administration: instrument.administration,
    summary: instrument.description ?? getSchemaText(activeSchema, "summary") ?? "",
    cadence: getSchemaText(activeSchema, "cadence") ?? "按研究项目配置频率",
    sourcePath: getSchemaText(activeSchema, "sourcePath"),
    preview: createMarkdownPreview(markdown) || getSchemaText(activeSchema, "summary") || "",
  };
}

function mapAnswers(answers: Prisma.JsonValue | null) {
  const record = asJsonRecord(answers);

  if (!record) {
    return null;
  }

  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, Number(value ?? 0)]));
}

function describeResponseMeta(response: {
  status: ResponseStatus;
  isBackfilled: boolean;
  reusesPreviousAnswers: boolean;
}) {
  const parts = [response.status === ResponseStatus.FORMAL ? "正式记录" : "补充记录"];

  if (response.isBackfilled) {
    parts.push("补录");
  }

  if (response.reusesPreviousAnswers) {
    parts.push("导入上一份答案");
  }

  return parts.join(" · ");
}

export async function getPatientWorkspaceData(userId: string) {
  const patient = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: { project: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const membership = patient?.memberships.find((item) => item.role === MembershipRole.PATIENT) ?? patient?.memberships[0] ?? null;
  const projectId = membership?.projectId ?? undefined;

  const [dailyVersion, responses, treatmentRecords, scaleLibrary] = await prisma.$transaction([
    prisma.instrumentVersion.findFirst({
      where: {
        isActive: true,
        instrument: {
          code: "CDS_STATE_DAILY",
          ...(projectId ? { projectId } : {}),
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    }),
    prisma.scaleResponse.findMany({
      where: {
        patientId: userId,
        instrumentVersion: {
          instrument: {
            code: "CDS_STATE_DAILY",
          },
        },
      },
      include: {
        revisions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
      orderBy: { entryDate: "desc" },
      take: 7,
    }),
    prisma.treatmentRecord.findMany({
      where: {
        patientId: userId,
      },
      include: {
        confirmedBy: {
          select: { displayName: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.instrument.findMany({
      where: {
        code: {
          in: selfRatedScaleCards.map((item) => item.code),
        },
        administration: InstrumentAdministration.SELF,
        ...(projectId ? { projectId } : {}),
      },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
      orderBy: { code: "asc" },
    }),
  ]);

  const latestResponse = responses[0] ?? null;
  const previousAnswers = latestResponse ? mapAnswers(latestResponse.revisions[0]?.answers ?? null) : null;

  return {
    viewer: patient,
    project: membership?.project ?? null,
    dailyInstrumentVersionId: dailyVersion?.id ?? null,
    latestResponse: latestResponse
      ? {
          id: latestResponse.id,
          totalScore: latestResponse.totalScore,
          entryDate: latestResponse.entryDate,
          meta: describeResponseMeta(latestResponse),
        }
      : null,
    previousAnswers,
    trendValues: responses
      .slice()
      .reverse()
      .map((entry) => Number(entry.totalScore ?? 0)),
    history: responses.map((entry) => ({
      id: entry.id,
      entryDate: entry.entryDate,
      totalScore: entry.totalScore,
      meta: describeResponseMeta(entry),
    })),
    treatments: treatmentRecords.map((record) => ({
      id: record.id,
      medicationName: record.medicationName,
      singleDose: record.singleDose,
      instructions: record.instructions,
      notes: record.notes,
      adverseEffectsText:
        Array.isArray(record.adverseEffects) && record.adverseEffects.every((item) => typeof item === "string")
          ? record.adverseEffects.join("，")
          : getSchemaText(record.adverseEffects, "notes") ?? "无",
      confirmationStatus: record.confirmationStatus,
      confirmedAt: record.confirmedAt,
      confirmedByName: record.confirmedBy?.displayName ?? null,
      updatedAt: record.updatedAt,
    })),
    selfRatedScaleLibrary: scaleLibrary.map(mapScaleLibraryEntry),
  };
}

export async function getDoctorWorkspaceData(userId: string) {
  const membership = await prisma.projectMembership.findFirst({
    where: {
      userId,
      role: MembershipRole.CLINICIAN,
    },
    include: {
      project: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const projectId = membership?.projectId ?? undefined;

  const [pendingRecords, recentResponses, scaleLibrary] = await prisma.$transaction([
    prisma.treatmentRecord.findMany({
      where: projectId
        ? {
            projectId,
            confirmationStatus: {
              in: ["PENDING", "CORRECTED"],
            },
          }
        : {
            id: "__none__",
          },
      include: {
        patient: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        project: {
          select: { title: true },
        },
        revisions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
      orderBy: [{ confirmationStatus: "asc" }, { updatedAt: "desc" }],
      take: 10,
    }),
    prisma.scaleResponse.findMany({
      where: projectId
        ? {
            projectId,
            instrumentVersion: {
              instrument: {
                code: "CDS_STATE_DAILY",
              },
            },
          }
        : {
            id: "__none__",
          },
      include: {
        patient: {
          select: { displayName: true },
        },
      },
      orderBy: { entryDate: "desc" },
      take: 6,
    }),
    prisma.instrument.findMany({
      where: {
        code: {
          in: clinicianRatedScaleCards.map((item) => item.code),
        },
        administration: InstrumentAdministration.CLINICIAN,
        ...(projectId ? { projectId } : {}),
      },
      include: {
        versions: {
          where: { isActive: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
      orderBy: { code: "asc" },
    }),
  ]);

  return {
    project: membership?.project ?? null,
    pendingRecords: pendingRecords.map((record) => {
      const latestPayload = asJsonRecord(record.revisions[0]?.payload ?? null);

      return {
        id: record.id,
        patientId: record.patientId,
        patientName: record.patient.displayName,
        patientEmail: record.patient.email,
        projectTitle: record.project?.title ?? "未分配项目",
        medicationName: record.medicationName,
        singleDose: record.singleDose,
        instructions: record.instructions,
        notes: record.notes,
        adverseEffectsText:
          Array.isArray(record.adverseEffects) && record.adverseEffects.every((item) => typeof item === "string")
            ? record.adverseEffects.join("，")
            : getSchemaText(record.adverseEffects, "notes") ?? "无",
        latestPayload,
        confirmationStatus: record.confirmationStatus,
        updatedAt: record.updatedAt,
      };
    }),
    recentResponses: recentResponses.map((response) => ({
      id: response.id,
      patientName: response.patient.displayName,
      entryDate: response.entryDate,
      totalScore: response.totalScore,
      status: response.status,
    })),
    clinicianScaleLibrary: scaleLibrary.map(mapScaleLibraryEntry),
  };
}

export async function getResearchWorkspaceData(userId: string) {
  const memberships = await prisma.projectMembership.findMany({
    where: {
      userId,
      role: {
        in: [MembershipRole.RESEARCH_ASSISTANT, MembershipRole.OWNER],
      },
    },
    include: {
      project: {
        include: {
          _count: {
            select: {
              memberships: true,
              instruments: true,
              treatments: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    projects: memberships.map((membership) => ({
      id: membership.project.id,
      title: membership.project.title,
      description: membership.project.description,
      memberCount: membership.project._count.memberships,
      instrumentCount: membership.project._count.instruments,
      treatmentCount: membership.project._count.treatments,
      role: membership.role,
    })),
  };
}