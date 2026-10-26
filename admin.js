/* Tamilflix admin handlers. Requires a secure Supabase is_admin() RPC and RLS. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const client = () => window.tamilflixSupabase || null;
  const ready = () => !!(window.SUPABASE_PUBLISHABLE_KEY && client());
  const isAdmin = () => !!(window.tamilflixIsAdmin && window.tamilflixIsAdmin());
  const message = (text, error = false) => {
    const el = $('adminMessage');
    if (el) { el.textContent = text; el.style.color = error ? '#ff8794' : '#86efac'; }
  };
  function resetForm() {
    $('movieForm')?.reset();
    if ($('movieId')) $('movieId').value = '';
    message('');
  }
  function fillForm(movie) {
    $('movieId').value = movie.id ?? '';
    $('movieTitle').value = movie.title || '';
    $('movieType').value = movie.type || 'movie';
    $('moviePoster').value = movie.poster_url || movie.poster || '';
    $('movieBackdrop').value = movie.backdrop || movie.backdrop_url || '';
    $('movieDescription').value = movie.description || '';
    $('movieLanguages').value = (Array.isArray(movie.languages) ? movie.languages : String(movie.languages || '').split(',').map(s => s.trim()).filter(Boolean)).join(', ');
    $('movieWatchUrl').value = movie.watch_url || '';
    $('movieDownloadUrl').value = movie.download_url || '';
    $('movieQuality').value = movie.quality || '';
    $('adminSection')?.scrollIntoView({ behavior: 'smooth' });
  }
  async function saveMovie(event) {
    event.preventDefault();
    if (!ready()) return message('Supabase config is missing. Keep your existing supabase-config.js.', true);
    if (!isAdmin()) return message('Admin permission not detected. Check login, is_admin() RPC, and admin_users setup.', true);
    const id = $('movieId').value;
    const payload = {
      title: $('movieTitle').value.trim(),
      type: $('movieType').value,
      poster_url: $('moviePoster').value.trim(),
      backdrop: $('movieBackdrop').value.trim() || null,
      description: $('movieDescription').value.trim() || null,
      languages: $('movieLanguages').value.split(',').map(s => s.trim()).filter(Boolean),
      watch_url: $('movieWatchUrl').value.trim() || null,
      download_url: $('movieDownloadUrl').value.trim() || null,
      quality: $('movieQuality').value.trim() || null
    };
    const db = client().from('movies');
    const result = id ? await db.update(payload).eq('id', id) : await db.insert(payload);
    if (result.error) return message('Save failed: ' + result.error.message, true);
    message('Saved successfully.');
    resetForm();
    if (window.tamilflixReloadMovies) await window.tamilflixReloadMovies();
  }
  async function deleteMovie(id) {
    if (!ready() || !isAdmin()) return alert('Please sign in with an authorized admin account.');
    if (!confirm('Delete this title? This cannot be undone.')) return;
    const { error } = await client().from('movies').delete().eq('id', id);
    if (error) return alert('Delete failed: ' + error.message);
    if (window.tamilflixReloadMovies) await window.tamilflixReloadMovies();
    alert('Title deleted.');
  }
  function init() {
    if (!$('movieForm')) return;
    $('movieForm').addEventListener('submit', saveMovie);
    $('cancelEditBtn')?.addEventListener('click', resetForm);
    document.addEventListener('click', event => {
      const edit = event.target.closest('[data-admin-edit]');
      if (edit) {
        const movie = window.tamilflixGetMovie?.(edit.dataset.adminEdit);
        if (movie) fillForm(movie);
        else message('Could not find that title in the current list.', true);
      }
      const del = event.target.closest('[data-admin-delete]');
      if (del) deleteMovie(del.dataset.adminDelete);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
