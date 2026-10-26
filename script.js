/*
 Tamilflix website
 Login, Register, Account, Logout, Movies, Search,
 My List, Video Player and Supabase session support.
*/

const DEMO_TITLES = [
  {
    id: "leo",
    title: "Leo",
    year: "2023",
    genre: "Action • Thriller",
    rating: "UA",
    type: "movie",
    description: "Action thriller.",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1800&auto=format&fit=crop",
    videoUrl: "",
    languageLinks: []
  },
  {
    id: "jailer",
    title: "Jailer",
    year: "2023",
    genre: "Action • Crime",
    rating: "UA",
    type: "movie",
    description: "Action movie.",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: []
  },
  {
    id: "vikram",
    title: "Vikram",
    year: "2022",
    genre: "Action • Thriller",
    rating: "UA",
    type: "movie",
    description: "Action thriller.",
    poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: []
  },
  {
    id: "master",
    title: "Master",
    year: "2021",
    genre: "Action • Drama",
    rating: "UA",
    type: "movie",
    description: "Action drama.",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: []
  },
  {
    id: "movie-multilang-demo",
    title: "Multi-language Movie Demo",
    year: "2025",
    genre: "Adventure • Action",
    rating: "UA",
    type: "movie",
    description: "Example of multiple audio-language versions.",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: [
      { language: "Tamil", videoUrl: "" },
      { language: "Sinhala", videoUrl: "" },
      { language: "English", videoUrl: "" },
      { language: "Hindi", videoUrl: "" },
      { language: "Telugu", videoUrl: "" }
    ]
  },
  {
    id: "movie-no-language",
    title: "Single Video Movie Demo",
    year: "2024",
    genre: "Drama",
    rating: "U",
    type: "movie",
    description: "Single-video demo.",
    poster: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: []
  },
  {
    id: "marvel-demo-1",
    title: "Marvel Title Demo",
    year: "2025",
    genre: "Superhero • Action",
    rating: "13+",
    type: "marvel",
    description: "Superhero demo.",
    poster: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: [
      { language: "Tamil", videoUrl: "" },
      { language: "English", videoUrl: "" },
      { language: "Hindi", videoUrl: "" },
      { language: "Telugu", videoUrl: "" },
      { language: "Sinhala", videoUrl: "" }
    ]
  },
  {
    id: "marvel-demo-2",
    title: "Superhero Collection",
    year: "2024",
    genre: "Superhero • Sci-Fi",
    rating: "13+",
    type: "marvel",
    description: "Superhero demo.",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: []
  },
  {
    id: "anime-demo-1",
    title: "Anime Adventure",
    year: "2025",
    genre: "Anime • Adventure",
    rating: "13+",
    type: "anime",
    description: "Anime adventure demo.",
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: [
      { language: "Tamil Dub", videoUrl: "" },
      { language: "Japanese", videoUrl: "" },
      { language: "English Dub", videoUrl: "" },
      { language: "Hindi Dub", videoUrl: "" },
      { language: "Sinhala Dub", videoUrl: "" }
    ]
  },
  {
    id: "anime-demo-2",
    title: "Anime Mystery",
    year: "2024",
    genre: "Anime • Mystery",
    rating: "13+",
    type: "anime",
    description: "Anime mystery demo.",
    poster: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: []
  },
  {
    id: "series-demo",
    title: "Series Collection",
    year: "2025",
    genre: "Drama • Series",
    rating: "13+",
    type: "series",
    description: "Series demo.",
    poster: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&auto=format&fit=crop",
    backdrop: "",
    videoUrl: "",
    languageLinks: []
  }
];

const $ = id => document.getElementById(id);

let titles = loadTitles();
let slideIndex = 0;
let slideTimer = null;
let activeSection = "home";
let query = "";
let selectedTitle = null;
let selectedVideoUrl = "";
let authListenerRegistered = false;

