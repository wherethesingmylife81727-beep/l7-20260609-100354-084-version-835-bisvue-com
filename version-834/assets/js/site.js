(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function getYearGroup(value) {
        var year = parseInt(value, 10);
        if (!year) {
            return "";
        }
        if (year >= 2020) {
            return String(year);
        }
        if (year >= 2010) {
            return "2010";
        }
        if (year >= 2000) {
            return "2000";
        }
        return "1990";
    }

    function setupFilters() {
        var panels = document.querySelectorAll(".filter-panel");
        panels.forEach(function (panel) {
            var scope = panel.parentElement;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var search = panel.querySelector(".filter-search");
            var type = panel.querySelector(".filter-type");
            var year = panel.querySelector(".filter-year");
            var category = panel.querySelector(".filter-category");
            var clear = panel.querySelector(".clear-filter");
            var noResult = scope.querySelector(".no-result");

            function apply() {
                var q = normalize(search && search.value);
                var selectedType = normalize(type && type.value);
                var selectedYear = normalize(year && year.value);
                var selectedCategory = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = getYearGroup(card.getAttribute("data-year"));
                    var cardCategory = normalize(card.getAttribute("data-category"));
                    var ok = true;

                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        ok = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        ok = false;
                    }
                    if (selectedCategory && cardCategory !== selectedCategory) {
                        ok = false;
                    }

                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (noResult) {
                    noResult.hidden = visible !== 0;
                }
            }

            [search, type, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (clear) {
                clear.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    apply();
                });
            }

            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q");
            if (initial && search) {
                search.value = initial;
            }
            apply();
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === index);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    window.initMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hlsInstance = null;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function attachStream() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            video.setAttribute("data-ready", "1");
        }

        function startPlayback() {
            attachStream();
            overlay.style.display = "none";
            video.controls = true;
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {
                    overlay.style.display = "flex";
                });
            }
        }

        overlay.addEventListener("click", startPlayback);
        overlay.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                startPlayback();
            }
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    setupHero();
    setupFilters();
})();
