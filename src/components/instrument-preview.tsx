import type { InstrumentDefinition } from "@/lib/instrument-catalog";

type InstrumentPreviewProps = {
  instrument: InstrumentDefinition;
};

export function InstrumentPreview({ instrument }: InstrumentPreviewProps) {
  return (
    <article className="surface-card rounded-[32px] p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow">Instrument preview</span>
          <h3 className="mt-4 text-2xl font-semibold text-[var(--ink)]">{instrument.title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{instrument.summary}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
          {instrument.importPreviousEnabled ? "支持导入上一份答案" : "基线量表"}
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {instrument.sections.map((section) => (
          <section key={section.id} className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5">
            <h4 className="text-base font-semibold text-[var(--ink)]">{section.title}</h4>
            <div className="mt-5 space-y-5">
              {section.items.map((item, index) => (
                <div key={item.code} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.74)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-warm)]">
                    Q{index + 1} · {item.code}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{item.prompt}</p>
                  {item.responseMode === "choice" ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.options.map((option) => (
                        <span
                          key={option}
                          className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white px-3 text-sm font-semibold text-[var(--muted)]"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[20px] border border-[var(--line)] bg-white/90 px-4 py-4">
                      <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        <span>{item.labels[0]}</span>
                        <span>{item.labels[1]}</span>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-[var(--line)]">
                        <div className="h-full w-1/2 rounded-full bg-[var(--accent-warm)]" />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
                        <span>{item.min}</span>
                        <span>滑杆步长 {item.step}</span>
                        <span>{item.max}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}