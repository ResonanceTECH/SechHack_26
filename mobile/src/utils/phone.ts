/** Format RU mobile as +7 XXX XXX-XX-XX while typing digits */
export function formatRuPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);

  let rest = digits;
  if (rest.startsWith("8")) rest = "7" + rest.slice(1);
  if (!rest.startsWith("7") && rest.length > 0) rest = "7" + rest;
  rest = rest.slice(0, 11);

  const body = rest.slice(1);
  let out = "+7";
  if (body.length === 0) return out;

  out += " " + body.slice(0, 3);
  if (body.length > 3) out += " " + body.slice(3, 6);
  if (body.length > 6) out += "-" + body.slice(6, 8);
  if (body.length > 8) out += "-" + body.slice(8, 10);
  return out;
}

export function isRuPhoneComplete(formatted: string): boolean {
  return formatted.replace(/\D/g, "").length === 11;
}

/** +7 916 123-45-67 → +7 916 ···-··-67 */
export function maskRuPhone(formatted: string): string {
  const d = formatted.replace(/\D/g, "");
  if (d.length < 11) return formatted;
  return `+7 ${d.slice(1, 4)} ···-··-${d.slice(9, 11)}`;
}
