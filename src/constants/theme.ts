// ─── Font families (loaded via @expo-google-fonts/noto-sans-thai) ─────────────
export const Font = {
  light:     'NotoSansThai_300Light',
  regular:   'NotoSansThai_400Regular',
  medium:    'NotoSansThai_500Medium',
  semibold:  'NotoSansThai_600SemiBold',
  bold:      'NotoSansThai_700Bold',
  extrabold: 'NotoSansThai_800ExtraBold',
} as const;

// ─── Accent color themes ───────────────────────────────────────────────────────
// First key = default accent
export const ACCENT_THEMES = {
  dream: {
    name: 'Dream', emoji: '✨',
    primary:   '#9B7FE8',
    secondary: '#C4A8F5',
    gradient:  ['#BDA6F8', '#7B57DB'] as [string, string],
    bgDark:    ['#1E1448', '#0C0A1E'] as [string, string],   // deep purple → cosmic
    bgLight:   ['#EDE5FF', '#F5F0E8'] as [string, string],   // soft lavender → cream
  },
  rose: {
    name: 'Rose', emoji: '🌸',
    primary:   '#D4638A',
    secondary: '#F5A0C0',
    gradient:  ['#F5A0C0', '#C4547C'] as [string, string],
    bgDark:    ['#250C17', '#0C0A1E'] as [string, string],   // deep rose → cosmic
    bgLight:   ['#FFE6F2', '#F5F0E8'] as [string, string],   // soft rose → cream
  },
  sage: {
    name: 'Sage', emoji: '🌿',
    primary:   '#4A9170',
    secondary: '#7DC4A4',
    gradient:  ['#7DC4A4', '#3D7A5C'] as [string, string],
    bgDark:    ['#0C2218', '#0C0A1E'] as [string, string],   // deep forest → cosmic
    bgLight:   ['#E2F5EC', '#F5F0E8'] as [string, string],   // soft sage → cream
  },
  dawn: {
    name: 'Dawn', emoji: '🌅',
    primary:   '#D4773A',
    secondary: '#F4A06C',
    gradient:  ['#F4A06C', '#C46030'] as [string, string],
    bgDark:    ['#221006', '#0C0A1E'] as [string, string],   // deep amber → cosmic
    bgLight:   ['#FFEEDD', '#F5F0E8'] as [string, string],   // soft peach → cream
  },
  ocean: {
    name: 'Ocean', emoji: '🌊',
    primary:   '#4B8EF1',
    secondary: '#72C3F8',
    gradient:  ['#5BA4F5', '#3B7DE8'] as [string, string],
    bgDark:    ['#091830', '#0C0A1E'] as [string, string],   // deep ocean → cosmic
    bgLight:   ['#E2EEFF', '#F5F0E8'] as [string, string],   // soft sky → cream
  },
  honey: {
    name: 'Honey', emoji: '🍯',
    primary:   '#C47A15',
    secondary: '#E9A83A',
    gradient:  ['#E9A83A', '#B36910'] as [string, string],
    bgDark:    ['#1E1406', '#0C0A1E'] as [string, string],   // deep honey → cosmic
    bgLight:   ['#FFF6DC', '#F5F0E8'] as [string, string],   // soft honey → cream
  },
} as const;

export type AccentTheme = keyof typeof ACCENT_THEMES;

// ─── Base palettes ─────────────────────────────────────────────────────────────
export const Colors = {
  // Warm parchment — cozy daytime
  light: {
    background:    '#F5F0E8',   // warm cream / parchment
    surface:       '#FFFDF8',   // warm white
    primary:       '#9B7FE8',   // overridden by accent at runtime
    secondary:     '#C4A8F5',
    accent:        '#F0C366',   // warm gold
    text:          '#1C1425',   // deep warm purple-black
    textSecondary: '#7A6882',   // warm muted lavender
    border:        '#EBE1D5',   // warm beige border
    error:         '#E05C5C',
    success:       '#2DAF70',
  },
  // Deep cosmic — Manifest-style night
  dark: {
    background:    '#0C0A1E',   // deep cosmic purple-black
    surface:       '#161238',   // deep indigo
    primary:       '#B09AF8',   // overridden by accent at runtime
    secondary:     '#F0C366',
    accent:        '#F0C366',   // warm gold
    text:          '#EDE8FF',   // warm white-lavender
    textSecondary: '#9585B8',   // muted lavender
    border:        '#2C2850',   // dark indigo border
    error:         '#EF9A9A',
    success:       '#A5D6A7',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
}

// ─── Gradients (static fallbacks — prefer heroGradient from ThemeContext) ──────
export const Gradients = {
  warm:    ['#F4A06C', '#C47A15'] as const,
  gold:    ['#F0C366', '#C47A15'] as const,
  dark:    ['#2C2850', '#0C0A1E'] as const,
  morning: ['#E8C4F8', '#9B7FE8'] as const,
  hero:    ['#BDA6F8', '#7B57DB'] as const,   // Dream default
};

// ─── Typography — Noto Sans Thai, airy spacing ────────────────────────────────
export const Typography = {
  h1:         { fontSize: 28, fontFamily: Font.extrabold, letterSpacing: -0.5, lineHeight: 36 },
  h2:         { fontSize: 22, fontFamily: Font.bold,      letterSpacing: -0.3, lineHeight: 30 },
  h3:         { fontSize: 17, fontFamily: Font.semibold,  letterSpacing: -0.1, lineHeight: 24 },
  body:       { fontSize: 15, fontFamily: Font.regular,   lineHeight: 24 },
  bodyMedium: { fontSize: 15, fontFamily: Font.semibold,  lineHeight: 22 },
  caption:    { fontSize: 13, fontFamily: Font.regular,   lineHeight: 18, letterSpacing: 0.1 },
  small:      { fontSize: 11, fontFamily: Font.medium,    letterSpacing: 0.3 },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
} as const;

// ─── Radius — softer, more organic ───────────────────────────────────────────
export const Radius = {
  sm:   14,   // was 12
  md:   20,   // was 18
  lg:   28,   // was 24
  full: 999,
} as const;

// ─── Shadows — warm & soft ────────────────────────────────────────────────────
export const Shadow = {
  light: {
    shadowColor: '#2C1E5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  medium: {
    shadowColor: '#2C1E5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
};

// ─── Legacy mood helpers ──────────────────────────────────────────────────────
export const MoodColors = {
  1: '#FF7878', 2: '#FFB347', 3: '#72C3F8', 4: '#72E2A0', 5: '#B5A9F5',
} as const;

export const MoodEmojis = {
  1: '😔', 2: '😐', 3: '🙂', 4: '😊', 5: '😄',
} as const;
