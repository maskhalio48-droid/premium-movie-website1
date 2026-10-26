/* ==========================================
   TAMILFLIX - MAIN SCRIPT
   Website Developed by Jayantha Dilan
========================================== */

"use strict";

/* ---------- SUPABASE ---------- */

function getSupabaseClient() {
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

/* ---------- DEMO MOVIES ---------- */

const DEMO_TITLES = [
    {
        id: "demo-1",
        title: "Leo",
        year: 2023,
        genre: "Action",
        rating: "U/A",
        type: "movie",
        description: "A sample movie listing for the Tamilflix catalogue.",
        poster: "",
        backdrop: "",
        videoUrl: "",
        languageLinks: []
    },
    {
        id: "demo-2",
        title: "Jailer",
        year: 2023,
        genre: "Action",
        rating: "U/A",
        type: "movie",
        description: "A sample movie listing for the Tamilflix catalogue.",
        poster: "",
        backdrop: "",
        videoUrl: "",
        languageLinks: []
    },
    {
        id: "demo-3",
        title: "Vikram",
        year: 2022,
        genre: "Action",
        rating: "U/A",
        type: "movie",
        description: "A sample movie listing for the Tamilflix catalogue.",
        poster: "",
        backdrop: "",
        videoUrl: "",
        languageLinks: []
    },
    {
        id: "demo-4",
        title: "Master",
        year: 2021,
        genre: "Action",
        rating: "U/A",
        type: "movie",
        description: "A sample movie listing for the Tamilflix catalogue.",
        poster: "",
        backdrop: "",
        videoUrl: "",
        languageLinks: []
    },
    {
        id: "demo-5",
        title: "Marvel Collection",
        year: 2025,
        genre: "Superhero",
        rating: "U/A",
        type: "marvel",
        description: "Explore superhero movie listings.",
        poster: "",
        backdrop: "",
        videoUrl: "",
        languageLinks: []
    },
    {
        id: "demo-6",
        title: "Anime Collection",
        year: 2025,
        genre: "Anime",
        rating: "U",
        type: "anime",
        description: "Explore anime listings.",
        poster: "",
        backdrop: "",
        videoUrl: "",
        languageLinks: []
    },
    {
        id: "demo-7",
        title: "Series Collection",
        year: 2025,
        genre: "Drama",
        rating: "U/A",
        type: "series",
        description: "Explore series listings.",
        poster: "",
        backdrop: "",
        videoUrl: "",
        languageLinks: []
    }
];

/* ---------- APPLICATION STATE ---------- */

let allTitles = [...DEMO_TITLES];
let databaseTitles = [];
let currentSection = "home";
let currentSearch = "";
let currentHeroIndex = 0;
let heroTimer = null;
let currentPlayerTitle = null;

const MY_LIST_KEY = "tamilflix_my_list";

function getMyList() {
    try {
        const list = JSON.parse(localStorage.getItem(MY_LIST_KEY) || "[]");
        return Array.isArray(list) ? list.map(String) : [];
    } catch {
        return [];
    }
}

function saveMyList(list) {
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function safeURL(value) {
    if (!value) return "";

    try {
        const url = new URL(String(value), window.location.href);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }
    } catch (error) {
        console.warn("Invalid URL:", value);
    }

    return "";
}

/* ---------- DATABASE MOVIE MAPPING ---------- */

function mapDatabaseMovie(row) {
    const category = String(row.category || "movie").toLowerCase();

    let type = category;

    if (category.includes("series")) {
        type = "series";
    } else if (category.includes("marvel")) {
        type = "marvel";
    } else if (category.includes("anime")) {
        type = "anime";
    } else {
        type = "movie";
    }

    let languageLinks = row.languages;

    if (typeof languageLinks === "string") {
        try {
            languageLinks = JSON.parse(languageLinks);
        } catch {
            languageLinks = [];
        }
    }

    if (!Array.isArray(languageLinks)) {
        languageLinks = [];
    }

    return {
        id: String(row.id),
        title: row.title || "Untitled",
        year: row.year || "",
        genre: row.genre || "",
        rating: row.rating || "U",
        type,
        category,
        description: row.description || "",
        poster: safeURL(row.poster_url || ""),
        backdrop: safeURL(row.backdrop_url || row.poster_url || ""),
        videoUrl: safeURL(row.video_url || ""),
        languageLinks: languageLinks.map(item => {
            if (!item || typeof item !== "object") return null;

            return {
                language: String(item.language || item.name || "Default"),
                quality: String(item.quality || ""),
                url: safeURL(
                    item.videoUrl ||
                    item.video_url ||
                    item.url ||
                    ""
                )
            };
        }).filter(Boolean)
    };
}

function setDatabaseMovies(rows) {
    databaseTitles = Array.isArray(rows)
        ? rows.map(mapDatabaseMovie)
        : [];

    rebuildTitles();
}

function rebuildTitles() {
    const databaseIds = new Set(
        databaseTitles.map(movie => String(movie.id))
    );

    allTitles = [
        ...databaseTitles,
        ...DEMO_TITLES.filter(movie => !databaseIds.has(String(movie.id)))
    ];

    renderRows();
    renderHero();
}

window.tamilflixSetDatabaseMovies = setDatabaseMovies;
window.tamilflixMapMovie = mapDatabaseMovie;

/* ---------- MOVIE CARD ---------- */

function createMovieCard(movie) {
    const card = document.createElement("article");
    card.className = "movie-card";

    const poster = safeURL(movie.poster);

    const posterContent = poster
        ? `<img src="${escapeHTML(poster)}"
                alt="${escapeHTML(movie.title)}"
                loading="lazy">`
        : `<div class="poster-placeholder">
                <span>▶</span>
                <strong>${escapeHTML(movie.title)}</strong>
           </div>`;

    card.innerHTML = `
        <button class="poster-card"
                type="button"
                aria-label="View ${escapeHTML(movie.title)}">
            ${posterContent}
            <span class="poster-play">▶</span>
        </button>

        <div class="card-info">
            <h3>${escapeHTML(movie.title)}</h3>

            <p>
                ${escapeHTML(movie.year || "")}
                ${movie.genre ? " • " + escapeHTML(movie.genre) : ""}
            </p>

            <span class="card-rating">
                ${escapeHTML(movie.rating || "U")}
            </span>
        </div>
    `;

    card.querySelector(".poster-card").addEventListener("click", () => {
        openDetails(movie);
    });

    return card;
}

function renderMovieContainer(containerId, movies) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.replaceChildren();

    movies.forEach(movie => {
        container.appendChild(createMovieCard(movie));
    });
}

