/* Tamilflix frontend. Local demo titles are included; replace with authorised content. */
(function(){
"use strict";
const STORAGE_KEY="tamilflix_titles";
const LIST_KEY="tamilflix_my_list";
const demoTitles=[
{id:"demo1",title:"Spider-Man: No Way Home",year:2021,category:"Marvel",genre:"Action / Adventure",rating:8.2,language:"English",poster:"https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",backdrop:"https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",description:"A young hero faces a world-changing challenge.",video:""},
{id:"demo2",title:"Avengers: Endgame",year:2019,category:"Marvel",genre:"Action / Sci-Fi",rating:8.4,language:"English",poster:"https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",backdrop:"https://image.tmdb.org/t/p/w1280/7RyHsO4ySX3R2w0II0L1lI1M4x8.jpg",description:"The heroes unite for a final battle.",video:""},
{id:"demo3",title:"Your Name",year:2016,category:"Anime",genre:"Animation / Romance",rating:8.4,language:"Japanese",poster:"https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgknONONX.jpg",backdrop:"",description:"Two teenagers discover a mysterious connection.",video:""},
{id:"demo4",title:"Interstellar",year:2014,category:"Movies",genre:"Sci-Fi / Drama",rating:8.7,language:"English",poster:"https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",backdrop:"",description:"Explorers travel beyond the limits of known space.",video:""},
{id:"demo5",title:"The Mandalorian",year:2019,category:"Series",genre:"Sci-Fi / Adventure",rating:8.6,language:"English",poster:"https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg",backdrop:"",description:"A lone bounty hunter navigates a dangerous galaxy.",video:""},
{id:"demo6",title:"Demon Slayer",year:2019,category:"Anime",genre:"Anime / Action",rating:8.6,language:"Japanese",poster:"https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6gEMu3f.jpg",backdrop:"",description:"A young swordsman seeks a cure for his sister.",video:""}
];
let titles=loadTitles();
let heroIndex=0, heroTimer=null, authMode="login";
const $=id=>document.getElementById(id);
function loadTitles(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):demoTitles.slice()}catch(e){return demoTitles.slice()}}
function saveTitles(){localStorage.setItem(STORAGE_KEY,JSON.stringify(titles))}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function getList(){try{return JSON.parse(localStorage.getItem(LIST_KEY)||"[]")}catch(e){return []}}
function setList(list){localStorage.setItem(LIST_KEY,JSON.stringify(list))}
function toast(message){const el=$("toast");if(!el)return;el.textContent=message;el.classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.add("hidden"),2600)}
function posterFallback(title){return "https://placehold.co/500x750/151927/ffffff?text="+encodeURIComponent(title||"Tamilflix")}
function posterFor(item){return item.poster||posterFallback(item.title)}
const LANGUAGES=["Tamil","Sinhala","English","Hindi","Telugu"];
function languageVideos(item){const saved={...(item.languageVideos||{})};if(item.video&&!Object.values(saved).some(Boolean)){saved[item.language||"English"]=item.video}return saved}
function videoFor(item,language){return languageVideos(item)[language]||""}
function firstAvailableLanguage(item){const urls=languageVideos(item);return LANGUAGES.find(lang=>urls[lang])||item.language||"Tamil"}
function card(item){return `<article class="movie-card" data-movie-id="${escapeHtml(item.id)}"><div class="poster-wrap"><img loading="lazy" src="${escapeHtml(posterFor(item))}" alt="${escapeHtml(item.title)} poster" onerror="this.onerror=null;this.src='${posterFallback(item.title)}'"><div class="card-overlay"><button type="button" data-open-movie="${escapeHtml(item.id)}" aria-label="View ${escapeHtml(item.title)}">▶</button><button type="button" data-list-movie="${escapeHtml(item.id)}" aria-label="Add ${escapeHtml(item.title)} to My List">♡</button></div></div><h3>${escapeHtml(item.title)}</h3><div class="movie-meta"><span>${escapeHtml(item.year||"—")} · ${escapeHtml(item.category||"Movies")}</span><span class="rating">★ ${escapeHtml(item.rating||"—")}</span></div></article>`}
function renderGrid(id,items){const el=$(id);if(!el)return;el.innerHTML=items.length?items.map(card).join(""):'<div class="empty-state">No titles here yet.</div>'}
function render(){
 const search=($("searchInput")?.value||"").trim().toLowerCase();
 const visible=titles.filter(t=>!search||[t.title,t.genre,t.category,t.language,t.year].join(" ").toLowerCase().includes(search));
 renderGrid("trendingGrid",visible.filter(t=>t.category!=="Marvel"&&t.category!=="Anime"&&t.category!=="Series").slice(0,12));
 renderGrid("marvelGrid",visible.filter(t=>t.category==="Marvel"));
 renderGrid("animeGrid",visible.filter(t=>t.category==="Anime"));
 renderGrid("seriesGrid",visible.filter(t=>t.category==="Series"));
 const list=getList();renderGrid("myListGrid",visible.filter(t=>list.includes(String(t.id))));
 renderHero();
 if(window.renderAdminList)window.renderAdminList();
}
function renderHero(){
 const featured=titles.filter(t=>t.poster);
 if(!featured.length)return;
 heroIndex=((heroIndex%featured.length)+featured.length)%featured.length;
 const item=featured[heroIndex];
 if($("heroTitle"))$("heroTitle").innerHTML=escapeHtml(item.title).replace(/&lt;br&gt;/g,"<br>");
 if($("heroDescription"))$("heroDescription").textContent=[item.year,item.genre,item.language].filter(Boolean).join(" • ")||"Movies • Series • Entertainment";
 if($("heroPoster"))$("heroPoster").src=item.poster||posterFallback(item.title);
 const hero=document.querySelector(".hero");
 if(hero&&item.backdrop)hero.style.backgroundImage=`linear-gradient(90deg,rgba(17,20,33,.97),rgba(17,20,33,.78)),url("${item.backdrop}")`;
 const dots=$("carouselDots");if(dots)dots.innerHTML=featured.slice(0,8).map((_,i)=>`<button class="${i===heroIndex?"active":""}" data-hero-index="${i}" aria-label="Show featured title ${i+1}"></button>`).join("");
}
function startCarousel(){clearInterval(heroTimer);heroTimer=setInterval(()=>{heroIndex++;renderHero()},5000)}
function openMovie(id){const item=titles.find(t=>String(t.id)===String(id));if(!item)return;
 const urls=languageVideos(item),active=firstAvailableLanguage(item);
 const languageButtons=LANGUAGES.map(lang=>`<button type="button" class="language-choice ${lang===active?"selected":""}" data-select-language="${lang}" aria-pressed="${lang===active}" ${videoFor(item,lang)?"":"disabled title=\"Video not added yet\""}>${lang}${videoFor(item,lang)?"":" · unavailable"}</button>`).join("");
 const details=$("movieDetails");details.dataset.movieId=String(item.id);details.dataset.selectedLanguage=active;
 details.innerHTML=`<div class="movie-detail-layout"><img src="${escapeHtml(posterFor(item))}" alt="${escapeHtml(item.title)} poster" onerror="this.onerror=null;this.src='${posterFallback(item.title)}'"><div><span class="movie-badge">${escapeHtml(item.category||"Movie")}</span><h2>${escapeHtml(item.title)}</h2><p class="movie-meta">${escapeHtml(item.year||"")} &nbsp; ★ ${escapeHtml(item.rating||"—")}</p><p>${escapeHtml(item.description||"No description available.")}</p><h3 class="language-heading">Choose language</h3><div class="language-choices">${languageButtons}</div><p class="selected-language-note" id="selectedLanguageNote">Selected: ${escapeHtml(active)}${videoFor(item,active)?"":" — video URL not added yet"}</p><div class="detail-actions detail-actions-stacked"><button class="watch-download-btn" data-play-movie="${escapeHtml(item.id)}">▶ WATCH NOW</button><button class="watch-download-btn" data-download-movie="${escapeHtml(item.id)}">⬇ DOWNLOAD</button><button class="btn btn-ghost" data-list-movie="${escapeHtml(item.id)}">♡ Add to My List</button></div><p class="muted">Add a separate authorised video URL for each language in Admin Panel. Download availability depends on the video host.</p></div></div>`;
 $("movieModal").classList.remove("hidden")}
