(function () {
    function bindMoviePlayer(source) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".player-overlay");
        var button = document.querySelector(".play-button");
        if (!video || !source) {
            return;
        }
        var hls = null;
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
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
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }
    window.bindMoviePlayer = bindMoviePlayer;
})();
