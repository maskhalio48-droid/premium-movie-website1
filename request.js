/* Tamilflix movie requests. Shared requests require the Supabase table/policies in movie_requests_setup.sql. */
(function(){
 "use strict";
 const $=id=>document.getElementById(id);
 const client=()=>window.supabaseClient || (window.TamilflixApp && window.supabaseClient) || null;
 const escapeHTML=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 function showMessage(id,text,error=false){const el=$(id);if(el){el.textContent=text;el.style.color=error?"#ff8aa1":"#8ce0ad"}}
 function openRequest(){ $('requestModal')?.classList.remove('hidden'); $('requestMovieTitle')?.focus(); }
 $('openRequestBtn')?.addEventListener('click',openRequest);
 $('movieRequestForm')?.addEventListener('submit',async e=>{
   e.preventDefault(); const sb=client();
   const title=$('requestMovieTitle').value.trim(); if(!title)return;
   if(!sb?.from){showMessage('requestFormMessage','Movie request service is not connected yet. Configure the Supabase client and run movie_requests_setup.sql.',true);return;}
   const {data:{user}={}}=await sb.auth?.getUser?.().catch(()=>({data:{user:null}}))||{data:{user:null}};
   const row={title,language:$('requestLanguage').value,category:$('requestCategory').value,notes:$('requestNotes').value.trim(),user_id:user?.id||null,status:'Pending'};
   const btn=e.submitter; if(btn)btn.disabled=true;
   try{const {error}=await sb.from('movie_requests').insert(row);if(error)throw error;
     showMessage('requestFormMessage','Request sent successfully. Thank you!'); $('movieRequestForm').reset();
     if(window.TamilflixApp?.toast)window.TamilflixApp.toast('Movie request sent');
   }catch(err){showMessage('requestFormMessage','Could not send request: '+(err.message||'Please try again.'),true)}finally{if(btn)btn.disabled=false;}
 });
 function statusLabel(s){return ['Pending','Approved','Declined','Added'].includes(s)?s:'Pending'}
 async function loadRequests(){const sb=client();const box=$('adminRequestList');if(!box)return;
   if(!sb?.from){showMessage('requestAdminMessage','Supabase client is not configured. Shared requests cannot be loaded.',true);box.innerHTML='';return;}
   showMessage('requestAdminMessage','Loading requests…');
   try{const {data,error}=await sb.from('movie_requests').select('id,title,language,category,notes,status,created_at').order('created_at',{ascending:false}).limit(200);if(error)throw error;
     if(!data?.length){box.innerHTML='<p class="muted">No movie requests yet.</p>';showMessage('requestAdminMessage','Loaded successfully.');return;}
     box.innerHTML=data.map(r=>`<div class="admin-movie-item request-item"><div class="admin-title"><strong>${escapeHTML(r.title)}</strong><small>${escapeHTML(r.category)} · ${escapeHTML(r.language)} · ${escapeHTML(new Date(r.created_at).toLocaleString())}<br>Status: <span class="request-status">${escapeHTML(statusLabel(r.status))}</span></small>${r.notes?`<p class="request-notes">${escapeHTML(r.notes)}</p>`:''}<div class="request-item-actions"><button type="button" data-request-status="Approved" data-request-id="${escapeHTML(r.id)}">Approve</button><button type="button" data-request-status="Added" data-request-id="${escapeHTML(r.id)}">Marked Added</button><button type="button" data-request-status="Declined" data-request-id="${escapeHTML(r.id)}">Decline</button><button type="button" data-request-delete="${escapeHTML(r.id)}">Delete</button></div></div></div>`).join('');showMessage('requestAdminMessage',`${data.length} request(s) loaded.`);
   }catch(err){box.innerHTML='';showMessage('requestAdminMessage','Could not load requests. Check that you are logged in as the admin and run the SQL setup. Details: '+(err.message||'Access denied.'),true)}
 }
 async function updateRequest(id,patch){const sb=client();if(!sb?.from)return;try{const {error}=await sb.from('movie_requests').update(patch).eq('id',id);if(error)throw error;await loadRequests()}catch(err){showMessage('requestAdminMessage','Update failed: '+(err.message||'Access denied.'),true)}}
 document.addEventListener('click',async e=>{const status=e.target.closest('[data-request-status]');if(status){await updateRequest(status.dataset.requestId,{status:status.dataset.requestStatus});return}const del=e.target.closest('[data-request-delete]');if(del){if(!confirm('Delete this movie request?'))return;const sb=client();try{const {error}=await sb.from('movie_requests').delete().eq('id',del.dataset.requestDelete);if(error)throw error;await loadRequests()}catch(err){showMessage('requestAdminMessage','Delete failed: '+(err.message||'Access denied.'),true)}}});
 $('refreshRequestsBtn')?.addEventListener('click',loadRequests);
 window.TamilflixRequests={open:openRequest,refresh:loadRequests};
})();
