export const Colors = {
    background: '#0a0a0a',
    card: '#121212',
    cardAlt: '#181818',
    surface: '#1e1e1e',
    border: '#242424',
    muted: '#1f1f1f',
    mutedForeground: '#999999',
    foreground: '#fafafa',
    primary: '#e91e8c',
    primaryForeground: '#ffffff',
    accent: '#f59e0b',
    accentForeground: '#ffffff',
    purple: '#6d28d9',
    deepPurple: '#5b21b6',
    orange: '#f59e0b',
    gold: '#facc15',
    magenta: '#e91e8c',
    pink: '#ec4899',
    destructive: '#ef4444',
    green: '#22c55e',
};

export const Gradients = {
    naavix: ['#f59e0b', '#e91e8c', '#6d28d9'] as const,
    naavixSoft: ['rgba(245, 158, 11, 0.2)', 'rgba(233, 30, 140, 0.2)', 'rgba(109, 40, 217, 0.2)'] as const,
    naavixGlow: ['rgba(245, 158, 11, 0.3)', 'rgba(233, 30, 140, 0.3)', 'rgba(109, 40, 217, 0.3)'] as const,
    gold: ['#facc15', '#f59e0b', '#e91e8c'] as const,
    purplePink: ['rgba(233, 30, 140, 0.5)', 'rgba(109, 40, 217, 0.5)'] as const,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const BorderRadius = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
};

export const FontSizes = {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
};

export const FontWeights = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};
