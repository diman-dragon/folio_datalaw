// Header button: switches light / dark theme.
import { getTheme, setTheme } from '../core/theme.js';
document.getElementById('theme-btn').addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
