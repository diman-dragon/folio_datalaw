// Entry point: applies the theme, wires the library and the file sources (dialog, drag & drop).
import { applyTheme } from './core/theme.js';
import './ui/home-screen.js';
import './ui/home-toolbar.js';
import { toast } from './ui/toast.js';
import { t } from './core/strings.js';
import { isTauri } from './io/bridge.js';
import { watchDrops } from './io/drop-files.js';
import { openPaths } from './app/open-paths.js';
applyTheme();
if (isTauri()) watchDrops(openPaths).catch(() => toast(t('err.open')));
else toast(t('err.notauri'));
