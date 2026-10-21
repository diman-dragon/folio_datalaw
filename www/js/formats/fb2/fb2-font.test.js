// Tests for the FB2 font strings.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fontOf, shiftOf, FAMILY, MONO } from './fb2-font.js';

test('plain, bold, italic and both', () => {
  assert.equal(fontOf({}, 18), `18px ${FAMILY}`);
  assert.equal(fontOf({ b: true }, 18), `bold 18px ${FAMILY}`);
  assert.equal(fontOf({ i: true }, 18), `italic 18px ${FAMILY}`);
  assert.equal(fontOf({ i: true, b: true }, 18), `italic bold 18px ${FAMILY}`);
});
test('super / subscript are smaller; code uses the monospace family', () => {
  assert.equal(fontOf({ sup: true }, 20), `14px ${FAMILY}`);
  assert.ok(fontOf({ code: true }, 18).endsWith(MONO));
});
test('baseline shifts: up for sup, down for sub, none otherwise', () => {
  assert.ok(shiftOf({ sup: true }, 20) < 0);
  assert.ok(shiftOf({ sub: true }, 20) > 0);
  assert.equal(shiftOf({}, 20), 0);
});
