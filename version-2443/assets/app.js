(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll(".hero-slide", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupHorizontalRows() {
    selectAll(".section-block").forEach(function (section) {
      var row = section.querySelector("[data-horizontal-row]");
      if (!row) {
        return;
      }
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (left) {
        left.addEventListener("click", function () {
          row.scrollBy({ left: -320, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          row.scrollBy({ left: 320, behavior: "smooth" });
        });
      }
    });
  }

  function filterCards(scope, query) {
    var cards = selectAll(".movie-card", scope);
    var rows = selectAll(".rank-row", scope);
    var value = String(query || "")
      .trim()
      .toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = String(
        card.getAttribute("data-search") || card.textContent || "",
      ).toLowerCase();
      var match = !value || haystack.indexOf(value) !== -1;
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });
    rows.forEach(function (row) {
      var haystack = String(row.textContent || "").toLowerCase();
      row.style.display =
        !value || haystack.indexOf(value) !== -1 ? "" : "none";
    });
    var empty = scope.querySelector("[data-empty-tip]");
    if (empty) {
      empty.classList.toggle("is-visible", cards.length > 0 && visible === 0);
    }
  }

  function setupSearch() {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    selectAll(".search-scope").forEach(function (scope) {
      var inputs = selectAll(".js-search", scope);
      inputs.forEach(function (input) {
        if (initial) {
          input.value = initial;
        }
        input.addEventListener("input", function () {
          filterCards(scope, input.value);
        });
      });
      if (initial) {
        filterCards(scope, initial);
      }
    });
  }

  function attachHls(video, source) {
    if (!video || !source || video.getAttribute("data-ready") === "1") {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
    video.setAttribute("data-ready", "1");
  }

  function setupPlayers() {
    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-player-play]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      function play() {
        attachHls(video, source);
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
      player.addEventListener("click", function (event) {
        if (event.target === video) {
          attachHls(video, source);
          return;
        }
        if (event.target && event.target.closest("[data-player-play]")) {
          return;
        }
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("loadedmetadata", function () {
        player.classList.add("is-ready");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupHorizontalRows();
    setupSearch();
    setupPlayers();
  });
})();
