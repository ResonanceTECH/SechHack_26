/** Mirrors CSS tokens in `styles/tokens.css` for JS usage. */
export const colors = {
  bgApp: '#F4F6FC',
  bgSurface: '#FFFFFF',
  bgSidebar: '#FFFFFF',
  bgNavActive: '#E8EEFF',
  brand: '#0059FF',
  brandSoft: '#D9E4FF',
  ink: '#1B2440',
  muted: '#6E7690',
  danger: '#E54D4D',
  success: '#2F9E6D',
  warning: '#E6A317',
  white: '#FFFFFF',
} as const

export type ColorToken = keyof typeof colors
