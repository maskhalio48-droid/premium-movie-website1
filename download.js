/* Authorized playback and download links only. */
(function(){
  function getMovie(id){return (window.tamilflixMovies||[]).find(m=>String(m.id)===String(id))}
  // script.js exposes a safe getter through this event bridge.
  function findFromCards(id){return window.tamilflixGetMovie?window.tamilflixGetMovie(id):null}
  window.tamilflixWatch=function(id){
    const m=findFromCards(id);
    if(!m){alert("Movie details are not available yet.");return}
    const url=m.watch_url||m.watchUrl||"";
    if(!url){alert("No authorized watch link has been added for this title yet.");return}
    window.open(url,"_blank","noopener,noreferrer");
  };
  window.tamilflixDownload=function(id){
    const m=findFromCards(id);
    if(!m){alert("Movie details are not available yet.");return}
    const url=m.download_url||m.downloadUrl||"";
    if(!url){alert("No authorized direct-download file has been added for this title yet.");return}
    const quality=m.quality?("\nAvailable quality: "+m.quality):"";
    if(confirm("Open the authorized download link for "+m.title+"?"+quality)){
      const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.download="";document.body.appendChild(a);a.click();a.remove();
    }
  };
})();
