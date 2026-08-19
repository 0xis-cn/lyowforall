import {
  addDays,
  formatMonth,
  inRange,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  todayUTC,
} from './date.js';

function weekdayLabels(locale) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const sunday = new Date(Date.UTC(2023, 0, 1));
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(sunday, i)));
}

export function buildCalendarModel({ viewDate, value, focusedDate, min, max, locale }) {
  const monthStart = startOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart);
  const today = todayUTC();
  const weeks = [];

  for (let week = 0; week < 6; week += 1) {
    const days = [];
    for (let day = 0; day < 7; day += 1) {
      const offset = week * 7 + day;
      const date = addDays(gridStart, offset);
      const disabled = !inRange(date, min, max);
      days.push({
        date,
        iso: toISODate(date),
        dayOfMonth: date.getUTCDate(),
        inMonth: date.getUTCMonth() === monthStart.getUTCMonth(),
        selected: isSameDay(date, value),
        focused: isSameDay(date, focusedDate),
        today: isSameDay(date, today),
        disabled,
      });
    }
    weeks.push(days);
  }

  return {
    monthLabel: formatMonth(monthStart, locale),
    weekdayLabels: weekdayLabels(locale),
    weeks,
  };
}
