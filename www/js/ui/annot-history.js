// Undo / redo history over all pages: every user action (draw, mark, erase) is one step. Emits 'annotchange' with step counts.
import { emit } from '../core/bus.js';
import { pushItem, insertItem, takeItems, clearData, importData } from './annot-data.js';
const MAX_HISTORY = 1000;
let done = [], undone = [];
const changed = () => emit('annotchange', { undo: done.length, redo: undone.length });
const record = (op) => { done.push(op); if (done.length > MAX_HISTORY) done.shift(); undone = []; };
export function addItem(i, item) { pushItem(i, item); record({ t: 'add', i, item }); changed(); }
// `removed` comes from takeItems() (live erasing removes items right away; the step is written when the stroke ends).
export function recordErase(removed) { if (removed.length) { record({ t: 'del', removed }); changed(); } }
function step(op, undoing) {
  const touched = new Set();
  if (op.t === 'add') {
    if (undoing) takeItems(op.i, [op.item]); else pushItem(op.i, op.item);
    touched.add(op.i);
  } else if (undoing) [...op.removed].reverse().forEach((r) => { insertItem(r.i, r.idx, r.item); touched.add(r.i); });
  else op.removed.forEach((r) => { takeItems(r.i, [r.item]); touched.add(r.i); });
  return [...touched];
}
export function undoOp() { const op = done.pop(); if (!op) return []; const p = step(op, true); undone.push(op); changed(); return p; }
export function redoOp() { const op = undone.pop(); if (!op) return []; const p = step(op, false); done.push(op); changed(); return p; }
export function replaceAll(data) { importData(data); done = []; undone = []; changed(); }
export function clearAll() { clearData(); done = []; undone = []; changed(); }
