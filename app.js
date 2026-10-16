const DEFAULT_KEY='2b10mkicnklPEdEkRjrQhhohu';
'use strict';
const PLANTS=[
{n:'Sampaguita',s:'Jasminum sambac',c:'Ornamental',d:'Shrub with fragrant white flowers; the national flower of the Philippines.',u:'Garlands, perfume, tea scenting, offerings.'},
{n:'Narra',s:'Pterocarpus indicus',c:'Tree',d:'Large hardwood tree with yellow flowers; the national tree.',u:'Fine furniture and timber; bark traditionally used for skin conditions.'},
{n:'Malunggay',s:'Moringa oleifera',c:'Food',d:'Fast-growing tree with small compound leaves and long pods.',u:'Leaves eaten in soups (tinola); rich in vitamins and minerals.'},
{n:'Gumamela',s:'Hibiscus rosa-sinensis',c:'Ornamental',d:'Shrub with large showy, usually red, funnel-shaped flowers.',u:'Ornamental hedge; flowers used in folk remedies and as soap substitute.'},
{n:'Lagundi',s:'Vitex negundo',c:'Medicinal',d:'Shrub with five-fingered leaves and small violet flowers.',u:'Leaf decoction for cough and asthma (DOH-endorsed herbal medicine).'},
{n:'Akapulko',s:'Senna alata',c:'Medicinal',d:'Shrub with large pinnate leaves and upright yellow flower spikes.',u:'Leaves applied for ringworm and skin fungal infections (DOH-endorsed).'},
{n:'Sambong',s:'Blumea balsamifera',c:'Medicinal',d:'Aromatic shrub with hairy, toothed leaves.',u:'Leaf tea as a diuretic and for kidney stones (DOH-endorsed).'},
{n:'Tsaang-gubat',s:'Ehretia microphylla',c:'Medicinal',d:'Small shrub with glossy small leaves and white flowers.',u:'Leaf tea for stomach pain; mouthwash.'},
{n:'Yerba Buena',s:'Clinopodium douglasii',c:'Medicinal',d:'Creeping mint-like herb with a cool scent.',u:'Tea for pain and fever relief (DOH-endorsed).'},
{n:'Ylang-ylang',s:'Cananga odorata',c:'Ornamental',d:'Tall tree with drooping, intensely fragrant yellow-green flowers.',u:'Essential oil used in perfumery and aromatherapy.'},
{n:'Calamansi',s:'Citrus microcarpa',c:'Food',d:'Small citrus tree bearing round green-orange sour fruit.',u:'Juice, seasoning and dipping sauces; vitamin C source.'},
{n:'Niyog (Coconut)',s:'Cocos nucifera',c:'Tree',d:'Tall palm producing large fibrous fruits.',u:'Coconut water, oil, copra, fiber and lumber.'},
{n:'Banaba',s:'Lagerstroemia speciosa',c:'Medicinal',d:'Tree with large leaves and pink-purple flowers.',u:'Leaf tea traditionally used to help manage blood sugar.'},
{n:'Saging (Banana)',s:'Musa acuminata',c:'Food',d:'Giant herb with a pseudostem and large paddle-shaped leaves.',u:'Fruit, banana flower, leaves for wrapping food.'}
];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=t=>String(t??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}};
function toast(m,t=''){const e=document.createElement('div');e.className='toast '+t;e.textContent=m;$('#toasts').append(e);setTimeout(()=>e.remove(),3500)}

// Navigation
function show(){const v=(location.hash||'#identify').slice(1);const id=$('#'+v)&&$('#'+v).classList.contains('view')?v:'identify';
 $$('.view').forEach(x=>x.classList.toggle('show',x.id===id));$$('.nav a').forEach(a=>a.classList.toggle('on',a.dataset.v===id));
 if(id==='history')renderHistory();$('#main').scrollTop=0}
addEventListener('hashchange',show);

