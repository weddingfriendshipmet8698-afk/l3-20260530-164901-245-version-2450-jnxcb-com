import { H as Hls } from './hls.js';

export function initMoviePlayer(source) {
  var video = document.getElementById('movie-video');
  var button = document.querySelector('[data-video-play]');
  var shell = document.querySelector('[data-video-shell]');
  var hlsInstance = null;
  var prepared = false;

  if (!video || !source) {
    return;
  }

  function prepareVideo() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    prepareVideo();

    if (button) {
      button.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove('hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        playVideo();
      }
    });
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && button) {
      button.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance && hlsInstance.destroy) {
      hlsInstance.destroy();
    }
  });
}
