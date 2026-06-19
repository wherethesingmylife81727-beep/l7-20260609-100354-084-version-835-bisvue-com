/*
  Site interactions for the static movie website.
  Includes mobile navigation, hero carousel, HTML-based filtering, query search,
  and the click-to-play initializer for detail pages.
*/

(function () {
  'use strict';

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }

    callback();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHeroCarousel() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var currentIndex = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === currentIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function updateFilterCount(panel, visible, total) {
    var output = panel.querySelector('[data-filter-count]');

    if (output) {
      output.textContent = '显示 ' + visible + ' / ' + total + ' 部';
    }
  }

  function initFilterPanel(panel) {
    var scope = panel.closest('[data-filter-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
    var input = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var category = panel.querySelector('[data-filter-category]');
    var reset = panel.querySelector('[data-filter-reset]');
    var noResults = scope.querySelector('[data-no-results]');

    function applyFilters() {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var categoryValue = normalize(category && category.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1 || searchText.indexOf(regionValue) !== -1;
        var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1 || searchText.indexOf(typeValue) !== -1;
        var matchesCategory = !categoryValue || cardCategory.indexOf(categoryValue) !== -1 || searchText.indexOf(categoryValue) !== -1;
        var isVisible = matchesQuery && matchesRegion && matchesType && matchesCategory;

        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      updateFilterCount(panel, visible, cards.length);

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (category) {
          category.value = '';
        }
        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (queryFromUrl && input) {
      input.value = queryFromUrl;
    }

    applyFilters();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(initFilterPanel);
  }

  function loadHlsSource(block, video, source, status) {
    if (!source) {
      status.textContent = '当前影片没有可用播放源。';
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {
        status.textContent = '浏览器已加载播放源，请再次点击播放。';
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      block._hls = hls;

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        status.textContent = '播放源已加载，正在开始播放。';
        video.play().catch(function () {
          status.textContent = '播放源已就绪，请再次点击播放。';
        });
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          status.textContent = '播放源加载失败，请检查网络或稍后重试。';
          hls.destroy();
          block._hls = null;
        }
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {
      status.textContent = '浏览器暂不支持自动解析，请尝试使用 Safari、Chrome 或 Edge。';
    });
  }

  function initPlayers() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-player-block]'));

    blocks.forEach(function (block) {
      var button = block.querySelector('[data-play-button]');
      var video = block.querySelector('video');
      var status = block.querySelector('[data-player-status]');
      var source = block.getAttribute('data-m3u8');

      if (!button || !video || !status) {
        return;
      }

      button.addEventListener('click', function () {
        button.hidden = true;
        status.textContent = '正在初始化播放源。';
        loadHlsSource(block, video, source, status);
      });
    });
  }

  onReady(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayers();
  });
}());