/* ---------- FILTERING ---------- */

function isMovie(movie) {
    return movie.type === "movie";
}

function isMarvel(movie) {
    return movie.type === "marvel" ||
        String(movie.genre).toLowerCase().includes("marvel");
}

function isAnime(movie) {
    return movie.type === "anime" ||
        String(movie.genre).toLowerCase().includes("anime");
}

function isSeries(movie) {
    return movie.type === "series";
}

function matchesSearch(movie) {
    if (!currentSearch) return true;

    const searchText = [
        movie.title,
        movie.genre,
        movie.category,
        movie.description,
        movie.year
    ].join(" ").toLowerCase();

    return searchText.includes(currentSearch.toLowerCase());
}

function renderRows() {
    const movies = allTitles.filter(matchesSearch);

    const trending = movies.filter(isMovie);
    const marvel = movies.filter(isMarvel);
    const anime = movies.filter(isAnime);
    const series = movies.filter(isSeries);

    const noLanguage = movies.filter(movie =>
        isMovie(movie) &&
        (!Array.isArray(movie.languageLinks) ||
            movie.languageLinks.length === 0)
    );

    renderMovieContainer("trendingMovies", trending);
    renderMovieContainer("marvelTitles", marvel);
    renderMovieContainer("animeTitles", anime);
    renderMovieContainer("popularSeries", series);
    renderMovieContainer("noLangMovies", noLanguage);
    renderMovieContainer("allItems", movies);

    const myListIds = getMyList();

    renderMovieContainer(
        "myListItems",
        allTitles.filter(movie =>
            myListIds.includes(String(movie.id)) &&
            matchesSearch(movie)
        )
    );

    const resultCount = document.getElementById("resultCount");

    if (resultCount) {
        resultCount.textContent = `${movies.length} titles`;
    }

    const allHeading = document.getElementById("allHeading");

    if (allHeading) {
        allHeading.textContent = currentSearch
            ? `Search results for "${currentSearch}"`
            : "All Movies & Series";
    }

    updateSectionVisibility();
}