function toggleList(id){id=String(id);let list=getList();if(list.includes(id)){list=list.filter(x=>x!==id);toast("Removed from My List")}else{list.push(id);toast("Added to My List")}setList(list);render()}
function showAuth(mode){authMode=mode;$("authTitle").textContent=mode==="login"?"Login to Tamilflix":"Create your Tamilflix account";$("authSubmit").textContent=mode==="login"?"Login":"Register";$("authSwitchText").textContent=mode==="login"?"New to Tamilflix?":"Already have an account?";$("authSwitch").textContent=mode==="login"?"Create account":"Login";$("authMessage").textContent="";$("authModal").classList.remove("hidden")}
async function submitAuth(e) {
    e.preventDefault();

    const email = $("authEmail").value;
    const password = $("authPassword").value;
    const sb = window.supabaseClient;

    try {
        if (!sb?.auth) {
            throw new Error("Supabase Auth is unavailable.");
        }

        const result = authMode === "login"
            ? await sb.auth.signInWithPassword({ email, password })
            : await sb.auth.signUp({ email, password });

        if (result.error) {
            throw result.error;
        }

        if (authMode === "login" && result.data?.user) {
            updateAuthUI(result.data.user);
            $("authModal").classList.add("hidden");
            toast("Login successful!");
        } else {
            $("authMessage").textContent =
                "Check your email if confirmation is enabled.";
        }

    } catch (err) {
        $("authMessage").textContent =
            err.message || "Authentication failed.";
    }
}
 // Update the header when login state changes
