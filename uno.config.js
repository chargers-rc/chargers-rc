import { defineConfig, presetUno, presetIcons, presetTypography } from 'unocss'

export default defineConfig({
  content: [
    './index.html',
    './src/**/*',
  ],

  presets: [
    presetUno(),
    presetIcons(),
    presetTypography(),
  ],

  theme: {
    colors: {
      brand: {
        primary: 'var(--brand-primary, #007aff)',
        secondary: 'var(--brand-secondary, #0051a8)',
        accent: 'var(--brand-accent, #ff3b30)',
      },
      surface: {
        base: 'var(--brand-surface, #ffffff)',
        alt: 'var(--brand-surface-alt, #f5f7fa)',
      },
      text: {
        base: 'var(--brand-text, #1a1a1a)',
        muted: 'var(--brand-text-muted, #6b7280)',
      },
      border: 'var(--brand-border, #e5e7eb)',
    },

    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },

    borderRadius: {
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '20px',
    },

    boxShadow: {
      card: '0 2px 8px rgba(0,0,0,0.06)',
      cardHover: '0 4px 12px rgba(0,0,0,0.08)',
    },

    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
    },
  },

  safelist: ['input'],

  shortcuts: {
    'page': 'px-md py-lg bg-surface-base text-text-base',
    'card': 'bg-surface-base rounded-lg shadow-card p-md border border-border',
    'card-hover': 'hover:shadow-cardHover transition-shadow',
    'btn': 'px-md py-sm rounded-md font-semibold text-white bg-brand-primary active:scale-95 transition-all',
    'btn-secondary': 'px-md py-sm rounded-md font-semibold bg-brand-secondary text-white active:scale-95 transition-all',
    'btn-outline': 'px-md py-sm rounded-md font-semibold border border-brand-primary text-brand-primary bg-transparent active:scale-95 transition-all',
    'btn-subtle': 'px-md py-sm rounded-md font-semibold bg-surface-alt text-text-base border border-border active:scale-95 transition-all',
    'input':
      'w-full px-md py-md rounded-lg border border-border bg-white text-text-base ' +
      'focus:(border-brand-primary ring-2 ring-brand-primary/20 outline-none) transition-all',
    'section-title': 'text-xl font-bold text-text-base mb-sm',
    'nav-item': 'flex flex-col items-center text-sm text-text-muted',
    'chip': 'px-sm py-xs rounded-full bg-surface-alt text-text-base border border-border',
  },
})
