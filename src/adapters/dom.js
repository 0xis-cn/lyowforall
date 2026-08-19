export function renderPopup(container, state) {
  const { isOpen, viewModel } = state;
  container.hidden = !isOpen;
  container.className = 'lite-datepicker-popup';

  const weeks = viewModel.weeks
    .map((week) => {
      const cells = week
        .map((day) => {
          const classes = [
            'lite-datepicker-day',
            day.inMonth ? '' : 'is-outside',
            day.selected ? 'is-selected' : '',
            day.today ? 'is-today' : '',
          ].filter(Boolean).join(' ');

          return `
            <td role="presentation">
              <button
                type="button"
                role="gridcell"
                class="${classes}"
                data-action="select"
                data-iso="${day.iso}"
                aria-selected="${day.selected ? 'true' : 'false'}"
                aria-current="${day.today ? 'date' : 'false'}"
                ${day.focused ? 'tabindex="0" data-focused="true"' : 'tabindex="-1"'}
                ${day.disabled ? 'disabled' : ''}
              >${day.dayOfMonth}</button>
            </td>
          `;
        })
        .join('');
      return `<tr role="row">${cells}</tr>`;
    })
    .join('');

  const weekdays = viewModel.weekdayLabels
    .map((label) => `<th scope="col">${label}</th>`)
    .join('');

  container.innerHTML = `
    <div class="lite-datepicker" role="dialog" aria-modal="false">
      <div class="lite-datepicker-header">
        <button type="button" data-action="prev" aria-label="Previous month">‹</button>
        <div class="lite-datepicker-title" aria-live="polite">${viewModel.monthLabel}</div>
        <button type="button" data-action="next" aria-label="Next month">›</button>
      </div>
      <table class="lite-datepicker-grid" role="grid" aria-label="Calendar">
        <thead><tr>${weekdays}</tr></thead>
        <tbody>${weeks}</tbody>
      </table>
    </div>
  `;
}

export function focusActiveCell(container) {
  const cell = container.querySelector('[data-focused="true"]');
  if (cell) cell.focus();
}
