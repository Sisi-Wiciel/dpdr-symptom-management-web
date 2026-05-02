"use client";

import { useMemo, useState } from "react";

import {
  calculateInstrumentScore,
  createEmptyInstrumentAnswers,
  getInstrumentItemCount,
  type InstrumentDefinition,
  type InstrumentItem,
} from "@/lib/instrument-catalog";

type ViewMode = "scroll" | "step";

/** Step unit: the list of items shown during a single step. */
type Step =
  | { kind: "item"; item: InstrumentItem; sectionTitle: string; globalIndex: number }
  | { kind: "section"; sectionTitle: string; items: InstrumentItem[]; startIndex: number };

function buildSteps(instrument: InstrumentDefinition): Step[] {
  const granularity = instrument.stepGranularity ?? "item";
  if (granularity === "section") {
    let idx = 0;
    return instrument.sections.map((section) => {
      const step: Step = { kind: "section", sectionTitle: section.title, items: section.items, startIndex: idx };
      idx += section.items.length;
      return step;
    });
  }
  // Default: one item per step
  let idx = 0;
  return instrument.sections.flatMap((section) =>
    section.items.map((item) => {
      const step: Step = { kind: "item", item, sectionTitle: section.title, globalIndex: idx };
      idx++;
      return step;
    }),
  );
}

function interpretScore(code: string, rawScore: number, itemCount: number): { standard: number; label: string; detail: string } {
  if (code === "SDS") {
    const standard = Math.round(rawScore * 1.25);
    let label = "无抑郁烦恼";
    let detail = "分数低于 50 分，暂无抑郁倾向。";
    if (standard >= 60) {
      label = "较明显抑郁";
      detail = "分数超过 60 分，建议尽快咨询心理医生进行专业评估。";
    } else if (standard >= 50) {
      label = "轻度抑郁倾向";
      detail = "分数超过 50 分，需引起注意，分数越高抑郁倾向越明显。";
    }
    return { standard, label, detail };
  }
  if (code === "DES-II") {
    const average = itemCount > 0 ? rawScore / itemCount : 0;
    let label = "分离体验较少";
    let detail = "平均分低于 20，分离体验程度在正常范围内。";
    if (average >= 30) {
      label = "分离体验明显";
      detail = "平均分超过 30，建议结合临床评估进一步了解。";
    } else if (average >= 20) {
      label = "分离体验偏多";
      detail = "平均分超过 20，有一定程度的分离体验，建议关注。";
    }
    return { standard: Math.round(average * 10) / 10, label, detail };
  }
  if (code === "CDS") {
    const total = rawScore;
    let label = "人格解体/现实解体症状轻微";
    let detail = "总分较低，症状不明显。";
    if (total >= 200) {
      label = "人格解体/现实解体症状严重";
      detail = "总分较高，建议及时就诊进行专业评估。";
    } else if (total >= 100) {
      label = "人格解体/现实解体症状中等";
      detail = "总分偏高，建议记录症状变化并咨询医生。";
    }
    return { standard: total, label, detail };
  }
  return { standard: Math.round(rawScore * 10) / 10, label: "答题完成", detail: `总计得分：${Math.round(rawScore * 10) / 10}` };
}

function ChoiceGroup({
  item,
  answers,
  onChange,
}: {
  item: InstrumentItem & { responseMode: "choice" };
  answers: Record<string, number>;
  onChange: (code: string, value: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {item.options.map((option, idx) => {
        const label = item.optionLabels?.[idx] ?? String(option);
        const selected = answers[item.code] === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(item.code, option)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selected ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-white/80"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SliderGroup({
  item,
  answers,
  onChange,
}: {
  item: InstrumentItem & { responseMode: "slider" };
  answers: Record<string, number>;
  onChange: (code: string, value: number) => void;
}) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        <span>{item.labels[0]}</span>
        <span>{item.labels[1]}</span>
      </div>
      <input
        className="mt-4 w-full accent-[var(--accent-warm)]"
        type="range"
        min={item.min}
        max={item.max}
        step={item.step}
        value={answers[item.code]}
        onChange={(event) => onChange(item.code, Number(event.target.value))}
      />
      <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>{item.min}</span>
        <span className="font-semibold text-[var(--ink)]">当前：{answers[item.code]}</span>
        <span>{item.max}</span>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  questionNumber,
  answers,
  onChange,
}: {
  item: InstrumentItem;
  questionNumber: number;
  answers: Record<string, number>;
  onChange: (code: string, value: number) => void;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-5 md:px-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-warm)]">
            Q{questionNumber} · {item.code}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink)]">{item.prompt}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--accent-ink)]">
          {answers[item.code]}
        </span>
      </div>

      {item.responseMode === "slider" ? (
        <SliderGroup item={item} answers={answers} onChange={onChange} />
      ) : (
        <ChoiceGroup item={item} answers={answers} onChange={onChange} />
      )}
    </div>
  );
}

