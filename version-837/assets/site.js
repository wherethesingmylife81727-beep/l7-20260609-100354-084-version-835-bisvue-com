document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
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
    }

    function auto() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        auto();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        auto();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        auto();
      });
    });

    show(0);
    auto();
  });

  document.querySelectorAll("[data-movie-search]").forEach(function (input) {
    var targetSelector = input.getAttribute("data-target") || "body";
    var target = document.querySelector(targetSelector) || document.body;
    var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
        card.classList.toggle("hidden-by-search", keyword && haystack.indexOf(keyword) === -1);
      });
    });
  });
});
