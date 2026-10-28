/* Light/dark theme switcher.
 * The initial theme is applied by an inline script in <head> (templates/base.html) so the
 * page never paints in the wrong theme. This file wires up the toggle and follows the
 * system preference until the visitor picks a theme. */
(function () {
  'use strict';

  var STORAGE_KEY = 'pcwong-theme';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncButtons() {
    var next = current() === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      btn.setAttribute('title', 'Switch to ' + next + ' theme');
    });
  }

  function apply(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        /* storage unavailable (private mode): keep the choice for this page only */
      }
    }
    syncButtons();
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-theme-toggle]')) {
      apply(current() === 'dark' ? 'light' : 'dark', true);
    }
  });

  // Only follow the system theme while the visitor has not chosen one.
  function onSystemChange(event) {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    if (!saved) {
      apply(event.matches ? 'dark' : 'light', false);
    }
  }

  if (media.addEventListener) {
    media.addEventListener('change', onSystemChange);
  } else if (media.addListener) {
    media.addListener(onSystemChange);
  }

  syncButtons();
})();
