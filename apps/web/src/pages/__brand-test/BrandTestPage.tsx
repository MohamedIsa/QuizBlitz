export function BrandTestPage() {
  return (
    <div className="min-h-screen bg-surface p-10 font-ui">
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
        QB Brand Smoke Test
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        DEV-only — verify tokens, fonts, shadows, and radii are wired correctly.
      </p>

      {/* ── Colours ─────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">Colours</h2>
        <div className="flex flex-wrap gap-3">
          {[
            ['bg-violet',            'violet'],
            ['bg-violet-deep',       'violet-deep'],
            ['bg-violet-soft',       'violet-soft'],
            ['bg-violet-tint',       'violet-tint'],
            ['bg-yellow',            'yellow'],
            ['bg-stage-night',       'stage-night'],
            ['bg-stage-night-lift',  'stage-night-lift'],
            ['bg-ink',               'ink'],
            ['bg-ink-soft',          'ink-soft'],
            ['bg-ink-muted',         'ink-muted'],
            ['bg-ink-border',        'ink-border'],
            ['bg-border-soft',       'border-soft'],
            ['bg-surface-2',         'surface-2'],
            ['bg-surface-3',         'surface-3'],
            ['bg-correct',           'correct'],
            ['bg-correct-soft',      'correct-soft'],
            ['bg-wrong',             'wrong'],
            ['bg-wrong-soft',        'wrong-soft'],
            ['bg-q1',                'q1'],
            ['bg-q2',                'q2'],
            ['bg-q3',                'q3'],
            ['bg-q4',                'q4'],
          ].map(([cls, label]) => (
            <div key={cls} className="flex flex-col items-center gap-1.5">
              <div className={`h-12 w-20 rounded-md border border-ink-border ${cls}`} />
              <span className="text-[10px] text-ink-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Typography ──────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">Typography</h2>
        <div className="space-y-3">
          <p className="font-display text-5xl font-bold tracking-tight text-ink">Display XL — Bricolage 800</p>
          <p className="font-display text-4xl font-bold tracking-tight text-ink">Display LG — Bricolage 700</p>
          <p className="font-display text-2xl font-bold text-ink">Display MD — Bricolage 700</p>
          <p className="text-base text-ink">Body — Inter 400</p>
          <p className="text-sm font-medium text-ink">Label — Inter 500</p>
          <p className="text-sm font-semibold text-ink">Label Semibold — Inter 600</p>
          <p className="text-sm font-bold text-ink">Label Bold — Inter 700</p>
          <p className="font-mono text-sm text-ink-soft">Mono — JetBrains Mono 400</p>
          <p className="font-mono text-sm font-medium text-ink-soft">Mono Medium — JetBrains Mono 500</p>
        </div>
      </section>

      {/* ── Shadows ─────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">Shadows</h2>
        <div className="flex flex-wrap gap-6">
          {[
            ['shadow-card', 'card'],
            ['shadow-lift', 'lift'],
            ['shadow-pop',  'pop'],
          ].map(([cls, label]) => (
            <div key={cls} className={`h-20 w-36 rounded-md bg-surface ${cls} flex items-center justify-center`}>
              <span className="text-xs text-ink-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Border radii ────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">Radii</h2>
        <div className="flex flex-wrap gap-4">
          {[
            ['rounded-xs',   'xs — 6px'],
            ['rounded-sm',   'sm — 10px'],
            ['rounded-md',   'md — 14px'],
            ['rounded-lg',   'lg — 20px'],
            ['rounded-xl',   'xl — 28px'],
            ['rounded-pill', 'pill'],
          ].map(([cls, label]) => (
            <div key={cls} className={`h-14 w-28 border-2 border-violet bg-violet-tint ${cls} flex items-center justify-center`}>
              <span className="text-[10px] text-violet">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CSS var smoke test ───────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">CSS vars (tokens.css)</h2>
        <div
          className="rounded-md border border-ink-border p-4 text-sm"
          style={{ background: 'var(--qb-violet-tint)', color: 'var(--qb-ink)', fontFamily: 'var(--qb-font-mono)' }}
        >
          var(--qb-violet-tint) background · var(--qb-ink) text · var(--qb-font-mono) font
        </div>
      </section>
    </div>
  )
}
