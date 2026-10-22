// View mode control (continuous ribbon / one page at a time): two buttons side by side; the choice is persisted.
import { store } from '../core/storage.js';
const $ = (id) => document.getElementById(id);
export const savedMode = () => (store.get('viewMode') === 'paged' ? 'paged' : 'ribbon');
const BUTTON = { ribbon: 'mode-ribbon', paged: 'mode-paged' };
const FIT = { ribbon: ['По ширине', 'Подогнать по ширине окна'], paged: ['По странице', 'Показать страницу целиком'] };
export function bindMode({ root, list, zoom }) {
  const apply = (mode) => {
    root.dataset.mode = mode;
    for (const [m, id] of Object.entries(BUTTON)) {
      $(id).classList.toggle('on', m === mode);
      $(id).setAttribute('aria-pressed', String(m === mode));
    }
    [$('zoom-fit').textContent, $('zoom-fit').title] = FIT[mode];
    list.setPaged(mode === 'paged');
    zoom.refit();
  };
  for (const [m, id] of Object.entries(BUTTON)) {
    $(id).onclick = () => {
      if (root.dataset.mode === m) return;
      store.set('viewMode', m);
      apply(m);
    };
  }
  apply(root.dataset.mode);
}
