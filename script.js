/*
Tamilflix demo catalogue.
Each title has a category: movie, marvel, anime, or series.
For a movie with multiple audio-language versions, add languageLinks entries.
For a movie with no language choices, leave languageLinks: [] and provide videoUrl.
Only add videos/posters you have rights to distribute or embed.
*/
const DEMO_TITLES = [
 {id:"leo",title:"Leo",year:"2023",genre:"Action • Thriller",rating:"UA",type:"movie",description:"Action thriller. Add your own authorized synopsis here.",poster:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop",backdrop:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1800&auto=format&fit=crop",videoUrl:"",languageLinks:[]},
 {id:"jailer",title:"Jailer",year:"2023",genre:"Action • Crime",rating:"UA",type:"movie",description:"Action movie title.",poster:"https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[]},
 {id:"vikram",title:"Vikram",year:"2022",genre:"Action • Thriller",rating:"UA",type:"movie",description:"Action thriller title.",poster:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[]},
 {id:"master",title:"Master",year:"2021",genre:"Action • Drama",rating:"UA",type:"movie",description:"Action drama title.",poster:"https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[]},
 {id:"movie-multilang-demo",title:"Multi-language Movie Demo",year:"2025",genre:"Adventure • Action",rating:"UA",type:"movie",description:"Example showing five language versions on one title page. Replace these sample links with authorized video links.",poster:"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[{language:"Tamil",videoUrl:""},{language:"Sinhala",videoUrl:""},{language:"English",videoUrl:""},{language:"Hindi",videoUrl:""},{language:"Telugu",videoUrl:""}]},
 {id:"movie-no-language",title:"Single Video Movie Demo",year:"2024",genre:"Drama",rating:"U",type:"movie",description:"Example of a movie with one video and no language selector.",poster:"https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[]},
 {id:"marvel-demo-1",title:"Marvel Title Demo",year:"2025",genre:"Superhero • Action",rating:"13+",type:"marvel",description:"Marvel category demo. Replace with a title and poster you are authorized to display.",poster:"https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[{language:"Tamil",videoUrl:""},{language:"English",videoUrl:""},{language:"Hindi",videoUrl:""},{language:"Telugu",videoUrl:""},{language:"Sinhala",videoUrl:""}]},
 {id:"marvel-demo-2",title:"Superhero Collection",year:"2024",genre:"Superhero • Sci-Fi",rating:"13+",type:"marvel",description:"Marvel/superhero collection demo card.",poster:"https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[]},
 {id:"anime-demo-1",title:"Anime Adventure",year:"2025",genre:"Anime • Adventure",rating:"13+",type:"anime",description:"Anime category demo. Replace with your authorized title details.",poster:"https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[{language:"Tamil Dub",videoUrl:""},{language:"Japanese",videoUrl:""},{language:"English Dub",videoUrl:""},{language:"Hindi Dub",videoUrl:""},{language:"Sinhala Dub",videoUrl:""}]},
 {id:"anime-demo-2",title:"Anime Mystery",year:"2024",genre:"Anime • Mystery",rating:"13+",type:"anime",description:"Anime mystery demo card.",poster:"https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[]},
 {id:"series-demo",title:"Series Collection",year:"2025",genre:"Drama • Series",rating:"13+",type:"series",description:"Series demo card.",poster:"https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&auto=format&fit=crop",backdrop:"",videoUrl:"",languageLinks:[]}
];
const $=id=>document.getElementById(id);
let titles=loadTitles(),slideIndex=0,slideTimer=null,activeSection="home",query="",selectedTitle=null,selectedVideoUrl="";
function loadTitles(){try{const x=JSON.parse(localStorage.getItem("tamilflix_titles")||"null");return Array.isArray(x)&&x.length?x:DEMO_TITLES}catch{return DEMO_TITLES}}
function saveTitles(){localStorage.setItem("tamilflix_titles",JSON.stringify(titles))}
function getMyList(){try{return JSON.parse(localStorage.getItem("tamilflix_mylist")||"[]")}catch{return []}}
function setMyList(x){localStorage.setItem("tamilflix_mylist",JSON.stringify(x))}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function card(t){return `<article class="poster-card" data-id="${esc(t.id)}" tabindex="0" role="button"><div class="poster-image-wrap"><img class="poster-image" src="${esc(t.poster||"")}" alt="${esc(t.title)} poster" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/400x600/171a22/ffffff?text=Tamilflix'"><span class="poster-play">▶</span></div><h3 class="poster-title">${esc(t.title)}</h3><p class="poster-meta">${esc(t.year)} · ${esc(t.genre.split("•")[0].trim())}<span class="rating">${esc(t.rating||"U")}</span></p></article>`}
function filteredTitles(){return titles.filter(t=>!query||`${t.title} ${t.genre} ${t.year} ${t.type}`.toLowerCase().includes(query.toLowerCase()))}
function renderRows(){
 const list=filteredTitles(),home=activeSection==="home"&&!query;
 const groups=[["trendingSection","trendingMovies",t=>t.type==="movie"],["marvelSection","marvelTitles",t=>t.type==="marvel"],["animeSection","animeTitles",t=>t.type==="anime"],["seriesSection","popularSeries",t=>t.type==="series"],["noLangSection","noLangMovies",t=>t.type==="movie"&&!(t.languageLinks||[]).length]];
 groups.forEach(([section,container,filter])=>{$(section).classList.toggle("hidden",!home);$(container).innerHTML=list.filter(filter).slice(0,14).map(card).join("")});
 const showAll=!!query||["movies","marvel","anime","series"].includes(activeSection);
 $("allSection").classList.toggle("hidden",!showAll);$("myListSection").classList.toggle("hidden",activeSection!=="mylist");
 if(showAll){const types={movies:["movie"],marvel:["marvel"],anime:["anime"],series:["series"]};const arr=list.filter(t=>types[activeSection]?.includes(t.type));$("allHeading").textContent=query?`Search: ${query}`:({movies:"Movies",marvel:"Marvel",anime:"Anime",series:"Series"}[activeSection]||"Search Results");$("resultCount").textContent=`${arr.length} titles`;$("allItems").innerHTML=arr.map(card).join("");}
 if(activeSection==="mylist"){const arr=titles.filter(t=>getMyList().includes(t.id));$("myListItems").innerHTML=arr.map(card).join("");}
 const count=showAll?list.filter(t=>({movies:t.type==="movie",marvel:t.type==="marvel",anime:t.type==="anime",series:t.type==="series"}[activeSection]||true)).length:activeSection==="mylist"?titles.filter(t=>getMyList().includes(t.id)).length:list.length;
 $("emptyState").classList.toggle("hidden",count>0);
 bindCards();
}
function renderHero(){const featured=titles.filter(t=>["movie","marvel","anime"].includes(t.type)).slice(0,5);if(!featured.length)return;slideIndex=(slideIndex+featured.length)%featured.length;const t=featured[slideIndex];$("hero").style.backgroundImage=`url("${t.backdrop||t.poster}")`;$("heroTitle").textContent=t.title;$("heroMeta").textContent=`${t.year} • ${t.genre} • ${t.rating||"U"}`;$("heroDescription").textContent=t.description||"Discover this title on Tamilflix.";$("heroWatch").onclick=()=>openDetails(t);$("heroList").onclick=()=>toggleList(t);$("sliderDots").innerHTML=featured.map((x,i)=>`<button class="slider-dot ${i===slideIndex?"active":""}" data-slide="${i}" aria-label="Show ${esc(x.title)}"></button>`).join("");$("sliderDots").querySelectorAll("button").forEach(b=>b.onclick=()=>{slideIndex=+b.dataset.slide;renderHero();restartSlider()})}
function nextSlide(n=1){const count=titles.filter(t=>["movie","marvel","anime"].includes(t.type)).slice(0,5).length;if(count){slideIndex=(slideIndex+n+count)%count;renderHero()}}
function restartSlider(){clearInterval(slideTimer);slideTimer=setInterval(()=>nextSlide(1),5000)}
function openDetails(t){selectedTitle=t;$("detailPoster").src=t.poster||"";$("detailPoster").onerror=()=>{$("detailPoster").src="https://placehold.co/400x600/171a22/ffffff?text=Tamilflix"};$("detailTitle").textContent=t.title;$("detailMeta").textContent=`${t.year} • ${t.genre} • ${t.rating||"U"}`;$("detailDescription").textContent=t.description||"";$("detailCategory").textContent=t.type.toUpperCase();const langs=t.languageLinks||[];if(langs.length){$("languageArea").innerHTML=`<div class="language-title">Choose audio language / version</div><div class="language-links">${langs.map((l,i)=>`<button class="language-btn ${i===0?"selected":""}" data-lang="${i}">${esc(l.language)}</button>`).join("")}</div>`;selectedVideoUrl=langs[0].videoUrl||"";$("languageArea").querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{$("languageArea").querySelectorAll(".language-btn").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");selectedVideoUrl=langs[+b.dataset.lang].videoUrl||"";$("detailWatch").textContent=`▶ Watch ${langs[+b.dataset.lang].language}`})}else{$("languageArea").innerHTML=`<p class="no-language-note">Single video • No language selection</p>`;selectedVideoUrl=t.videoUrl||""}$("detailWatch").textContent=langs.length?`▶ Watch ${langs[0].language}`:"▶ Watch Now";$("detailWatch").onclick=()=>openPlayer(t,selectedVideoUrl,langs.length?($("languageArea").querySelector(".selected")?.textContent||""): "");$("detailList").onclick=()=>toggleList(t);$("detailsModal").showModal()}
function getEmbed(raw){try{const u=new URL(raw);let id="";if(u.hostname.includes("youtu.be"))id=u.pathname.slice(1);else if(u.hostname.includes("youtube.com"))id=u.searchParams.get("v")||u.pathname.match(/\/embed\/([^/?]+)/)?.[1]||u.pathname.match(/\/shorts\/([^/?]+)/)?.[1]||"";return id?`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`:""}catch{return ""}}
function openPlayer(t,url="",language=""){selectedTitle=t;$("playerTitle").textContent=t.title;$("playerLanguage").textContent=language?`Language: ${language}`:"";const embed=getEmbed(url);$("videoFrame").innerHTML=embed?`<iframe src="${embed}" title="${esc(t.title)} ${esc(language)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`:`<p>No video link added for ${esc(language||t.title)} yet.</p>`;if($("detailsModal").open)$("detailsModal").close();$("playerModal").showModal()}
function toggleList(t){const list=getMyList();setMyList(list.includes(t.id)?list.filter(x=>x!==t.id):[...list,t.id]);renderRows()}
function bindCards(){document.querySelectorAll(".poster-card").forEach(c=>{const go=()=>{const t=titles.find(x=>x.id===c.dataset.id);if(t)openDetails(t)};c.onclick=go;c.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}})}
function setSection(s){activeSection=s;if(s==="home")query="";$("searchInput").value=query;document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.section===s));renderRows();if(innerWidth<800)$("mainNav").classList.remove("open");scrollTo({top:0,behavior:"smooth"})}
function showAuth(mode){$("authHeading").textContent=mode==="login"?"Login":"Create Account";$("authSubmit").textContent=mode==="login"?"Login":"Register";$("authMessage").textContent="";$("authModal").showModal()}
function init(){$("yearNow").textContent=new Date().getFullYear();renderRows();renderHero();restartSlider();$("prevSlide").onclick=()=>{nextSlide(-1);restartSlider()};$("nextSlide").onclick=()=>{nextSlide(1);restartSlider()};$("searchInput").addEventListener("input",e=>{query=e.target.value.trim();activeSection="home";renderRows()});document.querySelectorAll("[data-section]").forEach(b=>b.onclick=()=>setSection(b.dataset.section));$("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");$("loginBtn").onclick=()=>showAuth("login");$("registerBtn").onclick=()=>showAuth("register");document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$ (b.dataset.close).close());document.querySelectorAll("dialog").forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close()}));$("playerModal").addEventListener("close",()=>{$("videoFrame").innerHTML=""});$("authForm").onsubmit = async (e) => {
  e.preventDefault();

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  const message = $("authMessage");
  const button = $("authSubmit");

  if (!window.supabase || !window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY) {
    message.textContent = "Supabase configuration missing. Please check setup.";
    return;
  }

  const client = window.tamilflixSupabase ||
    (window.tamilflixSupabase = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    ));

  button.disabled = true;
  message.textContent = "Please wait...";

  try {
    if ($("authHeading").textContent === "Login") {
      const { error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      message.textContent = "Login successful!";
$("loginBtn").style.display = "none";
$("registerBtn").style.display = "none";
     setTimeout(() => {
  $("authModal").close();
}, 1000);
    } else {
      const { data, error } = await client.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      message.textContent = data.session
        ? "Account created successfully!"
        : "Account created. Please check your email to confirm it.";
    }
  } catch (error) {
    message.textContent = error.message || "Something went wrong.";
  } finally {
    button.disabled = false;
  }
};let x=0;$("hero").addEventListener("touchstart",e=>x=e.changedTouches[0].screenX,{passive:true});$("hero").addEventListener("touchend",e=>{const d=e.changedTouches[0].screenX-x;if(Math.abs(d)>45){nextSlide(d<0?1:-1);restartSlider()}},{passive:true})}
document.addEventListener("DOMContentLoaded",init);

/*
ADDING A TITLE:
{
 id:"unique-id", title:"Movie Name", year:"2026", genre:"Action • Drama",
 rating:"UA", type:"movie", description:"Description",
 poster:"https://your-authorized-poster.jpg",
 backdrop:"https://your-authorized-backdrop.jpg",
 videoUrl:"",
 languageLinks:[
  {language:"Tamil",videoUrl:"https://www.youtube.com/watch?v=VIDEO_ID"},
  {language:"English",videoUrl:"https://www.youtube.com/watch?v=VIDEO_ID"},
  {language:"Hindi",videoUrl:"https://www.youtube.com/watch?v=VIDEO_ID"},
  {language:"Telugu",videoUrl:"https://www.youtube.com/watch?v=VIDEO_ID"},
  {language:"Sinhala",videoUrl:"https://www.youtube.com/watch?v=VIDEO_ID"}
 ]
}
Categories: type:"movie", "marvel", "anime", or "series".
For no language selector: use languageLinks:[] and set videoUrl to the single video link.
This is a frontend demo: real admin/database integration is a later step. Use only video content you have rights to embed/distribute.
*/
