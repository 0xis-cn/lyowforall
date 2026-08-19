import {
  fromJulianDay,
  inRange,
  isSameDay,
  mod,
  toISODate,
  todayUTC,
  toJulianDay,
} from './date.js';

function getMonthLabel(calendar, year, month, locale, monthStartDate) {
  const aliases = typeof calendar.monthAliases === 'function' ? calendar.monthAliases(year) : null;
  const monthAlias = aliases?.[month];
  const yearAlias = typeof calendar.yearAlias === 'function' ? calendar.yearAlias(year) : year;

  if (monthAlias != null) return `${yearAlias} ${monthAlias}`;

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(monthStartDate);
}

function getWeekdayLabels(calendar, locale) {
  if (Array.isArray(calendar.weekdays) && calendar.weekdays.length === 7) {
    return calendar.weekdays;
  }

  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const sunday = new Date(Date.UTC(2023, 0, 1));
  return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(sunday.getTime() + i * 86400000)));
}

function shiftMonth(year, month, step, calendar) {
  let y = year;
  let m = month;
  let rest = step;

  while (rest > 0) {
    const monthCount = calendar.monthLengths(y).length;
    if (m + 1 >= monthCount) {
      y += 1;
      m = 0;
    } else {
      m += 1;
    }
    rest -= 1;
  }

  while (rest < 0) {
    if (m - 1 < 0) {
      y -= 1;
      m = calendar.monthLengths(y).length - 1;
    } else {
      m -= 1;
    }
    rest += 1;
  }

  return [y, m];
}

export function startOfCalendarMonth(date, calendar) {
  const julian = toJulianDay(date);
  const [year, month] = calendar.day(julian);
  return fromJulianDay(calendar.julian(year, month, 1));
}

export function addCalendarMonths(date, step, calendar) {
  const julian = toJulianDay(date);
  const [year, month] = calendar.day(julian);
  const [nextYear, nextMonth] = shiftMonth(year, month, step, calendar);
  return fromJulianDay(calendar.julian(nextYear, nextMonth, 1));
}

export function buildCalendarModel({ viewDate, value, focusedDate, min, max, locale, calendar }) {
  const monthStart = startOfCalendarMonth(viewDate, calendar);
  const monthStartJulian = toJulianDay(monthStart);
  const [year, month] = calendar.day(monthStartJulian);
  const monthLength = calendar.monthLengths(year)[month];
  const weekOffset = Number.isInteger(calendar.weekOffset) ? calendar.weekOffset : 0;
  const startWeekday = mod(monthStartJulian + weekOffset, 7);
  const gridStartJulian = monthStartJulian - startWeekday;
  const captions = typeof calendar.dayCaptions === 'function' ? calendar.dayCaptions(gridStartJulian, 42) : null;
  const today = todayUTC();
  const weeks = [];

  for (let week = 0; week < 6; week += 1) {
    const days = [];
    for (let day = 0; day < 7; day += 1) {
      const offset = week * 7 + day;
      const julian = gridStartJulian + offset;
      const date = fromJulianDay(julian);
      const [cellYear, cellMonth, cellDay] = calendar.day(julian);
      const disabled = !inRange(date, min, max);
      const caption = captions?.[offset];

      days.push({
        date,
        iso: toISODate(date),
        dayOfMonth: cellDay,
        label: typeof caption === 'object' ? caption.text : caption,
        badge: !!(caption && typeof caption === 'object' && caption.badge),
        inMonth: cellYear === year && cellMonth === month && cellDay <= monthLength,
        selected: isSameDay(date, value),
        focused: isSameDay(date, focusedDate),
        today: isSameDay(date, today),
        disabled,
      });
    }
    weeks.push(days);
  }

  return {
    monthLabel: getMonthLabel(calendar, year, month, locale, monthStart),
    weekdayLabels: getWeekdayLabels(calendar, locale),
    weeks,
  };
}
