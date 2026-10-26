/* TAMILFLIX — Website Developed by Jayantha Dilan */
"use strict";

const demoMovies = [
  {id:"demo-1",title:"Sample Tamil Movie",type:"movie",description:"Demo title. Replace this with content you own or are authorized to distribute.",poster:"https://placehold.co/400x600/171b29/ffffff?text=Tamilflix",backdrop:"",languages:["Tamil"],watch_url:"",download_url:"",quality:"",is_demo:true},
  {id:"demo-2",title:"Sample English Movie",type:"movie",description:"Demo title. Add your authorized watch and download links in the admin panel.",poster:"https://placehold.co/400x600/20283a/ffffff?text=Movie",backdrop:"",languages:["English"],watch_url:"",download_url:"",quality:"",is_demo:true},
  {id:"demo-3",title:"Sample Series",type:"series",description:"Demo series card.",poster:"https://placehold.co/400x600/252033/ffffff?text=Series",backdrop:"",languages:["Sinhala"],watch_url:"",download_url:"",quality:"",is_demo:true}
];
const state = {movies:[],view:"home",search:"",language:"all",myList:loadList(),user:null,admin:false,authMode:"login"};
const $ = id => document.getElementById(id);
const supabaseReady = () => window.SUPABASE_PUBLISHABLE_KEY && !window.SUPABASE_PUBLISHABLE_KEY.startsWith("PASTE_") && window.tamilflixSupabase;
function loadList(){try{return JSON.parse(localStorage.getItem("tamilflix_my_list")||"[]")}catch{return []}}
function saveList(){localStorage.setItem("tamilflix_my_list",JSON.stringify(state.myList))}
function esc(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function normalizeMovie(row){return {...row,languages:Array.isArray(row.languages)?row.languages:(typeof row.languages==="string"?row.languages.split(",").map(x=>x.trim()).filter(Boolean):[]),poster:row.poster_url||row.poster||"",watch_url:row.watch_url||"",download_url:row.download_url||""}}
async function loadMovies(){
  state.movies = demoMovies.slice();
  if (supabaseReady()){
    try{
      const {data,error}=await window.tamilflixSupabase.from("movies").select("*").order("created_at",{ascending:false});
      if(error) throw error;
      if(data && data.length) state.movies=data.map(normalizeMovie);
      $("statusMessage").textContent=data&&data.length?"":"Showing sample titles until you add movies.";
    }catch(e){console.warn("Could not load Supabase movies:",e.message);$("statusMessage").textContent="Showing demo titles. Check Supabase configuration and movies table."}
  }else{$("statusMessage").textContent="Demo mode: add your Supabase public key to enable accounts and database content."}
  render();
}
function filteredMovies(){
  return state.movies.filter(m=>{
    const text=(m.title+" "+(m.description||"")+" "+(m.languages||[]).join(" ")).toLowerCase();
    if(state.search && !text.includes(state.search.toLowerCase())) return false;
    if(state.language!=="all" && !(m.languages||[]).some(l=>l.toLowerCase()===state.language.toLowerCase())) return false;
    if(state.view==="movies" && m.type!=="movie") return false;
    if(state.view==="series" && m.type!=="series") return false;
    if(state.view==="my-list" && !state.myList.includes(String(m.id))) return false;
    return true;
  });
}
function render(){
  const movies=filteredMovies();
  $("sectionTitle").textContent=({home:"Popular titles",movies:"Movies",series:"Series","my-list":"My List"})[state.view]||"Popular titles";
  $("movieGrid").innerHTML=movies.length?movies.map(m=>`
    <article class="movie-card">
      <img class="poster" src="${esc(m.poster||"https://placehold.co/400x600/171b29/ffffff?text=Tamilflix")}" alt="${esc(m.title)} poster" loading="lazy" onerror="this.src='https://placehold.co/400x600/171b29/ffffff?text=Tamilflix'">
      <div class="card-body"><h3>${esc(m.title)}</h3><div class="card-meta">${esc((m.languages||[]).join(" • ")||m.type||"Movie")}</div>
      <div class="card-actions"><button class="btn btn-red" data-watch="${esc(m.id)}">▶ Watch</button><button class="btn btn-outline" data-download="${esc(m.id)}">↓</button></div>
      <div class="card-actions"><button class="btn btn-outline" data-details="${esc(m.id)}">Details</button><button class="btn btn-outline" data-list="${esc(m.id)}">${state.myList.includes(String(m.id))?"♥ Saved":"♡ List"}</button></div></div>
    </article>`).join(""):`<div class="empty-state">No titles found. Try another search or language.</div>`;
  const featured=state.movies.find(m=>!m.is_demo)||state.movies[0];
  if(featured){$("heroTitle").textContent=featured.title;$("heroDescription").textContent=featured.description||"Movies • Series • Entertainment";$("hero").style.backgroundImage=featured.backdrop?`linear-gradient(90deg,#090b12 0%,#090b12e8 36%,#090b1250 100%),url("${featured.backdrop}")`:"linear-gradient(90deg,#090b12 0%,#090b12e8 36%,#090b1250 100%),linear-gradient(0deg,#090b12,#20283a)";$("heroWatchBtn").dataset.watch=featured.id;$("heroDownloadBtn").dataset.download=featured.id}
  $("year").textContent=new Date().getFullYear();
}
function showAuth(mode){
  state.authMode=mode==="register"?"register":"login";
  $("authHeading").textContent=state.authMode==="register"?"Create Account":"Login";
  $("authSubmit").textContent=state.authMode==="register"?"Register":"Login";
  $("authMessage").textContent="";
  $("authForm").reset();
  $("authModal").showModal();
}
async function handleAuthSubmit(event){
  event.preventDefault();
  const msg=$("authMessage");msg.textContent="";
  if(!supabaseReady()){msg.textContent="Add the Supabase publishable/anon key in supabase-config.js first.";return}
  const email=$("authEmail").value.trim(),password=$("authPassword").value;
  const result=state.authMode==="register"
    ? await window.tamilflixSupabase.auth.signUp({email,password})
    : await window.tamilflixSupabase.auth.signInWithPassword({email,password});
  if(result.error){msg.textContent=result.error.message;return}
  if(state.authMode==="register" && !result.data.session){msg.textContent="Account created. Check your email to confirm, then log in.";return}
  state.user=result.data.user||null;
  msg.textContent=state.user?"Signed in successfully.":"Check your email to continue.";
  await updateAccountUI();
  setTimeout(()=>$("authModal").close(),700);
}
async function updateAccountUI(){
  if(supabaseReady()){
    const {data}=await window.tamilflixSupabase.auth.getUser();state.user=data?.user||null;
    state.admin=false;
    if(state.user){
      try{const {data:admin}=await window.tamilflixSupabase.rpc("is_admin");state.admin=admin===true}catch(e){console.warn("Admin check:",e.message)}
    }
  }
  $("loginBtn").classList.toggle("hidden",!!state.user);
  $("registerBtn").classList.toggle("hidden",!!state.user);
  $("logoutBtn").classList.toggle("hidden",!state.user);
  $("adminSection").classList.toggle("hidden",!state.admin);
}
async function logout(){
  if(supabaseReady()) await window.tamilflixSupabase.auth.signOut();
  state.user=null;state.admin=false;await updateAccountUI();
}
function findMovie(id){return state.movies.find(m=>String(m.id)===String(id))}
function showDetails(id){
  const m=findMovie(id);if(!m)return;
  $("detailsContent").innerHTML=`<h2>${esc(m.title)}</h2><img class="details-poster" src="${esc(m.poster||"https://placehold.co/400x600/171b29/ffffff?text=Tamilflix")}" alt=""><p>${esc(m.description||"No description available.")}</p><p class="muted">Languages: ${esc((m.languages||[]).join(", ")||"Not specified")}</p><p class="muted">Quality: ${esc(m.quality||"Available quality depends on the supplied link.")}</p><div class="details-actions"><button class="btn btn-red" data-watch="${esc(m.id)}">▶ Watch now</button><button class="btn btn-outline" data-download="${esc(m.id)}">↓ Download</button><button class="btn btn-outline" data-list="${esc(m.id)}">♡ My List</button></div>`;
  $("detailsModal").showModal();
}
function toggleList(id){
  id=String(id);state.myList=state.myList.includes(id)?state.myList.filter(x=>x!==id):[...state.myList,id];saveList();render();
}
window.tamilflixGetMovie = findMovie;
window.tamilflixReloadMovies = loadMovies;
window.tamilflixIsAdmin = () => state.admin;

function init(){
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===b));render();document.querySelector(".content-section").scrollIntoView({behavior:"smooth"})}));
  $("loginBtn").addEventListener("click",()=>showAuth("login"));
  $("registerBtn").addEventListener("click",()=>showAuth("register"));
  $("logoutBtn").addEventListener("click",logout);
  $("authForm").addEventListener("submit",handleAuthSubmit);
  $("searchInput").addEventListener("input",e=>{state.search=e.target.value;render()});
  $("languageFilter").addEventListener("change",e=>{state.language=e.target.value;render()});
  document.addEventListener("click",e=>{
    const close=e.target.closest("[data-close]");if(close){$(close.dataset.close).close();return}
    const watch=e.target.closest("[data-watch]");if(watch){e.preventDefault();window.tamilflixWatch?.(watch.dataset.watch);return}
    const download=e.target.closest("[data-download]");if(download){e.preventDefault();window.tamilflixDownload?.(download.dataset.download);return}
    const details=e.target.closest("[data-details]");if(details){showDetails(details.dataset.details);return}
    const list=e.target.closest("[data-list]");if(list){toggleList(list.dataset.list)}
  });
  $("heroWatchBtn").addEventListener("click",()=>window.tamilflixWatch?.($("heroWatchBtn").dataset.watch));
  $("heroDownloadBtn").addEventListener("click",()=>window.tamilflixDownload?.($("heroDownloadBtn").dataset.download));
  document.querySelectorAll("dialog").forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close()}));
  if(supabaseReady()) window.tamilflixSupabase.auth.onAuthStateChange(()=>updateAccountUI());
  updateAccountUI();loadMovies();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
