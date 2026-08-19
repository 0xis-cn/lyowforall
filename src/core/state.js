import {
  addDays,
  clampDate,
  coerceDate,
  parseISODate,
  toISODate,
  todayUTC,
} from './date.js';
import { addCalendarMonths, buildCalendarModel, startOfCalendarMonth } from './calendar.js';
import { resolveCalendar } from '../util/calendars/index.js';

function normalizeOptions(options = {}) {
  const min = coerceDate(options.min);
  const max = coerceDate(options.max);
  let value = coerceDate(options.value);
  value = clampDate(value, min, max);
  const calendar = resolveCalendar(options.calendar);

  return {
    value,
    min,
    max,
    locale: options.locale || undefined,
    calendar,
    calendarName: options.calendar == null
      ? 'default'
      : (typeof options.calendar === 'string' ? options.calendar : 'custom'),
  };
}

export function createDatePickerCore(initialOptions = {}) {
  let options = normalizeOptions(initialOptions);
  let isOpen = false;
  let value = options.value;
  let viewDate = startOfCalendarMonth(value || todayUTC(), options.calendar);
  let focusedDate = value || viewDate;

  const subscribers = new Set();
  const listeners = new Map();

  function emitState() {
    const snapshot = api.getState();
    subscribers.forEach((subscriber) => subscriber(snapshot));
  }

  function emit(type, detail = {}) {
    (listeners.get(type) || []).forEach((listener) => listener(detail));
  }

  function setValueInternal(nextValue, source = 'api') {
    const normalized = clampDate(coerceDate(nextValue), options.min, options.max);
    const currentIso = value ? toISODate(value) : '';
    const nextIso = normalized ? toISODate(normalized) : '';
    if (currentIso === nextIso) return false;

    value = normalized;
    if (value) {
      focusedDate = value;
      viewDate = startOfCalendarMonth(value, options.calendar);
    }

    emit('change', { value, iso: nextIso, source });
    emitState();
    return true;
  }

  const api = {
    subscribe(fn) {
      subscribers.add(fn);
      fn(api.getState());
      return () => subscribers.delete(fn);
    },
    on(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
      return () => {
        listeners.set(type, (listeners.get(type) || []).filter((item) => item !== fn));
      };
    },
    getState() {
      return {
        isOpen,
        value,
        valueIso: value ? toISODate(value) : '',
        focusedDate,
        focusedIso: focusedDate ? toISODate(focusedDate) : '',
        options,
        viewDate,
        viewIso: toISODate(viewDate),
        viewModel: buildCalendarModel({
          viewDate,
          value,
          focusedDate,
          min: options.min,
          max: options.max,
          locale: options.locale,
          calendar: options.calendar,
        }),
      };
    },
    open() {
      if (isOpen) return;
      isOpen = true;
      emit('open');
      emitState();
    },
    close() {
      if (!isOpen) return;
      isOpen = false;
      emit('close');
      emitState();
    },
    toggle() {
      if (isOpen) {
        api.close();
      } else {
        api.open();
      }
    },
    setValue(nextValue) {
      setValueInternal(nextValue, 'api');
    },
    getValue() {
      return value ? new Date(value) : null;
    },
    setOptions(partial = {}) {
      const merged = {
        value,
        min: options.min,
        max: options.max,
        locale: options.locale,
        calendar: options.calendar,
        ...partial,
      };
      options = normalizeOptions(merged);
      value = clampDate(value, options.min, options.max);
      focusedDate = clampDate(focusedDate, options.min, options.max) || value || viewDate;
      viewDate = startOfCalendarMonth(value || viewDate, options.calendar);
      emitState();
    },
    navigateMonth(step) {
      viewDate = addCalendarMonths(viewDate, step, options.calendar);
      const monthStart = startOfCalendarMonth(viewDate, options.calendar);
      focusedDate = clampDate(monthStart, options.min, options.max) || monthStart;
      emit('navigate', {
        calendar: options.calendarName,
      });
      emitState();
    },
    focusDateByIso(iso) {
      const parsed = parseISODate(iso);
      if (!parsed) return;
      focusedDate = clampDate(parsed, options.min, options.max) || focusedDate;
      if (focusedDate) viewDate = startOfCalendarMonth(focusedDate, options.calendar);
      emitState();
    },
    selectFocused(source = 'keyboard') {
      const changed = setValueInternal(focusedDate, source);
      api.close();
      return changed;
    },
    selectDateByIso(iso, source = 'pointer') {
      const parsed = parseISODate(iso);
      if (!parsed) return false;
      const changed = setValueInternal(parsed, source);
      api.close();
      return changed;
    },
    handleKey(key) {
      switch (key) {
        case 'ArrowLeft':
          focusedDate = clampDate(addDays(focusedDate, -1), options.min, options.max) || focusedDate;
          viewDate = startOfCalendarMonth(focusedDate, options.calendar);
          emitState();
          return true;
        case 'ArrowRight':
          focusedDate = clampDate(addDays(focusedDate, 1), options.min, options.max) || focusedDate;
          viewDate = startOfCalendarMonth(focusedDate, options.calendar);
          emitState();
          return true;
        case 'ArrowUp':
          focusedDate = clampDate(addDays(focusedDate, -7), options.min, options.max) || focusedDate;
          viewDate = startOfCalendarMonth(focusedDate, options.calendar);
          emitState();
          return true;
        case 'ArrowDown':
          focusedDate = clampDate(addDays(focusedDate, 7), options.min, options.max) || focusedDate;
          viewDate = startOfCalendarMonth(focusedDate, options.calendar);
          emitState();
          return true;
        case 'Enter':
          api.selectFocused('keyboard');
          return true;
        case 'Escape':
          api.close();
          return true;
        default:
          return false;
      }
    },
  };

  return api;
}
