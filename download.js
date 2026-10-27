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
window.TamilflixPlayer = {
    open: function (item) {
        const modal = document.getElementById("playerModal");
        const stage = document.getElementById("playerStage");
        const title = document.getElementById("playerTitle");
        const video = document.getElementById("moviePlayer");

        if (!modal || !stage || !video) {
            toast("Player is unavailable.");
            return;
        }

        const videoUrl = item.video || "";
        let youtubeId = null;

        try {
            const url = new URL(videoUrl);
console.log("Tamilflix video URL:", videoUrl);
            if (url.hostname === "youtu.be") {
                youtubeId = url.pathname.slice(1).split("/")[0];
            } else if (
                url.hostname === "youtube.com" ||
                url.hostname === "www.youtube.com" ||
                url.hostname === "m.youtube.com"
            ) {
                if (url.pathname === "/watch") {
                    youtubeId = url.searchParams.get("v");
                } else if (url.pathname.startsWith("/embed/")) {
                    youtubeId = url.pathname.split("/")[2];
                } else if (url.pathname.startsWith("/shorts/")) {
                    youtubeId = url.pathname.split("/")[2];
                }
            }
        } catch (error) {
            // The URL may be a relative or invalid URL.
        }

        video.pause();
        video.removeAttribute("src");
        video.load();

        stage.querySelector("iframe")?.remove();

        if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
            const iframe = document.createElement("iframe");
            iframe.src =
                "https://www.youtube-nocookie.com/embed/" +
                youtubeId +
                "?autoplay=0&playsinline=1";

            iframe.title = item.title || "YouTube video";
            iframe.allow =
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = "strict-origin-when-cross-origin";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "0";

            video.style.display = "none";
            stage.appendChild(iframe);
        } else {
            video.style.display = "block";
            video.src = videoUrl;
            video.load();
        }

        title.textContent = item.title || "Now Playing";
        modal.classList.remove("hidden");
    }
};
const modal=document.getElementById("playerModal"),video=document.getElementById("moviePlayer");
function closePlayer(){if(video){video.pause();video.removeAttribute("src");video.load()}if(modal)modal.classList.add("hidden");if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{})}
document.getElementById("playerClose")?.addEventListener("click",closePlayer);
document.getElementById("playerFullscreen")?.addEventListener("click",async()=>{try{const target=document.getElementById("playerStage");if(!document.fullscreenElement){if(target?.requestFullscreen)await target.requestFullscreen();else if(video?.webkitEnterFullscreen)video.webkitEnterFullscreen();else toast("Use your phone video controls for fullscreen.")}else await document.exitFullscreen()}catch(e){toast("Fullscreen is not available in this browser.")}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal&&!modal.classList.contains("hidden"))closePlayer()});
})();
