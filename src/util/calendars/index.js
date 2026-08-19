import DefaultCalendar from './DefaultCalendar.js';
import SeptimalCalendar from './SeptimalCalendar.js';
import HetesflusCalendar from './HetesflusCalendar.js';

export { DefaultCalendar, SeptimalCalendar, HetesflusCalendar };

export const builtInCalendars = {
  default: new DefaultCalendar(),
  septimal: new SeptimalCalendar(),
  hetesflus: new HetesflusCalendar(),
};

export function resolveCalendar(value) {
  if (!value) return builtInCalendars.default;
  if (typeof value === 'string') {
    return builtInCalendars[value] || builtInCalendars.default;
  }
  if (typeof value.day === 'function' && typeof value.julian === 'function') {
    return value;
  }
  return builtInCalendars.default;
}