function updateSectionVisibility() {
    const sections = {
        trendingSection: currentSection === "home",
        marvelSection: currentSection === "home",
        animeSection: currentSection === "home",
        seriesSection: currentSection === "home",
        noLangSection: currentSection === "home",
        allSection: currentSection !== "home" &&
            currentSection !== "mylist",
        myListSection: currentSection === "mylist"
    };

    Object.entries(sections).forEach(([id, visible]) => {
        const element = document.getElementById(id);

        if (element) {
            element.classList.toggle("hidden", !visible);
        }
    });

    const emptyState = document.getElementById("emptyState");

    if (emptyState) {
        const list = currentSection === "mylist"
            ? getMyList()
            : allTitles.filter(matchesSearch);

        emptyState.classList.toggle("hidden", list.length > 0);
    }
}

/* ---------- HERO SLIDER ---------- */

function renderHero() {
    const hero = document.getElementById("hero");

    if (!hero) return;

    const featured = allTitles.filter(movie =>
        movie.backdrop || movie.poster
    );

    if (!featured.length) {
        hero.style.backgroundImage = "";
        hero.style.background = "linear-gradient(120deg,#181818,#080808)";

        const title = document.getElementById("heroTitle");
        const description = document.getElementById("heroDescription");
        const meta = document.getElementById("heroMeta");

        if (title) title.textContent = "Welcome to Tamilflix";
        if (description) {
            description.textContent =
                "Movies • Series • Entertainment";
        }
        if (meta) meta.textContent = "FEATURED";

        return;
    }

    if (currentHeroIndex >= featured.length) {
        currentHeroIndex = 0;
    }

    const movie = featured[currentHeroIndex];
    const image = safeURL(movie.backdrop || movie.poster);

    hero.style.backgroundImage = image
        ? `linear-gradient(90deg,rgba(0,0,0,.95),rgba(0,0,0,.2)),url("${image}")`
        : "linear-gradient(120deg,#181818,#080808)";

    const title = document.getElementById("heroTitle");
    const description = document.getElementById("heroDescription");
    const meta = document.getElementById("heroMeta");

    if (title) title.textContent = movie.title;
    if (description) {
        description.textContent =
            movie.description || "Discover movies and series on Tamilflix.";
    }

    if (meta) {
        meta.textContent = [
            movie.year,
            movie.genre,
            movie.rating
        ].filter(Boolean).join(" • ");
    }

    const watch = document.getElementById("heroWatch");
    const add = document.getElementById("heroList");

    if (watch) {
        watch.onclick = () => openDetails(movie);
    }

    if (add) {
        add.onclick = () => toggleMyList(movie);
    }

    renderSliderDots(featured.length);
}

function renderSliderDots(count) {
    const dots = document.getElementById("sliderDots");

    if (!dots) return;

    dots.replaceChildren();

    for (let i = 0; i < count; i++) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = i === currentHeroIndex ? "active" : "";
        button.setAttribute("aria-label", `Slide ${i + 1}`);

        button.addEventListener("click", () => {
            currentHeroIndex = i;
            renderHero();
            restartSlider();
        });

        dots.appendChild(button);
    }
}

function moveHero(direction) {
    const featured = allTitles.filter(movie =>
        movie.backdrop || movie.poster
    );

    if (!featured.length) return;

    currentHeroIndex =
        (currentHeroIndex + direction + featured.length) %
        featured.length;

    renderHero();
    restartSlider();
}

function restartSlider() {
    if (heroTimer) {
        clearInterval(heroTimer);
    }

    heroTimer = setInterval(() => {
        moveHero(1);
    }, 6000);
}

window.renderRows = renderRows;
window.renderHero = renderHero;
window.restartSlider = restartSlider;

/* ---------- DETAILS MODAL ---------- */

