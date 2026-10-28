/* Carousel controls, "View more" captions, and "Load older posts".
 * Progressive enhancement: without JS, carousels still scroll natively and the
 * load-more link navigates to the next paginated page (/page/2/, /tags/x/page/2/). */
(function () {
  'use strict';

  var ICON_PREV =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_NEXT =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function makeButton(className, label, html) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.setAttribute('aria-label', label);
    if (html) btn.innerHTML = html;
    return btn;
  }

  function initCarousel(carousel) {
    if (carousel.dataset.ready) return;
    carousel.dataset.ready = 'true';

    var track = carousel.querySelector('[data-track]');
    if (!track) return;

    var count = track.children.length;
    if (count < 2) return; // single photo: no controls needed

    var prev = makeButton('carousel__nav carousel__nav--prev', 'Previous photo', ICON_PREV);
    var next = makeButton('carousel__nav carousel__nav--next', 'Next photo', ICON_NEXT);

    var counter = document.createElement('div');
    counter.className = 'carousel__counter';
    counter.setAttribute('aria-live', 'polite');

    var bar = document.createElement('div');
    bar.className = 'carousel__dots';
    var dots = [];
    for (var i = 0; i < count; i++) {
      var dot = makeButton('carousel__dot', 'Show photo ' + (i + 1), '');
      dots.push(dot);
      bar.appendChild(dot);
    }

    carousel.append(prev, next, counter, bar);

    function currentIndex() {
      var width = track.clientWidth || 1;
      var index = Math.round(track.scrollLeft / width);
      return Math.max(0, Math.min(count - 1, index));
    }

    function goTo(index) {
      var target = Math.max(0, Math.min(count - 1, index));
      track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
    }

    function update() {
      var index = currentIndex();
      counter.textContent = index + 1 + ' / ' + count;
      dots.forEach(function (dot, n) {
        dot.setAttribute('aria-current', n === index ? 'true' : 'false');
      });
      prev.hidden = index === 0;
      next.hidden = index === count - 1;
    }

    prev.addEventListener('click', function () {
      goTo(currentIndex() - 1);
    });
    next.addEventListener('click', function () {
      goTo(currentIndex() + 1);
    });
    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () {
        goTo(n);
      });
    });

    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(currentIndex() - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(currentIndex() + 1);
      }
    });

    update();
  }

  function initCarousels(root) {
    root.querySelectorAll('[data-carousel]').forEach(initCarousel);
  }

  // "View more" for long captions. The caption is clamped to CLAMP_LINES lines and the
  // button only appears when the text overflows. Without JS the full caption is shown.
  var CLAMP_LINES = 3; // keep in step with --clamp-lines in style.css

  function fitCaption(caption) {
    var button = caption.parentElement.querySelector('[data-view-more]');
    var expanded = caption.dataset.expanded === 'true';

    // Measure the full text height first, then apply the clamp.
    caption.classList.remove('is-clamped');
    var lineHeight = parseFloat(getComputedStyle(caption).lineHeight) || 24;
    var overflows = caption.scrollHeight > lineHeight * CLAMP_LINES + 2;

    if (!overflows) caption.dataset.expanded = 'false';
    caption.classList.toggle('is-clamped', overflows && !expanded);

    if (button) {
      button.hidden = !overflows;
      button.textContent = expanded ? 'View less' : 'View more';
      button.setAttribute('aria-expanded', String(overflows && expanded));
    }
  }

  function initCaption(caption) {
    if (caption.dataset.ready) return;
    caption.dataset.ready = 'true';

    var button = caption.parentElement.querySelector('[data-view-more]');
    if (button) {
      button.addEventListener('click', function () {
        caption.dataset.expanded = caption.dataset.expanded === 'true' ? 'false' : 'true';
        fitCaption(caption);
      });
    }
    fitCaption(caption);
  }

  function initCaptions(root) {
    root.querySelectorAll('[data-caption]').forEach(initCaption);
  }

  function refitCaptions() {
    document.querySelectorAll('[data-caption]').forEach(fitCaption);
  }

  function initLoadMore(link) {
    if (link.dataset.ready) return;
    link.dataset.ready = 'true';
    var label = link.textContent;

    link.addEventListener('click', function (event) {
      event.preventDefault();
      // Fetch the path only, so the request stays on the host the visitor is on.
      var url = new URL(link.getAttribute('href'), window.location.href).pathname;
      var feed = document.querySelector('[data-feed]');
      if (!feed) {
        window.location.href = url;
        return;
      }

      link.setAttribute('aria-busy', 'true');
      link.textContent = 'Loading…';

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');

          var incoming = doc.querySelector('[data-feed]');
          if (incoming) {
            Array.from(incoming.children).forEach(function (card) {
              feed.appendChild(document.importNode(card, true));
            });
            initCarousels(feed);
            initCaptions(feed);
          }

          var nextLink = doc.querySelector('[data-load-more]');
          if (nextLink) {
            link.setAttribute('href', nextLink.getAttribute('href'));
            link.removeAttribute('aria-busy');
            link.textContent = label;
          } else {
            link.closest('.load-more').remove();
          }
        })
        .catch(function () {
          window.location.href = url;
        });
    });
  }

  initCarousels(document);
  initCaptions(document);
  document.querySelectorAll('[data-load-more]').forEach(initLoadMore);

  // Line wrapping changes with width, and again once web fonts load.
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refitCaptions, 150);
  });
  window.addEventListener('load', refitCaptions);
})();
