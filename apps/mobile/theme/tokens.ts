// Source of truth: .claude/Claude design/tokens/design-tokens.json
// Re-port this file if the JSON changes.
export const tokens = {
  color: {
    brand: {
      violet:     '#6E3FF3',
      violetDeep: '#4F1FBF',
      violetSoft: '#EEE7FF',
      violetTint: '#F7F4FF',
      yellow:     '#FFD24A',
      yellowDeep: '#E6B400',
    },
    stage: {
      night:     '#0B0820',
      nightLift: '#1A1438',
      nightLine: '#2A2148',
    },
    ink: {
      ink:        '#0F0A1F',
      inkSoft:    '#3F3559',
      muted:      '#6B6481',
      border:     '#E7E2F0',
      borderSoft: '#F1ECF7',
      surface:    '#FFFFFF',
      surface2:   '#FAF8FE',
      surface3:   '#F3EEFB',
    },
    semantic: {
      correct:     '#16A34A',
      correctSoft: '#DCFCE7',
      wrong:       '#EF4444',
      wrongSoft:   '#FEE2E2',
    },
    quadrant: {
      q1: '#FF4D6D', // red   — triangle
      q2: '#2563EB', // blue  — diamond
      q3: '#FFB400', // amber — circle
      q4: '#16A34A', // green — square
    },
  },
  radius: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 9999 },
  shadow: {
    card: { shadowColor: '#0F0A1F', shadowOffset: { width: 0, height: 2 },  shadowOpacity: 0.05, shadowRadius: 8,  elevation: 2  },
    lift: { shadowColor: '#0F0A1F', shadowOffset: { width: 0, height: 8 },  shadowOpacity: 0.08, shadowRadius: 20, elevation: 8  },
    pop:  { shadowColor: '#6E3FF3', shadowOffset: { width: 0, height: 8 },  shadowOpacity: 0.28, shadowRadius: 20, elevation: 12 },
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 },
  font: {
    display:        'BricolageGrotesque_700Bold',
    displayRegular: 'BricolageGrotesque_400Regular',
    ui:             'Inter_400Regular',
    uiMedium:       'Inter_500Medium',
    uiSemibold:     'Inter_600SemiBold',
    uiBold:         'Inter_700Bold',
  },
  text: {
    displayXl: 60,
    displayLg: 40,
    displayMd: 28,
    displaySm: 22,
    uiLg: 16,
    uiMd: 14,
    uiSm: 12,
    uiXs: 11,
  },
} as const;

export type QBTokens = typeof tokens;
