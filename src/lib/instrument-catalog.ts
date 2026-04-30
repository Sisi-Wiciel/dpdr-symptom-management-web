export type InstrumentAdministration = "SELF" | "CLINICIAN";

type InstrumentChoiceItem = {
  code: string;
  prompt: string;
  responseMode: "choice";
  options: number[];
};

type InstrumentSliderItem = {
  code: string;
  prompt: string;
  responseMode: "slider";
  min: number;
  max: number;
  step: number;
  labels: [string, string];
};

export type InstrumentItem = InstrumentChoiceItem | InstrumentSliderItem;

export type InstrumentSection = {
  id: string;
  title: string;
  items: InstrumentItem[];
};

export type InstrumentDefinition = {
  code: string;
  title: string;
  locale: string;
  administration: InstrumentAdministration;
  scoring: "sum" | "average";
  importPreviousEnabled?: boolean;
  summary: string;
  sections: InstrumentSection[];
};

export type InstrumentLibraryCard = {
  code: string;
  title: string;
  administration: InstrumentAdministration;
  cadence: string;
  summary: string;
  sourcePath?: string;
};

const stateSliderLabels: [string, string] = ["0% 完全没有这种体验", "100% 这种体验严重至极"];

export const baselineInstrumentDefinition: InstrumentDefinition = {
  code: "CDS_BASELINE",
  locale: "zh-CN",
  title: "Cambridge Depersonalization Scale Baseline",
  administration: "SELF",
  scoring: "sum",
  summary: "用于初始严重度评估，记录过去较长时间窗内的 DPDR 体验频率与持续性。",
  sections: [
    {
      id: "frequency-and-duration",
      title: "基线频率与持续时间",
      items: [
        {
          code: "cds_b_01",
          prompt: "在过去 6 个月里，您感到自己像在旁观自己一样的频率如何？",
          responseMode: "choice",
          options: [0, 1, 2, 3, 4],
        },
        {
          code: "cds_b_02",
          prompt: "在过去 6 个月里，您感到周围环境不像真实世界一样的频率如何？",
          responseMode: "choice",
          options: [0, 1, 2, 3, 4],
        },
      ],
    },
  ],
};

