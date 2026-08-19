const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86400000;
const UNIX_EPOCH_JULIAN_DAY = 2440588;

function utcDate(year, monthIndex, day) {
  return new Date(Date.UTC(year, monthIndex, day));
}

export function todayUTC() {
  const now = new Date();
  return utcDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function parseISODate(value) {
  if (typeof value !== 'string') return null;
  const match = ISO_RE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = utcDate(year, month - 1, day);
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }
  return candidate;
}

export function coerceDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return utcDate(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }
  if (typeof value === 'string') {
    return parseISODate(value);
  }
  return null;
}

export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(date, locale = undefined) {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function formatMonth(date, locale = undefined) {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function isSameDay(a, b) {
  return !!a && !!b &&
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return utcDate(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate());
}

export function addMonths(date, amount) {
  const next = utcDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
  return next;
}

export function startOfMonth(date) {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function startOfWeek(date) {
  return addDays(date, -date.getUTCDay());
}

export function clampDate(date, min, max) {
  if (!date) return null;
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

export function inRange(date, min, max) {
  if (min && date < min) return false;
  if (max && date > max) return false;
  return true;
}

export function toJulianDay(date) {
  return Math.floor(date.getTime() / MS_PER_DAY) + UNIX_EPOCH_JULIAN_DAY;
}

export function fromJulianDay(julianDay) {
  return new Date((julianDay - UNIX_EPOCH_JULIAN_DAY) * MS_PER_DAY);
}

export function mod(n, m) {
  return ((n % m) + m) % m;
}