function loadTitles() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("tamilflix_titles") || "null"
    );

    return Array.isArray(stored) && stored.length
      ? stored
      : DEMO_TITLES;
  } catch {
    return DEMO_TITLES;
  }
}

function saveTitles() {
  localStorage.setItem(
    "tamilflix_titles",
    JSON.stringify(titles)
  );
}

function getMyList() {
  try {
    return JSON.parse(
      localStorage.getItem("tamilflix_mylist") || "[]"
    );
  } catch {
    return [];
  }
}

function setMyList(list) {
  localStorage.setItem(
    "tamilflix_mylist",
    JSON.stringify(list)
  );
}

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getSupabaseClient() {
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

  window.tamilflixSupabase =
    window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );

  return window.tamilflixSupabase;
}

/* ---------------- MOVIE CARDS ---------------- */

function card(t) {
  const genre = String(t.genre || "")
    .split("•")[0]
    .trim();

  return `
    <article class="poster-card"
      data-id="${esc(t.id)}"
      tabindex="0"
      role="button">

      <div class="poster-image-wrap">
        <img
          class="poster-image"
          src="${esc(t.poster || "")}"
          alt="${esc(t.title)} poster"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/400x600/171a22/ffffff?text=Tamilflix'">

        <span class="poster-play">▶</span>
      </div>

      <h3 class="poster-title">${esc(t.title)}</h3>

      <p class="poster-meta">
        ${esc(t.year || "")} · ${esc(genre)}
        <span class="rating">${esc(t.rating || "U")}</span>
      </p>
    </article>
  `;
}

function filteredTitles() {
  return titles.filter(t => {
    const text = [
      t.title,
      t.genre,
      t.year,
      t.type
    ].join(" ").toLowerCase();

    return !query || text.includes(query.toLowerCase());
  });
}

/* ---------------- RENDER MOVIES ---------------- */

function renderRows() {
  const list = filteredTitles();
  const home = activeSection === "home" && !query;

  const groups = [
    ["trendingSection", "trendingMovies", t => t.type === "movie"],
    ["marvelSection", "marvelTitles", t => t.type === "marvel"],
    ["animeSection", "animeTitles", t => t.type === "anime"],
    ["seriesSection", "popularSeries", t => t.type === "series"],
    [
      "noLangSection",
      "noLangMovies",
      t => t.type === "movie" &&
        !(t.languageLinks || []).length
    ]
  ];

  groups.forEach(([section, container, filter]) => {
    if ($(section)) {
      $(section).classList.toggle("hidden", !home);
    }

    if ($(container)) {
      $(container).innerHTML =
        list.filter(filter).slice(0, 14).map(card).join("");
    }
  });

  const showAll =
    !!query ||
    ["movies", "marvel", "anime", "series"].includes(activeSection);

  if ($("allSection")) {
    $("allSection").classList.toggle("hidden", !showAll);
  }

  if ($("myListSection")) {
    $("myListSection").classList.toggle(
      "hidden",
      activeSection !== "mylist"
    );
  }

  if (showAll) {
    const types = {
      movies: ["movie"],
      marvel: ["marvel"],
      anime: ["anime"],
      series: ["series"]
    };

    const arr = list.filter(t =>
      query || (types[activeSection] || []).includes(t.type)
    );

    if ($("allHeading")) {
      $("allHeading").textContent = query
        ? `Search: ${query}`
        : ({
            movies: "Movies",
            marvel: "Marvel",
            anime: "Anime",
            series: "Series"
          }[activeSection] || "Search Results");
    }

    if ($("resultCount")) {
      $("resultCount").textContent = `${arr.length} titles`;
    }

    if ($("allItems")) {
      $("allItems").innerHTML = arr.map(card).join("");
    }
  }

  if (activeSection === "mylist" && $("myListItems")) {
    const myList = getMyList();

    const arr = titles.filter(t =>
      myList.some(id => String(id) === String(t.id))
    );

    $("myListItems").innerHTML = arr.map(card).join("");
  }

  const count = showAll
    ? list.filter(t =>
        query ||
        ({
          movies: t.type === "movie",
          marvel: t.type === "marvel",
          anime: t.type === "anime",
          series: t.type === "series"
        }[activeSection] || false)
      ).length
    : activeSection === "mylist"
      ? titles.filter(t =>
          getMyList().some(id => String(id) === String(t.id))
        ).length
      : list.length;

  if ($("emptyState")) {
    $("emptyState").classList.toggle("hidden", count > 0);
  }

  bindCards();
}

