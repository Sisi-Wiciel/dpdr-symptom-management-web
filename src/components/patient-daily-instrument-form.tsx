"use client";

import { useState } from "react";

import { submitDailyResponseAction } from "@/app/(workspace)/patient/actions";
import {
  calculateInstrumentScore,
  createEmptyInstrumentAnswers,
  getInstrumentItemCount,
  type InstrumentDefinition,
  type InstrumentItem,
} from "@/lib/instrument-catalog";

type ViewMode = "scroll" | "step";

type PatientDailyInstrumentFormProps = {
  instrument: InstrumentDefinition;
  projectId: string;
  instrumentVersionId: string;
  previousAnswers: Record<string, number> | null;
  entryDateDefault: string;
};

/** Flat list of all items across all sections, each annotated with its section title. */
function flattenItems(instrument: InstrumentDefinition) {
  return instrument.sections.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionTitle: section.title })),
  );
}

function ChoiceOptions({
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
        return (
          <label
            key={option}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              answers[item.code] === option
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-white/80"
            }`}
          >
            <input type="radio" name={item.code} value={option} checked={answers[item.code] === option} className="sr-only" onChange={() => onChange(item.code, option)} />
            {label}
          </label>
        );
      })}
    </div>
  );
}

export function PatientDailyInstrumentForm({
  instrument,
  projectId,
  instrumentVersionId,
  previousAnswers,
  entryDateDefault,
}: PatientDailyInstrumentFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(() => createEmptyInstrumentAnswers(instrument));
  const [reusesPreviousAnswers, setReusesPreviousAnswers] = useState(false);
  const [isBackfilled, setIsBackfilled] = useState(false);
  const [status, setStatus] = useState<"FORMAL" | "SUPPLEMENTARY">("FORMAL");
  const [viewMode, setViewMode] = useState<ViewMode>("scroll");
  const [stepIndex, setStepIndex] = useState(0);

  const totalScore = Number(calculateInstrumentScore(instrument, answers).toFixed(1));
  const itemCount = getInstrumentItemCount(instrument);
  const allItems = flattenItems(instrument);

  function handleAnswerChange(code: string, value: number) {
    setAnswers((current) => ({ ...current, [code]: value }));
  }

  const currentItem = allItems[stepIndex];

  return (
    <article className="surface-card rounded-[32px] p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow">Daily submission</span>
          <h3 className="mt-4 text-2xl font-semibold text-[var(--ink)]">{instrument.title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{instrument.summary}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-4 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">当前平均分</p>
          <p className="display-heading mt-2 text-4xl font-semibold text-[var(--ink)]">{totalScore}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{itemCount} 题，0-100 平均值</p>
        </div>
      </div>

      {/* View-mode toggle */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-[var(--ink)]">答题方式：</span>
        <button
          type="button"
          onClick={() => { setViewMode("scroll"); }}
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

      <form action={submitDailyResponseAction} className="mt-8 space-y-6">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="instrumentVersionId" value={instrumentVersionId} />
        <input type="hidden" name="reusesPreviousAnswers" value={String(reusesPreviousAnswers)} />
        <input type="hidden" name="isBackfilled" value={String(isBackfilled)} />
        <input type="hidden" name="status" value={status} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-3 rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
              <span className="text-sm font-semibold text-[var(--ink)]">记录日期</span>
              <input
                name="entryDate"
                type="date"
                defaultValue={entryDateDefault}
                className="w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none"
              />
            </label>
            <div className="rounded-[24px] border border-[var(--line)] bg-white/70 px-5 py-5">
              <p className="text-sm font-semibold text-[var(--ink)]">提交策略</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("FORMAL")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    status === "FORMAL" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  正式记录
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("SUPPLEMENTARY")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    status === "SUPPLEMENTARY" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  补充记录
                </button>
              </div>
            </div>
          </div>

          {previousAnswers ? (
            <div className="flex items-start">
              <button
                type="button"
                onClick={() => {
                  setAnswers(previousAnswers);
                  setReusesPreviousAnswers(true);
                }}
                className="rounded-[22px] border border-[var(--line)] bg-white px-5 py-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/80"
              >
                导入上一份答案
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-[22px] border border-[var(--line)] bg-white/70 px-4 py-4 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={reusesPreviousAnswers}
              onChange={(event) => setReusesPreviousAnswers(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--line)]"
            />
            本次答案基于上一份记录继续修改
          </label>
          <label className="flex items-center gap-3 rounded-[22px] border border-[var(--line)] bg-white/70 px-4 py-4 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={isBackfilled}
              onChange={(event) => setIsBackfilled(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--line)]"
            />
            这是一份补录记录
          </label>
        </div>

        {/* Hidden inputs for all answers (needed for form submission in both modes) */}
        {allItems.map((item) => (
          <input key={item.code} type="hidden" name={item.code} value={answers[item.code] ?? 0} />
        ))}

        {viewMode === "step" ? (
          /* ---- Step mode ---- */
          <div className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5 md:p-6">
            {/* Progress bar */}
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                第 {stepIndex + 1} 题 / 共 {allItems.length} 题
              </span>
              <span className="text-xs text-[var(--muted)]">{currentItem?.sectionTitle}</span>
            </div>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-1.5 rounded-full bg-[var(--ink)] transition-all"
                style={{ width: `${((stepIndex + 1) / allItems.length) * 100}%` }}
              />
            </div>

            {currentItem && (
              <div className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-5 md:px-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-warm)]">
                      Q{stepIndex + 1} · {currentItem.code}
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink)]">{currentItem.prompt}</p>
                  </div>
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--accent-ink)]">
                    {answers[currentItem.code]}
                  </span>
                </div>

                {currentItem.responseMode === "slider" ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      <span>{currentItem.labels[0]}</span>
                      <span>{currentItem.labels[1]}</span>
                    </div>
                    <input
                      className="mt-4 w-full accent-[var(--accent-warm)]"
                      type="range"
                      min={currentItem.min}
                      max={currentItem.max}
                      step={currentItem.step}
                      value={answers[currentItem.code]}
                      onChange={(event) => handleAnswerChange(currentItem.code, Number(event.target.value))}
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted)]">
                      <span>{currentItem.min}</span>
                      <span>当前 {answers[currentItem.code]}</span>
                      <span>{currentItem.max}</span>
                    </div>
                  </div>
                ) : (
                  <ChoiceOptions item={currentItem} answers={answers} onChange={handleAnswerChange} />
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/80 disabled:opacity-40"
              >
                ← 上一题
              </button>
              {stepIndex < allItems.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.min(allItems.length - 1, i + 1))}
                  className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-80"
                >
                  下一题 →
                </button>
              ) : (
                <button type="submit" className="pill pill-primary">
                  保存今日 CDS-S
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ---- Scroll mode ---- */
          <div className="space-y-5">
            {instrument.sections.map((section) => (
              <section key={section.id} className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5 md:p-6">
                <h4 className="text-base font-semibold text-[var(--ink)]">{section.title}</h4>
                <div className="mt-5 space-y-5">
                  {section.items.map((item, index) => {
                    const globalIndex = allItems.findIndex((i) => i.code === item.code);
                    return (
                      <div key={item.code} className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-5 md:px-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-warm)]">
                              Q{globalIndex + 1} · {item.code}
                            </p>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink)]">{item.prompt}</p>
                          </div>
                          <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--accent-ink)]">
                            {answers[item.code]}
                          </span>
                        </div>

                        {item.responseMode === "slider" ? (
                          <div className="mt-5">
                            <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              <span>{item.labels[0]}</span>
                              <span>{item.labels[1]}</span>
                            </div>
                            <input
                              className="mt-4 w-full accent-[var(--accent-warm)]"
                              type="range"
                              name={item.code}
                              min={item.min}
                              max={item.max}
                              step={item.step}
                              value={answers[item.code]}
                              onChange={(event) => handleAnswerChange(item.code, Number(event.target.value))}
                            />
                            <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted)]">
                              <span>{item.min}</span>
                              <span>当前 {answers[item.code]}</span>
                              <span>{item.max}</span>
                            </div>
                          </div>
                        ) : (
                          <ChoiceOptions item={item} answers={answers} onChange={handleAnswerChange} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {viewMode === "scroll" && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[var(--line)] bg-white/70 px-5 py-5">
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              旧版 CDS-S 小程序只保存原始作答值，这里会同步写入 Prisma 响应表与 revision 历史，并把平均分用于趋势图展示。
            </p>
            <button type="submit" className="pill pill-primary">
              保存今日 CDS-S
            </button>
          </div>
        )}
      </form>
    </article>
  );
}