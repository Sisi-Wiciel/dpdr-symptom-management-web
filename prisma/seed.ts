import path from "node:path";
import { readFile } from "node:fs/promises";

import { hash } from "bcryptjs";
import {
  InstrumentAdministration,
  MembershipRole,
  PrismaClient,
  ResponseStatus,
  ScaleKind,
  TreatmentConfirmationStatus,
  UserRole,
} from "@prisma/client";

import {
  baselineInstrumentDefinition,
  dailyInstrumentDefinition,
  upcomingInstrumentDefinitions,
} from "../src/lib/instrument-catalog";

const prisma = new PrismaClient();
const demoPassword = process.env.SEED_DEMO_PASSWORD ?? "demo12345";

function createDailyAnswers(score: number) {
  return Object.fromEntries(
    dailyInstrumentDefinition.sections.flatMap((section) => section.items.map((item) => [item.code, score])),
  );
}

async function readScaleMarkdown(sourcePath: string) {
  return readFile(path.join(process.cwd(), sourcePath), "utf-8");
}

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.treatmentRevision.deleteMany();
  await prisma.treatmentRecord.deleteMany();
  await prisma.scaleResponseRevision.deleteMany();
  await prisma.scaleResponse.deleteMany();
  await prisma.projectMembership.deleteMany();
  await prisma.instrumentVersion.deleteMany();
  await prisma.instrument.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash(demoPassword, 10);

  const patient = await prisma.user.create({
    data: {
      email: "patient.demo@cds.local",
      displayName: "患者演示账号",
      passwordHash,
      primaryRole: UserRole.PATIENT,
    },
  });

  const patientSecondary = await prisma.user.create({
    data: {
      email: "patient.case2@cds.local",
      displayName: "患者案例二",
      passwordHash,
      primaryRole: UserRole.PATIENT,
    },
  });

  const clinician = await prisma.user.create({
    data: {
      email: "clinician.demo@cds.local",
      displayName: "医生演示账号",
      passwordHash,
      primaryRole: UserRole.CLINICIAN,
    },
  });

  const researchAssistant = await prisma.user.create({
    data: {
      email: "research.demo@cds.local",
      displayName: "研究助理演示账号",
      passwordHash,
      primaryRole: UserRole.RESEARCH_ASSISTANT,
    },
  });

  const pilotProject = await prisma.project.create({
    data: {
      slug: "cds-state-daily-pilot",
      title: "CDS State Daily Pilot",
      description: "DPDR state monitoring with daily CDS-S check-ins and treatment reconciliation.",
    },
  });

  const longitudinalProject = await prisma.project.create({
    data: {
      slug: "dpdr-longitudinal-study",
      title: "DPDR Longitudinal Study",
      description: "项目级纵向随访与量表编排演示数据。",
    },
  });

  await prisma.projectMembership.createMany({
    data: [
      {
        userId: patient.id,
        projectId: pilotProject.id,
        role: MembershipRole.PATIENT,
      },
      {
        userId: patientSecondary.id,
        projectId: pilotProject.id,
        role: MembershipRole.PATIENT,
      },
      {
        userId: clinician.id,
        projectId: pilotProject.id,
        role: MembershipRole.CLINICIAN,
      },
      {
        userId: researchAssistant.id,
        projectId: pilotProject.id,
        role: MembershipRole.RESEARCH_ASSISTANT,
        canProxyAdd: true,
      },
      {
        userId: clinician.id,
        projectId: longitudinalProject.id,
        role: MembershipRole.CLINICIAN,
      },
      {
        userId: researchAssistant.id,
        projectId: longitudinalProject.id,
        role: MembershipRole.RESEARCH_ASSISTANT,
        canProxyAdd: true,
      },
    ],
  });

  const baselineInstrument = await prisma.instrument.create({
    data: {
      code: baselineInstrumentDefinition.code,
      title: baselineInstrumentDefinition.title,
      description: baselineInstrumentDefinition.summary,
      kind: ScaleKind.BASELINE,
      administration: InstrumentAdministration.SELF,
      projectId: pilotProject.id,
    },
  });

  const baselineVersion = await prisma.instrumentVersion.create({
    data: {
      instrumentId: baselineInstrument.id,
      versionLabel: "v1-zh-baseline",
      schema: baselineInstrumentDefinition,
      isActive: true,
      publishedAt: new Date(),
    },
  });

  const dailyInstrument = await prisma.instrument.create({
    data: {
      code: dailyInstrumentDefinition.code,
      title: dailyInstrumentDefinition.title,
      description: dailyInstrumentDefinition.summary,
      kind: ScaleKind.DAILY,
      administration: InstrumentAdministration.SELF,
      projectId: pilotProject.id,
    },
  });

  const dailyVersion = await prisma.instrumentVersion.create({
    data: {
      instrumentId: dailyInstrument.id,
      versionLabel: "v1-zh-state",
      schema: dailyInstrumentDefinition,
      isActive: true,
      publishedAt: new Date(),
    },
  });

  for (const item of upcomingInstrumentDefinitions) {
    if (!item.sourcePath) {
      continue;
    }

    const markdown = await readScaleMarkdown(item.sourcePath);
    const instrument = await prisma.instrument.create({
      data: {
        code: item.code,
        title: item.title,
        description: item.summary,
        kind: ScaleKind.FOLLOW_UP,
        administration:
          item.administration === "SELF" ? InstrumentAdministration.SELF : InstrumentAdministration.CLINICIAN,
        projectId: pilotProject.id,
      },
    });

    await prisma.instrumentVersion.create({
      data: {
        instrumentId: instrument.id,
        versionLabel: "v1-imported-markdown",
        schema: {
          code: item.code,
          title: item.title,
          summary: item.summary,
          cadence: item.cadence,
          sourcePath: item.sourcePath,
          markdown,
        },
        isActive: true,
        publishedAt: new Date(),
      },
    });
  }

  const dailyScores = [41, 39, 38, 35, 33, 31, 29];
  const now = new Date();

  for (const [index, score] of dailyScores.entries()) {
    const entryDate = new Date(now);
    entryDate.setDate(now.getDate() - (dailyScores.length - index - 1));
    entryDate.setHours(20, 30, 0, 0);

    const status = index === 3 ? ResponseStatus.SUPPLEMENTARY : ResponseStatus.FORMAL;
    const reusesPreviousAnswers = index !== 0;
    const isBackfilled = index === 3;
    const response = await prisma.scaleResponse.create({
      data: {
        patientId: patient.id,
        projectId: pilotProject.id,
        instrumentVersionId: dailyVersion.id,
        entryDate,
        status,
        isBackfilled,
        reusesPreviousAnswers,
        totalScore: score,
      },
    });

    await prisma.scaleResponseRevision.create({
      data: {
        responseId: response.id,
        versionNumber: 1,
        totalScore: score,
        editorId: patient.id,
        answers: createDailyAnswers(score),
      },
    });
  }

  const secondaryResponseDate = new Date(now);
  secondaryResponseDate.setHours(21, 0, 0, 0);
  const secondaryResponse = await prisma.scaleResponse.create({
    data: {
      patientId: patientSecondary.id,
      projectId: pilotProject.id,
      instrumentVersionId: dailyVersion.id,
      entryDate: secondaryResponseDate,
      status: ResponseStatus.FORMAL,
      totalScore: 44,
    },
  });

  await prisma.scaleResponseRevision.create({
    data: {
      responseId: secondaryResponse.id,
      versionNumber: 1,
      totalScore: 44,
      editorId: patientSecondary.id,
      answers: createDailyAnswers(44),
    },
  });

  const pendingTreatment = await prisma.treatmentRecord.create({
    data: {
      patientId: patient.id,
      projectId: pilotProject.id,
      medicationName: "盐酸舍曲林",
      singleDose: "50 mg",
      instructions: "qd after breakfast",
      adverseEffects: ["轻度恶心", "晨起口干"],
      notes: "最近一周睡眠略差，但仍按时服药。",
      confirmationStatus: TreatmentConfirmationStatus.PENDING,
    },
  });

  await prisma.treatmentRevision.create({
    data: {
      recordId: pendingTreatment.id,
      version: 1,
      editorId: patient.id,
      payload: {
        medicationName: "盐酸舍曲林",
        singleDose: "50 mg",
        instructions: "qd after breakfast",
        adverseEffects: ["轻度恶心", "晨起口干"],
        notes: "最近一周睡眠略差，但仍按时服药。",
      },
    },
  });

  const confirmedTreatment = await prisma.treatmentRecord.create({
    data: {
      patientId: patient.id,
      projectId: pilotProject.id,
      medicationName: "阿立哌唑",
      singleDose: "5 mg",
      instructions: "qn",
      adverseEffects: ["轻度困倦"],
      notes: "医生已核对门诊处方。",
      confirmationStatus: TreatmentConfirmationStatus.CONFIRMED,
      confirmedById: clinician.id,
      confirmedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
    },
  });

  await prisma.treatmentRevision.createMany({
    data: [
      {
        recordId: confirmedTreatment.id,
        version: 1,
        editorId: patient.id,
        payload: {
          medicationName: "阿立哌唑",
          singleDose: "5 mg",
          instructions: "qn",
          adverseEffects: ["轻度困倦"],
          notes: "患者录入。",
        },
      },
      {
        recordId: confirmedTreatment.id,
        version: 2,
        editorId: clinician.id,
        payload: {
          medicationName: "阿立哌唑",
          singleDose: "5 mg",
          instructions: "qn",
          adverseEffects: ["轻度困倦"],
          notes: "医生确认沿用当前方案。",
          confirmationStatus: TreatmentConfirmationStatus.CONFIRMED,
        },
      },
    ],
  });

  const secondaryPendingTreatment = await prisma.treatmentRecord.create({
    data: {
      patientId: patientSecondary.id,
      projectId: pilotProject.id,
      medicationName: "帕罗西汀",
      singleDose: "20 mg",
      instructions: "qd after breakfast",
      adverseEffects: ["口干"],
      notes: "新近开始服用，需要医生确认是否与处方一致。",
      confirmationStatus: TreatmentConfirmationStatus.PENDING,
    },
  });

  await prisma.treatmentRevision.create({
    data: {
      recordId: secondaryPendingTreatment.id,
      version: 1,
      editorId: patientSecondary.id,
      payload: {
        medicationName: "帕罗西汀",
        singleDose: "20 mg",
        instructions: "qd after breakfast",
        adverseEffects: ["口干"],
      },
    },
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        actorId: patient.id,
        actorRole: UserRole.PATIENT,
        action: "scale_response.seeded",
        entityType: "InstrumentVersion",
        entityId: dailyVersion.id,
        after: {
          responseCount: dailyScores.length,
        },
      },
      {
        actorId: patient.id,
        actorRole: UserRole.PATIENT,
        action: "treatment_record.created",
        entityType: "TreatmentRecord",
        entityId: pendingTreatment.id,
        after: {
          medicationName: pendingTreatment.medicationName,
          confirmationStatus: pendingTreatment.confirmationStatus,
        },
      },
      {
        actorId: clinician.id,
        actorRole: UserRole.CLINICIAN,
        action: "treatment_record.reviewed",
        entityType: "TreatmentRecord",
        entityId: confirmedTreatment.id,
        after: {
          medicationName: confirmedTreatment.medicationName,
          confirmationStatus: confirmedTreatment.confirmationStatus,
        },
      },
    ],
  });

  console.log("Seeded demo users, projects, instrument library, daily CDS-S responses, and treatment review records.");
  console.log(`Patient demo: ${patient.email} / ${demoPassword}`);
  console.log(`Clinician demo: ${clinician.email} / ${demoPassword}`);
  console.log(`Research assistant demo: ${researchAssistant.email} / ${demoPassword}`);
  console.log(`Pilot project: ${pilotProject.title}`);
  console.log(`Secondary project: ${longitudinalProject.title}`);
  console.log(`Baseline version: ${baselineVersion.versionLabel}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });