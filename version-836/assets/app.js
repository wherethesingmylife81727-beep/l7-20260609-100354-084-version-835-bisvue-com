(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = $('#menu-button');
    var mobileNav = $('#mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.hidden = !mobileNav.hidden;
        });
    }

    var slides = $all('.hero-slide');
    var dots = $all('.hero-dot');
    var prev = $('[data-hero-prev]');
    var next = $('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    if (slides.length) {
        showSlide(0);
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHero();
        });
    });

    var globalSearch = $('#global-search');
    var searchPanel = $('#search-panel');

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function searchTemplate(item) {
        return '<a class="search-result" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
            '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span><span>' + item.oneLine + '</span></span>' +
            '</a>';
    }

    if (globalSearch && searchPanel && window.SiteSearchData) {
        globalSearch.addEventListener('input', function () {
            var q = normalize(globalSearch.value);
            if (q.length < 1) {
                searchPanel.hidden = true;
                searchPanel.innerHTML = '';
                return;
            }
            var results = window.SiteSearchData.filter(function (item) {
                var haystack = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags].join(' '));
                return haystack.indexOf(q) !== -1;
            }).slice(0, 12);
            searchPanel.innerHTML = results.length ? results.map(searchTemplate).join('') : '<div class="empty-state" style="display:block">暂无匹配影片</div>';
            searchPanel.hidden = false;
        });

        document.addEventListener('click', function (event) {
            if (!searchPanel.contains(event.target) && event.target !== globalSearch) {
                searchPanel.hidden = true;
            }
        });
    }

    var catalogSearch = $('[data-catalog-search]');
    var catalogCards = $all('[data-catalog-card]');
    var chips = $all('[data-year-filter]');
    var emptyState = $('[data-empty-state]');
    var activeYear = 'all';

    function applyCatalogFilter() {
        if (!catalogCards.length) {
            return;
        }
        var q = catalogSearch ? normalize(catalogSearch.value) : '';
        var visible = 0;
        catalogCards.forEach(function (card) {
            var haystack = normalize([card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.type, card.dataset.genre].join(' '));
            var yearOk = activeYear === 'all' || card.dataset.year === activeYear;
            var textOk = !q || haystack.indexOf(q) !== -1;
            var ok = yearOk && textOk;
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    if (catalogSearch) {
        catalogSearch.addEventListener('input', applyCatalogFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeYear = chip.getAttribute('data-year-filter') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('is-active', item === chip);
            });
            applyCatalogFilter();
        });
    });

    var player = $('#movie-player');
    var cover = $('#play-cover');
    var playButtons = $all('[data-play-button]');
    var hls = null;
    var playerReady = false;

    function attachStream() {
        if (!player || playerReady) {
            return;
        }
        var stream = player.getAttribute('data-stream-url');
        if (!stream) {
            return;
        }
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(player);
        } else {
            player.src = stream;
        }
        playerReady = true;
    }

    function startPlayer() {
        if (!player) {
            return;
        }
        attachStream();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        player.setAttribute('controls', 'controls');
        var promise = player.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (player) {
        player.addEventListener('click', startPlayer);
    }

    if (cover) {
        cover.addEventListener('click', startPlayer);
    }

    playButtons.forEach(function (button) {
        button.addEventListener('click', startPlayer);
    });
})();
