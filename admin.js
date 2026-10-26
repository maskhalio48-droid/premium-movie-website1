/* ==========================================
   TAMILFLIX - ADMIN PANEL
   Website Developed by Jayantha Dilan
========================================== */

"use strict";

(function () {
    let client = null;
    let isAdmin = false;
    let databaseMovies = [];

    const $ = id => document.getElementById(id);

    /* ---------- SUPABASE CLIENT ---------- */

    function getClient() {
        if (window.tamilflixSupabase) {
            return window.tamilflixSupabase;
        }

        if (
            !window.supabase ||
            !window.SUPABASE_URL ||
            !window.SUPABASE_PUBLISHABLE_KEY
        ) {
            console.error("Supabase configuration is missing.");
            return null;
        }

        window.tamilflixSupabase = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_PUBLISHABLE_KEY
        );

        return window.tamilflixSupabase;
    }

    /* ---------- HTML SAFETY ---------- */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function showMessage(message, isError = false) {
        const element = $("adminMessage");

        if (!element) return;

        element.textContent = message;
        element.style.color = isError ? "#ff6b6b" : "#7ee787";
    }

    /* ---------- ADMIN BUTTON ---------- */

    function createAdminButton() {
        let button = $("tamilflixAdminButton");

        if (button) {
            button.hidden = true;
            return button;
        }

        button = document.createElement("button");
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
            await checkAdmin();

            if (!isAdmin) {
                alert("இந்த account-க்கு Admin அனுமதி இல்லை.");
                return;
            }

            const modal = $("adminModal");

            if (modal?.showModal) {
                modal.showModal();
            }

            await loadAdminMovies();
        });

        return button;
    }

    function updateAdminButton() {
        const button = $("tamilflixAdminButton");

        if (button) {
            button.hidden = !isAdmin;
        }
    }

    /* ---------- CHECK ADMIN ---------- */

    async function checkAdmin() {
        client = getClient();

        if (!client) {
            isAdmin = false;
            updateAdminButton();
            return false;
        }

        try {
            const { data: userData, error: userError } =
                await client.auth.getUser();

            if (userError || !userData?.user) {
                isAdmin = false;
                updateAdminButton();
                return false;
            }

            const { data, error } = await client.rpc("is_admin");

            isAdmin = !error && data === true;

            if (error) {
                console.error("Admin verification failed:", error.message);
            }
        } catch (error) {
            console.error("Admin check failed:", error);

            isAdmin = false;
        }

        updateAdminButton();

        return isAdmin;
    }

    /* ---------- LOAD PUBLIC MOVIES ---------- */

    async function loadPublicMovies() {
        client = getClient();

        if (!client) return;

        try {
            const { data, error } = await client
                .from("movies")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Movie loading failed:", error.message);
                return;
            }

            databaseMovies = data || [];

            window.tamilflixDatabaseMovies = databaseMovies;

            if (typeof window.tamilflixSetDatabaseMovies === "function") {
                window.tamilflixSetDatabaseMovies(databaseMovies);
            } else {
                window.dispatchEvent(
                    new CustomEvent("tamilflix:movies-updated", {
                        detail: databaseMovies
                    })
                );
            }
        } catch (error) {
            console.error("Could not load movies:", error);
        }
    }

    /* ---------- LOAD ADMIN MOVIES ---------- */

    async function loadAdminMovies() {
        client = getClient();

        const list = $("adminMovieList");

        if (!client || !list) return;

        if (!(await checkAdmin())) {
            list.textContent = "Admin access required.";
            return;
        }

        list.textContent = "திரைப்படங்கள் ஏற்றப்படுகின்றன...";

        try {
            const { data, error } = await client
                .from("movies")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                list.textContent = "Loading failed: " + error.message;
                return;
            }

            databaseMovies = data || [];

            if (!databaseMovies.length) {
                list.textContent = "இன்னும் திரைப்படங்கள் சேர்க்கப்படவில்லை.";
                return;
            }

            list.replaceChildren();

            databaseMovies.forEach(movie => {
                const item = document.createElement("div");

                item.className = "admin-movie-item";

                item.style.padding = "12px";
                item.style.borderBottom = "1px solid #444";

                const title = document.createElement("strong");

                title.textContent = movie.title || "Untitled";

                const status = document.createElement("span");

                status.textContent = movie.is_active ? "Active" : "Hidden";
                status.style.margin = "0 10px";

                const editButton = document.createElement("button");

                editButton.type = "button";
                editButton.textContent = "Edit";

                editButton.addEventListener("click", () => {
                    fillMovieForm(movie);
                });

                const deleteButton = document.createElement("button");

                deleteButton.type = "button";
                deleteButton.textContent = "Delete";

                deleteButton.addEventListener("click", async () => {
                    await deleteMovie(movie.id);
                });

                item.append(title, status, editButton, deleteButton);

                list.appendChild(item);
            });
        } catch (error) {
            list.textContent = "Error: " + error.message;
        }
    }

    /* ---------- FILL FORM FOR EDITING ---------- */

    function fillMovieForm(movie) {
        if (!isAdmin) {
            showMessage("Admin access required.", true);
            return;
        }

        $("movieId").value = movie.id ?? "";
        $("movieTitle").value = movie.title ?? "";
        $("movieYear").value = movie.year ?? "";
        $("movieCategory").value = movie.category ?? "movie";
        $("movieGenre").value = movie.genre ?? "";
        $("movieRating").value = movie.rating ?? "U";
        $("moviePoster").value = movie.poster_url ?? "";
        $("movieBackdrop").value = movie.backdrop_url ?? "";
        $("movieDescription").value = movie.description ?? "";
        $("movieVideo").value = movie.video_url ?? "";

        let languages = movie.languages ?? [];

        if (typeof languages === "string") {
            try {
                languages = JSON.parse(languages);
            } catch {
                languages = [];
            }
        }

        $("movieLanguages").value = JSON.stringify(
            Array.isArray(languages) ? languages : [],
            null,
            2
        );

        showMessage("Editing: " + (movie.title || "Selected movie"));

        $("movieTitle").focus();
    }

    /* ---------- SAVE MOVIE ---------- */

    async function saveMovie(event) {
        event.preventDefault();

        client = getClient();

        if (!client || !(await checkAdmin())) {
            showMessage("உங்கள் Admin account-ல் login செய்யவும்.", true);
            return;
        }

        const title = $("movieTitle").value.trim();
        const poster = $("moviePoster").value.trim();

        if (!title) {
            showMessage("Movie title அவசியம்.", true);
            return;
        }

        if (!poster) {
            showMessage("Poster URL அவசியம்.", true);
            return;
        }

        let languages = [];

        try {
            const input = $("movieLanguages").value.trim();

            languages = input ? JSON.parse(input) : [];

            if (!Array.isArray(languages)) {
                throw new Error("JSON array ஆக இருக்க வேண்டும்.");
            }

            for (const item of languages) {
                if (!item || typeof item !== "object") {
                    throw new Error("ஒவ்வொரு language link-மும் object ஆக இருக்க வேண்டும்.");
                }

                if (
                    item.url &&
                    !/^https?:\/\//i.test(String(item.url))
                ) {
                    throw new Error("Video URL http:// அல்லது https:// ஆக இருக்க வேண்டும்.");
                }
            }
        } catch (error) {
            showMessage("Language links error: " + error.message, true);
            return;
        }

        const movie = {
            title,
            year: $("movieYear").value.trim() || null,
            category: $("movieCategory").value || "movie",
            genre: $("movieGenre").value.trim() || null,
            rating: $("movieRating").value.trim() || "U",
            poster_url: poster,
            backdrop_url: $("movieBackdrop").value.trim() || null,
            description: $("movieDescription").value.trim() || null,
            video_url: $("movieVideo").value.trim() || null,
            languages,
            is_active: true
        };

        const id = $("movieId").value.trim();

        showMessage("Saving movie...");

        const saveButton = $("movieForm")?.querySelector(
            'button[type="submit"]'
        );

        if (saveButton) saveButton.disabled = true;

        try {
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
                throw result.error;
            }

            showMessage("திரைப்படம் வெற்றிகரமாகச் சேமிக்கப்பட்டது!");

            $("movieForm").reset();
            $("movieId").value = "";

            await loadAdminMovies();
            await loadPublicMovies();
        } catch (error) {
            console.error("Save failed:", error);

            showMessage("Save failed: " + error.message, true);
        } finally {
            if (saveButton) saveButton.disabled = false;
        }
    }

    /* ---------- DELETE MOVIE ---------- */

    async function deleteMovie(id) {
        if (!confirm("இந்த திரைப்படத்தை நிரந்தரமாக நீக்க வேண்டுமா?")) {
            return;
        }

        client = getClient();

        if (!client || !(await checkAdmin())) {
            alert("Admin access required.");
            return;
        }

        try {
            const { error } = await client
                .from("movies")
                .delete()
                .eq("id", id);

            if (error) throw error;

            showMessage("திரைப்படம் நீக்கப்பட்டது.");

            await loadAdminMovies();
            await loadPublicMovies();
        } catch (error) {
            console.error("Delete failed:", error);

            showMessage("Delete failed: " + error.message, true);
        }
    }

    /* ---------- RESET FORM ---------- */

    function resetMovieForm() {
        const form = $("movieForm");

        if (form) form.reset();

        if ($("movieId")) $("movieId").value = "";

        showMessage("புதிய திரைப்படத்தைச் சேர்க்கலாம்.");
    }

    /* ---------- INITIALIZE ---------- */

    function initAdmin() {
        client = getClient();

        createAdminButton();

        const form = $("movieForm");

        if (form) {
            form.addEventListener("submit", saveMovie);
        }

        const resetButton = $("resetMovieForm");

        if (resetButton) {
            resetButton.addEventListener("click", resetMovieForm);
        }

        document.querySelectorAll("[data-close-modal]").forEach(button => {
            button.addEventListener("click", () => {
                const modal = button.closest("dialog");

                if (modal) modal.close();
            });
        });

        if (client) {
            client.auth.onAuthStateChange(() => {
                setTimeout(async () => {
                    await checkAdmin();
                    await loadPublicMovies();
                }, 0);
            });
        }

        checkAdmin();
        loadPublicMovies();
    }

    document.addEventListener("DOMContentLoaded", initAdmin);

})();
