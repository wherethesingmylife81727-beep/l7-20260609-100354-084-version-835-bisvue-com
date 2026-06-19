(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });

      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function restartTimer() {
      window.clearInterval(timer);
      startTimer();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide-to")) || 0);
        restartTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
  var activeFilter = "all";

  function filterCards() {
    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

    cards.forEach(function (card) {
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var cardFilter = card.getAttribute("data-filter") || "";
      var cardType = card.getAttribute("data-type") || "";
      var keywordMatched = !query || title.indexOf(query) !== -1;
      var filterMatched = activeFilter === "all" || cardFilter === activeFilter;

      if (activeFilter.indexOf("type:") === 0) {
        filterMatched = cardType === activeFilter.slice(5);
      }

      card.classList.toggle("hidden-by-filter", !(keywordMatched && filterMatched));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", filterCards);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var group = button.parentElement;
      var siblings = group ? Array.prototype.slice.call(group.querySelectorAll("[data-filter-button]")) : filterButtons;

      siblings.forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");
      activeFilter = button.getAttribute("data-filter-value") || "all";
      filterCards();
    });
  });
})();

function initializeMoviePlayer(sourceUrl) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("player-button");
  var hlsInstance = null;
  var started = false;

  if (!video || !button || !sourceUrl) {
    return;
  }

  function setSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function startPlay() {
    setSource();
    button.classList.add("hidden");
    video.play().catch(function () {
      button.classList.remove("hidden");
    });
  }

  button.addEventListener("click", startPlay);

  video.addEventListener("click", function () {
    if (!started) {
      startPlay();
    }
  });

  video.addEventListener("error", function () {
    button.classList.remove("hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
