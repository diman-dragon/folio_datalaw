// View mode toggle (continuous ribbon <-> one page at a time); the choice is persisted.
import { store } from '../core/storage.js';
const $ = (id) => document.getElementById(id);
export const savedMode = () => (store.get('viewMode') === 'paged' ? 'paged' : 'ribbon');
// per current mode: [icon of the mode the button switches TO, its tooltip, fit-button caption]
const UI = {
  ribbon: ['pages', 'Показывать по одной странице', 'По ширине'],
  paged: ['scroll', 'Показывать лентой', 'По странице'],
};
export function bindMode({ root, list, zoom }) {
  const apply = (mode) => {
    const [icon, title, fit] = UI[mode];
    root.dataset.mode = mode;
    $('mode-btn').title = title;
    $('mode-btn').querySelector('use').setAttribute('href', `img/icons.svg#${icon}`);
    $('zoom-fit').textContent = fit;
    list.setPaged(mode === 'paged');
    zoom.refit();
  };
  $('mode-btn').onclick = () => {
    const next = root.dataset.mode === 'paged' ? 'ribbon' : 'paged';
    store.set('viewMode', next);
    apply(next);
  };
  apply(root.dataset.mode);
}
