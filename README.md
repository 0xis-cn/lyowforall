# lyowforall

`lyowforall` is now a lightweight, dependency-free JavaScript datepicker library.

## Install

```bash
npm install lyowforall
```

## Usage

### Class/module API

```js
import { DatePicker } from 'lyowforall';
import 'lyowforall/src/styles/datepicker.css';

const input = document.querySelector('#date');
const picker = new DatePicker(input, {
  value: '2026-08-01',
  min: '2026-01-01',
  max: '2026-12-31',
  locale: 'en-US',
  onChange(detail) {
    console.log(detail.iso);
  },
});

picker.open();
picker.setValue('2026-08-12');
picker.getValue();
picker.close();
picker.destroy();
```

### Web Component API

```html
<script type="module">
  import { defineLiteDatePicker } from 'lyowforall';
  defineLiteDatePicker();
</script>

<lite-datepicker
  value="2026-08-01"
  min="2026-01-01"
  max="2026-12-31"
  locale="en-US"
></lite-datepicker>
```

The element dispatches `change` events (`event.detail.iso`, `event.detail.value`).

## Options

Both APIs support:

- `value` (`YYYY-MM-DD` string or `Date`)
- `min` (`YYYY-MM-DD` string or `Date`)
- `max` (`YYYY-MM-DD` string or `Date`)
- `locale` (BCP-47 locale string)

Parsing is deterministic and ISO-first (`YYYY-MM-DD`), formatting uses `Intl.DateTimeFormat`.

## Class methods

- `open()` / `close()` / `toggle()`
- `setValue(value)` / `getValue()`
- `destroy()`

## Accessibility

- Popup anchored to input/control
- Keyboard support: Arrow keys, `Enter`, `Escape`
- ARIA roles for calendar grid/cells
- `aria-expanded` on trigger control

## Example

See `/examples/basic.html`.

## Migration from the previous Vue app

This project is now a framework-agnostic library.

Breaking changes:
- Vue app entrypoints and Vue runtime dependencies were removed.
- The main APIs are now `DatePicker` and `<lite-datepicker>`.
- Date parsing behavior is strict ISO (`YYYY-MM-DD`) by default.