function updateAuthUI(user) {
    const authButtons = $("authButtons");
    const userAccount = $("userAccount");
    const userEmail = $("userEmail");

    if (user) {
        authButtons?.classList.add("hidden");
        userAccount?.classList.remove("hidden");

        if (userEmail) {
            userEmail.textContent = user.email || "My Account";
        }
    } else {
        authButtons?.classList.remove("hidden");
        userAccount?.classList.add("hidden");
    }
}

// Restore the login state after refreshing the page
async function initialiseAuth() {
    const sb = window.supabaseClient;

    if (!sb?.auth) {
        console.error("Tamilflix: Supabase Auth is unavailable.");
        return;
    }

    const { data, error } = await sb.auth.getSession();

    if (error) {
        console.error("Unable to restore session:", error.message);
        return;
    }

    updateAuthUI(data.session?.user || null);

    sb.auth.onAuthStateChange((_event, session) => {
        updateAuthUI(session?.user || null);
    });
}

// Logout
$("logoutBtn")?.addEventListener("click", async () => {
    const sb = window.supabaseClient;

    if (!sb?.auth) {
        toast("Supabase Auth is unavailable.");
        return;
    }

    const { error } = await sb.auth.signOut();

    if (error) {
        toast(error.message || "Logout failed.");
        return;
    }

    updateAuthUI(null);
    toast("Logged out successfully.");
});

initialiseAuth();
document.addEventListener("click",e=>{
 const close=e.target.closest("[data-close]");if(close){$(close.dataset.close)?.classList.add("hidden");return}
 const open=e.target.closest("[data-open-movie]");if(open){openMovie(open.dataset.openMovie);return}
 const add=e.target.closest("[data-list-movie]");if(add){toggleList(add.dataset.listMovie);return}
 const language=e.target.closest("[data-select-language]");if(language){if(language.disabled)return;const details=$("movieDetails"),item=titles.find(t=>String(t.id)===details.dataset.movieId);if(!item)return;details.dataset.selectedLanguage=language.dataset.selectLanguage;details.querySelectorAll("[data-select-language]").forEach(btn=>{btn.classList.toggle("selected",btn===language);btn.setAttribute("aria-pressed",btn===language?"true":"false")});const note=$("selectedLanguageNote");if(note)note.textContent="Selected: "+details.dataset.selectedLanguage+(videoFor(item,details.dataset.selectedLanguage)?"":" — video URL not added yet");return}
 const play=e.target.closest("[data-play-movie]");if(play){const item=titles.find(t=>String(t.id)===play.dataset.playMovie);const lang=$("movieDetails").dataset.selectedLanguage||firstAvailableLanguage(item||{});const video=item&&videoFor(item,lang);if(item&&video){window.TamilflixPlayer?.open({...item,video,language:lang});}else toast("Add an authorised video URL for this language in Admin Panel.");return}
 const dl=e.target.closest("[data-download-movie]");if(dl){const lang=$("movieDetails").dataset.selectedLanguage||"Tamil";window.TamilflixDownload?.(dl.dataset.downloadMovie,lang);return}
 const dot=e.target.closest("[data-hero-index]");if(dot){heroIndex=Number(dot.dataset.heroIndex);renderHero();startCarousel();return}
 const all=e.target.closest("[data-show-all]");if(all){const category=all.dataset.showAll;const matching=category==="all"?titles:titles.filter(t=>t.category===category);toast(`${matching.length} title(s) in ${category}`);return}
});
$("searchForm")?.addEventListener("submit",e=>{e.preventDefault();render();document.querySelector("#movies")?.scrollIntoView({behavior:"smooth"})});
$("searchInput")?.addEventListener("input",render);
$("prevSlide")?.addEventListener("click",()=>{heroIndex--;renderHero();startCarousel()});
$("nextSlide")?.addEventListener("click",()=>{heroIndex++;renderHero();startCarousel()});
$("heroExplore")?.addEventListener("click",()=>$("movies").scrollIntoView({behavior:"smooth"}));
$("heroInfo")?.addEventListener("click",()=>openMovie(titles[heroIndex%titles.length]?.id));
$("loginBtn")?.addEventListener("click",()=>showAuth("login"));
$("registerBtn")?.addEventListener("click",()=>showAuth("register"));
$("openAdminBtn")?.addEventListener("click", () => {
    $("adminModal")?.classList.remove("hidden");
});
 $("authSwitch")?.addEventListener("click",()=>showAuth(authMode==="login"?"register":"login"));
$("authForm")?.addEventListener("submit",submitAuth);
$("menuToggle")?.addEventListener("click",()=>$("mainNav").classList.toggle("open"));
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"))});
window.TamilflixApp={get titles(){return titles},setTitles(next){titles=next;saveTitles();render()},saveTitles,render,toast,openMovie};
render();startCarousel();
})();
