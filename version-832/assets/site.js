(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (target && target.tagName === 'IMG') {
            target.classList.add('image-hidden');
        }
    }, true);

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('active', itemIndex === activeIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('active', itemIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setHero(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setHero(activeIndex + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var input = filterPanel.querySelector('[data-search-input]');
        var yearSelect = filterPanel.querySelector('[data-year-filter]');
        var regionSelect = filterPanel.querySelector('[data-region-filter]');
        var genreSelect = filterPanel.querySelector('[data-genre-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.filter(Boolean).sort().reverse().forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function uniqueFrom(attribute) {
            var bucket = {};
            cards.forEach(function (card) {
                String(card.getAttribute(attribute) || '').split(/[，,、/\s]+/).forEach(function (value) {
                    if (value) {
                        bucket[value] = true;
                    }
                });
            });
            return Object.keys(bucket);
        }

        fillSelect(yearSelect, uniqueFrom('data-year'));
        fillSelect(regionSelect, uniqueFrom('data-region'));
        fillSelect(genreSelect, uniqueFrom('data-genre'));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var genre = genreSelect ? genreSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = String(card.getAttribute('data-keywords') || '').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || String(card.getAttribute('data-year') || '').indexOf(year) !== -1;
                var matchRegion = !region || String(card.getAttribute('data-region') || '').indexOf(region) !== -1;
                var matchGenre = !genre || String(card.getAttribute('data-genre') || '').indexOf(genre) !== -1;
                var matched = matchKeyword && matchYear && matchRegion && matchGenre;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        [input, yearSelect, regionSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var playButton = document.querySelector('[data-play-button]');
    var video = document.querySelector('[data-player]');
    var hlsObject = null;

    function beginPlayback() {
        if (!playButton || !video) {
            return;
        }
        var streamUrl = playButton.getAttribute('data-stream');
        if (!streamUrl) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (hlsObject) {
                hlsObject.destroy();
            }
            hlsObject = new window.Hls();
            hlsObject.loadSource(streamUrl);
            hlsObject.attachMedia(video);
            hlsObject.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
        } else {
            video.src = streamUrl;
            video.play();
        }
        playButton.classList.add('hidden');
        video.controls = true;
    }

    if (playButton && video) {
        playButton.addEventListener('click', beginPlayback);
        video.addEventListener('click', function () {
            if (!video.src) {
                beginPlayback();
            }
        });
    }
})();
