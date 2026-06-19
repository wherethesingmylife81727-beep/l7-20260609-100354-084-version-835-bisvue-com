(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-menu]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function setupHero() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      const input = scope.querySelector('[data-filter-input]');
      const count = scope.querySelector('[data-filter-count]');
      const list = scope.parentElement.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');
      const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));

      if (!list) {
        return;
      }

      const cards = Array.from(list.querySelectorAll('.movie-card'));

      if (scope.hasAttribute('data-read-query') && input) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (query) {
          input.value = query;
        }
      }

      function apply() {
        const q = normalize(input ? input.value : '');
        const selectValues = selects.map(function (select) {
          return {
            key: select.getAttribute('data-filter-select'),
            value: normalize(select.value)
          };
        });
        let visible = 0;

        cards.forEach(function (card) {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
          ].join(' '));

          const matchesQuery = !q || haystack.includes(q);
          const matchesSelects = selectValues.every(function (item) {
            if (!item.value) {
              return true;
            }

            return normalize(card.dataset[item.key] || '').includes(item.value);
          });
          const show = matchesQuery && matchesSelects;

          card.dataset.hidden = show ? 'false' : 'true';

          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      apply();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
