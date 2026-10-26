/* Download button supports only direct, authorised file URLs. It cannot bypass streaming restrictions. */
(function(){
"use strict";
function toast(message){window.TamilflixApp?.toast(message)}
window.TamilflixDownload=function(id){
 const item=window.TamilflixApp?.titles.find(x=>String(x.id)===String(id));
 if(!item){toast("Title not found.");return}
 if(!item.video){toast("No direct video URL has been added.");return}
 try{
   const url=new URL(item.video,window.location.href);
   if(!["http:","https:"].includes(url.protocol)){toast("Unsupported video URL.");return}
   const link=document.createElement("a");link.href=url.href;link.download=(item.title||"tamilflix-video").replace(/[^\w-]+/g,"_");
   link.target="_blank";link.rel="noopener";document.body.appendChild(link);link.click();link.remove();
   toast("Opened the provided video link. Download availability depends on the host.");
 }catch(e){toast("Please check the video URL.")}
};
})();