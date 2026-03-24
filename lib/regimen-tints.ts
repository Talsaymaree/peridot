export const REGIMEN_TINTS = [
  { label: 'Peridot', value: '#9FCC3B' },
  { label: 'Lime', value: '#CFEA7A' },
  { label: 'Glow', value: '#E8F7A1' },
  { label: 'Emerald', value: '#7FBF3F' },
  { label: 'Teal', value: '#53B8A6' },
  { label: 'Sky', value: '#76C7F2' },
  { label: 'Peach', value: '#E9B66E' },
  { label: 'Coral', value: '#D96B4A' },
] as const

export const DEFAULT_REGIMEN_TINT = REGIMEN_TINTS[0].value

function normalizeHex(hex: string | null | undefined) {
  if (!hex) return DEFAULT_REGIMEN_TINT
  const trimmed = hex.trim()
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toUpperCase() : DEFAULT_REGIMEN_TINT
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex).replace('#', '')
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

export function getRegimenTint(hex: string | null | undefined) {
  return normalizeHex(hex)
}

export function getRegimenTintMeta(hex: string | null | undefined) {
  const value = normalizeHex(hex)
  const match = REGIMEN_TINTS.find((tint) => tint.value === value)

  return {
    label: match?.label ?? 'Custom',
    value,
  }
}

export function tintRgba(hex: string | null | undefined, alpha: number) {
  const { r, g, b } = hexToRgb(normalizeHex(hex))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function darkenTint(hex: string | null | undefined, amount = 0.2) {
  const { r, g, b } = hexToRgb(normalizeHex(hex))
  const factor = Math.max(0, Math.min(1, 1 - amount))
  const toHex = (value: number) => Math.round(value * factor).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}
