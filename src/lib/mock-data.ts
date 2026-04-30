export const landingMetrics = [
  {
    label: "Patient Loop",
    value: "1/day",
    detail: "每天一份正式 CDS-S，必要时追加补充记录，并保留导入上一次答案与补录标记。",
  },
  {
    label: "Audit Depth",
    value: "100%",
    detail: "所有治疗修订、医生确认与跨角色操作都在模型层预留完整审计轨迹。",
  },
  {
    label: "Project Mode",
    value: "multi-study",
    detail: "同一患者可进入多个研究项目，后续按共享与项目私有规则细分可见性。",
  },
] as const;

export const workflowSteps = [
  {
    title: "患者完成基线与每日量表",
    detail: "从 baseline CDS 到 daily CDS-S，后续继续扩展 SAS、SDS 与 PSQI。",
  },
  {
    title: "医生审核治疗记录",
    detail: "患者优先录入治疗与用药，医生确认是否与真实临床治疗一致。",
  },
  {
    title: "研究助理管理项目归属",
    detail: "以项目为视角分配患者、查看合规数据，并保留临床确认边界。",
  },
] as const;

export const patientTrend = [39, 37, 41, 35, 33, 31, 29];

export const patientChecklist = [
  { label: "今日 CDS-S", status: "待完成", detail: "计划时间 20:30" },
  { label: "上一份答案导入", status: "可用", detail: "最近一次更新于昨晚" },
  { label: "当前用药确认", status: "待确认", detail: "盐酸舍曲林 50mg qd" },
] as const;

export const patientHistory = [
  { date: "2026-04-29", score: 31, meta: "正式记录 · 复用上次答案后修改 2 项" },
  { date: "2026-04-28", score: 33, meta: "正式记录 · 当日完成" },
  { date: "2026-04-27", score: 35, meta: "补充记录 · 晚间发作后追加" },
] as const;

export const clinicianQueue = [
  {
    name: "P-1042 / 林某",
    project: "CDS State Daily Pilot",
    reason: "患者更新 medication frequency，需要医生确认是否与门诊处方一致。",
  },
  {
    name: "P-1068 / 周某",
    project: "DPDR Longitudinal Study",
    reason: "记录了新发不良反应：轻度恶心与入睡困难。",
  },
  {
    name: "P-1096 / 陈某",
    project: "CDS State Daily Pilot",
    reason: "补录了 3 天前的 CDS-S，需要确认是否计入正式记录。",
  },
] as const;

export const researchProjects = [
  {
    name: "CDS State Daily Pilot",
    members: "84 名患者 · 6 位研究成员",
    cadence: "每日 CDS-S + 每周治疗复核",
  },
  {
    name: "DPDR Longitudinal Study",
    members: "31 名患者 · 3 位医生 · 2 位助理",
    cadence: "基线量表 + SAS / SDS / PSQI 周期跟踪",
  },
] as const;