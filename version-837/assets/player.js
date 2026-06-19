function initMoviePlayer(videoId, overlayId, sourceUrl, posterUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var attached = false;

  if (!video) {
    return;
  }

  if (posterUrl) {
    video.setAttribute("poster", posterUrl);
  }

  function attachSource() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 800);
      });
    }

    video.src = sourceUrl;
    return Promise.resolve();
  }

  function startPlay() {
    attachSource().then(function () {
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", startPlay);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlay();
    }
  });
}
