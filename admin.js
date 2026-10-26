/* Admin form handlers. Admin access must be enforced by Supabase RLS, not just hidden UI. */
(function(){
  const $=id=>document.getElementById(id);
  function getClient(){return window.tamilflixSupabase||null}
  function isReady(){return !!(window.SUPABASE_PUBLISHABLE_KEY&&!window.SUPABASE_PUBLISHABLE_KEY.startsWith("PASTE_")&&getClient())}
  function getMovie(id){return window.tamilflixGetMovie?window.tamilflixGetMovie(id):null}
  function resetForm(){
    $("movieForm").reset();$("movieId").value="";$("adminMessage").textContent="";
  }
  function fillForm(m){
    $("movieId").value=m.id;$("movieTitle").value=m.title||"";$("movieType").value=m.type||"movie";
    $("moviePoster").value=m.poster_url||m.poster||"";$("movieBackdrop").value=m.backdrop||"";
    $("movieDescription").value=m.description||"";$("movieLanguages").value=(m.languages||[]).join(", ");
    $("movieWatchUrl").value=m.watch_url||"";$("movieDownloadUrl").value=m.download_url||"";$("movieQuality").value=m.quality||"";
    $("adminSection").scrollIntoView({behavior:"smooth"});
  }
  async function saveMovie(e){
    e.preventDefault();const msg=$("adminMessage");
    if(!isReady()){msg.textContent="Configure Supabase first.";return}
    if(!window.tamilflixIsAdmin||!window.tamilflixIsAdmin()){msg.textContent="Your account is not authorized as an admin.";return}
    const id=$("movieId").value;
    const payload={title:$("movieTitle").value.trim(),type:$("movieType").value,poster_url:$("moviePoster").value.trim(),backdrop:$("movieBackdrop").value.trim()||null,description:$("movieDescription").value.trim(),languages:$("movieLanguages").value.split(",").map(s=>s.trim()).filter(Boolean),watch_url:$("movieWatchUrl").value.trim()||null,download_url:$("movieDownloadUrl").value.trim()||null,quality:$("movieQuality").value.trim()||null};
    const query=getClient().from("movies");
    const result=id?await query.update(payload).eq("id",id).select().single():await query.insert(payload).select().single();
    if(result.error){msg.textContent=result.error.message;return}
    msg.textContent="Saved successfully.";resetForm();await window.tamilflixReloadMovies?.();
  }
  document.addEventListener("DOMContentLoaded",()=>{
    $("movieForm").addEventListener("submit",saveMovie);
    $("cancelEditBtn").addEventListener("click",resetForm);
    document.addEventListener("click",async e=>{
      const edit=e.target.closest("[data-admin-edit]");if(edit){const m=getMovie(edit.dataset.adminEdit);if(m)fillForm(m)}
      const del=e.target.closest("[data-admin-delete]");if(del){
        if(!confirm("Delete this title?"))return;
        if(!isReady()||!window.tamilflixIsAdmin?.()){alert("Admin access is required.");return}
        const result=await getClient().from("movies").delete().eq("id",del.dataset.adminDelete);
        if(result.error)alert(result.error.message);else await window.tamilflixReloadMovies?.();
      }
    });
  });
})();