function openDetails(movie) {
    const modal = document.getElementById("detailsModal");

    if (!modal) return;

    const poster = document.getElementById("detailPoster");
    const category = document.getElementById("detailCategory");
    const title = document.getElementById("detailTitle");
    const meta = document.getElementById("detailMeta");
    const description = document.getElementById("detailDescription");

    if (poster) {
        poster.src = safeURL(movie.poster) || "";
        poster.alt = movie.title;
    }

    if (category) {
        category.textContent = movie.type.toUpperCase();
    }

    if (title) title.textContent = movie.title;

    if (meta) {
        meta.textContent = [
            movie.year,
            movie.genre,
            movie.rating
        ].filter(Boolean).join(" • ");
    }

    if (description) {
        description.textContent =
            movie.description || "No description available.";
    }

    const languageArea = document.getElementById("languageArea");

    if (languageArea) {
        languageArea.replaceChildren();

        movie.languageLinks.forEach(item => {
            if (!item.url) return;

            const button = document.createElement("button");

            button.type = "button";
            button.className = "language-button";

            button.textContent = [
                item.language,
                item.quality
            ].filter(Boolean).join(" • ");

            button.addEventListener("click", () => {
                openPlayer(movie, item.url, item.language);
            });

            languageArea.appendChild(button);
        });
    }

    const watch = document.getElementById("detailWatch");

    if (watch) {
        watch.onclick = () => {
            const firstLink = movie.languageLinks.find(item => item.url);

            const url = firstLink
                ? firstLink.url
                : movie.videoUrl;

            if (url) {
                openPlayer(
                    movie,
                    url,
                    firstLink ? firstLink.language : "Default"
                );
            } else {
                alert(
                    "இந்தத் திரைப்படத்திற்கு இன்னும் video URL சேர்க்கப்படவில்லை."
                );
            }
        };
    }

    const listButton = document.getElementById("detailList");

    if (listButton) {
        listButton.onclick = () => toggleMyList(movie);
    }

    if (typeof modal.showModal === "function") {
        modal.showModal();
    }
}

/* ---------- VIDEO PLAYER ---------- */

function getYouTubeEmbed(url) {
    try {
        const parsed = new URL(url);
        let videoId = "";

        if (
            parsed.hostname.includes("youtube.com") ||
            parsed.hostname.includes("youtube-nocookie.com")
        ) {
            if (parsed.pathname === "/watch") {
                videoId = parsed.searchParams.get("v") || "";
            } else if (parsed.pathname.startsWith("/embed/")) {
                videoId = parsed.pathname.split("/embed/")[1].split("/")[0];
            } else if (parsed.pathname.startsWith("/shorts/")) {
                videoId = parsed.pathname.split("/shorts/")[1].split("/")[0];
            }
        } else if (parsed.hostname === "youtu.be") {
            videoId = parsed.pathname.slice(1).split("/")[0];
        }

        if (/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
            return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
        }
    } catch (error) {
        console.warn("Could not parse video URL.");
    }

    return "";
}

