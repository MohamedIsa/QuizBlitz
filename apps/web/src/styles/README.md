# Token layers

There are two token layers in this project. Use the right one for the job.

---

## Layer 1 — `tokens.css` (CSS custom properties)

Raw `--qb-*` variables on `:root`. Every token from the master design file lives here verbatim.

**Use when:**
- Writing inline `style={{}}` props (e.g. SVG gradients, canvas drawing)
- Building arbitrary CSS that Tailwind cannot express
- Consuming tokens inside `@keyframes` or complex `@layer` rules

```tsx
// inline style — Tailwind can't express a two-stop gradient with runtime values
<div style={{ background: `linear-gradient(135deg, var(--qb-violet), var(--qb-yellow))` }} />
```

---

## Layer 2 — `index.css @theme` (Tailwind utilities)

Registers the same values as Tailwind v4 design tokens so they generate utility classes.

**Use when:**
- Writing any JSX/TSX — this is the default for all component styling

```tsx
// Tailwind utility classes — always prefer these in JSX
<div className="bg-violet text-white rounded-md shadow-card px-4 py-2" />
```

---

## Quick reference

| I want to…                          | Use                         |
|-------------------------------------|-----------------------------|
| Style a component in JSX            | `bg-violet`, `text-ink-muted`, `shadow-card` etc. |
| Reference a colour in an SVG/canvas | `var(--qb-violet)`          |
| Build a CSS gradient                | `var(--qb-violet)` + `var(--qb-yellow)` |
| Override a Tailwind default (e.g. font-sans) | `@theme { --font-sans: ... }` in `index.css` |

**Never duplicate values.** If a new token is needed, add it to both layers and the mobile `tokens.ts` file in the same PR.
