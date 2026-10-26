/* Tamilflix Admin Panel
   Movie Add / Edit / Delete
   YouTube + direct video URLs
   Multiple quality URLs stored in languages JSON
*/

(function () {
  "use strict";

  let sb = null;
  let databaseMovies = [];
  let isAdmin = false;

  function getClient() {
    if (window.tamilflixSupabase) {
      return window.tamilflixSupabase;
    }

    if (
      !window.supabase ||
      !window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY
    ) {
      return null;
    }

    window.tamilflixSupabase = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );

    return window.tamilflixSupabase;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function updateAdminButton() {
    const button = $("tamilflixAdminButton");
    if (button) button.hidden = !isAdmin;
  }

  function createAdminButton() {
    if ($("tamilflixAdminButton")) return;

    const button = document.createElement("button");
    button.id = "tamilflixAdminButton";
    button.type = "button";
    button.className = "btn btn-red";
    button.textContent = "⚙️ Admin Panel";
    button.hidden = true;

    const registerButton = $("registerBtn");

    if (registerButton) {
      registerButton.insertAdjacentElement("afterend", button);
    } else {
      document.querySelector("header")?.appendChild(button);
    }

    button.addEventListener("click", async () => {
      if (!isAdmin) {
        alert("Admin access is not available for this account.");
        return;
      }

      const modal = $("adminModal");

      if (modal?.showModal) {
        modal.showModal();
      }

      await loadAdminMovies();
    });
  }

  async function checkAdmin() {
    const client = getClient();

    if (!client) {
      isAdmin = false;
      updateAdminButton();
      return;
    }

    try {
      const { data: userData, error: userError } =
        await client.auth.getUser();

      if (userError || !userData?.user) {
        isAdmin = false;
        updateAdminButton();
        return;
      }

      const { data, error } = await client.rpc("is_admin");

      isAdmin = !error && data === true;
    } catch (error) {
      console.error("Admin verification failed:", error);
      isAdmin = false;
    }

    updateAdminButton();
  }

  function mapMovie(row) {
    return {
      id: String(row.id),
      title: row.title || "",
      year: row.year || "",
      genre: row.genre || "",
      rating: row.rating || "U",
      type: String(row.category || "movie").toLowerCase(),
      description: row.description || "",
      poster: row.poster_url || "",
      backdrop: row.backdrop_url || row.poster_url || "",
      videoUrl: row.video_url || "",
      languageLinks: Array.isArray(row.languages) ? row.languages : []
    };
  }

  async function loadPublicMovies() {
    const client = getClient();
    if (!client) return;

    const { data, error } = await client
      .from("movies")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load movies:", error.message);
      return;
    }

    databaseMovies = data || [];
    window.tamilflixDatabaseMovies = databaseMovies;

    if (databaseMovies.length && typeof renderRows === "function") {
      window.tamilflixDatabaseMovies = databaseMovies;
      window.tamilflixMapMovie = mapMovie;

      // script.js can use this mapping if needed.
      window.tamilflixMappedMovies = databaseMovies.map(mapMovie);
      titles = window.tamilflixMappedMovies;

      renderRows();

      if (typeof renderHero === "function") {
        renderHero();
      }
    }
  }

  async function loadAdminMovies() {
    const client = getClient();
    const list = $("adminMovieList");

    if (!client || !list || !isAdmin) return;

    list.textContent = "Loading movies...";

    const { data, error } = await client
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      list.textContent = "Could not load movies: " + error.message;
      return;
    }

    databaseMovies = data || [];

    if (!databaseMovies.length) {
      list.textContent = "No movies added yet.";
      return;
    }

    list.innerHTML = databaseMovies.map(movie => `
      <div class="admin-movie-item"
           style="padding:12px;border-bottom:1px solid #444">
        <strong>${escapeHTML(movie.title)}</strong>
        <span>${movie.is_active ? "Active" : "Hidden"}</span>
        <button type="button"
                data-edit-movie="${escapeHTML(movie.id)}">
          Edit
        </button>
        <button type="button"
                data-delete-movie="${escapeHTML(movie.id)}">
          Delete
        </button>
      </div>
    `).join("");

    list.querySelectorAll("[data-edit-movie]").forEach(button => {
      button.addEventListener("click", () => {
        const movie = databaseMovies.find(
          item => String(item.id) === button.dataset.editMovie
        );

        if (movie) fillMovieForm(movie);
      });
    });

    list.querySelectorAll("[data-delete-movie]").forEach(button => {
      button.addEventListener("click", async () => {
        if (!confirm("Delete this movie permanently?")) return;

        const { error } = await client
          .from("movies")
          .delete()
          .eq("id", button.dataset.deleteMovie);

        if (error) {
          alert("Delete failed: " + error.message);
          return;
        }

        await loadAdminMovies();
        await loadPublicMovies();
      });
    });
  }

  function fillMovieForm(movie) {
    $("movieId").value = movie.id;
    $("movieTitle").value = movie.title || "";
    $("movieYear").value = movie.year || "";
    $("movieCategory").value = movie.category || "movie";
    $("movieGenre").value = movie.genre || "";
    $("movieRating").value = movie.rating || "U";
    $("moviePoster").value = movie.poster_url || "";
    $("movieBackdrop").value = movie.backdrop_url || "";
    $("movieDescription").value = movie.description || "";
    $("movieVideo").value = movie.video_url || "";

    $("movieLanguages").value = JSON.stringify(
      Array.isArray(movie.languages) ? movie.languages : [],
      null,
      2
    );

    const message = $("adminMessage");
    if (message) {
      message.textContent =
        "Editing: " + (movie.title || "Selected movie");
    }

    $("movieTitle").focus();
  }

  async function saveMovie(event) {
    event.preventDefault();

    const client = getClient();
    const message = $("adminMessage");

    if (!client || !isAdmin) {
      if (message) {
        message.textContent = "Please log in with your admin account.";
      }
      return;
    }

    let languages = [];

    try {
      const input = $("movieLanguages").value.trim();
      languages = input ? JSON.parse(input) : [];

      if (!Array.isArray(languages)) {
        throw new Error("Quality and language links must be a JSON array.");
      }
    } catch (error) {
      message.textContent = "Links format error: " + error.message;
      return;
    }

    const movie = {
      title: $("movieTitle").value.trim(),
      year: $("movieYear").value.trim(),
      category: $("movieCategory").value,
      genre: $("movieGenre").value.trim(),
      rating: $("movieRating").value.trim() || "U",
      poster_url: $("moviePoster").value.trim(),
      backdrop_url: $("movieBackdrop").value.trim(),
      description: $("movieDescription").value.trim(),
      video_url: $("movieVideo").value.trim(),
      languages,
      is_active: true
    };

    if (!movie.title || !movie.poster_url) {
      message.textContent = "Movie title and poster URL are required.";
      return;
    }

    message.textContent = "Saving...";

    const id = $("movieId").value.trim();

    let result;

    if (id) {
      result = await client
        .from("movies")
        .update(movie)
        .eq("id", id);
    } else {
      result = await client
        .from("movies")
        .insert(movie);
    }

    if (result.error) {
      message.textContent = "Save failed: " + result.error.message;
      return;
    }

    message.textContent = "Movie saved successfully!";

    $("movieForm").reset();
    $("movieId").value = "";

    await loadAdminMovies();
    await loadPublicMovies();
  }

  function setupCloseButtons() {
    document.querySelectorAll("[data-close-modal]").forEach(button => {
      button.addEventListener("click", () => {
        const modal = button.closest("dialog");
        if (modal) modal.close();
      });
    });
  }

  function initAdmin() {
    createAdminButton();
    setupCloseButtons();

    const form = $("movieForm");

    if (form) {
      form.addEventListener("submit", saveMovie);
    }

    const client = getClient();

    if (client) {
      client.auth.onAuthStateChange(() => {
        setTimeout(checkAdmin, 0);
      });
    }

    loadPublicMovies();
    checkAdmin();
  }

  document.addEventListener("DOMContentLoaded", initAdmin);
})();
