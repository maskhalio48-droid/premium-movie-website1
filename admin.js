/* Admin panel: browser-local content manager. Do not treat this as secure multi-user administration. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const app=()=>window.TamilflixApp;
function msg(text,isError=false){const el=$("adminMessage");if(el){el.textContent=text;el.style.color=isError?"#ff8aa1":"#8ce0ad"}}
function openAdmin(){if(!$("adminModal"))return;$("adminModal").classList.remove("hidden");renderAdminList()}
function getTitles(){return app()?.titles||[]}
function setTitles(list){app()?.setTitles(list)}
function clearForm(){["editId","movieTitle","movieYear","movieGenre","movieRating","movieLanguage","moviePoster","movieBackdrop","movieDescription","movieVideo","videoTamil","videoSinhala","videoEnglish","videoHindi","videoTelugu"].forEach(id=>{if($(id))$(id).value=""});$("movieCategory").value="Movies";msg("");$("posterPreview")?.classList.add("hidden")}
function renderAdminList() {
    const box = $("adminMovieList");

    if (!box) {
        msg("Error: adminMovieList element not found.", true);
        return;
    }

    const list = getTitles();

    // Display diagnostic information inside the Admin Panel
    if (!Array.isArray(list)) {
        box.innerHTML =
            '<p class="muted">Error: Movie titles data is not an array.</p>';
        return;
    }

    if (list.length === 0) {
        box.innerHTML =
            '<p class="muted">No titles found in browser storage.</p>';

        msg("No movie titles found. Checking the saved data is required.", true);
        return;
    }

    box.innerHTML = list.map(m => `
        <div class="admin-movie-item">
            <img
                src="${esc(m.poster || "https://placehold.co/100x150?text=Poster")}"
                alt=""
                onerror="this.onerror=null;this.src='https://placehold.co/100x150?text=Poster'"
            >

            <div class="admin-title">
                <strong>${esc(m.title || "Untitled")}</strong>
                <small>${esc(m.year || "")} · ${esc(m.category || "Movies")}</small>
            </div>

            <button
                type="button"
                data-edit-title="${esc(m.id)}"
            >Edit</button>

            <button
                type="button"
                data-delete-title="${esc(m.id)}"
            >Delete</button>
        </div>
    `).join("");

    msg("Loaded " + list.length + " movie title(s).");
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function fillForm(id){const m=getTitles().find(x=>String(x.id)===String(id));if(!m)return;
 $("editId").value=m.id;$("movieTitle").value=m.title||"";$("movieYear").value=m.year||"";$("movieCategory").value=m.category||"Movies";$("movieGenre").value=m.genre||"";$("movieRating").value=m.rating||"";$("movieLanguage").value=m.language||"";$("moviePoster").value=m.poster||"";$("movieBackdrop").value=m.backdrop||"";$("movieDescription").value=m.description||"";$("movieVideo").value=m.video||"";const lv=m.languageVideos||{};$("videoTamil").value=lv.Tamil||"";$("videoSinhala").value=lv.Sinhala||"";$("videoEnglish").value=lv.English||((m.language==="English")?m.video||"":"");$("videoHindi").value=lv.Hindi||"";$("videoTelugu").value=lv.Telugu||"";preview();$("adminForm").scrollIntoView({behavior:"smooth",block:"start"});msg("Editing title: "+m.title)}
function saveForm(e){e.preventDefault();const title=$("movieTitle").value.trim();if(!title){msg("Movie title is required.",true);return}
 const id=$("editId").value||("movie_"+Date.now());
 const item={id,title,year:$("movieYear").value?Number($("movieYear").value):"",category:$("movieCategory").value,genre:$("movieGenre").value.trim(),rating:$("movieRating").value?Number($("movieRating").value):"",language:$("movieLanguage").value.trim(),poster:$("moviePoster").value.trim(),backdrop:$("movieBackdrop").value.trim(),description:$("movieDescription").value.trim(),video:$("movieVideo").value.trim(),languageVideos:{Tamil:$("videoTamil").value.trim(),Sinhala:$("videoSinhala").value.trim(),English:$("videoEnglish").value.trim(),Hindi:$("videoHindi").value.trim(),Telugu:$("videoTelugu").value.trim()}};
 const list=getTitles();const index=list.findIndex(x=>String(x.id)===String(id));if(index>=0)list[index]=item;else list.unshift(item);setTitles(list);msg("Saved successfully.");renderAdminList();$("posterPreview")?.classList.add("hidden");clearForm();app()?.render();app()?.toast("Movie saved")}
function preview(){const url=$("moviePoster").value.trim();const box=$("posterPreview");if(!url){msg("Enter a poster URL first.",true);return} $("posterPreviewImage").src=url;$("posterPreviewCaption").textContent=$("movieTitle").value||"Poster preview";box.classList.remove("hidden")}
async function autoPoster(){
 const title=$("movieTitle").value.trim();const key=$("omdbKey").value.trim();
 if(!title){msg("Enter the movie title first.",true);return}
 if(!key){msg("Enter a free OMDb API key first. It is saved only in this browser.",true);$("omdbKey").focus();return}
 localStorage.setItem("tamilflix_omdb_key",key);msg("Searching OMDb…");
 try{
   const response=await fetch("https://www.omdbapi.com/?apikey="+encodeURIComponent(key)+"&t="+encodeURIComponent(title)+"&plot=full");
   const data=await response.json();if(data.Response==="False")throw new Error(data.Error||"No match found.");
   $("movieTitle").value=data.Title||title;$("movieYear").value=(data.Year||"").match(/\d{4}/)?.[0]||"";
   $("movieGenre").value=data.Genre||"";$("movieRating").value=data.imdbRating&&data.imdbRating!=="N/A"?data.imdbRating:"";
   $("movieDescription").value=data.Plot&&data.Plot!=="N/A"?data.Plot:"";
   if(data.Poster&&data.Poster!=="N/A")$("moviePoster").value=data.Poster;
   $("posterPreviewCaption").textContent=`${data.Title||title} (${data.Year||"year unknown"})`;
   if($("moviePoster").value){$("posterPreviewImage").src=$("moviePoster").value;$("posterPreview").classList.remove("hidden")}
   msg("Movie details found. Check the poster and details, then press Save Movie.");
 }catch(err){msg("Auto Poster failed: "+(err.message||"Check the API key or internet connection."),true)}
}
document.addEventListener("click",e=>{
 const edit=e.target.closest("[data-edit-title]");if(edit){fillForm(edit.dataset.editTitle);return}
 const del=e.target.closest("[data-delete-title]");if(del){const item=getTitles().find(x=>String(x.id)===String(del.dataset.deleteTitle));if(!item)return;if(!confirm("Delete "+item.title+"?"))return;setTitles(getTitles().filter(x=>String(x.id)!==String(del.dataset.deleteTitle)));renderAdminList();app()?.render();msg("Title deleted.");return}
});
$("adminForm")?.addEventListener("submit",saveForm);
$("autoPosterBtn")?.addEventListener("click",autoPoster);
$("posterPreviewBtn")?.addEventListener("click",preview);
$("omdbKey")&&($("omdbKey").value=localStorage.getItem("tamilflix_omdb_key")||"");
document.addEventListener("keydown",e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="a"){e.preventDefault();openAdmin()}});
window.TamilflixAdmin={open:openAdmin,renderAdminList};
})();
