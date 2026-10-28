/* Client-side search.
 * - Captions and titles: Zola's built-in index (search_index.en.json), queried with elasticlunr.
 * - Tags: the #post-index JSON island rendered in templates/base.html.
 * Result text is written with textContent, never innerHTML. */
(function () {
  'use strict';

  var input = document.getElementById('search-input');
  var panel = document.getElementById('search-panel');
  var list = document.getElementById('search-results');
  var wrap = document.querySelector('[data-search]');
  var toggle = document.querySelector('[data-search-toggle]');
  var header = document.querySelector('.site-header');
  if (!input || !panel || !list || !wrap || !toggle) return;

  var MAX_RESULTS = 8;
  var indexUrl = input.getAttribute('data-index-url');
  var posts = readPosts();
  var indexPromise = null;
  var timer = null;

  function readPosts() {
    var el = document.getElementById('post-index');
    try {
      return el ? JSON.parse(el.textContent) : [];
    } catch (err) {
      return [];
    }
  }

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(indexUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (json) {
          return elasticlunr.Index.load(json);
        })
        .catch(function (err) {
          indexPromise = null;
          throw err;
        });
    }
    return indexPromise;
  }

  // Index text can contain HTML entities (&amp;, &quot;). Decode them so they display correctly.
  // DOMParser builds an inert document, so nothing in the text runs or loads.
  function decodeText(text) {
    var doc = new DOMParser().parseFromString(text || '', 'text/html');
    return doc.documentElement.textContent;
  }

  // Zola's index stores absolute URLs. Keep only the path so results stay on the current host.
  function pathOf(url) {
    return new URL(url, window.location.href).pathname;
  }

  function excerpt(text) {
    var clean = decodeText(text).replace(/\s+/g, ' ').trim();
    return clean.length > 140 ? clean.slice(0, 140).trim() + '…' : clean;
  }

  function matchTags(query) {
    var q = query.toLowerCase();
    return posts
      .filter(function (post) {
        return (post.tags || []).some(function (tag) {
          return tag.toLowerCase().indexOf(q) !== -1;
        });
      })
      .map(function (post) {
        return { url: post.url, title: post.title, text: post.excerpt };
      });
  }

  function search(query) {
    return loadIndex().then(function (index) {
      var hits = index.search(query, {
        bool: 'AND',
        expand: true,
        fields: { title: { boost: 2 }, body: { boost: 1 } }
      });

      var seen = {};
      var items = [];

      hits.forEach(function (hit) {
        var url = pathOf(hit.ref);
        if (seen[url]) return;
        seen[url] = true;
        items.push({
          url: url,
          title: hit.doc.title,
          text: hit.doc.body
        });
      });

      matchTags(query).forEach(function (item) {
        if (seen[item.url]) return;
        seen[item.url] = true;
        items.push(item);
      });

      return items;
    });
  }

  function addMessage(text) {
    var li = document.createElement('li');
    li.className = 'search__empty';
    li.textContent = text;
    list.appendChild(li);
  }

  function render(items, query) {
    list.textContent = '';

    if (items.length === 0) {
      addMessage('No matches for "' + query + '"');
    }

    items.slice(0, MAX_RESULTS).forEach(function (item) {
      var li = document.createElement('li');
      var link = document.createElement('a');
      var title = document.createElement('span');
      var text = document.createElement('span');

      link.href = item.url;
      title.className = 'search__title';
      title.textContent = item.title || '';
      text.className = 'search__excerpt';
      text.textContent = excerpt(item.text);

      link.append(title, text);
      li.appendChild(link);
      list.appendChild(li);
    });

    panel.hidden = false;
  }

  function close() {
    panel.hidden = true;
    list.textContent = '';
  }

  // Expanded state also hides the page links on narrow screens (see style.css).
  function setOpen(open) {
    wrap.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (header) header.classList.toggle('is-searching', open);
  }

  function expand() {
    setOpen(true);
    input.focus();
  }

  function collapse() {
    if (input.value.trim() !== '') return; // keep the field open while it holds a query
    close();
    setOpen(false);
  }

  function run(query) {
    search(query)
      .then(function (items) {
        if (input.value.trim() === query) render(items, query);
      })
      .catch(function () {
        if (input.value.trim() !== query) return;
        list.textContent = '';
        addMessage('Search is unavailable right now.');
        panel.hidden = false;
      });
  }

  input.addEventListener('input', function () {
    var query = input.value.trim();
    clearTimeout(timer);
    if (!query) {
      close();
      return;
    }
    timer = setTimeout(function () {
      run(query);
    }, 150);
  });

  toggle.addEventListener('click', expand);

  // Focusing the field opens it, warms the index, and reopens results for an existing query.
  input.addEventListener('focus', function () {
    setOpen(true);
    loadIndex().catch(function () {});
    var query = input.value.trim();
    if (query) run(query);
  });

  // Collapse back to the icon once focus leaves an empty field.
  // Moving focus to the icon itself is not a real exit, so the field stays open.
  input.addEventListener('blur', function (event) {
    if (event.relatedTarget === toggle) return;
    collapse();
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      input.value = '';
      close();
      input.blur(); // the blur handler collapses the now-empty field
    }
    if (event.key === 'Enter') {
      var first = list.querySelector('a');
      if (first) window.location.href = first.href;
    }
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-search]')) close();
  });
})();
