document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".mobile-toggle");
    var links = document.querySelector(".nav-links");

    if (toggle && links) {
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        var restart = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        restart();
    }

    document.querySelectorAll("[data-local-filter]").forEach(function (wrap) {
        var input = wrap.querySelector("input");
        var select = wrap.querySelector("select");
        var section = wrap.closest("section");
        var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".movie-card, .ranking-card")) : [];

        var apply = function () {
            var query = input ? input.value.trim().toLowerCase() : "";
            var type = select ? select.value.trim() : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || ""
                ].join(" ").toLowerCase();
                var matchedText = !query || haystack.indexOf(query) !== -1;
                var matchedType = !type || (card.getAttribute("data-type") || "") === type;
                card.classList.toggle("is-filter-hidden", !(matchedText && matchedType));
            });
        };

        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
    });

    document.querySelectorAll("[data-global-search]").forEach(function (wrap) {
        var input = wrap.querySelector("input");
        var resultBox = wrap.querySelector(".global-search-results");

        if (!input || !resultBox || !window.SEARCH_INDEX) {
            return;
        }

        var render = function () {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                resultBox.classList.remove("is-open");
                resultBox.innerHTML = "";
                return;
            }

            var matched = window.SEARCH_INDEX.filter(function (item) {
                return item.text.indexOf(query) !== -1;
            }).slice(0, 12);

            var safe = function (value) {
                return String(value).replace(/[&<>"']/g, function (char) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "\"": "&quot;",
                        "'": "&#39;"
                    }[char];
                });
            };

            resultBox.innerHTML = matched.map(function (item) {
                return '<a href="./' + safe(item.url) + '"><strong>' + safe(item.title) + '</strong><span>' + safe(item.meta) + '</span></a>';
            }).join("");

            resultBox.classList.toggle("is-open", matched.length > 0);
        };

        input.addEventListener("input", render);
        document.addEventListener("click", function (event) {
            if (!wrap.contains(event.target)) {
                resultBox.classList.remove("is-open");
            }
        });
    });
});

function startMoviePlayer(source) {
    var setup = function () {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("movie-play");
        var loaded = false;
        var hls = null;

        if (!video || !button || !source) {
            return;
        }

        var load = function () {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        };

        var play = function () {
            load();
            button.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        };

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup);
    } else {
        setup();
    }
}