// Dictionary
let cat='All';
function renderDict(){const q=$('#q').value.toLowerCase().trim();
 const list=PLANTS.filter(p=>(cat==='All'||p.c===cat)&&(p.n+p.s+p.u+p.d).toLowerCase().includes(q));
 $('#grid').innerHTML=list.length?list.map(p=>`<div class="pcard" tabindex="0" role="button" data-s="${esc(p.s)}"><h3>${esc(p.n)}</h3><em>${esc(p.s)}</em><small>${esc(p.c)}</small><p>${esc(p.d)}</p></div>`).join(''):'<div class="empty">🔍 No plants match your search.</div>'}
function initDict(){const cats=['All',...new Set(PLANTS.map(p=>p.c))];
 $('#chips').innerHTML=cats.map(c=>`<button class="chip${c==='All'?' on':''}">${c}</button>`).join('');
 $('#chips').onclick=e=>{if(!e.target.classList.contains('chip'))return;cat=e.target.textContent;$$('.chip').forEach(x=>x.classList.toggle('on',x===e.target));renderDict()};
 $('#q').oninput=renderDict;
 $('#grid').onclick=e=>{const c=e.target.closest('.pcard');if(c)openPlant(c.dataset.s)};
 $('#grid').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){const c=e.target.closest('.pcard');if(c){e.preventDefault();openPlant(c.dataset.s)}}};
 renderDict()}
function openPlant(s,extra){const p=PLANTS.find(x=>x.s.toLowerCase()===String(s).toLowerCase());
 $('#dlgBody').innerHTML=p?`<h2>${esc(p.n)}</h2><em>${esc(p.s)}</em><p>${esc(p.d)}</p><h4>Documented uses</h4><p>${esc(p.u)}</p><p class="note">Category: ${esc(p.c)}. Not medical advice.</p>`:`<h2>${esc(s)}</h2>${extra||''}<p class="note">Not yet in the local dictionary.</p>`;
 $('#dlg').showModal()}
$('#dlgClose').onclick=()=>$('#dlg').close();

// Identify
let picked=null,thumb='';
const MAX=5*1024*1024,OK=['image/jpeg','image/png','image/webp'];
$('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;
 if(!OK.includes(f.type))return toast('Unsupported photo. Use JPG, PNG or WebP.','err');
 if(f.size>MAX)return toast('Photo is over 5 MB. Choose a smaller one.','err');
 picked=f;const url=URL.createObjectURL(f);const im=$('#preview');im.src=url;im.hidden=false;$('#dropText').hidden=true;$('#go').disabled=false;$('#results').innerHTML='';
 const t=new Image();t.onload=()=>{const r=160/Math.max(t.width,t.height),c=document.createElement('canvas');c.width=t.width*r;c.height=t.height*r;c.getContext('2d').drawImage(t,0,0,c.width,c.height);thumb=c.toDataURL('image/jpeg',.6)};t.src=url};
async function shrink(file){
 try{
  const bmp=await createImageBitmap(file);
  const r=Math.min(1,1000/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');
  c.width=Math.round(bmp.width*r);c.height=Math.round(bmp.height*r);
  c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
  const b=await new Promise(ok=>c.toBlob(ok,'image/jpeg',.8));
  if(b)return b;
 }catch(e){}
 return file;
}
$('#go').onclick=async()=>{
  const key=store.get('key','')||DEFAULT_KEY;
 if(!key){toast('Add your API key in Setup first.','err');location.hash='#settings';return}
 if(!navigator.onLine)return toast('You are offline. AI identification needs internet.','err');
 $('#loading').hidden=false;$('#go').disabled=true;$('#results').innerHTML='';
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),30000);
 try{
  const blob=await shrink(picked);
  const fd=new FormData();fd.append('images',blob,'plant.jpg');fd.append('organs',$('#organ').value);
  const r=await fetch('https://my-api.plantnet.org/v2/identify/all?lang=en&nb-results=3&api-key='+encodeURIComponent(key),{method:'POST',body:fd,signal:ctl.signal});
  if(r.status===404)throw new Error('No plant was recognized. Try a clearer, closer photo.');
  if(r.status===401||r.status===403){const m=await r.text().catch(()=>'');throw new Error('Key rejected ('+r.status+'). Check key and "expose my API key". '+m.slice(0,80))}
  if(r.status===429)throw new Error('Daily API limit reached. Try again tomorrow.');
  if(r.status===400||r.status===415)throw new Error('The photo could not be processed. Try another one.');
  if(!r.ok)throw new Error('Service error ('+r.status+'). Try again later.');
  const data=await r.json();const res=(data.results||[]).slice(0,3);
  if(!res.length)throw new Error('No matches found. Try a clearer photo.');
  showResults(res);
 }catch(err){toast(err.name==='AbortError'?'Timed out. Check your connection and try again.':err instanceof TypeError?'Network error. The request was blocked or failed.':err.message,'err')}
 finally{clearTimeout(timer);$('#loading').hidden=true;$('#go').disabled=false}};
