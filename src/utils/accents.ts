const ACCENT_MAP: Record<string, string> = {
  À: 'A', Á: 'A', Â: 'A', Ã: 'A', Ä: 'A',
  È: 'E', É: 'E', Ê: 'E', Ë: 'E',
  Ì: 'I', Í: 'I', Î: 'I', Ï: 'I',
  Ò: 'O', Ó: 'O', Ô: 'O', Õ: 'O', Ö: 'O',
  Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U',
  Ç: 'C',
  Ñ: 'N',
};

export function removeAccents(str: string): string {
  return str
    .toUpperCase()
    .split('')
    .map((ch) => ACCENT_MAP[ch] ?? ch)
    .join('');
}

export function normalize(str: string): string {
  return removeAccents(str).toUpperCase();
}