function isDirectVideoURL(url) {
    try {
        const parsed = new URL(url);

        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return false;
        }

        return /\.(mp4|webm|ogg)(?:$|[?#])/i.test(parsed.href);
    } catch {
        return false;
    }
}

function openPlayer(movie, rawURL, language = "Default") {
    const modal = document.getElementById("playerModal");
    const frame = document.getElementById("videoFrame");
    const title = document.getElementById("playerTitle");
    const playerLanguage = document.getElementById("playerLanguage");
    const downloadArea = document.getElementById("downloadArea");

    if (!modal || !frame) return;

    const url = safeURL(rawURL);

    if (!url) {
        alert("இந்த video URL செல்லுபடியாகவில்லை.");
        return;
    }

    currentPlayerTitle = movie;

    if (title) title.textContent = movie.title;

    if (playerLanguage) {
        playerLanguage.textContent = language || "Default";
    }

    frame.replaceChildren();

    if (downloadArea) {
        downloadArea.replaceChildren();
        downloadArea.classList.add("hidden");
    }

    const embedURL = getYouTubeEmbed(url);

    if (embedURL) {
        const iframe = document.createElement("iframe");

        iframe.src = embedURL;
        iframe.title = movie.title;
        iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";

        frame.appendChild(iframe);
    } else if (isDirectVideoURL(url)) {
        const video = document.createElement("video");

        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.src = url;

        frame.appendChild(video);

        if (downloadArea) {
            if (
                typeof window.tamilflixCreateDownloadButton === "function"
            ) {
                window.tamilflixCreateDownloadButton(url, movie.title);
            } else {
                const downloadLink = document.createElement("a");

                downloadLink.href = url;
                downloadLink.textContent = "⬇ Download Video";
                downloadLink.target = "_blank";
                downloadLink.rel = "noopener noreferrer";
                downloadLink.className = "btn btn-red";

                downloadArea.appendChild(downloadLink);
                downloadArea.classList.remove("hidden");
            }
        }
            downloadLink.href = url;
            downloadLink.textContent = "⬇ Download Video";
            downloadLink.target = "_blank";
            downloadLink.rel = "noopener noreferrer";
            downloadLink.className = "btn btn-red";

            downloadArea.appendChild(downloadLink);
                        downloadArea.classList.remove("hidden");
        }
    } else {
        const message = document.createElement("p");

        message.textContent =
            "இந்த video URL ஆதரிக்கப்படவில்லை. YouTube link அல்லது நேரடி MP4/WebM/OGG URL பயன்படுத்தவும்.";

        frame.appendChild(message);
    }

    if (typeof modal.showModal === "function") {
        modal.showModal();
    }
}

function closePlayer() {
    const frame = document.getElementById("videoFrame");
    const downloadArea = document.getElementById("downloadArea");

    if (frame) frame.replaceChildren();

    if (downloadArea) {
        downloadArea.replaceChildren();
        downloadArea.classList.add("hidden");
    }

    currentPlayerTitle = null;
}

/* ---------- MY LIST ---------- */

function toggleMyList(movie) {
    const list = getMyList();
    const id = String(movie.id);
    const index = list.indexOf(id);

    if (index >= 0) {
        list.splice(index, 1);
        alert("My List-லிருந்து நீக்கப்பட்டது.");
    } else {
        list.push(id);
        alert("My List-ல் சேர்க்கப்பட்டது.");
    }

    saveMyList(list);
    renderRows();
}

window.tamilflixToggleMyList = toggleMyList;

/* ---------- NAVIGATION ---------- */

