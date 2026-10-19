// Entry point: applies the theme, wires the library and the file sources (dialog, drag & drop).
import { applyTheme } from './core/theme.js';
import './ui/home-screen.js';
import './ui/home-events.js';
import './ui/home-toolbar.js';
import { toast } from './ui/toast.js';
import { t } from './core/strings.js';
import { isTauri } from './io/bridge.js';
import { watchDrops } from './io/drop-files.js';
import { openDropped } from './app/open-dropped.js';
applyTheme();
if (isTauri()) watchDrops(openDropped).catch(() => toast(t('err.open')));
else toast(t('err.notauri'));
