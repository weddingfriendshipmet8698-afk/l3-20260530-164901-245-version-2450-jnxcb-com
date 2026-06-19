(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
    bindPlayers();
  });

  function bindMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (slides.length <= 1) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function bindFilters() {
    var grid = document.querySelector(".filter-grid");
    var input = document.querySelector(".filter-controller input[name='q']");
    if (!grid || !input) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-row"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function apply(value) {
      var query = value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      grid.classList.toggle("is-empty", visible === 0);
    }

    input.addEventListener("input", function () {
      apply(input.value);
    });
    apply(initial);
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    players.forEach(function (box) {
      var video = box.querySelector("video.movie-player");
      var overlay = box.querySelector(".player-overlay");
      var status = box.querySelector(".player-status");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var initialized = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function initialize() {
        if (initialized || !stream) {
          return;
        }
        initialized = true;
        setStatus("正在加载");
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("可以播放");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放连接暂时不可用");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          setStatus("可以播放");
        } else {
          setStatus("当前浏览器暂不支持播放");
        }
      }

      function play() {
        initialize();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setStatus("点击播放器继续播放");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", initialize);
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    });
  }
})();
