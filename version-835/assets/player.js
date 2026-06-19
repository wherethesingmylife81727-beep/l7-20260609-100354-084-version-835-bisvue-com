(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupPlayer(root) {
    const video = root.querySelector('video');
    const button = root.querySelector('[data-play-button]');
    const status = root.querySelector('[data-player-status]');
    const src = root.getAttribute('data-src');
    let initialized = false;
    let hls = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initialize() {
      if (initialized || !video || !src) {
        return Promise.resolve();
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成，正在播放。');
        });

        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('播放源暂时无法加载，请刷新页面或稍后重试。');
          }
        });

        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setStatus('使用浏览器原生 HLS 播放。');
        return Promise.resolve();
      }

      video.src = src;
      setStatus('当前浏览器可能不支持 HLS，已尝试直接载入播放源。');
      return Promise.resolve();
    }

    function play() {
      initialize().then(function () {
        const playPromise = video.play();

        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            root.classList.add('is-playing');
          }).catch(function () {
            setStatus('浏览器阻止自动播放，请再次点击播放器。');
          });
        } else {
          root.classList.add('is-playing');
        }
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        root.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        root.classList.remove('is-playing');
      });
    }

    root.addEventListener('click', function (event) {
      if (event.target === root) {
        play();
      }
    });
  }

  ready(function () {
    Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
