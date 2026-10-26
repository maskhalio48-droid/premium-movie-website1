/* Playback/download helpers for links the site owner is authorized to share. */
(function () {
  'use strict';
  function findMovie(id) { return window.tamilflixGetMovie ? window.tamilflixGetMovie(id) : null; }
  window.tamilflixWatch = function (id) {
    const movie = findMovie(id);
    if (!movie) return alert('Movie details are not available yet.');
    const url = movie.watch_url || movie.watchUrl || '';
    if (!url) return alert('No authorized watch link has been added for this title yet.');
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  window.tamilflixDownload = function (id) {
    const movie = findMovie(id);
    if (!movie) return alert('Movie details are not available yet.');
    const url = movie.download_url || movie.downloadUrl || '';
    if (!url) return alert('No authorized direct-download file has been added for this title yet.');
    const quality = movie.quality ? '\nAvailable quality: ' + movie.quality : '';
    if (!confirm('Open the authorized download link for ' + movie.title + '?' + quality)) return;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.download = '';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };
})();