export const dailyInstrumentDefinition: InstrumentDefinition = {
  code: "CDS_STATE_DAILY",
  locale: "zh-CN",
  title: "CDS-S 当前状态量表",
  administration: "SELF",
  scoring: "average",
  importPreviousEnabled: true,
  summary: "迁移自旧版 jsPsych CDS-S 页面，保留 22 条目、0-100 滑杆和上一份答案复用能力。",
  sections: [
    {
      id: "daily-state",
      title: "此时此刻的解体与现实感受",
      items: [
        {
          code: "cds_s_01",
          prompt: "我此刻有一种奇怪的感觉，好像自己不真实或与世界隔绝开了。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_02",
          prompt: "周围的事物此刻看起来就像一幅画，缺乏立体感，或是毫无生机的。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_03",
          prompt: "我此刻感觉部分身体好像不属于我自己。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_04",
          prompt: "我此刻感觉就像“旁观者”一样在观察自己。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_05",
          prompt: "我此刻感觉身体非常轻，好像飘在空中一样。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_06",
          prompt: "我此刻感受不到任何情绪。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_07",
          prompt: "当我大声读这句话时，我的声音听起来遥远且不真实。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_08",
          prompt: "我此刻感觉头脑里空空荡荡，所以我此刻没有任何思维。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_09",
          prompt: "我此刻感觉我的手或脚变大或变小了。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_10",
          prompt: "我此刻感觉与周围环境脱节，或感觉周围环境不真实，就像与世界隔着一层纱或雾。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_11",
          prompt: "此刻看来，我最近做的事情就像发生在很久以前一样。例如，我感觉今早所做的一切都发生在几周前。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_12",
          prompt: "当我试着回忆人生中的重要事件时，会感觉与这些记忆完全分离，就像我没有参与其中一样。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_13",
          prompt: "我此刻似乎感受不到任何对家人或好友的情感。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_14",
          prompt: "周围的事物此刻看起来就像一幅画，缺乏立体感，或是毫无生机的。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_15",
          prompt: "我不能充分感受到手中的物品，就像不是我在握着它一样。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_16",
          prompt: "如果我此刻试着想象一个经常见面的亲人或朋友的脸，我似乎无法在脑海中将其描绘出来。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_17",
          prompt: "如果我此刻掐一下自己的胳膊，会感到与痛觉完全分离，就像这是“别人的疼痛”一样。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_18",
          prompt: "我此刻感觉自己在身体之外。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_19",
          prompt: "我此刻对自身动作没有控制感，所以感觉自己是自动的、机械的，就像机器人一样。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_20",
          prompt: "我此刻感觉与自身思维完全分离，仿佛思维有自己的生命一样。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_21",
          prompt: "我想触摸自己，以确保躯体或自己真实存在。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
        {
          code: "cds_s_22",
          prompt: "此刻仍有和开始回答问卷时一样的奇怪感受。",
          responseMode: "slider",
          min: 0,
          max: 100,
          step: 1,
          labels: stateSliderLabels,
        },
      ],
    },
  ],
};

export const upcomingInstrumentDefinitions: InstrumentLibraryCard[] = [
  {
    code: "SDS",
    title: "抑郁自评量表",
    administration: "SELF",
    cadence: "按研究项目配置频率",
    summary: "患者自评抑郁症状强度，内容来源于 scale/抑郁自评量表.md。",
    sourcePath: "scale/抑郁自评量表.md",
  },
  {
    code: "CDS",
    title: "剑桥人格解体量表 CDS",
    administration: "SELF",
    cadence: "基线或阶段性复测",
    summary: "患者自评人格解体与现实解体体验的基线量表，内容来源于 scale/剑桥人格解体量表CDS.md。",
    sourcePath: "scale/剑桥人格解体量表CDS.md",
  },
  {
    code: "DES-II",
    title: "分离体验量表",
    administration: "SELF",
    cadence: "按研究项目配置频率",
    summary: "患者自评分离体验频率，内容来源于 scale/分离体验量表.md。",
    sourcePath: "scale/分离体验量表.md",
  },
  {
    code: "HAMA",
    title: "Hamilton Anxiety Scale",
    administration: "CLINICIAN",
    cadence: "医生访视时评定",
    summary: "由医生进行他评的焦虑量表，内容来源于 scale/HAMA.md。",
    sourcePath: "scale/HAMA.md",
  },
  {
    code: "HAMD",
    title: "Hamilton Depression Scale",
    administration: "CLINICIAN",
    cadence: "医生访视时评定",
    summary: "由医生进行他评的抑郁量表，内容来源于 scale/HAMD.md。",
    sourcePath: "scale/HAMD.md",
  },
];

export const selfRatedScaleCards = upcomingInstrumentDefinitions.filter((item) => item.administration === "SELF");

export const clinicianRatedScaleCards = upcomingInstrumentDefinitions.filter((item) => item.administration === "CLINICIAN");

export function getInstrumentItemCount(instrument: InstrumentDefinition) {
  return instrument.sections.reduce((count, section) => count + section.items.length, 0);
}

export function createEmptyInstrumentAnswers(instrument: InstrumentDefinition) {
  return Object.fromEntries(
    instrument.sections.flatMap((section) =>
      section.items.map((item) => [item.code, item.responseMode === "slider" ? item.min : item.options[0] ?? 0]),
    ),
  ) as Record<string, number>;
}

export function calculateInstrumentScore(instrument: InstrumentDefinition, answers: Record<string, number>) {
  const values = instrument.sections.flatMap((section) => section.items.map((item) => Number(answers[item.code] ?? 0)));

  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return instrument.scoring === "average" ? total / values.length : total;
}
