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
        primary: 'var(--brand-primary, #0072CE)',
        secondary: 'var(--brand-secondary, #0A1A2F)',
        accent: 'var(--brand-accent, #FFC300)',
      },
      surface: {
        base: 'var(--brand-surface, #FFFFFF)',
        alt: 'var(--brand-surface-alt, #F5F7FA)',
      },
      text: {
        base: 'var(--brand-text, #0A1A2F)',
        muted: 'var(--brand-text-muted, #4B5563)',
      },
      border: 'var(--brand-border, #E5E7EB)',

      /* ⭐ HEADER COLORS */
      header: {
        bg: 'var(--header-bg)',
        text: 'var(--header-text)',
        muted: 'var(--header-text-muted)',
        link: 'var(--header-link)',
        linkHover: 'var(--header-link-hover)',
        linkActive: 'var(--header-link-active)',   // ⭐ FIXED
        accent: 'var(--header-accent)',
      },
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
      sans: 'var(--site-font)',
    },
  },

  safelist: [
    'input',
    'bg-[var(--brand-primary)]',
    'bg-[var(--brand-surface)]',
    'text-[var(--brand-text)]',
    'text-[var(--brand-text-muted)]',
  ],

  shortcuts: {
    page: 'px-md py-lg bg-surface-base text-text-base',

    card: 'bg-surface-base rounded-lg shadow-card p-md border border-border',
    'card-hover': 'hover:shadow-cardHover transition-shadow',

    btn: 'px-md py-sm rounded-md font-semibold text-white bg-brand-primary active:scale-95 transition-all',
    'btn-secondary': 'px-md py-sm rounded-md font-semibold bg-brand-secondary text-white active:scale-95 transition-all',
    'btn-outline': 'px-md py-sm rounded-md font-semibold border border-brand-primary text-brand-primary bg-transparent active:scale-95 transition-all',
    'btn-subtle': 'px-md py-sm rounded-md font-semibold bg-surface-alt text-text-base border border-border active:scale-95 transition-all',

    input:
      'w-full px-md py-md rounded-lg border border-border bg-white text-text-base ' +
      'focus:(border-brand-primary ring-2 ring-brand-primary/20 outline-none) transition-all',

    'section-title': 'text-xl font-bold text-text-base mb-sm',
    'nav-item': 'flex flex-col items-center text-sm text-text-muted',
    chip: 'px-sm py-xs rounded-full bg-surface-alt text-text-base border border-border',
  },
})
