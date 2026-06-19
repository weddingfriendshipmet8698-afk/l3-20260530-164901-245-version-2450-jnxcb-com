(function () {
  const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";

  function qs(root, sel) { return (root || document).querySelector(sel); }
  function qsa(root, sel) { return Array.from((root || document).querySelectorAll(sel)); }

  function initSearchers() {
    qsa(document, "[data-search-input]").forEach((input) => {
      const targetSel = input.getAttribute("data-search-target");
      const target = targetSel ? document.querySelector(targetSel) : null;
      if (!target) return;

      const cards = qsa(target, "[data-searchable]");
      const empty = target.querySelector("[data-empty-state]");
      const apply = () => {
        const kw = (input.value || "").trim().toLowerCase();
        let shown = 0;
        cards.forEach((card) => {
          const hay = (card.getAttribute("data-searchable") || "").toLowerCase();
          const ok = !kw || hay.includes(kw);
          card.hidden = !ok;
          if (ok) shown += 1;
        });
        if (empty) empty.hidden = shown !== 0;
      };
      input.addEventListener("input", apply);
      apply();
    });
  }

  function initChips() {
    qsa(document, "[data-chip-group]").forEach((group) => {
      const targetSel = group.getAttribute("data-chip-group");
      const target = targetSel ? document.querySelector(targetSel) : null;
      if (!target) return;
      const cards = qsa(target, "[data-searchable]");
      const chips = qsa(group, "[data-chip]");
      const empty = target.querySelector("[data-empty-state]");
      const apply = (chip) => {
        chips.forEach((c) => c.classList.toggle("active", c === chip));
        const filter = chip ? chip.getAttribute("data-chip") : "all";
        const kw = chip ? (chip.getAttribute("data-filter") || "").toLowerCase() : "all";
        let shown = 0;
        cards.forEach((card) => {
          const search = (card.getAttribute("data-searchable") || "").toLowerCase();
          const year = (card.getAttribute("data-year") || "").toLowerCase();
          const region = (card.getAttribute("data-region") || "").toLowerCase();
          const genre = (card.getAttribute("data-genre") || "").toLowerCase();
          let ok = true;
          if (filter !== "all") {
            if (filter.startsWith("year:")) ok = year === filter.slice(5);
            else if (filter.startsWith("region:")) ok = region.includes(filter.slice(7));
            else if (filter.startsWith("genre:")) ok = genre.includes(filter.slice(6));
            else ok = search.includes(kw);
          }
          card.hidden = !ok;
          if (ok) shown += 1;
        });
        if (empty) empty.hidden = shown !== 0;
      };
      chips.forEach((chip) => chip.addEventListener("click", () => apply(chip)));
    });
  }

  function loadHlsScript() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (window.__hls_loading) return window.__hls_loading;
    window.__hls_loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = HLS_CDN;
      s.async = true;
      s.onload = () => resolve(window.Hls);
      s.onerror = () => reject(new Error("Failed to load Hls.js"));
      document.head.appendChild(s);
    });
    return window.__hls_loading;
  }

  function playVideo(video) {
    const m3u8 = video.getAttribute("data-m3u8");
    const mp4 = video.getAttribute("data-mp4");
    if (!m3u8 && !mp4) return Promise.reject(new Error("No source found"));

    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl");
    if (nativeHls && m3u8) {
      video.src = m3u8;
      video.load();
      return video.play();
    }

    const attemptHls = () => {
      if (!window.Hls || !m3u8) return Promise.reject(new Error("No HLS support"));
      if (window.Hls.isSupported()) {
        if (video._hls) {
          try { video._hls.destroy(); } catch (e) {}
        }
        const hls = new window.Hls({
          maxBufferLength: 8,
          enableWorker: true,
          lowLatencyMode: true
        });
        video._hls = hls;
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        return new Promise((resolve, reject) => {
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => resolve(video.play()));
          hls.on(window.Hls.Events.ERROR, (_, data) => {
            if (data && data.fatal) reject(new Error(data.details || "HLS error"));
          });
        });
      }
      return Promise.reject(new Error("HLS unsupported"));
    };

    return loadHlsScript()
      .then(() => attemptHls())
      .catch(() => {
        if (mp4) {
          video.src = mp4;
          video.load();
          return video.play();
        }
        return Promise.reject(new Error("Unable to play"));
      });
  }

  function initPlayers() {
    qsa(document, "[data-player]").forEach((wrap) => {
      const video = qs(wrap, "video");
      const overlay = qs(wrap, "[data-player-overlay]");
      const btn = qs(wrap, "[data-player-play]");
      if (!video || !overlay || !btn) return;

      const start = () => {
        overlay.classList.add("hidden");
        playVideo(video).catch(() => {
          overlay.classList.remove("hidden");
          video.setAttribute("controls", "controls");
        });
      };

      btn.addEventListener("click", start);
      wrap.addEventListener("click", (e) => {
        if (e.target === video) {
          start();
        }
      });
    });
  }

  function initActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    qsa(document, "[data-nav]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.endsWith(path) || (path === "" && href.endsWith("index.html"))) {
        a.classList.add("active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSearchers();
    initChips();
    initPlayers();
    initActiveNav();
  });
})();
