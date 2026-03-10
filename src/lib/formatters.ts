export function formatDiopter(value: string): string {
  const trimmed = value.trim().replace(',', '.');

  if (!trimmed || trimmed === '+' || trimmed === '-') return '0.00';

  let negative = false;
  let numeric = trimmed;

  if (trimmed[0] === '+' || trimmed[0] === '-') {
    negative = trimmed[0] === '-';
    numeric = trimmed.substring(1);
  }

  const parsed = parseFloat(numeric);
  if (isNaN(parsed)) return '0.00';

  const rounded = Math.round((negative ? -parsed : parsed) * 4) / 4;
  if (rounded === 0) return '0.00';
  if (rounded > 0) return '+' + rounded.toFixed(2);
  return rounded.toFixed(2); // negative: toFixed includes the minus sign
}

export function formatAddPP(value: string): string {
  const trimmed = value.trim().replace(',', '.');

  if (!trimmed || trimmed === '+') return '0.00';

  const numeric = trimmed.replace(/^[+-]/, '');
  const parsed = parseFloat(numeric);
  if (isNaN(parsed)) return '0.00';

  const rounded = Math.round(parsed * 4) / 4;
  if (rounded <= 0) return '0.00';
  return '+' + rounded.toFixed(2);
}

export function isDiopterValid(value: string): boolean {
  if (value === '') return true;
  return /^[+-]?\d+\.(00|25|50|75)$/.test(value);
}

export function clampAxis(value: string): string {
  const stripped = value.replace(/\D/g, '');
  if (!stripped) return '0';
  const n = parseInt(stripped, 10);
  if (isNaN(n)) return '0';
  if (n > 180) return '180';
  if (n < 0) return '0';
  return String(n);
}

export function filterAxisInput(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatDecimal2(value: string): string {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return '';
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) return '';
  if (parsed < 0) return Math.abs(parsed).toFixed(2);
  return parsed.toFixed(2);
}

export function isDecimal2Valid(value: string): boolean {
  if (value === '') return true;
  return /^\d+\.\d{2}$/.test(value);
}

export function filterDecimalInput(value: string): string {
  return value.replace(/[^0-9.,]/g, '');
}

export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isoToDDMMYYYY(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function ddmmyyyyToISO(dmy: string): string {
  const match = dmy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';
  const [, d, m, y] = match;
  const dd = d.padStart(2, '0'), mm = m.padStart(2, '0');
  const date = new Date(`${y}-${mm}-${dd}`);
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== +y ||
    date.getMonth() + 1 !== +m ||
    date.getDate() !== +d
  ) return '';
  return `${y}-${mm}-${dd}`;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-àáâãéèêíìóòôõúùçÀÁÂÃÉÈÊÍÌÓÒÔÕÚÙÇ]/g, '');
}
