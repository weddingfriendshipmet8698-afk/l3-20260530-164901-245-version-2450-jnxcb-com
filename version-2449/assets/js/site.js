(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scopeName = panel.getAttribute("data-filter-panel") || "document";
      var scope = scopeName === "document" ? document : document.querySelector(scopeName);
      var cards = Array.prototype.slice.call((scope || document).querySelectorAll("[data-filter-card]"));
      var input = panel.querySelector("[data-filter-search]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var category = panel.querySelector("[data-filter-category]");
      var count = document.querySelector("[data-result-count]");
      var empty = document.querySelector("[data-no-results]");

      function apply() {
        var term = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var matchesSearch = !term || normalize(card.getAttribute("data-search")).indexOf(term) !== -1;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
          var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var matchesCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
          var ok = matchesSearch && matchesYear && matchesRegion && matchesType && matchesCategory;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible.toString();
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var source = shell.getAttribute("data-video");
      var started = false;
      var hls = null;

      function attach() {
        if (!video || !source || started) {
          return;
        }
        started = true;
        shell.classList.add("is-playing");
        video.setAttribute("controls", "controls");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          attach();
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            attach();
          }
        });
      }
      shell.addEventListener("click", function () {
        if (!started) {
          attach();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
