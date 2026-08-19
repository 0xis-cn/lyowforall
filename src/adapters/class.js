import { createDatePickerCore } from '../core/state.js';
import { coerceDate, toISODate } from '../core/date.js';
import { focusActiveCell, renderPopup } from './dom.js';

export class DatePicker {
  constructor(element, options = {}) {
    if (!(element instanceof HTMLElement)) {
      throw new TypeError('DatePicker requires a valid HTMLElement anchor');
    }

    this.element = element;
    this.options = { ...options };
    this.core = createDatePickerCore(options);
    this.popup = document.createElement('div');
    this.popup.id = `lite-datepicker-${Math.random().toString(36).slice(2)}`;
    this.popup.className = 'lite-datepicker-host';
    this.popup.hidden = true;
    document.body.appendChild(this.popup);

    this.element.setAttribute('aria-haspopup', 'grid');
    this.element.setAttribute('aria-controls', this.popup.id);
    this.element.setAttribute('aria-expanded', 'false');

    this.unsubscribe = this.core.subscribe((state) => {
      renderPopup(this.popup, state);
      this.element.setAttribute('aria-expanded', state.isOpen ? 'true' : 'false');
      if (state.isOpen) {
        this.positionPopup();
      }
    });

    this.unlistenChange = this.core.on('change', (detail) => {
      if ('value' in this.element && typeof this.element.value === 'string') {
        this.element.value = detail.iso;
      }
      this.element.dispatchEvent(new CustomEvent('lite-datepicker:change', { detail }));
      if (typeof this.options.onChange === 'function') {
        this.options.onChange(detail);
      }
    });

    this.boundInputClick = () => {
      if (this.element.disabled) return;
      this.toggle();
    };

    this.boundInputKeydown = (event) => {
      if (this.element.disabled) return;
      if (!this.core.getState().isOpen && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.open();
        focusActiveCell(this.popup);
        return;
      }
      if (this.core.getState().isOpen && this.core.handleKey(event.key)) {
        event.preventDefault();
        focusActiveCell(this.popup);
      }
    };

    this.boundInputChange = (event) => {
      const next = coerceDate(event.target.value);
      this.setValue(next);
    };

    this.boundPopupClick = (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'prev') this.core.navigateMonth(-1);
      if (action === 'next') this.core.navigateMonth(1);
      if (action === 'select' && button.dataset.iso) {
        this.core.selectDateByIso(button.dataset.iso, 'pointer');
      }
      focusActiveCell(this.popup);
    };

    this.boundPopupKeydown = (event) => {
      if (this.core.handleKey(event.key)) {
        event.preventDefault();
        focusActiveCell(this.popup);
      }
    };

    this.boundOutsideClick = (event) => {
      if (!this.core.getState().isOpen) return;
      if (this.popup.contains(event.target) || this.element.contains(event.target)) return;
      this.close();
    };

    this.boundWindowResize = () => {
      if (this.core.getState().isOpen) this.positionPopup();
    };

    this.element.addEventListener('click', this.boundInputClick);
    this.element.addEventListener('keydown', this.boundInputKeydown);
    if ('value' in this.element) {
      this.element.addEventListener('change', this.boundInputChange);
      const initial = coerceDate(this.element.value);
      if (initial) this.core.setValue(initial);
    }

    this.popup.addEventListener('click', this.boundPopupClick);
    this.popup.addEventListener('keydown', this.boundPopupKeydown);
    document.addEventListener('mousedown', this.boundOutsideClick);
    window.addEventListener('resize', this.boundWindowResize);

    if (options.value) {
      this.setValue(options.value);
    }
  }

  positionPopup() {
    const rect = this.element.getBoundingClientRect();
    this.popup.style.position = 'absolute';
    this.popup.style.top = `${window.scrollY + rect.bottom + 4}px`;
    this.popup.style.left = `${window.scrollX + rect.left}px`;
    this.popup.style.zIndex = '999';
    this.popup.style.minWidth = `${rect.width}px`;
  }

  open() {
    this.core.open();
  }

  close() {
    this.core.close();
  }

  toggle() {
    this.core.toggle();
  }

  setValue(value) {
    this.core.setValue(value);
  }

  getValue() {
    return this.core.getValue();
  }

  destroy() {
    this.close();
    this.unsubscribe();
    this.unlistenChange();
    this.element.removeEventListener('click', this.boundInputClick);
    this.element.removeEventListener('keydown', this.boundInputKeydown);
    this.element.removeEventListener('change', this.boundInputChange);
    this.popup.removeEventListener('click', this.boundPopupClick);
    this.popup.removeEventListener('keydown', this.boundPopupKeydown);
    document.removeEventListener('mousedown', this.boundOutsideClick);
    window.removeEventListener('resize', this.boundWindowResize);
    this.popup.remove();
  }

  getValueIso() {
    const value = this.getValue();
    return value ? toISODate(value) : '';
  }
}
