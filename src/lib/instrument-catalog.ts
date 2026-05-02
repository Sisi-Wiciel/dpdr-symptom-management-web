export type InstrumentAdministration = "SELF" | "CLINICIAN";

type InstrumentChoiceItem = {
  code: string;
  prompt: string;
  responseMode: "choice";
  /** Raw option values stored as answers (can encode scoring direction directly). */
  options: number[];
  /** Optional human-readable labels shown in place of raw option values. */
  optionLabels?: string[];
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
  /**
   * Controls the granularity used for the step-by-step answering mode.
   * - "item": advance one question at a time (default; works for single-section instruments).
   * - "section": advance one section at a time (useful when sections group paired questions,
   *   e.g. CDS where each section contains a frequency and a duration item).
   */
  stepGranularity?: "item" | "section";
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

// ---------------------------------------------------------------------------
// Self-rated scale InstrumentDefinitions (interactive questionnaire forms)
// ---------------------------------------------------------------------------

const sdsOptionLabels = ["A 没有或很少时间", "B 小部分时间", "C 相当多时间", "D 绝大部分或全部时间"];
/** Positive scoring (A→1, B→2, C→3, D→4) */
const sdsPositiveOptions = [1, 2, 3, 4];
/** Reversed scoring (A→4, B→3, C→2, D→1) — items 11-20 per the SDS scoring key */
const sdsReversedOptions = [4, 3, 2, 1];

/**
 * 抑郁自评量表 (SDS, Self-rating Depression Scale)
 * 20 questions, options A-D.
 * Items 1-10 score 1-4; items 11-20 are reversed (A→4 … D→1).
 * Raw sum × 1.25 → standard score; cutoff ≥ 50 suggests depression.
 */
export const sdsInstrumentDefinition: InstrumentDefinition = {
  code: "SDS",
  locale: "zh-CN",
  title: "抑郁自评量表（SDS）",
  administration: "SELF",
  scoring: "sum",
  summary: "共 20 题，每题选 A/B/C/D，完成后自动计算标准分，≥ 50 分提示抑郁倾向。",
  sections: [
    {
      id: "sds-main",
      title: "根据你最近一个星期的实际情况选择最符合你的选项",
      items: [
        { code: "sds_01", prompt: "我觉得闷闷不乐，情绪低沉", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_02", prompt: "我觉得一天之中早晨最好", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_03", prompt: "我一阵阵地哭出来或是想哭", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_04", prompt: "我晚上睡眠不好", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_05", prompt: "我吃的和平时一样多", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_06", prompt: "我与异性接触时和以往一样感到愉快", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_07", prompt: "我发觉我的体重在下降", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_08", prompt: "我有便秘的苦恼", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_09", prompt: "我心跳比平时快", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_10", prompt: "我无缘无故感到疲乏", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_11", prompt: "我的头脑和平时一样清楚", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_12", prompt: "我觉得经常做的事情并没有困难", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_13", prompt: "我觉得不安而平静不下来", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_14", prompt: "我对将来抱有希望", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_15", prompt: "我比平常容易激动", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_16", prompt: "我觉得做出决定是容易的", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_17", prompt: "我觉得自己是个有用的人，有人需要我", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_18", prompt: "我的生活过得很有意思", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
        { code: "sds_19", prompt: "我认为如果我死了别人会生活的更好些", responseMode: "choice", options: sdsPositiveOptions, optionLabels: sdsOptionLabels },
        { code: "sds_20", prompt: "平常感兴趣的事我仍然照样感兴趣", responseMode: "choice", options: sdsReversedOptions, optionLabels: sdsOptionLabels },
      ],
    },
  ],
};

const desSliderLabels: [string, string] = ["0% 从未有过", "100% 总是这样"];

/**
 * 分离体验量表 II（DES-II, Dissociative Experiences Scale II）
 * 28 questions, slider 0-100 in steps of 10.
 * Score = average of all items (0-100).
 */
export const desInstrumentDefinition: InstrumentDefinition = {
  code: "DES-II",
  locale: "zh-CN",
  title: "分离体验量表（DES-II）",
  administration: "SELF",
  scoring: "average",
  summary: "共 28 题，每题用滑杆选择 0%–100% 的体验频率（从未有过→总是这样），完成后计算平均分。",
  sections: [
    {
      id: "des-main",
      title: "请在每个滑杆上选择与你情况最符合的数值（注意：选择时排除受酒精或毒品影响的情况）",
      items: [
        { code: "des_01", prompt: "有些人有这样的体验：他们骑着自行车（或开车）走着，突然意识到，怎么自己一点儿也想不起来在整个或部分的行驶过程中发生了什么。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_02", prompt: "有些人有时正在听某人说话时突然意识到，自己对刚才所谈内容的全部或者部分好像什么也没听见。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_03", prompt: "有些人有这样的体验：他们突然发现自己到了某个地方，却不知道怎么来的。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_04", prompt: "有些人有这样的体验：他们注意到自己身上所穿的衣服，却想不起来自己是怎么穿上这身衣服的。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_05", prompt: "有些人有这样的体验：他们在自己的东西中发现了新的物品，可是这个物品是怎么来的，却回忆不起来。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_06", prompt: "有些人有这样的体验：他们并不认识的人朝他们走来，他们却用另外的名字向这些人打招呼或者自称认识这些人。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_07", prompt: "有些人有时候有这样感觉：觉得自己像是站在自己旁边，或者看着自己正在干着什么。有时他们会由此产生一种正在看着一个陌生人的印象。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_08", prompt: "有些人被说成是，他们认不出自己的朋友或家人了。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_09", prompt: "有些人不记得他们生活中的重要事件了。（例如婚礼或者毕业典礼）", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_10", prompt: "有些人自己感觉自己肯定没有撒谎，但别人却责备他们在撒谎。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_11", prompt: "有些人在照镜子的时候认不出自己了。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_12", prompt: "有些人有这样的体验：他们觉得周围的其他人、物和世界不真实。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_13", prompt: "有些人有这样的感觉：就好像他们的身体不属于他们自己了。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_14", prompt: "有些人在回忆一件早先经历过的事情时有时会产生很强烈的体验，就好像再次经历了这一生活事件似的。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_15", prompt: "有些人有时分不清，有些事情是自己真的经历过，还是自己做的梦。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_16", prompt: "有些人有时感觉一个自己熟悉的地方变得陌生和不熟悉。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_17", prompt: "有些人有这样的体验：当他们看电影太投入时，就感觉不到周围其他事物的存在了。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_18", prompt: "有些人在幻想和做白日梦的时候感觉特别强烈，以至于觉得那些就像是真的一样。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_19", prompt: "有些人有这样的体验：他们有时候能够感觉不到疼痛。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_20", prompt: "有些人有时就呆呆地坐在那儿，既没想任何事情，也感觉不到时间的流逝。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_21", prompt: "有些人在读书时出声地跟自己说话。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_22", prompt: "有些人发现，他们在不同场合的举止差别很大，以至于感觉自己就像两个人。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_23", prompt: "有些人有这样的体验：一些平时感到困难的事情却在特定的情景下能够轻松、自如地完成（如：运动、工作、应对公众场合）。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_24", prompt: "有些人有时记不清，某件事情是他们已经做了、还是他们只是想过要去做（如：把一封信投入信箱或者只是想着要投）。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_25", prompt: "有些人会从自己身边的一些现象上发现，自己一定是做了些什么，但对此自己却一点儿印象也没有。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_26", prompt: "有些人有时候在自己的物品中发现小纸片、图画或者笔记，这些肯定出自自己的手笔，但却怎么也想不起来自己是怎么完成的。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_27", prompt: "有些人有时听到自己头脑中有一个声音，这个声音会指示他们应该做什么，或者对自己刚做过的事情加以评论。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
        { code: "des_28", prompt: "有些人有时感觉自己好像是在透过一层雾在感知着这个世界，所以其他人或物好像离自己很远或者不太清晰。", responseMode: "slider", min: 0, max: 100, step: 10, labels: desSliderLabels },
      ],
    },
  ],
};

const cdsFreqLabels = ["0 从不", "1 几乎不会", "2 偶尔", "3 经常", "4 一直都是"];
const cdsFreqOptions = [0, 1, 2, 3, 4];
const cdsDurLabels = ["1 几秒钟", "2 几分钟", "3 几小时", "4 大约一天", "5 超过一天", "6 超过一周"];
const cdsDurOptions = [1, 2, 3, 4, 5, 6];

function makeCdsSection(n: number, symptom: string): InstrumentSection {
  const num = String(n).padStart(2, "0");
  return {
    id: `cds-q${num}`,
    title: `${n}. ${symptom}`,
    items: [
      {
        code: `cds_${num}_freq`,
        prompt: "频次：在过去 6 个月内，你的这种体验有多频繁？",
        responseMode: "choice",
        options: cdsFreqOptions,
        optionLabels: cdsFreqLabels,
      },
      {
        code: `cds_${num}_dur`,
        prompt: "持续时间：你的这种体验每次大约持续多长时间？",
        responseMode: "choice",
        options: cdsDurOptions,
        optionLabels: cdsDurLabels,
      },
    ],
  };
}

/**
 * 剑桥人格解体量表（CDS, Cambridge Depersonalization Scale）
 * 29 questions, each with a frequency (0-4) and a duration (1-6) rating.
 * stepGranularity: "section" so step mode shows both ratings for one question together.
 */
export const cdsInstrumentDefinition: InstrumentDefinition = {
  code: "CDS",
  locale: "zh-CN",
  title: "剑桥人格解体量表（CDS）",
  administration: "SELF",
  scoring: "sum",
  stepGranularity: "section",
  summary: "共 29 题，每题分别评定频次（0-4）和持续时间（1-6），完成后计算总分。",
  sections: [
    makeCdsSection(1, "感到世界不真实或与世界分离开了"),
    makeCdsSection(2, "看到事物好像看一幅画一样，是平的，缺乏立体感"),
    makeCdsSection(3, "感到躯体好像不属于自己"),
    makeCdsSection(4, "在可怕的环境中不觉得害怕"),
    makeCdsSection(5, "不再享受特别喜爱的活动"),
    makeCdsSection(6, "感到自己已分离出来，是一个观察者"),
    makeCdsSection(7, "对膳食的味道不再有愉快感或厌恶感"),
    makeCdsSection(8, "感到躯体非常轻，好像是飘在空中一样"),
    makeCdsSection(9, "哭或笑时感受不到情感"),
    makeCdsSection(10, "感到根本没有任何思维"),
    makeCdsSection(11, "听自己发出的声音显得遥远和不真实"),
    makeCdsSection(12, "感到手或脚好像变大或变小"),
    makeCdsSection(13, "感到自己与环境分离或周围环境不真实"),
    makeCdsSection(14, "感到最近经历的事好像是很久以前发生的一样"),
    makeCdsSection(15, "从外面看自己，好像从镜子里看到自己一样"),
    makeCdsSection(16, "自己经历的事情回忆起来好像不是真的发生在自己身上"),
    makeCdsSection(17, "当进入新环境时，好像以前见过一样"),
    makeCdsSection(18, "感受不到对家人和朋友的情感"),
    makeCdsSection(19, "物体看上去较小或进一步远离"),
    makeCdsSection(20, "用手碰东西时不能引起充分的感受"),
    makeCdsSection(21, "想起某事却不能描述它"),
    makeCdsSection(22, "感到与躯体疼痛分离"),
    makeCdsSection(23, "感到（灵魂）在躯体之外"),
    makeCdsSection(24, "当运动时，感到自己是机械的，像是\u201c机器人\u201d"),
    makeCdsSection(25, "对东西的气味不再有愉快感或厌恶感"),
    makeCdsSection(26, "从自己的思维里分离出来，好像另有一个自己一样"),
    makeCdsSection(27, "反复摸自己，以确保躯体真实存在"),
    makeCdsSection(28, "感受不到饥饿或口渴"),
    makeCdsSection(29, "既往熟悉的地方看上去很陌生"),
  ],
};

/**
 * Map from instrument code to its interactive InstrumentDefinition.
 * Only covers self-rated scales that have been fully structured for interactive use.
 */
export const selfRatedInstrumentDefinitions: Record<string, InstrumentDefinition> = {
  SDS: sdsInstrumentDefinition,
  "DES-II": desInstrumentDefinition,
  CDS: cdsInstrumentDefinition,
};

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
