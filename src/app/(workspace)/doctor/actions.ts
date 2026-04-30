"use server";

import { MembershipRole, TreatmentConfirmationStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireViewerSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

function parseAdverseEffects(value: string) {
  return value
    .split(/[\n,，、；;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function reviewTreatmentRecordAction(formData: FormData) {
  const session = await requireViewerSession([UserRole.CLINICIAN], "/doctor");
  const recordId = String(formData.get("recordId") ?? "").trim();
  const decision = String(formData.get("decision") ?? "CONFIRMED").trim();
  const medicationName = String(formData.get("medicationName") ?? "").trim();
  const singleDose = String(formData.get("singleDose") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const adverseEffectsText = String(formData.get("adverseEffects") ?? "").trim();

  if (!recordId || !medicationName || !singleDose || !instructions) {
    redirect("/doctor?error=review-missing");
  }

  const existingRecord = await prisma.treatmentRecord.findUnique({
    where: { id: recordId },
    include: {
      revisions: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!existingRecord?.projectId) {
    redirect("/doctor?error=record-missing");
  }

  const membership = await prisma.projectMembership.findFirst({
    where: {
      userId: session.sub,
      projectId: existingRecord.projectId,
      role: MembershipRole.CLINICIAN,
    },
    select: { id: true },
  });

  if (!membership) {
    redirect("/doctor?error=forbidden");
  }

  const confirmationStatus =
    decision === "CORRECTED" ? TreatmentConfirmationStatus.CORRECTED : TreatmentConfirmationStatus.CONFIRMED;
  const adverseEffects = parseAdverseEffects(adverseEffectsText);
  const nextVersion = (existingRecord.revisions[0]?.version ?? 0) + 1;

  await prisma.$transaction(async (transaction) => {
    await transaction.treatmentRecord.update({
      where: { id: recordId },
      data: {
        medicationName,
        singleDose,
        instructions,
        notes: notes || null,
        adverseEffects,
        confirmationStatus,
        confirmedById: session.sub,
        confirmedAt: new Date(),
      },
    });

    await transaction.treatmentRevision.create({
      data: {
        recordId,
        version: nextVersion,
        editorId: session.sub,
        payload: {
          medicationName,
          singleDose,
          instructions,
          adverseEffects,
          notes,
          confirmationStatus,
        },
      },
    });

    await transaction.auditEvent.create({
      data: {
        actorId: session.sub,
        actorRole: UserRole.CLINICIAN,
        action: "treatment_record.reviewed",
        entityType: "TreatmentRecord",
        entityId: recordId,
        before: {
          medicationName: existingRecord.medicationName,
          singleDose: existingRecord.singleDose,
          instructions: existingRecord.instructions,
          confirmationStatus: existingRecord.confirmationStatus,
        },
        after: {
          medicationName,
          singleDose,
          instructions,
          confirmationStatus,
        },
      },
    });
  });

  revalidatePath("/doctor");
  revalidatePath("/patient");
  redirect("/doctor?reviewed=1");
}