type ScaleQuestionnaireFormProps = {
  instrument: InstrumentDefinition;
};

export function ScaleQuestionnaireForm({ instrument }: ScaleQuestionnaireFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(() => createEmptyInstrumentAnswers(instrument));
  const [viewMode, setViewMode] = useState<ViewMode>("scroll");
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const itemCount = getInstrumentItemCount(instrument);
  const rawScore = calculateInstrumentScore(instrument, answers);
  const steps = useMemo(() => buildSteps(instrument), [instrument]);

  function handleChange(code: string, value: number) {
    setAnswers((current) => ({ ...current, [code]: value }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    setAnswers(createEmptyInstrumentAnswers(instrument));
    setStepIndex(0);
    setSubmitted(false);
  }

  if (submitted) {
    const { standard, label, detail } = interpretScore(instrument.code, rawScore, itemCount);
    return (
      <article className="surface-card rounded-[32px] p-8">
        <span className="eyebrow">量表完成</span>
        <h3 className="mt-4 text-2xl font-semibold text-[var(--ink)]">{instrument.title}</h3>

        <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-white/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {instrument.code === "SDS" ? "标准分" : instrument.code === "DES-II" ? "平均分" : "总分"}
          </p>
          <p className="display-heading mt-2 text-5xl font-semibold text-[var(--ink)]">{standard}</p>
          <p className="mt-4 text-lg font-semibold text-[var(--ink)]">{label}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{detail}</p>
          {instrument.code === "SDS" && (
            <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
              SDS 评分说明：将 20 道题的原始得分相加（粗分），再乘以 1.25 取整，即得标准分。分界值为 50 分。
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/80"
          >
            重新填写
          </button>
        </div>
      </article>
    );
  }

  const currentStep = steps[stepIndex];

  return (
    <article className="surface-card rounded-[32px] p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow">Self-rated scale</span>
          <h3 className="mt-4 text-2xl font-semibold text-[var(--ink)]">{instrument.title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{instrument.summary}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-4 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">共</p>
          <p className="display-heading mt-2 text-4xl font-semibold text-[var(--ink)]">{itemCount}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">题</p>
        </div>
      </div>

      {/* View-mode toggle */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-[var(--ink)]">答题方式：</span>
        <button
          type="button"
          onClick={() => setViewMode("scroll")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            viewMode === "scroll" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"
          }`}
        >
          滚动模式
        </button>
        <button
          type="button"
          onClick={() => { setViewMode("step"); setStepIndex(0); }}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            viewMode === "step" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"
          }`}
        >
          逐题模式
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {viewMode === "step" ? (
          /* ---- Step mode ---- */
          <div className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5 md:p-6">
            {/* Progress */}
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                第 {stepIndex + 1} 步 / 共 {steps.length} 步
              </span>
              <span className="text-xs text-[var(--muted)]">{currentStep?.sectionTitle}</span>
            </div>
            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-1.5 rounded-full bg-[var(--ink)] transition-all"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>

            {currentStep?.kind === "item" ? (
              <ItemCard
                item={currentStep.item}
                questionNumber={currentStep.globalIndex + 1}
                answers={answers}
                onChange={handleChange}
              />
            ) : currentStep?.kind === "section" ? (
              <div className="space-y-5">
                <p className="text-base font-semibold text-[var(--ink)]">{currentStep.sectionTitle}</p>
                {currentStep.items.map((item, idx) => (
                  <ItemCard
                    key={item.code}
                    item={item}
                    questionNumber={currentStep.startIndex + idx + 1}
                    answers={answers}
                    onChange={handleChange}
                  />
                ))}
              </div>
            ) : null}

            {/* Navigation */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/80 disabled:opacity-40"
              >
                ← 上一步
              </button>
              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                  className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-80"
                >
                  下一步 →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="pill pill-primary"
                >
                  查看结果
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ---- Scroll mode ---- */
          <>
            {instrument.sections.map((section, sectionIdx) => {
              const sectionStartIndex = instrument.sections.slice(0, sectionIdx).reduce((acc, s) => acc + s.items.length, 0);
              return (
                <section key={section.id} className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5 md:p-6">
                  <h4 className="text-base font-semibold text-[var(--ink)]">{section.title}</h4>
                  <div className="mt-5 space-y-5">
                    {section.items.map((item, itemIdx) => (
                      <ItemCard
                        key={item.code}
                        item={item}
                        questionNumber={sectionStartIndex + itemIdx + 1}
                        answers={answers}
                        onChange={handleChange}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[var(--line)] bg-white/70 px-5 py-5">
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                填写完成后点击右侧按钮查看结果和评分说明。本次作答结果仅在当前页面展示，不会自动保存到系统。
              </p>
              <button type="button" onClick={handleSubmit} className="pill pill-primary">
                查看结果
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
