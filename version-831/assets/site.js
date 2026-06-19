(function () {
  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".search-input"));
    var index = window.searchIndex || [];

    inputs.forEach(function (input) {
      var results = input.parentElement.querySelector(".search-results");
      if (!results) {
        return;
      }

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();

        if (query.length < 1) {
          results.classList.remove("open");
          results.innerHTML = "";
          return;
        }

        var matches = index.filter(function (item) {
          var text = [
            item.title,
            item.year,
            item.region,
            item.genre,
            item.tags
          ].join(" ").toLowerCase();
          return text.indexOf(query) !== -1;
        }).slice(0, 8);

        if (!matches.length) {
          results.innerHTML = '<div class="empty-state">没有匹配的影片</div>';
          results.classList.add("open");
          return;
        }

        results.innerHTML = matches.map(function (item) {
          return [
            '<a class="search-result-item" href="' + escapeText(item.url) + '">',
            '<img src="' + escapeText(item.image) + '" alt="' + escapeText(item.title) + '">',
            '<span>',
            '<strong>' + escapeText(item.title) + '</strong>',
            '<span>' + escapeText(item.year) + ' · ' + escapeText(item.region) + ' · ' + escapeText(item.genre) + '</span>',
            '</span>',
            '</a>'
          ].join("");
        }).join("");

        results.classList.add("open");
      });

      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          results.classList.remove("open");
        }
      });
    });
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var targetSelector = panel.getAttribute("data-filter-target");
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) {
        return;
      }

      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var genre = panel.querySelector("[data-filter-genre]");
      var emptySelector = panel.getAttribute("data-empty-target");
      var empty = emptySelector ? document.querySelector(emptySelector) : null;

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var g = genre ? genre.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();

          var matchKeyword = !q || text.indexOf(q) !== -1;
          var matchYear = !y || card.getAttribute("data-year") === y;
          var matchGenre = !g || text.indexOf(g) !== -1;
          var matched = matchKeyword && matchYear && matchGenre;

          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keyword, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-button");
    var poster = shell.querySelector(".player-poster");
    var stream = shell.getAttribute("data-stream");
    var ready = false;

    if (!video || !stream) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      shell.classList.add("is-ready");
      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    prepare();

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (poster) {
      poster.addEventListener("click", function () {
        play();
      });
    }

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      shell.classList.add("is-ready");
    });

    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(setupPlayer);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initSearch();
    initFilters();
    initPlayers();
  });
})();
