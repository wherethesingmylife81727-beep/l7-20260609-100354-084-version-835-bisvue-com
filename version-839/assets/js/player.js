(function() {
  window.startMoviePlayback = function(video, trigger, cover, sourceUrl) {
    if (!video || !sourceUrl) {
      return;
    }

    var ready = false;
    var hlsInstance = null;

    function bindSource() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      bindSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playAction = video.play();
      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function() {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function() {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
