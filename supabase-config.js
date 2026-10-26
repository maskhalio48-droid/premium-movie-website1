/* Tamilflix Supabase public client configuration.
   The publishable/anon key is intended for browser use. Never put service_role keys here. */
(function () {
  "use strict";
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("Tamilflix: Supabase URL or publishable key is missing.");
    return;
  }
  // The Supabase CDN exposes its library as window.supabase. Keep the client
  // in a separate variable to avoid overwriting the library namespace.
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Tamilflix: Supabase JS library did not load. Check your internet connection.");
    return;
  }
  try {
    window.supabaseClient = window.supabase.createClient(url, key);
  } catch (error) {
    console.error("Tamilflix: Could not initialize Supabase client.", error);
  }
})();
