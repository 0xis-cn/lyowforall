import { createDatePickerCore } from '../core/state.js';
import { coerceDate, formatDate, toISODate } from '../core/date.js';
import { focusActiveCell, renderPopup } from './dom.js';

export class LiteDatePickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'min', 'max', 'locale', 'disabled'];
  }

  constructor() {
    super();
    this.core = createDatePickerCore();
    this.control = document.createElement('button');
    this.popup = document.createElement('div');

    this.control.type = 'button';
    this.control.className = 'lite-datepicker-control';
    this.popup.className = 'lite-datepicker-host';
    this.popup.hidden = true;

    this.control.setAttribute('aria-haspopup', 'grid');
    this.control.setAttribute('aria-expanded', 'false');

    this.append(this.control, this.popup);

    this.unsubscribe = this.core.subscribe((state) => {
      renderPopup(this.popup, state);
      this.control.setAttribute('aria-expanded', state.isOpen ? 'true' : 'false');
      this.control.textContent = state.value
        ? formatDate(state.value, state.options.locale)
        : 'Select date';
    });

    this.unlistenChange = this.core.on('change', (detail) => {
      if (detail.iso) {
        this.setAttribute('value', detail.iso);
      } else {
        this.removeAttribute('value');
      }
      this.dispatchEvent(new CustomEvent('change', {
        detail,
        bubbles: true,
        composed: true,
      }));
    });

    this.onControlClick = () => {
      if (this.disabled) return;
      this.core.toggle();
      focusActiveCell(this.popup);
    };

    this.onControlKeydown = (event) => {
      if (this.disabled) return;
      if (!this.core.getState().isOpen && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.core.open();
        focusActiveCell(this.popup);
        return;
      }
      if (this.core.getState().isOpen && this.core.handleKey(event.key)) {
        event.preventDefault();
        focusActiveCell(this.popup);
      }
    };

    this.onPopupClick = (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'prev') this.core.navigateMonth(-1);
      if (action === 'next') this.core.navigateMonth(1);
      if (action === 'select' && button.dataset.iso) this.core.selectDateByIso(button.dataset.iso, 'pointer');
      focusActiveCell(this.popup);
    };

    this.onPopupKeydown = (event) => {
      if (this.core.handleKey(event.key)) {
        event.preventDefault();
        focusActiveCell(this.popup);
      }
    };

    this.onOutsideClick = (event) => {
      if (!this.core.getState().isOpen) return;
      if (this.contains(event.target)) return;
      this.core.close();
    };
  }

  connectedCallback() {
    this.control.addEventListener('click', this.onControlClick);
    this.control.addEventListener('keydown', this.onControlKeydown);
    this.popup.addEventListener('click', this.onPopupClick);
    this.popup.addEventListener('keydown', this.onPopupKeydown);
    document.addEventListener('mousedown', this.onOutsideClick);
    this.syncFromAttributes();
    this.updateDisabledState();
  }

  disconnectedCallback() {
    this.control.removeEventListener('click', this.onControlClick);
    this.control.removeEventListener('keydown', this.onControlKeydown);
    this.popup.removeEventListener('click', this.onPopupClick);
    this.popup.removeEventListener('keydown', this.onPopupKeydown);
    document.removeEventListener('mousedown', this.onOutsideClick);
    this.unsubscribe();
    this.unlistenChange();
  }

  attributeChangedCallback() {
    this.syncFromAttributes();
    this.updateDisabledState();
  }

  syncFromAttributes() {
    this.core.setOptions({
      value: this.getAttribute('value'),
      min: this.getAttribute('min'),
      max: this.getAttribute('max'),
      locale: this.getAttribute('locale') || undefined,
    });
  }

  updateDisabledState() {
    this.control.disabled = this.disabled;
    if (this.disabled) this.core.close();
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(next) {
    if (!next) {
      this.removeAttribute('value');
      this.core.setValue(null);
      return;
    }
    const parsed = coerceDate(next);
    this.core.setValue(parsed);
    if (parsed) this.setAttribute('value', toISODate(parsed));
  }

  get min() {
    return this.getAttribute('min') || '';
  }

  set min(next) {
    if (!next) this.removeAttribute('min');
    else this.setAttribute('min', next);
  }

  get max() {
    return this.getAttribute('max') || '';
  }

  set max(next) {
    if (!next) this.removeAttribute('max');
    else this.setAttribute('max', next);
  }

  get locale() {
    return this.getAttribute('locale') || '';
  }

  set locale(next) {
    if (!next) this.removeAttribute('locale');
    else this.setAttribute('locale', next);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(next) {
    if (next) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  open() {
    if (!this.disabled) this.core.open();
  }

  close() {
    this.core.close();
  }

  toggle() {
    if (!this.disabled) this.core.toggle();
  }

  setValue(next) {
    this.value = next ? toISODate(coerceDate(next)) : '';
  }

  getValue() {
    return this.core.getValue();
  }
}

export function defineLiteDatePicker(tagName = 'lite-datepicker') {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, LiteDatePickerElement);
  }
}