/* ---------------- HERO SLIDER ---------------- */

function renderHero() {
  if (!$("hero")) return;

  const featured = titles
    .filter(t => ["movie", "marvel", "anime"].includes(t.type))
    .slice(0, 5);

  if (!featured.length) return;

  slideIndex = ((slideIndex % featured.length) + featured.length)
    % featured.length;

  const t = featured[slideIndex];

  $("hero").style.backgroundImage =
    `url("${t.backdrop || t.poster || ""}")`;

  if ($("heroTitle")) {
    $("heroTitle").textContent = t.title || "";
  }

  if ($("heroMeta")) {
    $("heroMeta").textContent =
      `${t.year || ""} • ${t.genre || ""} • ${t.rating || "U"}`;
  }

  if ($("heroDescription")) {
    $("heroDescription").textContent =
      t.description || "Discover this title on Tamilflix.";
  }

  if ($("heroWatch")) {
    $("heroWatch").onclick = () => openDetails(t);
  }

  if ($("heroList")) {
    $("heroList").onclick = () => toggleList(t);
  }

  if ($("sliderDots")) {
    $("sliderDots").innerHTML = featured.map((x, i) => `
      <button
        class="slider-dot ${i === slideIndex ? "active" : ""}"
        data-slide="${i}"
        aria-label="Show ${esc(x.title)}">
      </button>
    `).join("");

    $("sliderDots").querySelectorAll("button").forEach(button => {
      button.onclick = () => {
        slideIndex = Number(button.dataset.slide);
        renderHero();
        restartSlider();
      };
    });
  }
}

function nextSlide(amount = 1) {
  const count = titles
    .filter(t => ["movie", "marvel", "anime"].includes(t.type))
    .slice(0, 5).length;

  if (count) {
    slideIndex = (slideIndex + amount + count) % count;
    renderHero();
  }
}

function restartSlider() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => nextSlide(1), 5000);
}

/* ---------------- DETAILS AND PLAYER ---------------- */

function openDetails(t) {
  selectedTitle = t;

  if (!$("detailsModal")) return;

  $("detailPoster").src = t.poster || "";

  $("detailPoster").onerror = () => {
    $("detailPoster").src =
      "https://placehold.co/400x600/171a22/ffffff?text=Tamilflix";
  };

  $("detailTitle").textContent = t.title || "";

  $("detailMeta").textContent =
    `${t.year || ""} • ${t.genre || ""} • ${t.rating || "U"}`;

  $("detailDescription").textContent = t.description || "";

  $("detailCategory").textContent =
    String(t.type || "movie").toUpperCase();

  const langs = Array.isArray(t.languageLinks)
    ? t.languageLinks
    : [];

  if (langs.length) {
    $("languageArea").innerHTML = `
      <div class="language-title">Choose audio language / version</div>
      <div class="language-links">
        ${langs.map((lang, i) => `
          <button
            class="language-btn ${i === 0 ? "selected" : ""}"
            data-lang="${i}">
            ${esc(lang.language || "Version")}
          </button>
        `).join("")}
      </div>
    `;

    selectedVideoUrl = langs[0].videoUrl || "";

    $("languageArea")
      .querySelectorAll("[data-lang]")
      .forEach(button => {
        button.onclick = () => {
          $("languageArea")
            .querySelectorAll(".language-btn")
            .forEach(item => item.classList.remove("selected"));

          button.classList.add("selected");

          const lang = langs[Number(button.dataset.lang)];

          selectedVideoUrl = lang.videoUrl || "";

          $("detailWatch").textContent =
            `▶ Watch ${lang.language || "Version"}`;
        };
      });
  } else {
    $("languageArea").innerHTML =
      `<p class="no-language-note">Single video • No language selection</p>`;

    selectedVideoUrl = t.videoUrl || "";
  }

  $("detailWatch").textContent = langs.length
    ? `▶ Watch ${langs[0].language || "Version"}`
    : "▶ Watch Now";

  $("detailWatch").onclick = () => {
    const language = langs.length
      ? ($("languageArea").querySelector(".selected")?.textContent || "")
      : "";

    openPlayer(t, selectedVideoUrl, language);
  };

  $("detailList").onclick = () => toggleList(t);

  $("detailsModal").showModal();
}

