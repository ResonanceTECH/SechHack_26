/** До 10 цифр национального номера (без +7 / 8). */
export function parseRuNationalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '')

  // Полный номер: 7XXXXXXXXXX / 8XXXXXXXXXX / +7…
  if (digits.length >= 11 && (digits[0] === '7' || digits[0] === '8')) {
    return digits.slice(1, 11)
  }

  // Контрол всегда с префиксом +7 → в digits лидирующая 7
  if (digits.startsWith('7')) {
    return digits.slice(1, 11)
  }

  // Вставка/ввод с 8 как код страны (короткий фрагмент после стрипа)
  if (digits.startsWith('8') && digits.length > 1) {
    return digits.slice(1, 11)
  }

  return digits.slice(0, 10)
}

/** `+7 (999) 123-45-67` — префикс +7 всегда. */
export function formatRuPhone(national: string): string {
  const d = national.slice(0, 10)
  if (d.length === 0) return '+7'

  const a = d.slice(0, 3)
  const b = d.slice(3, 6)
  const c = d.slice(6, 8)
  const e = d.slice(8, 10)

  if (d.length <= 3) return `+7 (${a}`
  if (d.length <= 6) return `+7 (${a}) ${b}`
  if (d.length <= 8) return `+7 (${a}) ${b}-${c}`
  return `+7 (${a}) ${b}-${c}-${e}`
}

export function isRuPhoneComplete(national: string): boolean {
  return national.length === 10
}
