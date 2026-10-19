// Library interactions: click opens a card, trash / right click removes it, "remove unreadable" cleans the hidden ones.
import { removeEntry } from '../app/remove-entry.js';
import { openStored } from '../app/open-stored.js';
import { getHiddenDocs } from './home-screen.js';
const $ = (id) => document.getElementById(id);
$('home-body').addEventListener('click', (e) => {
  const li = e.target.closest('.doc');
  if (!li) return;
  if (e.target.closest('.doc-del')) removeEntry(li.dataset.id);
  else openStored(li.dataset.id);
});
$('home-body').addEventListener('contextmenu', (e) => {
  const li = e.target.closest('.doc');
  if (!li) return;
  e.preventDefault();
  removeEntry(li.dataset.id);
});
$('hidden-clean').addEventListener('click', () => {
  getHiddenDocs().forEach((d) => removeEntry(d.id, { quiet: true }));
});