function setSection(section) {
    currentSection = section || "home";

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === currentSection
        );
    });

    renderRows();

    const nav = document.getElementById("mainNav");

    if (nav) nav.classList.remove("open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

window.tamilflixSetSection = setSection;

/* ---------- LOGIN / REGISTER ---------- */

let authMode = "login";

function showAuth(mode) {
    authMode = mode === "register" ? "register" : "login";

    const modal = document.getElementById("authModal");
    const heading = document.getElementById("authHeading");
    const submit = document.getElementById("authSubmit");
    const message = document.getElementById("authMessage");
    const form = document.getElementById("authForm");

    if (heading) {
        heading.textContent =
            authMode === "register" ? "Create Account" : "Login";
    }

    if (submit) {
        submit.textContent =
            authMode === "register" ? "Register" : "Login";
    }

    if (message) message.textContent = "";

    if (form) form.reset();

    if (modal && typeof modal.showModal === "function") {
        modal.showModal();
    }
}

window.tamilflixShowAuth = showAuth;

async function handleAuthSubmit(event) {
    event.preventDefault();

    const client = getSupabaseClient();

    const email = document.getElementById("authEmail")?.value.trim();
    const password = document.getElementById("authPassword")?.value;
    const message = document.getElementById("authMessage");
    const submit = document.getElementById("authSubmit");

    if (!client) {
        if (message) {
            message.textContent =
                "Supabase configuration-ஐ சரிபார்க்கவும்.";
        }
        return;
    }

    if (!email || !password) {
        if (message) {
            message.textContent = "Email மற்றும் password உள்ளிடவும்.";
        }
        return;
    }

    if (password.length < 6) {
        if (message) {
            message.textContent =
                "Password குறைந்தது 6 characters இருக்க வேண்டும்.";
        }
        return;
    }

    if (submit) submit.disabled = true;

    if (message) message.textContent = "Please wait...";

    try {
        let result;

        if (authMode === "register") {
            result = await client.auth.signUp({
                email,
                password
            });
        } else {
            result = await client.auth.signInWithPassword({
                email,
                password
            });
        }

        if (result.error) {
            throw result.error;
        }

        if (authMode === "register" && !result.data.session) {
            if (message) {
                message.textContent =
                    "Account உருவாக்கப்பட்டது. Email-ஐச் சரிபார்த்து login செய்யவும்.";
            }
        } else {
            if (message) {
                message.textContent = "Login successful!";
            }

            const modal = document.getElementById("authModal");

            if (modal?.open) modal.close();

            await updateAccountUI();
        }
    } catch (error) {
        if (message) {
            message.textContent =
                error.message || "Authentication failed.";
        }
    } finally {
        if (submit) submit.disabled = false;
    }
}

async function updateAccountUI() {
    const client = getSupabaseClient();

    const loginButton = document.getElementById("loginBtn");
    const registerButton = document.getElementById("registerBtn");

    if (!loginButton || !registerButton) return;

    let user = null;

    if (client) {
        try {
            const { data, error } = await client.auth.getUser();

            if (!error) user = data.user;
        } catch (error) {
            console.warn("Could not retrieve account.");
        }
    }

    loginButton.hidden = Boolean(user);
    registerButton.hidden = Boolean(user);

    let accountArea = document.getElementById("accountArea");

    if (!accountArea) {
        accountArea = document.createElement("div");
        accountArea.id = "accountArea";
        accountArea.className = "account-area";

        const authButtons = document.querySelector(".auth-buttons");

        if (authButtons) {
            authButtons.appendChild(accountArea);
        } else {
            registerButton.insertAdjacentElement(
                "afterend",
                accountArea
            );
        }
    }

    accountArea.replaceChildren();

    if (user) {
        const email = document.createElement("span");

        email.className = "account-email";
        email.textContent = user.email || "Logged in";

        const logoutButton = document.createElement("button");

        logoutButton.type = "button";
        logoutButton.className = "btn";
        logoutButton.textContent = "Logout";

        logoutButton.addEventListener("click", async () => {
            if (!client) return;

            const { error } = await client.auth.signOut();

            if (error) {
                alert(error.message);
                return;
            }

            await updateAccountUI();
        });

        accountArea.append(email, logoutButton);
    }
}

/* ---------- MODAL EVENTS ---------- */

function closeDialog(button) {
    const modal = button.closest("dialog");

    if (modal) modal.close();
}

function setupModalEvents() {
    document.querySelectorAll("[data-close]").forEach(button => {
        button.addEventListener("click", () => {
            closeDialog(button);
        });
    });

    document.querySelectorAll("dialog").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.close();
            }
        });
    });

    const playerModal = document.getElementById("playerModal");

    if (playerModal) {
        playerModal.addEventListener("close", closePlayer);
    }
}

/* ---------- INITIALIZATION ---------- */

function init() {
    const year = document.getElementById("yearNow");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    rebuildTitles();

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            currentSearch = event.target.value.trim();
            renderRows();
        });
    }

    document.querySelectorAll("[data-section]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            setSection(link.dataset.section);
        });
    });

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            mainNav.classList.toggle("open");
        });
    }

    document.getElementById("loginBtn")?.addEventListener(
        "click",
        () => showAuth("login")
    );

    document.getElementById("registerBtn")?.addEventListener(
        "click",
        () => showAuth("register")
    );

    document.getElementById("prevSlide")?.addEventListener(
        "click",
        () => moveHero(-1)
    );

    document.getElementById("nextSlide")?.addEventListener(
        "click",
        () => moveHero(1)
    );

    document.getElementById("authForm")?.addEventListener(
        "submit",
        handleAuthSubmit
    );

    setupModalEvents();
    restartSlider();

    const client = getSupabaseClient();

    if (client) {
        client.auth.onAuthStateChange(() => {
            setTimeout(() => {
                updateAccountUI();
            }, 0);
        });
    }

    updateAccountUI();

    window.addEventListener(
        "tamilflix:movies-updated",
        event => {
            if (Array.isArray(event.detail)) {
                setDatabaseMovies(event.detail);
            }
        }
    );
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
         }
