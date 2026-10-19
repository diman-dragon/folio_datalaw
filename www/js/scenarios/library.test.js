// Scenario: library sections, hiding unreadable files, folder / drop import (real pdf.js on the test fixtures).
import test from 'node:test';
import fs from 'node:fs';
import { $, ok, wait } from './dom-env.js';
const FX = new URL('../../../test-fixtures/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const THREE = `${FX}three-pages.pdf`, LOCKED = `${FX}locked.pdf`;
const vendored = fs.existsSync(new URL('../../vendor/pdfjs/pdf.min.mjs', import.meta.url));
const existing = new Set(['/lib/reading1.pdf', '/lib/reading2.pdf', '/lib/new1.pdf', '/lib/done.pdf', THREE, LOCKED]);
const calls = [], listeners = {};
let dialogAnswer = null;
window.__TAURI__ = {
  core: { invoke: async (cmd, args) => {
    calls.push(cmd);
    if (cmd === 'files_exist') return args.paths.map((p) => existing.has(p));
    if (cmd === 'list_pdfs') return args.paths.flatMap((p) => (p === '/folder' ? [THREE, LOCKED] : [p]));
    if (cmd === 'read_pdf') return fs.readFileSync(args.path).buffer.slice(0);
    throw new Error(`unexpected ${cmd}`);
  } },
  event: { listen: async (n, cb) => { listeners[n] = cb; } },
  dialog: { open: async () => dialogAnswer },
};
const { addDoc, updateDoc, listDocs } = await import('../data/library.js');
const mk = (path, pages, lastPage) => { const d = addDoc({ path, name: path.split('/').pop(), size: 1000, pages }); updateDoc(d.id, { lastPage }); };
mk('/lib/reading1.pdf', 20, 5); mk('/lib/reading2.pdf', 10, 2); mk('/lib/new1.pdf', 8, 1); mk('/lib/done.pdf', 6, 6); mk('/lib/gone.pdf', 9, 4); mk('/lib/gone2.pdf', 9, 1);
await import('../main.js');
await wait(60);
const names = (id) => [...$(id).children].map((li) => li.querySelector('.doc-name').textContent).sort();
const toast = () => $('toast').textContent;

test('"Reading now" holds started unfinished documents, the rest go to "Others", no duplicates', () => {
  ok(names('reading-list').join() === 'reading1,reading2', names('reading-list').join());
  ok(names('doc-list').join() === 'done,new1', names('doc-list').join());
  ok($('cnt-reading').textContent === '2' && $('cnt-rest').textContent === '2', 'counters');
  ok($('sec-reading').classList.contains('sec-reading') && ($('sec-reading').compareDocumentPosition($('sec-rest')) & 4), 'reading panel comes first');
});
test('unreadable (missing) files are hidden, counted, and can be cleaned', async () => {
  ok(!names('reading-list').includes('gone') && !names('doc-list').includes('gone2'), 'not shown');
  ok(!$('doc-hidden').hidden && $('hidden-text').textContent.endsWith(': 2'), $('hidden-text').textContent);
  $('hidden-clean').click(); await wait(60);
  ok(listDocs().length === 4 && $('doc-hidden').hidden, 'records removed');
});
test('a dropped folder is expanded by Rust and imported; protected files are skipped', { skip: !vendored && 'run pnpm install first (vendors pdf.js)' }, async () => {
  await listeners['tauri://drag-enter']({});
  ok(!$('drop').hidden, 'veil shows');
  await listeners['tauri://drag-drop']({ payload: { paths: ['/folder'] } });
  await wait(1500);
  ok(calls.includes('list_pdfs') && $('drop').hidden, 'expanded, veil hidden');
  ok(listDocs().find((d) => d.path === THREE)?.pages === 3, 'readable PDF added with its page count');
  ok(!listDocs().find((d) => d.path === LOCKED), 'password-protected PDF not added');
  ok(toast().startsWith('Добавлено: 1'), toast());
});
test('the folder button re-imports: known files are counted as already there', { skip: !vendored && 'run pnpm install first' }, async () => {
  dialogAnswer = '/folder';
  $('folder-btn').click();
  await wait(800);
  ok(toast().includes('уже были: 1'), toast());
});
