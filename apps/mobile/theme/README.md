# QuizBlitz Mobile Theme

## Where tokens come from

All values in `tokens.ts` are ported from the canonical source:

```
.claude/Claude design/tokens/design-tokens.json   ← DTCG-format source of truth
.claude/Claude design/tokens/design-tokens.css    ← CSS custom-property mirror
```

If brand colours, radii, or spacing change, update `design-tokens.json` first, then re-port `tokens.ts` to match.

## How to consume tokens in a component

**Prefer `useAppTheme().colors.*`** for anything React Native Paper already models (primary, background, surface, error). Paper applies these automatically to its components.

```tsx
const theme = useAppTheme();
// ✅ button colour, input focus ring, chip background — Paper handles it
<Button mode="contained">Save</Button>

// ✅ custom colour from the MD3 palette
<View style={{ backgroundColor: theme.colors.surfaceVariant }} />
```

**Use `useAppTheme().tokens.*`** for values Paper doesn't model — radii, shadows, spacing, quadrant colours, stage colours.

```tsx
const { tokens } = useAppTheme();

<View style={{
  borderRadius: tokens.radius.lg,
  ...tokens.shadow.card,
  padding: tokens.spacing[4],
}} />
```

## How to add a new token

1. Add the value to `design-tokens.json` under the correct group.
2. Add the matching constant to `tokens.ts` in `theme/tokens.ts`.
3. If it's a colour that Paper should apply globally (e.g. a new semantic surface), also wire it into `lightTheme.colors` in `theme/index.ts`.
4. Do not add inline hex values in component files — all colours come from tokens.

## Why dark mode is locked off

`THEME_CONFIG.userSwitchable` is `false` for v1. The design spec only defines a light-mode colour system. The dark palette will be designed and wired up in a later phase. The `darkTheme` export is kept so `_layout.tsx` compiles without changes when dark mode is re-enabled.
