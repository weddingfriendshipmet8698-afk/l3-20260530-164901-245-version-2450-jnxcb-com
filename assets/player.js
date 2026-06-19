function setupMoviePlayer(source) {
  var video = document.querySelector(".movie-video");
  var overlay = document.querySelector(".play-overlay");
  var hls = null;
  var attached = false;

  if (!video || !overlay || !source) {
    return;
  }

  function attachNative() {
    video.src = source;
    attached = true;
    return Promise.resolve();
  }

  function attachHls() {
    return new Promise(function (resolve, reject) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        attached = true;
        resolve();
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          reject(data);
        }
      });
    });
  }

  function attachSource() {
    if (attached) {
      return Promise.resolve();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      return attachNative();
    }
    if (window.Hls && Hls.isSupported()) {
      return attachHls();
    }
    return attachNative();
  }

  function startPlayback() {
    overlay.hidden = true;
    video.controls = true;
    attachSource().then(function () {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.hidden = false;
        });
      }
    }).catch(function () {
      overlay.hidden = false;
      video.controls = true;
    });
  }

  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (!attached) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    overlay.hidden = true;
  });
  video.addEventListener("pause", function () {
    if (!video.currentTime) {
      overlay.hidden = false;
    }
  });
}