function getEmbed(raw) {
  try {
    const url = new URL(raw);
    let id = "";

    if (url.hostname.includes("youtu.be")) {
      id = url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      id =
        url.searchParams.get("v") ||
        url.pathname.match(/\/embed\/([^/?]+)/)?.[1] ||
        url.pathname.match(/\/shorts\/([^/?]+)/)?.[1] ||
        "";
    }

    return id
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`
      : "";
  } catch {
    return "";
  }
}

/* ---------------- VIDEO PLAYER + DOWNLOAD ---------------- */

function openPlayer(t, url = "", language = "") {
  selectedTitle = t;

  const modal = $("playerModal");
  const frame = $("videoFrame");

  if (!modal || !frame) return;

  $("playerTitle").textContent = t.title || "Movie";

  $("playerLanguage").textContent = language
    ? `Language: ${language}`
    : "";

  // Get quality links saved in the existing languages field.
  const links = Array.isArray(t.languageLinks)
    ? t.languageLinks.filter(item =>
        item &&
        typeof item.url === "string" &&
        item.url.trim()
      )
    : [];

  const directVideoPattern = /\.(mp4|webm|ogg)(?:[?#].*)?$/i;

  function isDirectVideo(link) {
    return directVideoPattern.test(link) ||
      /\/storage\/v1\/object\/public\//i.test(link);
  }

  function safeUrl(value) {
    try {
      const parsed = new URL(value, window.location.href);

      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return "";
      }

      return parsed.href;
    } catch {
      return "";
    }
  }

  function renderVideo(videoUrl) {
    const safe = safeUrl(videoUrl);

    if (!safe) {
      frame.innerHTML = "<p>Invalid video URL.</p>";
      return;
    }

    const embed = getEmbed(safe);

    if (embed) {
      frame.innerHTML = `
        <iframe
          src="${esc(embed)}"
          title="${esc(t.title || "Movie")}"
          allow="accelerometer; autoplay; clipboard-write;
                 encrypted-media; gyroscope; picture-in-picture;
                 web-share"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
          style="width:100%;aspect-ratio:16/9;border:0"
        ></iframe>

        <p style="margin-top:12px">
          const loadingMessage = document.createElement("div");
loadingMessage.id = "videoLoadingMessage";
loadingMessage.textContent = "🎬 Video loading, please wait...";
loadingMessage.style.cssText = `
    color: white;
    text-align: center;
    padding: 30px 10px;
    font-size: 16px;
`;

videoFrame.innerHTML = "";
videoFrame.appendChild(loadingMessage); </p>
      `;

      return;
    }

    if (!isDirectVideo(safe)) {
      frame.innerHTML = `
        <p>This link is not a recognized direct video file.</p>
        <a href="${esc(safe)}"
           target="_blank"
           rel="noopener noreferrer">
          Open video link
        </a>
      `;
      return;
    }

    frame.innerHTML = `
      <video
        id="tamilflixVideo"
        controls
        playsinline
        preload="metadata"
        style="width:100%;max-height:70vh;background:#000"
      >
        <source src="${esc(safe)}">
        Your browser does not support video playback.
      </video>

      <a
        href="${esc(safe)}"
        download
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-red"
        style="display:inline-flex;margin-top:12px;text-decoration:none"
      >⬇️ Download</a>
    `;
  }

  // Create quality selector if multiple direct video files exist.
  const qualityLinks = links.filter(item =>
    isDirectVideo(safeUrl(item.url) || "")
  );

  if (qualityLinks.length > 0) {
    const options = qualityLinks.map((item, index) => `
      <option value="${index}">
        ${esc(item.quality || item.language || `Quality ${index + 1}`)}
      </option>
    `).join("");

    frame.innerHTML = `
      <label for="tamilflixQuality">Video quality:</label>
      <select id="tamilflixQuality" style="margin:8px;padding:8px">
        ${options}
      </select>
      <div id="tamilflixVideoArea"></div>
    `;

    const select = $("tamilflixQuality");
    const area = $("tamilflixVideoArea");

    function showSelectedQuality() {
      const item = qualityLinks[Number(select.value)];
      if (!item) return;

      // Render inside a temporary container.
      const oldFrame = $("videoFrame");
      const originalHTML = oldFrame.innerHTML;

      oldFrame.innerHTML = "";
      renderVideo(item.url);

      const renderedHTML = oldFrame.innerHTML;
      oldFrame.innerHTML = originalHTML;

      area.innerHTML = renderedHTML;
    }

    select.addEventListener("change", showSelectedQuality);
    showSelectedQuality();
  } else {
    renderVideo(url || t.videoUrl || "");
  }

  if ($("detailsModal")?.open) {
    $("detailsModal").close();
  }

  if (!modal.open) {
    modal.showModal();
  }
}

/* ---------------- MY LIST ---------------- */

function toggleList(t) {
  const list = getMyList();
  const id = String(t.id);

  const updated = list.some(item => String(item) === id)
    ? list.filter(item => String(item) !== id)
    : [...list, id];

  setMyList(updated);
  renderRows();
}

function bindCards() {
  document.querySelectorAll(".poster-card").forEach(element => {
    const open = () => {
      const movie = titles.find(
        item => String(item.id) === String(element.dataset.id)
      );

      if (movie) openDetails(movie);
    };

    element.onclick = open;

    element.onkeydown = event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    };
  });
}

/* ---------------- NAVIGATION ---------------- */

function setSection(section) {
  activeSection = section;

  if (section === "home") {
    query = "";
  }

  if ($("searchInput")) {
    $("searchInput").value = query;
  }

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === section
    );
  });

  renderRows();

  if (window.innerWidth < 800 && $("mainNav")) {
    $("mainNav").classList.remove("open");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- LOGIN / REGISTER ---------------- */

function showAuth(mode) {
  if (!$("authModal")) return;

  $("authHeading").textContent =
    mode === "login" ? "Login" : "Create Account";

  $("authSubmit").textContent =
    mode === "login" ? "Login" : "Register";

  $("authMessage").textContent = "";
  $("authForm").reset();
  $("authModal").showModal();
}

/* Display signed-in account email and Logout button. */
async function updateAccountUI() {
  const client = getSupabaseClient();

  let user = null;

  if (client) {
    const { data, error } = await client.auth.getSession();

    if (!error) {
      user = data.session?.user || null;
    }
  }

  const loginButton = $("loginBtn");
  const registerButton = $("registerBtn");

  if (loginButton) {
  loginButton.hidden = !!user;
}

if (registerButton) {
  registerButton.hidden = !!user;
}

  let area = $("accountArea");

  if (!area) {
    area = document.createElement("div");
    area.id = "accountArea";
    area.className = "account-area";

    const container = document.querySelector(".auth-buttons");

    if (container) {
      container.appendChild(area);
    }
  }

  if (!area) return;

  if (!user) {
    area.innerHTML = "";
    return;
  }

  area.innerHTML = `
    <span class="account-email" title="${esc(user.email || "")}">
      ${esc(user.email || "Signed in")}
    </span>
    <button type="button" id="logoutBtn" class="btn btn-outline">
      Logout
    </button>
  `;

  $("logoutBtn").onclick = async () => {
    const button = $("logoutBtn");
    button.disabled = true;

    const { error } = await client.auth.signOut();

    if (error) {
      alert("Logout failed: " + error.message);
      button.disabled = false;
      return;
    }

    await updateAccountUI();
  };
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  const message = $("authMessage");
  const button = $("authSubmit");
  const client = getSupabaseClient();

  if (!client) {
    message.textContent =
      "Supabase configuration missing. Please check setup.";
    return;
  }

  button.disabled = true;
  message.textContent = "Please wait...";

  try {
    if (
      $("authHeading").textContent.trim().toLowerCase() === "login"
    ) {
      const { error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      message.textContent = "Login successful!";

      await updateAccountUI();

      setTimeout(() => {
        if ($("authModal")?.open) {
          $("authModal").close();
        }
      }, 700);
    } else {
      const { data, error } = await client.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        message.textContent = "Account created successfully!";

        await updateAccountUI();

        setTimeout(() => {
          if ($("authModal")?.open) {
            $("authModal").close();
          }
        }, 700);
      } else {
        message.textContent =
          "Account created. Please check your email to confirm it.";
      }
    }
  } catch (error) {
    message.textContent =
      error.message || "Something went wrong.";
  } finally {
     button.disabled = false;
  }
}

/* ---------------- INITIALIZATION ---------------- */

async function init() {
  if ($("yearNow")) {
    $("yearNow").textContent = new Date().getFullYear();
  }

  renderRows();
  renderHero();
  restartSlider();

  if ($("prevSlide")) {
    $("prevSlide").onclick = () => {
      nextSlide(-1);
      restartSlider();
    };
  }

  if ($("nextSlide")) {
    $("nextSlide").onclick = () => {
      nextSlide(1);
      restartSlider();
    };
  }

  if ($("searchInput")) {
    $("searchInput").addEventListener("input", event => {
      query = event.target.value.trim();
      activeSection = "home";
      renderRows();
    });
  }

  document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => {
      setSection(button.dataset.section);
    });
  });

  if ($("menuToggle")) {
    $("menuToggle").onclick = () => {
      $("mainNav")?.classList.toggle("open");
    };
  }

  if ($("loginBtn")) {
    $("loginBtn").onclick = () => showAuth("login");
  }

  if ($("registerBtn")) {
    $("registerBtn").onclick = () => showAuth("register");
  }

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
      const modal = $(button.dataset.close);

      if (modal && typeof modal.close === "function") {
        modal.close();
      }
    });
  });

  document.querySelectorAll("dialog").forEach(dialog => {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });

  if ($("playerModal")) {
    $("playerModal").addEventListener("close", () => {
      if ($("videoFrame")) {
        $("videoFrame").innerHTML = "";
      }
    });
  }

  if ($("authForm")) {
    $("authForm").addEventListener("submit", handleAuthSubmit);
  }

  let touchStartX = 0;

  if ($("hero")) {
    $("hero").addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    $("hero").addEventListener("touchend", event => {
      const delta =
        event.changedTouches[0].screenX - touchStartX;

      if (Math.abs(delta) > 45) {
        nextSlide(delta < 0 ? 1 : -1);
        restartSlider();
      }
    }, { passive: true });
  }

  const client = getSupabaseClient();

  if (client && !authListenerRegistered) {
    authListenerRegistered = true;

    client.auth.onAuthStateChange(() => {
      setTimeout(() => {
        updateAccountUI();
      }, 0);
    });
  }

  await updateAccountUI();
}

document.addEventListener("DOMContentLoaded", init);