function showResults(res){
 const items=res.map(x=>({sci:x.species.scientificNameWithoutAuthor,fam:x.species.family?.scientificNameWithoutAuthor||'',common:(x.species.commonNames||[]).slice(0,3),score:Math.round(x.score*100)}));
 $('#results').innerHTML=items.map((i,k)=>{const l=PLANTS.find(p=>p.s.toLowerCase()===i.sci.toLowerCase());
  return `<div class="card"><h3>${k?'':'⭐ '}${esc(i.sci)}</h3><p><b>${i.score}% match</b></p><div class="bar"><i style="width:${i.score}%"></i></div>
  <p>Family: ${esc(i.fam)||'—'}<br>Common names: ${esc(i.common.join(', ')||'—')}</p>
  ${l?`<p><b>${esc(l.n)}</b>: ${esc(l.d)}</p><p><b>Uses:</b> ${esc(l.u)}</p>`:'<p class="note">No local description yet for this species.</p>'}</div>`}).join('');
 const h=store.get('hist',[]);h.unshift({id:Date.now(),thumb,items});
 if(!store.set('hist',h.slice(0,30)))toast('Could not save (storage full).','err');else toast('Saved to history','ok')}

// History
function renderHistory(){const h=store.get('hist',[]);
 $('#hlist').innerHTML=h.length?h.map(r=>{const t=r.items[0];return `<div class="pcard">${r.thumb?`<img src="${r.thumb}" alt="">`:''}<h3>${esc(t.sci)}</h3><em>${t.score}% match · ${new Date(r.id).toLocaleDateString()}</em><button class="btn" data-v="${r.id}">View</button><button class="btn ghost" data-d="${r.id}">Delete</button></div>`}).join(''):'<div class="empty">🌱 No saved identifications yet.</div>';
 $('#clear').hidden=!h.length}
$('#hlist').onclick=e=>{const v=e.target.dataset.v,d=e.target.dataset.d;const h=store.get('hist',[]);
 if(d){store.set('hist',h.filter(r=>String(r.id)!==d));renderHistory();toast('Record deleted','ok')}
 if(v){const r=h.find(x=>String(x.id)===v);openPlant(r.items[0].sci,`<p>Top match ${r.items[0].score}%. Other: ${esc(r.items.slice(1).map(i=>i.sci).join(', ')||'none')}</p>`)}};
$('#clear').onclick=()=>{if(confirm('Delete all saved records?')){store.set('hist',[]);renderHistory();toast('History cleared','ok')}};

// Settings
$('#key').value=store.get('key','');
$('#saveKey').onclick=async()=>{const k=$('#key').value.trim();store.set('key',k);toast('API key saved','ok');try{const r=await fetch('https://my-api.plantnet.org/v2/projects?api-key='+encodeURIComponent(k));const t=await r.text();setTimeout(()=>toast('Test '+r.status+': '+t.slice(0,70),r.ok?'ok':'err'),1500)}catch(e){setTimeout(()=>toast('Test blocked: no reply allowed for this domain','err'),1500)}};

// Online status + service worker
function net(){const o=navigator.onLine;$('#net').textContent=o?'Online':'Offline';$('#net').classList.toggle('off',!o)}
addEventListener('online',net);addEventListener('offline',net);net();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
initDict();show();
