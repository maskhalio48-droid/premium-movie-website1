/* Download only direct video files the site owner has permission to distribute.
   This does not use or imitate VidMate and cannot bypass streaming-service restrictions. */
(function(){
"use strict";
function toast(message){window.TamilflixApp?.toast(message)}
window.TamilflixDownload=function(id,language){
 const item=window.TamilflixApp?.titles.find(x=>String(x.id)===String(id));
 if(!item){toast("Title not found.");return}
 const urls={...(item.languageVideos||{})};if(item.video&&!Object.values(urls).some(Boolean))urls[item.language||"English"]=item.video;
 const videoUrl=urls[language]||"";
 if(!videoUrl){toast("No authorised video URL has been added for "+(language||"this language")+".");return}
 try{
  const url=new URL(videoUrl,window.location.href);
  if(!["http:","https:"].includes(url.protocol)){toast("Unsupported video URL.");return}
  const link=document.createElement("a");link.href=url.href;
  link.download=(item.title||"tamilflix-video").replace(/[^\w-]+/g,"_")+"_"+(language||"video")+".mp4";
  link.target="_blank";link.rel="noopener noreferrer";
  document.body.appendChild(link);link.click();link.remove();
  toast("Download requested. The video host may control whether direct download is allowed.");
 }catch(e){toast("Please check the video URL.")}
};
window.TamilflixPlayer={open:function(item){
 const modal=document.getElementById("playerModal"),video=document.getElementById("moviePlayer"),title=document.getElementById("playerTitle");
 if(!modal||!video){toast("Player is unavailable.");return}
 try{video.pause();video.removeAttribute("src");video.load();video.src=item.video;title.textContent=item.title||"Now Playing";modal.classList.remove("hidden");
  const p=video.play();if(p&&p.catch)p.catch(()=>toast("Press Play in the video controls to start playback."));
 }catch(e){toast("This video URL could not be opened.")}
}};
const modal=document.getElementById("playerModal"),video=document.getElementById("moviePlayer");
function closePlayer(){if(video){video.pause();video.removeAttribute("src");video.load()}if(modal)modal.classList.add("hidden");if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{})}
document.getElementById("playerClose")?.addEventListener("click",closePlayer);
document.getElementById("playerFullscreen")?.addEventListener("click",async()=>{try{const target=document.getElementById("playerStage");if(!document.fullscreenElement){if(target?.requestFullscreen)await target.requestFullscreen();else if(video?.webkitEnterFullscreen)video.webkitEnterFullscreen();else toast("Use your phone video controls for fullscreen.")}else await document.exitFullscreen()}catch(e){toast("Fullscreen is not available in this browser.")}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal&&!modal.classList.contains("hidden"))closePlayer()});
})();
