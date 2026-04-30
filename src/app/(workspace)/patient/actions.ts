"use server";

import { MembershipRole, ResponseStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireViewerSession } from "@/lib/auth/server";
import { calculateInstrumentScore, dailyInstrumentDefinition } from "@/lib/instrument-catalog";
import { prisma } from "@/lib/prisma";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseDate(value: string) {
  if (!value) {
    return new Date();
  }

  const normalized = value.length === 10 ? `${value}T12:00:00+08:00` : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseAdverseEffects(value: string) {
  return value
    .split(/[\n,，、；;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function submitDailyResponseAction(formData: FormData) {
  const session = await requireViewerSession([UserRole.PATIENT], "/patient");
  const projectId = String(formData.get("projectId") ?? "").trim();
  const instrumentVersionId = String(formData.get("instrumentVersionId") ?? "").trim();
  const entryDate = parseDate(String(formData.get("entryDate") ?? ""));
  const status = String(formData.get("status") ?? "FORMAL") === "SUPPLEMENTARY" ? ResponseStatus.SUPPLEMENTARY : ResponseStatus.FORMAL;
  const reusesPreviousAnswers = parseBoolean(formData.get("reusesPreviousAnswers"));
  const isBackfilled = parseBoolean(formData.get("isBackfilled"));

  if (!projectId || !instrumentVersionId) {
    redirect("/patient?error=instrument-missing");
  }

  const membership = await prisma.projectMembership.findFirst({
    where: {
      userId: session.sub,
      projectId,
      role: MembershipRole.PATIENT,
    },
    select: { id: true },
  });

  if (!membership) {
    redirect("/patient?error=forbidden");
  }

  const answers = Object.fromEntries(
    dailyInstrumentDefinition.sections.flatMap((section) =>
      section.items.map((item) => [item.code, Number(formData.get(item.code) ?? 0)]),
    ),
  );

  const totalScore = Number(calculateInstrumentScore(dailyInstrumentDefinition, answers).toFixed(1));

  await prisma.$transaction(async (transaction) => {
    const response = await transaction.scaleResponse.create({
      data: {
        patientId: session.sub,
        projectId,
        instrumentVersionId,
        entryDate,
        status,
        reusesPreviousAnswers,
        isBackfilled,
        totalScore,
      },
    });

    await transaction.scaleResponseRevision.create({
      data: {
        responseId: response.id,
        versionNumber: 1,
        answers,
        totalScore,
        editorId: session.sub,
      },
    });

    await transaction.auditEvent.create({
      data: {
        actorId: session.sub,
        actorRole: UserRole.PATIENT,
        action: "scale_response.created",
        entityType: "ScaleResponse",
        entityId: response.id,
        after: {
          totalScore,
          status,
          isBackfilled,
          reusesPreviousAnswers,
        },
      },
    });
  });

  revalidatePath("/patient");
  redirect("/patient?submitted=daily-response");
}

export async function submitTreatmentRecordAction(formData: FormData) {
  const session = await requireViewerSession([UserRole.PATIENT], "/patient");
  const projectId = String(formData.get("projectId") ?? "").trim();
  const medicationName = String(formData.get("medicationName") ?? "").trim();
  const singleDose = String(formData.get("singleDose") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const adverseEffectsText = String(formData.get("adverseEffects") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!projectId || !medicationName || !singleDose || !instructions) {
    redirect("/patient?error=treatment-missing");
  }

  const membership = await prisma.projectMembership.findFirst({
    where: {
      userId: session.sub,
      projectId,
      role: MembershipRole.PATIENT,
    },
    select: { id: true },
  });

  if (!membership) {
    redirect("/patient?error=forbidden");
  }

  const adverseEffects = parseAdverseEffects(adverseEffectsText);

  await prisma.$transaction(async (transaction) => {
    const record = await transaction.treatmentRecord.create({
      data: {
        patientId: session.sub,
        projectId,
        medicationName,
        singleDose,
        instructions,
        adverseEffects,
        notes: notes || null,
      },
    });

    await transaction.treatmentRevision.create({
      data: {
        recordId: record.id,
        version: 1,
        editorId: session.sub,
        payload: {
          medicationName,
          singleDose,
          instructions,
          adverseEffects,
          notes,
        },
      },
    });

    await transaction.auditEvent.create({
      data: {
        actorId: session.sub,
        actorRole: UserRole.PATIENT,
        action: "treatment_record.created",
        entityType: "TreatmentRecord",
        entityId: record.id,
        after: {
          medicationName,
          singleDose,
          instructions,
        },
      },
    });
  });

  revalidatePath("/patient");
  revalidatePath("/doctor");
  redirect("/patient?submitted=treatment-record");
}