import test from 'node:test';
import assert from 'node:assert/strict';

import { parseISODate, toISODate } from '../src/core/date.js';
import { createDatePickerCore } from '../src/core/state.js';

test('parseISODate accepts valid ISO and rejects invalid', () => {
  const valid = parseISODate('2026-02-10');
  assert.equal(toISODate(valid), '2026-02-10');
  assert.equal(parseISODate('2026-02-31'), null);
  assert.equal(parseISODate('02/10/2026'), null);
});

test('core enforces min/max bounds and keyboard selection', () => {
  const core = createDatePickerCore({
    min: '2026-03-05',
    max: '2026-03-20',
    value: '2026-03-10',
  });

  core.setValue('2026-03-01');
  assert.equal(toISODate(core.getValue()), '2026-03-05');

  core.handleKey('ArrowRight');
  core.handleKey('Enter');
  assert.equal(toISODate(core.getValue()), '2026-03-06');
});
