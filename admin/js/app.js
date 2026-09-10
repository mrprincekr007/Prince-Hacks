/* Admin v3 - SELL ANYTHING (type/gallery/shipping/pipeline) */
const $ = id => document.getElementById(id);
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300);}
function esc(s){return String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function csv(name,rows){const c=rows.map(r=>r.map(x=>`"${String(x??"").replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+c],{type:"text/csv"}));a.download=name;a.click();}

let PRODUCTS={},ORDERS={},COUPONS={},QUERIES={},REVIEWS={},KEYS={},CATS={};
let SETTINGS={storeName:"Prince Hacks Store",upiId:"princehacks@okhdfc",upiName:"Prince Hacks",whatsapp:"919999999999",notice:"",offerEnd:0,maintenance:false,heroTitle:"",heroSub:"",deliveryFee:49,freeAbove:999,codAllowed:true,paymentLink:"",zapKey:"",paypal:"",paypalLink:"",binance:"",binanceLink:"",blocked:[],contact:[]};
let salesChart=null,catChart=null,lastOrderCount=0,firstLoad=true;
const CATL={panel:"Game Panel",code:"Source Code",video:"Video + Files",project:"Project"};
const STS=["pending","paid","done","cancelled"];

/* LOGIN (Firebase Auth - sirf Firebase Authentication me bana user) */
try{const sv=JSON.parse(localStorage.getItem("phs_adm")||"null");
  if(sv&&sv.e){$("admEmail").value=sv.e;$("admPass").value=sv.p||"";
    const h=$("saveHint");if(h)h.textContent="💾 Saved login auto-loaded";}}catch(e){}
function saveAuth(){
  const em=$("admEmail").value.trim(),pw=$("admPass").value;
  if(!em||!pw){$("loginErr").textContent="❌ Pehle Gmail aur password dono bharo";return;}
  localStorage.setItem("phs_adm",JSON.stringify({e:em,p:pw}));
  $("loginErr").textContent="";
  const h=$("saveHint");if(h){h.textContent="✅ Gmail & Password save ho gaya! Ab login karo.";}
  setTimeout(()=>$("admPass").focus(),300);
}
document.getElementById("yr").textContent=new Date().getFullYear();
async function adminLogin(){
  const em=$("admEmail").value.trim(), pw=$("admPass").value;
  const bt=$("loginBtn");
  if(!em||!pw){$("loginErr").textContent="❌ Email aur password dono bharo";return;}
  if(!firebase.auth()){$("loginErr").textContent="❌ Firebase Auth connected nahi hai";return;}
  $("loginErr").textContent="";bt.disabled=true;bt.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Login ho raha hai...';
  try{
    await firebase.auth().signInWithEmailAndPassword(em,pw);
  }catch(e){
    bt.disabled=false;bt.innerHTML='<i class="fa-solid fa-right-to-bracket"></i> Login';
    $("loginBoxAnim")?.classList.remove("err-shake");void $("loginBoxAnim")?.offsetWidth;$("loginBoxAnim")?.classList.add("err-shake");
    const m=e.code||"";
    if(m==="auth/invalid-email")$("loginErr").textContent="❌ Email format galat hai";
    else if(m==="auth/invalid-credential"||m==="auth/user-not-found"||m==="auth/wrong-password")$("loginErr").textContent="❌ Galat Email ya Password!";
    else if(m==="auth/too-many-requests")$("loginErr").textContent="⏳ Bahut tries ho gaye, thodi der baad aao";
    else $("loginErr").textContent="❌ "+e.message;
  }
}
firebase.auth().onAuthStateChanged(u=>{
  if(u){sessionStorage.setItem("phs_admin",u.email||"1");showPanel();toast("✅ Welcome "+esc(u.email||"Boss")+"!");}
  else $("panel").style.display="none";
});
function adminLogout(){firebase.auth().signOut().then(()=>{sessionStorage.removeItem("phs_admin");location.reload();});}
function showPanel(){$("loginScreen").style.display="none";$("panel").style.display="block";startListeners();}
if(firebase.auth().currentUser)showPanel();
["admEmail","admPass"].forEach(id=>{const el=$(id);if(el)el.addEventListener("keydown",e=>{if(e.key==="Enter")adminLogin();});});
document.querySelectorAll(".side-btn").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".side-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("show"));$("tab-"+b.dataset.tab).classList.add("show");
  $("tabTitle").textContent=b.textContent.trim();closeSide();onTab(b.dataset.tab);}));
function goTab(t){document.querySelector('[data-tab="'+t+'"]').click();}
function toggleGroup(b){const g=b.nextElementSibling;if(!g||!g.classList.contains("side-grp"))return;
  const on=g.classList.toggle("open");
  b.classList.toggle("open",on);
  b.querySelector(".facv")?.setAttribute("class","fa-solid facv fa-angle-"+(on?"down":"right"));
  localStorage.setItem("grp_"+b.dataset.g,on?"1":"0");}
document.querySelectorAll(".side-group").forEach(b=>{
  if(localStorage.getItem("grp_"+b.dataset.g)==="0"){b.classList.remove("open");const g=b.nextElementSibling;
  if(g&&g.classList.contains("side-grp"))g.classList.remove("open");
  b.querySelector(".facv")?.setAttribute("class","fa-solid facv fa-angle-right");}});
function onTab(t){try{
  if(t==="cats")renderCatsPage();
  if(t==="report")drawCharts(Object.values(ORDERS));
  if(t==="broadcast")renderBroadcast();
}catch(e){}}

/* LISTENERS */
function startListeners(){
  if(!db){$("connDot").textContent="🔴 Firebase off";return;}
  $("connDot").textContent="🟢 Live Connected";
  db.ref("settings").on("value",s=>{if(s.exists()){SETTINGS={...SETTINGS,...s.val()};fillSettings();}});
  db.ref("products").on("value",s=>{PRODUCTS=s.exists()?s.val():{};renderProducts();renderDash();renderCatsPage();});
  db.ref("cats").on("value",s=>{CATS=s.exists()?s.val():{};renderCatsPage();});
  db.ref("orders").on("value",s=>{ORDERS=s.exists()?s.val():{};const n=Object.keys(ORDERS).length;
    if(!firstLoad&&n>lastOrderCount){try{$("newOrderSound").play();}catch(e){}toast("🔔 Naya Order!");notifyBoss("🔔 Naya Order Aaya!","Prince Hacks Store me naya order hai.");}
    lastOrderCount=n;firstLoad=false;renderOrders();renderPayments();renderDash();renderCustomers();
    try{const seen={};Object.values(ORDERS).forEach(o=>{if(/^[6-9]\d{9}$/.test(o.phone||""))seen[o.phone]=1;});const bc=$("bcastCount");if(bc)bc.textContent=Object.keys(seen).length;}catch(e){}});
  db.ref("coupons").on("value",s=>{COUPONS=s.exists()?s.val():{};renderCoupons();});
  db.ref("queries").on("value",s=>{QUERIES=s.exists()?s.val():{};renderQueries();});
  db.ref("reviews").on("value",s=>{REVIEWS=s.exists()?s.val():{};renderReviews();});
  db.ref("keys").on("value",s=>{KEYS=s.exists()?s.val():{};renderKeys();renderProducts();});
}

/* DASH */
function renderDash(){const p=Object.keys(PRODUCTS).length,o=Object.values(ORDERS);
  $("stProducts").textContent=p;$("pCountSide").textContent=p;$("stOrders").textContent=o.length;$("oCountSide").textContent=o.length;
  $("stRevenue").textContent="₹"+o.reduce((s,x)=>s+(+x.total||0),0);
  $("stPending").textContent=o.filter(x=>!["done","cancelled"].includes(x.status)).length;
  const today=new Date().toDateString();
  $("stToday").textContent="₹"+o.filter(x=>new Date(x.date).toDateString()===today).reduce((s,x)=>s+(+x.total||0),0);
  $("stQuery").textContent=Object.keys(QUERIES).length;
  tickClock();
  const last=[...o].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  $("recentOrders").innerHTML=last.length?last.map(x=>`<div class="olist-item"><div><h4>${esc(x.orderId)} - ${esc(x.name)} (${esc(x.phone)})</h4><small>${(x.items||[]).map(i=>esc(i.name)+"x"+(i.qty||1)).join(", ")} • ₹${x.total} • ${x.status}</small></div></div>`).join(""):"<p style='color:#888'>Koi order nahi.</p>";
  // low stock
  const low=Object.entries(PRODUCTS).filter(([id,p])=>(+p.stock||0)<=5);
  $("lowStock").innerHTML=low.length?low.map(([id,p])=>`<p>⚠️ ${esc(p.name)} - <b>${p.stock}</b> <button onclick="stockCh('${id}',10)">+10</button></p>`).join(""):"<p style='color:green'>✅ Sab stock OK</p>";
  // top products by qty sold
  const sold={};o.forEach(x=>(x.items||[]).forEach(i=>sold[i.name]=(sold[i.name]||0)+(+i.qty||1)));
  const top=Object.entries(sold).sort((a,b)=>b[1]-a[1]).slice(0,5);
  $("topProducts").innerHTML=top.length?top.map(([n,q])=>`<p>🏆 ${esc(n)} - <b>${q} sold</b></p>`).join(""):"<p style='color:#888'>Abhi sale nahi.</p>";
  drawCharts(o);}

function drawCharts(o){try{if(typeof Chart==="undefined"||!$("salesChart"))return;
  const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d;});
  const labels=days.map(d=>d.toLocaleDateString("hi-IN",{day:"numeric",month:"short"}));
  const rev=days.map(d=>o.filter(x=>new Date(x.date).toDateString()===d.toDateString()).reduce((s,x)=>s+(+x.total||0),0));
  if(salesChart)salesChart.destroy();
  salesChart=new Chart($("salesChart"),{type:"bar",data:{labels,datasets:[{label:"₹",data:rev,backgroundColor:"#2874f0"}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  const cats={};Object.values(PRODUCTS).forEach(p=>cats[p.category]=(cats[p.category]||0)+1);
  if(catChart)catChart.destroy();
  catChart=new Chart($("catChart"),{type:"doughnut",data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats),backgroundColor:["#ff6384","#36a2eb","#ffce56","#4bc0c0","#9966ff","#00c853"]}]}});}catch(e){}}

/* IMAGE UPLOAD -> compressed base64 (bina hosting ke photo) */
function uploadImages(el){const files=[...el.files].slice(0,5);if(!files.length)return;toast("⏳ Photos compress...");
  let done=0;files.forEach(f=>{const r=new FileReader();
    r.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");
      const mx=800,sc=Math.min(1,mx/Math.max(img.width,img.height));c.width=img.width*sc;c.height=img.height*sc;
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      const url=c.toDataURL("image/jpeg",.7);
      $("fImages").value=($("fImages").value?$("fImages").value+"\n":"")+url;
      if(!$("fImage").value)$("fImage").value=url;
      if(++done===files.length)toast("✅ Photos add! (Save dabao)");};img.src=r.result;};r.readAsDataURL(f);});
  el.value="";}

/* PRODUCTS */
function saveProduct(){const name=$("fName").value.trim(),price=+$("fPrice").value;
  if(!name||!price){toast("❌ Naam+Price");$("fName").classList.add("err-shake");$("fPrice").classList.add("err-shake");setTimeout(()=>{$("fName").classList.remove("err-shake");$("fPrice").classList.remove("err-shake");},600);return;}
  const cat=$("fCat").value.trim().toLowerCase().replace(/\s+/g,"")||"other";
  const id=$("fId").value||db.ref("products").push().key;
  db.ref("products/"+id).set({name,category:cat,catLabel:$("fCatLabel").value.trim()||CATL[cat]||cat,
    ptype:"digital",tags:$("fTags").value.trim(),featured:$("fFeat2").checked,custom:$("fCustom").checked,
    price,oldPrice:+$("fOld").value||price,badge:$("fBadge").value.trim(),icon:$("fIcon").value.trim()||"📦",
    image:$("fImage").value.trim(),images:$("fImages").value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,6),
    color:$("fColor").value||"linear-gradient(135deg,#2874f0,#6a11cb)",desc:$("fDesc").value.trim(),
    features:$("fFeat").value.split("\n").map(x=>x.trim()).filter(Boolean),download:$("fDl").value.trim(),video:$("fVideo").value.trim(),
    rating:+$("fRating").value||4.5,reviews:PRODUCTS[id]?.reviews||0,stock:$("fStock").value===""?99:+$("fStock").value,
    active:$("fActive").checked,createdAt:Date.now()}).then(()=>{toast("✅ Save! Nayi category ho to store me auto aayegi.");resetForm();});}
function editProduct(id){const p=PRODUCTS[id];if(!p)return;
  $("fId").value=id;$("fName").value=p.name;$("fCat").value=p.category;
  $("fTags").value=p.tags||"";$("fFeat2").checked=!!p.featured;$("fPrice").value=p.price;$("fOld").value=p.oldPrice||"";
  $("fBadge").value=p.badge||"";$("fIcon").value=p.icon||"";$("fImage").value=p.image||"";
  $("fImages").value=(p.images||[]).join("\n");$("fColor").value=p.color||"";$("fCatLabel").value=p.catLabel||"";
  $("fDesc").value=p.desc||"";$("fFeat").value=(p.features||[]).join("\n");$("fDl").value=p.download||"";$("fVideo").value=p.video||"";
  $("fRating").value=p.rating||4.5;$("fStock").value=p.stock??99;$("fActive").checked=p.active!==false;$("fCustom").checked=!!p.custom;
  $("formTitle").textContent="✏️ Edit: "+p.name;document.querySelector('[data-tab="products"]').click();scrollTo(0,0);}
function delProduct(id){if(confirm("Delete?"))db.ref("products/"+id).remove().then(()=>toast("🗑 Deleted"));}
function dupProduct(id){const p={...PRODUCTS[id]};p.name+=" (Copy)";db.ref("products").push({...p,createdAt:Date.now()}).then(()=>toast("📋 Copy!"));}
function stockCh(id,d){db.ref("products/"+id+"/stock").set(Math.max(0,(+PRODUCTS[id].stock||0)+d));}
function resetForm(){["fId","fName","fCat","fTags","fPrice","fOld","fBadge","fIcon","fImage","fImages","fCatLabel","fDesc","fFeat","fDl","fVideo"].forEach(i=>$(i).value="");$("fColor").value="linear-gradient(135deg,#2874f0,#6a11cb)";$("fRating").value=4.5;$("fStock").value=99;$("fActive").checked=true;$("fFeat2").checked=false;$("fCustom").checked=false;$("formTitle").textContent="➕ Naya Product (kuch bhi becho!)";}
function renderProducts(){const q=($("prodSearch")?.value||"").toLowerCase(),box=$("productList");
  const keys=Object.keys(PRODUCTS).filter(id=>((PRODUCTS[id].name||"")+" "+(PRODUCTS[id].category||"")).toLowerCase().includes(q));
  keys.sort((a,b)=>(+PRODUCTS[a].sort||1e9)-(+PRODUCTS[b].sort||1e9));
  box.innerHTML=keys.length?keys.slice(0,prodLimit).map((id,i)=>{const p=PRODUCTS[id];
  const kl=KEYS[id]?Object.values(KEYS[id]):[],ku=kl.filter(k=>!k.used).length;
  const img=p.image||((p.images&&p.images[0])||"");
  const desc=String(p.desc||"").replace(/\s+/g," ").trim();
    return `<div class="plist-item" data-pid="${id}" draggable="true" ondragstart="pDragStart(this)" ondragover="pDragOver(event)" ondragleave="pDragLeave(this)" ondrop="pDragDrop(event)" ondragend="pDragEnd(this)"><div class="plist-emoji" style="background:${p.color||'#2874f0'}">${p.icon||"📦"}${img?`<img src="${img}" loading="lazy" onerror="this.remove()">`:""}<span class="ppos">${i+1}</span><span class="dgrip">⠿</span></div>
    <div style="flex:1;min-width:0">
      <div class="ptop"><h4>${esc(p.name)}</h4><div class="chips">
        ${p.featured?`<span class="chip chip-gold">⭐ Featured</span>`:""}
        ${p.custom?`<span class="chip chip-blue">🧩 Custom</span>`:""}
        ${p.badge?`<span class="chip chip-orange">${esc(p.badge)}</span>`:""}
        ${p.active===false?`<span class="chip chip-red">Hidden</span>`:`<span class="chip chip-green">● Live</span>`}
      </div></div>
      <div class="pline">💰 <b class="pprice">₹${p.price}</b>${p.oldPrice?` <s class="pold">₹${p.oldPrice}</s>`:""}<span class="pmeta"> • ${esc(p.catLabel||p.category)} • 👁 ${p.views||0}</span></div>
      <div class="pline">🔑 ${ku}/${kl.length} keys • Stock: <b>${p.stock??"∞"}</b>${p.download?` • <span class="txt-green">🔗 link</span>`:""}${p.video?` • 📺 video`:""}</div>
      ${desc?`<div class="desc-pv">${esc(desc.slice(0,170))}${desc.length>170?"…":""}</div>`:""}
      <div class="stock-btns"><button class="mv up" onclick="sortCh('${id}',-1)" title="Store me upar">⬆ Upar</button><button class="mv dn" onclick="sortCh('${id}',1)" title="Store me niche">⬇ Niche</button><button onclick="stockCh('${id}',-1)">-1</button><button onclick="stockCh('${id}',1)">+1</button></div>
    </div>
    <div class="acts"><button class="ab ab-edit" onclick="editProduct('${id}')">✎ Edit</button><button class="ab ab-copy" onclick="dupProduct('${id}')">⧉ Copy</button><button class="ab ab-del" onclick="delProduct('${id}')">🗑 Del</button></div></div>`;}).join("")+(keys.length>prodLimit?`<button class="more-btn" onclick="prodLimit+=20;renderProducts()">▼ Aur Dikhao (${keys.length-prodLimit})</button>`:""):"<p style='color:#888'>Kuch nahi.</p>";}
function sortCh(id,dir){
  let list=Object.entries(PRODUCTS).map(([i,p])=>({id:i,s:(+p.sort)||null,row:p}));
  const anyMiss=list.some(x=>x.s===null||x.s===0);
  if(anyMiss)list.forEach((x,i)=>{x.s=x.s||(i+1);});
  else list.sort((a,b)=>a.s-b.s);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return;
  const to=idx+dir;if(to<0||to>=list.length){toast("⚠️ Yahan se nahi ja sakta — edge!");return;}
  [list[idx].s,list[to].s]=[list[to].s,list[idx].s];
  const up={};list.forEach(x=>{up["products/"+x.id+"/sort"]=x.s;});
  db.ref().update(up).then(()=>toast("✅ Order update! Store me turant dikhega"));}
/* drag & drop re-order */
let _dragId=null;
function pDragStart(el){_dragId=el.dataset.pid;el.classList.add("dragging");}
function pDragOver(e){e.preventDefault();const t=e.target.closest(".plist-item");if(t&&t.dataset.pid!==_dragId)t.classList.add("drag-over");}
function pDragLeave(el){el.classList.remove("drag-over");}
function pDragDrop(e){e.preventDefault();const t=e.target.closest(".plist-item");if(!t||!_dragId)return;
  const box=$("productList");let ids=[...box.querySelectorAll(".plist-item")].map(x=>x.dataset.pid);
  const from=ids.indexOf(_dragId),to=ids.indexOf(t.dataset.pid);
  if(from<0||to<0||from===to)return;
  ids.splice(from,1);ids.splice(to,0,_dragId);
  const up={};ids.forEach((id,i)=>{up["products/"+id+"/sort"]=i+1;});
  document.querySelectorAll(".plist-item").forEach(x=>x.classList.remove("drag-over","dragging"));
  db.ref().update(up).then(()=>{toast("✅ Naya order set! Store me turant dikhega");renderProducts();});}
function pDragEnd(){document.querySelectorAll(".plist-item").forEach(x=>x.classList.remove("drag-over","dragging"));}

/* ORDERS PIPELINE */
function renderOrders(){const f=$("ordFilter").value,q=($("ordSearch")?.value||"").toLowerCase(),box=$("orderList");
  let list=Object.entries(ORDERS).map(([id,v])=>({id,...v}));
  if(f!=="all")list=list.filter(x=>x.status===f);
  if(q)list=list.filter(x=>((x.orderId||"")+(x.name||"")+(x.phone||"")).toLowerCase().includes(q));
  list.sort((a,b)=>new Date(b.date)-new Date(a.date));
  box.innerHTML=list.length?list.slice(0,ordLimit).map(o=>`<div class="olist-item"><div>
    <h4>${esc(o.orderId)} - ${esc(o.name)} <span class="status ${o.status==='done'?'done':'pending'}">${(o.status||"").toUpperCase()}</span> ${badgeMtd(o.pay||"upi")} ${(o.keys||[]).length?` <small>🔑 ${o.keys.length}</small>`:""}</h4>
    <small>📱 ${esc(o.phone)} • 📦 ${(o.items||[]).map(i=>esc(i.name)+"x"+(i.qty||1)).join(", ")}<br>
    💰 ₹${o.total}${o.coupon?` (🎟️ ${esc(o.coupon)})`:""} • ${new Date(o.date).toLocaleString("hi-IN")}</small>
    <div style="margin-top:6px"><select onchange="setStatus('${o.id}',this.value)">${STS.map(s=>`<option value="${s}" ${o.status===s?"selected":""}>${s}</option>`).join("")}</select></div></div>
    <div class="acts"><button onclick="openOrder('${o.id}')" title="Detail">👁</button><a href="https://wa.me/91${esc(o.phone)}" target="_blank"><button class="wa">WA</button></a>
    <button onclick="printBill('${o.id}')">🖨️</button><button class="del" onclick="delOrder('${o.id}')">✖</button></div></div>`).join("")+(list.length>ordLimit?`<button class="more-btn" onclick="ordLimit+=20;renderOrders()">▼ Aur (${list.length-ordLimit})</button>`:""):"<p style='color:#888'>Koi order nahi.</p>";}
function setStatus(id,s){db.ref("orders/"+id+"/status").set(s).then(()=>toast("✅ "+s));}

/* PAYMENT METHODS meta (pm kaise dikhega) */
const PM_META={zapupi:{l:"⚡ Auto UPI",c:"#16a34a"},upi:{l:"📱 Manual UPI",c:"#ea580c"},paypal:{l:"💳 PayPal",c:"#2563eb"},binance:{l:"🪙 Binance",c:"#f59e0b"}};
function payLbl(pm){const m=PM_META[pm]||{l:"📱 UPI",c:"#555"};return {l:m.l,c:m.c,manual:pm!=="zapupi"};}
function badgeMtd(pm){const m=payLbl(pm);return `<span class="pm-badge" style="border-color:${m.c};color:${m.c}">${m.l}</span>`;}

/* PAYMENTS PAGE - har transaction (auto + manual) + approve */
function renderPayments(){
  const box=$("paymentList");if(!box)return;
  const mf=$("payMtdFilter")?.value||"all",sf=$("payStFilter")?.value||"all";
  const q=($("paySearch")?.value||"").toLowerCase().trim();
  let list=Object.entries(ORDERS).map(([id,v])=>({id,...v}));
  if(mf!=="all")list=list.filter(x=>(x.pay||"upi")===mf);
  if(sf!=="all")list=list.filter(x=>x.status===sf);
  if(q)list=list.filter(x=>((x.orderId||"")+(x.name||"")+(x.phone||"")).toLowerCase().includes(q));
  list.sort((a,b)=>new Date(b.date)-new Date(a.date));
  const pend=list.filter(x=>x.status==="pending").length, got=list.reduce((s,x)=>s+(x.status==="paid"||x.status==="done"?+x.total||0:0),0);
  $("payCountSide").textContent=pend;
  const sum=$("paySummary");sum.innerHTML=
    `<div class="pay-sum" style="background:#ef4444">⏳ Pending approvals: <b>${pend}</b></div>`+
    `<div class="pay-sum" style="background:#16a34a">✅ Received: ₹${got.toLocaleString("en-IN")}</div>`+
    `<div class="pay-sum" style="background:#2874f0">🧾 Total txns: <b>${list.length}</b></div>`;
  box.innerHTML=list.length?list.slice(0,ordLimit).map(o=>{
    const m=payLbl(o.pay||"upi");
    return `<div class="olist-item"><div>
      <h4>${esc(o.orderId)} — ${esc(o.name)} <span class="status ${o.status==='done'?'done':(o.status==='paid'?'paid':'pending')}">${(o.status||"").toUpperCase()}</span> ${o.req?"📝":""} ${o.delivery?"🔗":""}</h4>
      <small>${badgeMtd(o.pay||"upi")} 📦 ${(o.items||[]).map(i=>esc(i.name)+"x"+(i.qty||1)).join(", ")}<br>
      📱 ${esc(o.phone)} • 💰 ₹${o.total} • ${new Date(o.date).toLocaleString("hi-IN")}${m.manual?` • <span style="color:#ea580c">${o.status==="pending"?"⚠️ approval waiting":"manual"}</span>`:""}</small>
      <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
        ${o.status==="pending"?`<button class="green" onclick="approvePay('${o.id}')">✅ Approve Payment</button><button class="wa" onclick="deliverOrder('${o.id}')">📦 Deliver+WA</button>`:""}
        <button onclick="openOrder('${o.id}')">👁 Detail</button>
      </div></div>
      <div class="acts"><a href="https://wa.me/91${esc(o.phone)}" target="_blank"><button class="wa">WA</button></a>
      <button onclick="printBill('${o.id}')">🖨️</button><button class="del" onclick="delOrder('${o.id}')">✖</button></div>
    </div>`;}).join("")+(list.length>ordLimit?`<button class="more-btn" onclick="ordLimit+=20;renderPayments()">▼ Aur (${list.length-ordLimit})</button>`:""):"<p style='color:#888'>Koi payment nahi.</p>";
}
async function claimOrder(id){const o=ORDERS[id];if(!o)return[];
  const keys=[];
  for(const it of (o.items||[])){const pid=it.id;
    try{if(db){const s=await db.ref("keys/"+pid).get();if(s.exists()){let fk="";s.forEach(c=>{if(!fk&&c.val()&&!c.val().used)fk=c.key;});
      if(fk){await db.ref("keys/"+pid+"/"+fk).update({used:true,orderId:id,date:Date.now()});
        const kk=await db.ref("keys/"+pid+"/"+fk+"/key").get();if(kk.exists())keys.push({id:pid,name:it.name,key:String(kk.val())});}}}}catch(e){}
    try{if(db&&!o.stockDed){const p=PRODUCTS[pid];if(p)db.ref("products/"+pid+"/stock").set(Math.max(0,(+p.stock||99)-(+it.qty||1)));}}catch(e){}
  }
  if(!o.stockDed)try{await db.ref("orders/"+id+"/stockDed").set(true);}catch(e){}
  if(keys.length)try{await db.ref("orders/"+id+"/keys").set(keys);}catch(e){}
  return keys;}
function approvePay(id){const o=ORDERS[id]||{};if(!o)return;
  if(o.status!=="pending"){toast("✅ Pehle se approved");return;}
  claimOrder(id).then(()=>{db.ref("orders/"+id+"/status").set("paid");
    toast("✅ Payment approved! Keys claim ho gayi.");
    const w=`https://wa.me/91${String(o.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent("Namaste "+o.name+", aapka payment ₹"+o.total+" CONFIRM ho gaya ✅\nOrder: "+o.orderId+"\nFiles/key WhatsApp par bhej rahe hain...")}`;
    open(w,"_blank");});}

function deliverOrder(id){const o=ORDERS[id]||{};if(!o)return;
  claimOrder(id).then(keys=>{const dls=(o.items||[]).map(i=>{const p=PRODUCTS[i.id];return(p&&p.download)?i.name+" -> "+p.download:"";}).filter(Boolean).join("\n");
    const keysTxt=keys.map(k=>k.name+": "+k.key).join("\n");
    let msg=`Namaste ${o.name||""} 🙏\nAapka order ${o.orderId||""} DELIVERED ho gaya ✅\n\n📦 ${(o.items||[]).map(i=>i.name+" x"+(i.qty||1)).join(", ")}\n💰 Amount: Rs.${o.total||0}\n\n⬇️ Download:\n${dls||"Link WhatsApp par mil rha hai"}`;
    if(keysTxt)msg+=`\n🔑 Keys:\n${keysTxt}`;
    msg+="\n\nThanks for shopping with us! ❤️";
    if(o.status!=="done")setStatus(id,"done");
    open("https://wa.me/91"+String(o.phone||"").replace(/\D/g,"")+"?text="+encodeURIComponent(msg),"_blank");
    toast("📤 Message + Status done");});}
function deliverLink(id){const o=ORDERS[id]||{};const link=$("ordLink").value.trim();if(!link){toast("❌ Download link daalo");return;}
  db.ref("orders/"+id+"/delivery").set({link,deliveredAt:Date.now()});
  db.ref("orders/"+id+"/status").set("done");
  const appName=(o.req&&o.req.appName)||(o.items||[]).map(i=>i.name).join(", ");
  const msg=`Namaste ${o.name||""} 🙏\nAapka order ${o.orderId||""} COMPLETE ho gaya! ✅\n\n📦 ${appName}\n\n⬇️ Aapka product hai:\n${link}\n\nMy Orders me bhi milega. Thanks for shopping! ❤️`;
  open("https://wa.me/91"+String(o.phone||"").replace(/\D/g,"")+"?text="+encodeURIComponent(msg),"_blank");
  toast("✅ Link dal diya + WhatsApp bheja");}
function delOrder(id){if(confirm("Delete?"))db.ref("orders/"+id).remove();}
function printBill(id){const o=ORDERS[id];const w=open("","_blank");
  w.document.write(`<h2>${esc(SETTINGS.storeName)}</h2><p>Bill ${o.orderId}<br>${esc(o.name)} ${esc(o.phone)}<br>${new Date(o.date).toLocaleString("hi-IN")}</p><hr>${(o.items||[]).map(i=>`<p>${esc(i.name)} x${i.qty||1} - ₹${i.price*(i.qty||1)}</p>`).join("")}${(o.keys||[]).map(k=>`<p>🔑 ${esc(k.name)}: <b>${esc(k.key)}</b></p>`).join("")}<h3>Total ₹${o.total} (${payLbl(o.pay||"upi").l})</h3><script>print()<\/script>`);}

/* QUERIES/REVIEWS/CUSTOMERS */
function renderQueries(){const k=Object.keys(QUERIES||{});$("qCountSide").textContent=k.length;
  $("queryList").innerHTML=k.length?k.reverse().map(id=>{const q=QUERIES[id];
    return `<div class="olist-item"><div><h4>${esc(q.name)} (${esc(q.phone||"")})</h4><small>${esc(q.msg)}<br>${new Date(q.date).toLocaleString("hi-IN")}</small></div>
    <div class="acts"><a href="https://wa.me/91${esc(q.phone||"")}?text=${encodeURIComponent("Namaste "+(q.name||"")+", jawab: ")}" target="_blank"><button class="wa">Reply</button></a><button class="del" onclick="blockNum('${esc(q.phone||"")}')" title="Block">🚫</button><button class="del" onclick="db.ref('queries/${id}').remove()">✖</button></div></div>`;}).join(""):"<p style='color:#888'>Koi message nahi 🎉</p>";}
function renderReviews(){const k=Object.keys(REVIEWS||{});
  $("reviewList").innerHTML=k.length?k.reverse().map(id=>{const r=REVIEWS[id];
    return `<div class="olist-item"><div><h4>${"★".repeat(r.stars||5)} - ${esc(r.name)} <span style="color:#888;font-weight:400">(${esc(r.phone||"")})</span></h4><small>${esc(r.text)}</small></div><div class="acts"><button class="del" onclick="blockNum('${esc(r.phone||"")}')" title="Block">🚫</button><button class="del" onclick="db.ref('reviews/${id}').remove()">Del</button></div></div>`;}).join(""):"<p style='color:#888'>Koi review nahi.</p>";}
function blockNum(phone){if(!phone)return;const p=String(phone).replace(/\D/g,"").slice(-10);if(!p){toast("❌ Galat number");return;}if(!confirm("Block number "+p+" ?"))return;const b=(SETTINGS.blocked||[]).map(x=>String(x));if(!b.includes(p)){b.push(p);db.ref("settings/blocked").set(b);toast("🚫 Blocked "+p);}else toast("Pehle se blocked hai.");}
function renderCustomers(){const m={};Object.values(ORDERS).forEach(o=>{const k=o.phone||"?";m[k]=m[k]||{phone:k,name:o.name,orders:0,spent:0};m[k].orders++;m[k].spent+=+o.total||0;if(o.name)m[k].name=o.name;});
  const list=Object.values(m).sort((a,b)=>b.spent-a.spent);
  $("customerList").innerHTML=list.length?list.map(c=>`<div class="olist-item"><div><h4>${esc(c.name)} - ${esc(c.phone)}</h4><small>${c.orders} orders • ₹${c.spent}</small></div><div class="acts"><a href="https://wa.me/91${esc(c.phone)}" target="_blank"><button class="wa">WA</button></a></div></div>`).join(""):"<p style='color:#888'>No customers.</p>";}

/* COUPONS */
function saveCoupon(){const c=$("cCode").value.trim().toUpperCase();if(!c){toast("❌ Code");return;}
  db.ref("coupons/"+c).set({type:$("cType").value,off:+$("cOff").value||50,min:+$("cMin").value||0}).then(()=>{toast("✅ Live!");$("cCode").value="";});}
function delCoupon(c){if(confirm("Delete?"))db.ref("coupons/"+c).remove();}
function renderCoupons(){const k=Object.keys(COUPONS||{});
  $("couponList").innerHTML=k.length?k.map(c=>{const v=COUPONS[c];
  const used=Object.values(ORDERS).filter(o=>o.coupon===c);const rev=used.reduce((s,o)=>s+(+o.discount||0),0);
  return `<div class="plist-item"><div><h4>${esc(c)} - ${v.type==="percent"?v.off+"%":"₹"+v.off}</h4><small>Min ₹${v.min||0} • 🎯 ${used.length} orders • ₹${rev} discount diya</small></div><div class="acts"><button class="del" onclick="delCoupon('${c}')">Del</button></div></div>`;}).join(""):"<p style='color:#888'>Koi coupon nahi.</p>";}

/* CATEGORIES MANAGER - naam + emoji, store me live */
const CAT_EMOJI_A={panel:"🎮",code:"💻",video:"🎬",project:"🚀",merch:"👕",service:"🛠️",fashion:"👗",food:"🍔",mobile:"📱",other:"📦"};
function renderCatsPage(){const box=$("catListBox");if(!box)return;
  const m={};Object.values(PRODUCTS).forEach(p=>{m[p.category]=m[p.category]||{label:p.catLabel||p.category,n:0};m[p.category].n++;});
  const cats=Object.keys(m);
  box.innerHTML=cats.length?cats.map(c=>{const meta=CATS[c]||{};const defL=m[c].label;
    return `<div class="plist-item"><div><h4>${esc(meta.emoji||CAT_EMOJI_A[c]||"📦")} ${esc(meta.label||defL)} <small style="color:#888">(${m[c].n} products)</small></h4></div>
    <div class="grid2" style="min-width:220px;gap:6px">
      <input id="catE${esc(c)}" value="${esc(meta.emoji||CAT_EMOJI_A[c]||"📦")}" maxlength="4" placeholder="🎮" style="width:50px">
      <input id="catL${esc(c)}" value="${esc(meta.label||defL)}" placeholder="${esc(defL)}">
      <button class="green" onclick="saveCat('${esc(c)}')">💾 Save</button>
      <button class="del" onclick="db.ref('cats/${esc(c)}').remove()">Reset</button>
    </div></div>`;}).join(""):"<p style='color:#888'>Pehle products add karo.</p>";}
function saveCat(c){const em=$("catE"+c).value.trim(),l=$("catL"+c).value.trim();
  if(!l){toast("❌ Naam likho");return;}
  db.ref("cats/"+c).set({label:l,emoji:em||"📦"}).then(()=>toast("✅ Live!"));}

/* BROADCAST - sab customers ko WhatsApp message */
function renderBroadcast(){const box=$("bcastList");if(!box)return;
  const m={};Object.values(ORDERS).forEach(o=>{const k=o.phone||"";if(/^[6-9]\d{9}$/.test(k)&&!m[k])m[k]={phone:k,name:o.name||"Customer"};});
  const arr=Object.values(m);$("bcastCount").textContent=arr.length;
  const msg=$("bcastMsg")?$("bcastMsg").value:"";
  box.innerHTML=arr.length?arr.map(c=>`<div class="olist-item"><div><h4>${esc(c.name)} — +91 ${c.phone}</h4><small>${esc(msg.replace(/\{name\}/g,c.name))}</small></div>
    <div class="acts"><input type="checkbox" class="bchk" value="${c.phone}" checked onclick="bcastSel()"><a href="${waLink(c.phone,msg,c.name)}" target="_blank"><button class="wa">Open</button></a></div></div>`).join(""):"<p style='color:#888'>Abhi koi customer nahi (orders se aenge).</p>";
  bcastSel();}
function waLink(phone,txt,name){return "https://wa.me/91"+phone+"?text="+encodeURIComponent(txt.replace(/\{name\}/g,name||"Customer"));}
function bcastSel(){const n=document.querySelectorAll(".bchk:checked").length;const el=$("bcastSelCount");if(el)el.textContent=n;}
function bcastOpen(){const msg=$("bcastMsg").value.trim();if(!msg){toast("❌ Message likho");return;}
  const links=[...document.querySelectorAll(".bchk:checked")].map(x=>waLink(x.value,msg));
  if(!links.length){toast("❌ Koi customer select nahi");return;}
  links.slice(0,8).forEach(l=>open(l,"_blank"));
  toast(links.length>8?"📲 Pehle 8 khole - baaki upar 'Open' se":"📲 "+(links.length)+" messages khole");
}
function bcastCopyAll(){const ns=[...document.querySelectorAll(".bchk:checked")].map(x=>"91"+x.value);
  if(!ns.length){toast("❌ Koi select nahi");return;}
  navigator.clipboard.writeText(ns.join(", ")).then(()=>toast("📋 "+ns.length+" numbers copy!"));}

/* SETTINGS */
function fillSettings(){const S=SETTINGS;$("sName").value=S.storeName||"";$("sWa").value=S.whatsapp||"";$("sUpi").value=S.upiId||"";
  $("sUpiName").value=S.upiName||"";$("sNotice").value=S.notice||"";
  $("sHeroT").value=S.heroTitle||"";$("sHeroS").value=S.heroSub||"";
  $("sPayLink").value=S.paymentLink||"";
  $("sZap").value=S.zapKey||"";
  $("sPayPal").value=S.paypal||"";$("sPayPalLink").value=S.paypalLink||"";
  $("sBinance").value=S.binance||"";$("sBinanceLink").value=S.binanceLink||"";
$("sBlocked").value=(S.blocked||[]).join(", ");
  const ct=S.contact||[];
  const gv=c=>{const o=ct.find(x=>x.c===c);return o?o.v:"";};
  $("sTg").value=gv("tg");$("sIg").value=gv("ig");$("sEm").value=gv("em");$("sLk").value=gv("lk");
  if(S.offerEnd)$("sOffer").value=new Date(+S.offerEnd).toISOString().slice(0,16);
  $("sMaint").checked=!!S.maintenance;}
function saveSettings(){const d={storeName:$("sName").value.trim(),whatsapp:$("sWa").value.trim(),upiId:$("sUpi").value.trim(),
  upiName:$("sUpiName").value.trim(),notice:$("sNotice").value.trim(),
  heroTitle:$("sHeroT").value.trim(),heroSub:$("sHeroS").value.trim(),
  paymentLink:$("sPayLink").value.trim(),zapKey:$("sZap").value.trim(),
  paypal:$("sPayPal").value.trim(),paypalLink:$("sPayPalLink").value.trim(),
  binance:$("sBinance").value.trim(),binanceLink:$("sBinanceLink").value.trim(),
  blocked:$("sBlocked").value.split(",").map(x=>x.trim()).filter(x=>/^[6-9]\d{9}$/.test(x)),
  offerEnd:$("sOffer").value?new Date($("sOffer").value).getTime():0,
  maintenance:$("sMaint").checked};
  const ct=[];if(d.whatsapp)ct.push({c:"wa",v:d.whatsapp});
  if($("sTg").value.trim())ct.push({c:"tg",v:$("sTg").value.trim()});
  if($("sIg").value.trim())ct.push({c:"ig",v:$("sIg").value.trim()});
  if($("sEm").value.trim())ct.push({c:"em",v:$("sEm").value.trim()});
  if($("sLk").value.trim())ct.push({c:"lk",v:$("sLk").value.trim()});
  d.contact=ct;
  if(!d.upiId||!d.whatsapp){toast("❌ UPI+WA");return;}
  db.ref("settings").update(d).then(()=>toast("✅ Live!"));}

/* EXPORT/IMPORT/SEED */
function exportOrdersCSV(){csv("orders.csv",[["ID","Name","Phone","Method","Items","Qty","Keys","Total","Status","Coupon","Date"],...Object.values(ORDERS).map(x=>[x.orderId,x.name,x.phone,payLbl(x.pay||"upi").l,(x.items||[]).map(i=>i.name).join(";"),(x.items||[]).reduce((s,i)=>s+(+i.qty||1),0),(x.keys||[]).map(k=>k.key).join(";"),x.total,x.status,x.coupon||"",x.date])]);}
function exportProductsCSV(){csv("products.csv",[["Name","Cat","Price","Stock","Views","KeysLeft","Featured"],...Object.keys(PRODUCTS).map(id=>{const p=PRODUCTS[id];const kl=KEYS[id]?Object.values(KEYS[id]):[];return[p.name,p.category,p.price,p.stock,p.views||0,kl.filter(k=>!k.used).length,p.featured?"YES":""];})]);}
function exportBackup(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({products:PRODUCTS,orders:ORDERS,coupons:COUPONS,settings:SETTINGS,queries:QUERIES,reviews:REVIEWS,keys:KEYS},null,2)],{type:"application/json"}));a.download="backup.json";a.click();}
function importBackupFile(el){const f=el.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(d.products)db.ref("products").set(d.products);if(d.coupons)db.ref("coupons").set(d.coupons);if(d.settings)db.ref("settings").update(d.settings);if(d.keys)db.ref("keys").set(d.keys);toast("✅ Restore!");}catch(e){toast("❌ File galat");}};r.readAsText(f);}
function seedProducts(){if(Object.keys(PRODUCTS).length&&!confirm("Demo add?"))return;
  [{name:"FF Headshot Panel",category:"panel",catLabel:"Game Panel",ptype:"digital",price:299,oldPrice:999,rating:4.8,reviews:100,badge:"BEST SELLER",icon:"🎯",image:"",images:[],color:"linear-gradient(135deg,#ff416c,#ff4b2b)",desc:"Demo digital.",features:["Instant"],tags:"ff panel",download:"",video:"",stock:99,active:true,featured:true,createdAt:Date.now()},
   {name:"BGMI VIP Panel - 30 Days",category:"panel",catLabel:"Game Panel",ptype:"digital",price:499,oldPrice:1299,rating:4.7,reviews:60,badge:"HOT",icon:"🔫",image:"",images:[],color:"linear-gradient(135deg,#232526,#414345)",desc:"Demo digital + keys.",features:["ESP","Key"],tags:"bgmi",download:"",video:"",stock:99,active:true,featured:false,createdAt:Date.now()}]
  .forEach(p=>db.ref("products").push(p));toast("🌱 Adding!");}
function seedCoupons(){db.ref("coupons").update({PRINCE50:{type:"flat",off:50,min:199},WELCOME10:{type:"percent",off:10,min:99}}).then(()=>toast("🎟️ Live!"));}

/* MOTION: animated counters on dashboard */
function animNum(el,to,prefix=""){if(!el)return;const from=+el.dataset.v||0;el.dataset.v=to;
  const t0=performance.now(),dur=700;
  (function f(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3),v=Math.round(from+(to-from)*e);
  el.textContent=prefix+v.toLocaleString("en-IN");if(k<1)requestAnimationFrame(f);})(t0);}
const _rd=renderDash;
renderDash=function(){_rd();try{
  animNum($("stProducts"),Object.keys(PRODUCTS).length);
  animNum($("stOrders"),Object.keys(ORDERS).length);
  animNum($("stPending"),Object.values(ORDERS).filter(x=>!["done","cancelled"].includes(x.status)).length);
}catch(e){}};

/* v5: limits, sidebar, dark, pass, clock, notify, order modal, top search */
let prodLimit=15,ordLimit=15;
/* sidebar collapse (PC) / drawer (phone) */
function mobileNav(){return window.matchMedia("(max-width:800px)").matches;}
function toggleSide(){if(mobileNav()){document.body.classList.toggle("side-open");}
  else{document.body.classList.toggle("side-hidden");
  localStorage.setItem("phs_side",document.body.classList.contains("side-hidden")?"1":"0");}}
function closeSide(){document.body.classList.remove("side-open");}
if(localStorage.getItem("phs_side")==="1")document.body.classList.add("side-hidden");
/* admin dark */
function toggleAdminTheme(){document.body.classList.toggle("adark");
  const d=document.body.classList.contains("adark");localStorage.setItem("phs_atheme",d?"dark":"light");
  const ic=$("athIc");if(ic)ic.className="fa-solid "+(d?"fa-sun":"fa-moon");
  toast(d?"Dark ON":"Light ON");}
if(localStorage.getItem("phs_atheme")==="dark"){document.body.classList.add("adark");const ic=$("athIc");if(ic)ic.className="fa-solid fa-sun";}
/* password eye */
function togglePass(){const i=$("admPass");i.type=i.type==="password"?"text":"password";}
/* sync clock */
function tickClock(){const el=$("syncClock");if(el)el.textContent="🕒 "+new Date().toLocaleTimeString("hi-IN",{hour:"2-digit",minute:"2-digit"});}
setInterval(tickClock,30000);
/* browser notification */
try{if("Notification" in window&&Notification.permission==="default"&&sessionStorage.getItem("phs_admin")==="1")Notification.requestPermission();}catch(e){}
function notifyBoss(t,b){try{if("Notification" in window&&Notification.permission==="granted")new Notification(t,{body:b});}catch(e){}}
/* top search -> jumps to tab */
function topGo(v){v=v.toLowerCase().trim();if(v.length<2)return;
  if(/phs\d/i.test(v)||/^[6-9]\d{9}$/.test(v)){document.querySelector('[data-tab="orders"]').click();$("ordSearch").value=v;renderOrders();}
  else{document.querySelector('[data-tab="products"]').click();$("prodSearch").value=v;renderProducts();}}
/* order detail modal */
const STEPS=[["pending","⏳","Pending"],["paid","✅","Paid"],["done","📦","Delivered"],["cancelled","❌","Cancel"]];
function openOrder(id){const o=ORDERS[id];if(!o)return;const si=STEPS.findIndex(s=>s[0]===o.status);
  $("ordBody").innerHTML=`<h2>🧾 ${esc(o.orderId)}</h2>
  <p style="color:#666;font-size:13px">${new Date(o.date).toLocaleString("hi-IN")} • ${badgeMtd(o.pay||"upi")} ${o.status==="pending"&&(o.pay||"upi")!=="zapupi"?'<span style="color:#ea580c">⚠️ payment approve nahi hai</span>':""}</p>
  <div class="timeline">${STEPS.map((s,i)=>`<div class="${i<=si&&o.status!=='cancelled'?'hit':(o.status==='cancelled'&&s[0]==='cancelled'?'hit':'')}"><i>${s[1]}</i>${s[2]}</div>`).join("")}</div>
  <p><b>👤 ${esc(o.name)}</b> • 📱 ${esc(o.phone)}</p>
  <hr style="margin:10px 0;border:0;border-top:1px solid #eee">
  ${(o.items||[]).map(i=>`<p>• ${esc(i.name)} x${i.qty||1} — <b>₹${i.price*(i.qty||1)}</b></p>`).join("")}
  ${(o.keys||[]).length?`<p style="margin-top:8px"><b>🔑 Delivered Keys:</b></p>`+o.keys.map(k=>`<p>• ${esc(k.name)}: <b>${esc(k.key)}</b></p>`).join(""):""}
  ${o.coupon?`<p>🎟️ Coupon: ${esc(o.coupon)} (-₹${o.discount||0})</p>`:""}
  <h3 style="margin-top:8px">Total: ₹${o.total}</h3>
<div class="qa-row"><select id="ordStSel" style="flex:1">${STEPS.map(s=>`<option value="${s[0]}" ${o.status===s[0]?"selected":""}>${s[2]}</option>`).join("")}</select>
  <button class="green" onclick="setStatus('${id}',$('ordStSel').value);closeOrder()">✔ Update</button></div>
  ${o.req?`<div class="req-box" style="margin-top:10px"><b>📝 <span style="color:#f59e0b">Custom Kaam — User Ki Requirement:</span></b>
    ${o.req.logo?`<img src="${o.req.logo}" style="max-width:140px;max-height:100px;border-radius:10px;margin:8px 0;display:block">`:""}
    <p style="margin-top:6px"><b>Naam/Type:</b> ${esc(o.req.appName||"-")}</p>
    <p><b>Chahiye Kya:</b> ${esc(o.req.appDesc||"-")}</p>
    <p style="color:#888;font-size:12px">Bheja: ${new Date(o.req.submittedAt||0).toLocaleString("hi-IN")} • ${o.req.contact?("📱 "+esc(o.req.contact)):""}</p>
    <small style="color:#16a34a">✅ User ne details de di — kaam start kar do, ready hote hi upar link daal do</small></div>`:""}
  ${((o.items||[]).some(it=>{const p=PRODUCTS[it.id];return p&&p.custom;})&&o.status!=="cancelled")?`<div class="req-box" style="margin-top:10px"><b>🔗 <span style="color:#16a34a">Product/App Ready Hai? — Delivery Link Dalo</span></b>
    <input id="ordLink" placeholder="https://drive.google.com/..." value="${esc((o.delivery&&o.delivery.link)||"")}">
    <div class="qa-row" style="margin-top:8px"><button class="green" style="flex:1" onclick="deliverLink('${id}');closeOrder()">📦 Link Dalo + Done + WhatsApp Bhejo</button></div></div>`:""}
  <div class="qa-row"><button class="green" style="flex:1" onclick="deliverOrder('${id}');closeOrder()">📦 Deliver + WhatsApp</button>
  <a href="https://wa.me/91${esc(o.phone)}" target="_blank"><button class="wa">WhatsApp</button></a></div>
  <div class="qa-row"><button onclick="printBill('${id}')">🖨️ Bill</button><button class="del" onclick="delOrder('${id}');closeOrder()">Delete</button></div>`;
  $("ordModal").classList.add("show");}
function closeOrder(){$("ordModal").classList.remove("show");}
$("ordModal").addEventListener("click",e=>{if(e.target.id==="ordModal")closeOrder();});

/* DEVICE: phone vs PC */
(function(){const mobi=matchMedia("(pointer:coarse)").matches||innerWidth<900;
  document.body.classList.toggle("mobi",mobi);document.body.classList.toggle("desk",!mobi);})();
addEventListener("keydown",e=>{if(e.key==="Escape"&&$("ordModal").classList.contains("show"))closeOrder();});

/* KEYS MANAGER */
function fillKeyProds(){const s=$("kProd"),f=$("kFilter");if(!s)return;
  const opts=Object.keys(PRODUCTS).map(id=>`<option value="${id}">${esc(PRODUCTS[id].name)}</option>`).join("");
  const cur=s.value;s.innerHTML=opts;if(cur&&PRODUCTS[cur])s.value=cur;
  const fc=f.value;f.innerHTML=`<option value="">All products</option>`+opts;if(fc)f.value=fc;
  const tc=Object.values(KEYS).flatMap(v=>Object.values(v||{}));
  $("kCountSide").textContent=tc.filter(k=>!k.used).length;}
const _rPa=renderProducts;
renderProducts=function(){_rPa();try{fillKeyProds();}catch(e){}};
function saveKeys(){const pid=$("kProd").value;if(!pid){toast("❌ Product chuno");return;}
  const lines=$("kText").value.split("\n").map(x=>x.trim()).filter(Boolean);
  if(!lines.length){toast("❌ Keys likho");return;}
  lines.forEach(k=>db.ref("keys/"+pid).push({key:k,used:false,date:Date.now()}));
  $("kText").value="";toast(`✅ ${lines.length} keys add! Ab orders par auto-jayengi.`);}
function renderKeys(){const box=$("keyList");if(!box)return;const f=$("kFilter")?.value||"";
  const ids=f?[f]:Object.keys(KEYS);
  let html="",total=0,left=0;
  ids.forEach(pid=>{const kl=KEYS[pid]?Object.entries(KEYS[pid]):[];if(!kl.length)return;
    total+=kl.length;left+=kl.filter(([id,k])=>!k.used).length;
    html+=`<h4 style="margin:12px 0 6px">${esc(PRODUCTS[pid]?.name||pid)} — <span style="color:green">${kl.filter(([id,k])=>!k.used).length} left</span>/${kl.length}</h4>`+
    kl.slice(-30).reverse().map(([kid,k])=>`<div class="plist-item"><div><h4 style="font-family:monospace">${esc(k.key)}</h4><small>${k.used?`🔴 Used • ${esc(k.orderId||"")}`:"🟢 Available"}</small></div><div class="acts"><button onclick="navigator.clipboard.writeText('${esc(k.key)}');toast('Copy!')">Copy</button><button class="del" onclick="db.ref('keys/${pid}/${kid}').remove()">✖</button></div></div>`).join("");});
  box.innerHTML=html||"<p style='color:#888'>Koi keys nahi. Upar se add karo.</p>";
  if(!f)box.insertAdjacentHTML("afterbegin",`<p class="hint">📦 Total: ${total} keys • 🟢 Available: ${left}</p>`);}
function delKey(pid,kid){if(confirm("Key delete?"))db.ref(`keys/${pid}/${kid}`).remove();}

/* SPEED: typing me list dobara banane ka lag khatam (debounce) */
function skelRowsA(n){if(n===0)return"";return Array.from({length:n},()=>`<div class="olist-item"><div><div class="adm-skel w60"></div><div class="adm-skel w40" style="margin-top:7px"></div></div></div>`).join("");}
(function(){const oRP=renderProducts,oRO=renderOrders,oRPm=renderPayments;let t1,t2,t3;
renderProducts=function(){clearTimeout(t1);t1=setTimeout(oRP,160);};
renderOrders=function(){clearTimeout(t2);t2=setTimeout(oRO,160);};
renderPayments=function(){clearTimeout(t3);t3=setTimeout(oRPm,160);};})();
/* VECTOR ICON ENGINE - admin */
(function(){
var REG=function(){return /([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF\u2B00-\u2BFF]+[\uFE0F]?|\uFE0F|[\u25B2\u25BC\u25B6\u25C0])/g};
var RET=function(){return /([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF\u2B00-\u2BFF]+[\uFE0F]?|\uFE0F|[\u25B2\u25BC\u25B6\u25C0])/};
var M={"⚡":"fa-bolt","🗲":"fa-bolt","📱":"fa-mobile-alt","📲":"fa-mobile-alt","💳":"fa-credit-card","🪙":"fa-coins","📢":"fa-bullhorn","📣":"fa-bullhorn","🛒":"fa-shopping-cart","🎮":"fa-gamepad","💻":"fa-laptop","🎬":"fa-video","🚀":"fa-rocket","👕":"fa-tshirt","🛠":"fa-tools","👗":"fa-tshirt","🍔":"fa-hamburger","🎧":"fa-headphones","🎵":"fa-music","💿":"fa-compact-disc","📈":"fa-chart-line","📊":"fa-chart-bar","🏆":"fa-trophy","📦":"fa-box","🔥":"fa-fire","⭐":"fa-star","🌟":"fa-star","✨":"fa-star","★":"fa-star","☆":"fa-star","❤":"fa-heart","♥":"fa-heart","♡":"fa-heart","💖":"fa-heart","💛":"fa-heart","💕":"fa-heart","📥":"fa-download","⬇":"fa-arrow-down","📤":"fa-share","🖨":"fa-print","🔑":"fa-key","✅":"fa-check-circle","✔":"fa-check-circle","✓":"fa-check-circle","❌":"fa-times-circle","✖":"fa-times-circle","❎":"fa-times-circle","⏳":"fa-hourglass-half","⏰":"fa-clock","🕐":"fa-clock","🕒":"fa-clock","🕑":"fa-clock","💾":"fa-save","🗑":"fa-trash","✏":"fa-edit","✍":"fa-edit","🔍":"fa-search","🔎":"fa-search","👁":"fa-eye","🏠":"fa-home","👤":"fa-user","💬":"fa-comments","🔗":"fa-link","⚙":"fa-cog","🔒":"fa-lock","🌙":"fa-moon","☾":"fa-moon","🌞":"fa-sun","☉":"fa-sun","🔓":"fa-unlock","🛡":"fa-shield-alt","💰":"fa-money-bill-wave","💸":"fa-money-bill-wave-alt","🌱":"fa-seedling","🧾":"fa-receipt","🔄":"fa-sync","➕":"fa-plus","➖":"fa-minus","🎯":"fa-bullseye","📷":"fa-camera","🎉":"fa-smile","🎊":"fa-smile","❓":"fa-question-circle","⚠":"fa-exclamation-triangle","☀":"fa-sun","🗄":"fa-database","🏪":"fa-store","🧪":"fa-flask","🎁":"fa-gift","🔔":"fa-bell","📄":"fa-file","📚":"fa-book","♟":"fa-chess-pawn","☰":"fa-bars","💥":"fa-bolt","📌":"fa-thumbtack","🚩":"fa-flag","🤝":"fa-handshake","👑":"fa-crown","🎨":"fa-palette","🧩":"fa-puzzle-piece","🤖":"fa-robot","👾":"fa-ghost","🆓":"fa-tag","👥":"fa-users","📋":"fa-clipboard","📜":"fa-scroll","📩":"fa-envelope","📺":"fa-tv","🔁":"fa-exchange-alt","🔧":"fa-wrench","🔫":"fa-crosshairs","😍":"fa-smile-beam","😕":"fa-meh","🤍":"fa-heart","🗂":"fa-folder-open","●":["fa-circle","#94a3b8"],"○":["fa-circle","#94a3b8"],"→":"fa-arrow-right","←":"fa-arrow-left","©":"fa-copyright","🏷":"fa-tag","🚫":"fa-ban","🚚":"fa-truck","🎟":"fa-ticket","🛍":"fa-shopping-bag","▼":"fa-chevron-down","▲":"fa-chevron-up","▶":"fa-caret-right","🟢":["fa-circle","#22c55e"],"🔴":["fa-circle","#ef4444"],"🟡":["fa-circle","#f59e0b"],"🔵":["fa-circle","#3b82f6"],"⚪":["fa-circle","#94a3b8"]};
function em2fa(s){return s.replace(REG(),function(m){var k=m.replace(/\uFE0F/g,"");if(!M[k])k=m;var e=M[k]||["fa-tag"];var ic=Array.isArray(e)?e[0]:e;var col=Array.isArray(e)?e[1]:null;
return col?'<i class="fa-solid '+ic+' cb" style="color:'+col+';font-size:9px;vertical-align:2px"></i>':'<i class="fa-solid '+ic+' cb"></i>';});}
function fixNode(n){if(!n.nodeValue)return;var parts=n.nodeValue.split(REG()),frag=document.createDocumentFragment(),added=false;
parts.forEach(function(p){if(!p)return;if(RET().test(p)){var d=document.createElement("span");d.innerHTML=em2fa(p);while(d.firstChild)frag.appendChild(d.firstChild);added=true;}else frag.appendChild(document.createTextNode(p));});
if(added)n.parentNode.replaceChild(frag,n);}
function eng(){if(!document.body)return;try{
var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;if(p&&(p.nodeName==="SCRIPT"||p.nodeName==="STYLE"||p.nodeName==="TITLE"||p.nodeName==="TEXTAREA"))return NodeFilter.FILTER_REJECT;return (n.nodeValue&&RET().test(n.nodeValue))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
var list=[],x;while((x=w.nextNode()))list.push(x);list.forEach(fixNode);
document.querySelectorAll("[placeholder]").forEach(function(el){var v=el.getAttribute("placeholder")||"";if(RET().test(v))el.setAttribute("placeholder",v.replace(RET(),"").trim());});
}catch(e){}}
eng(document.body);
document.addEventListener("DOMContentLoaded",function(){eng(document.body);});
if(window.MutationObserver){new MutationObserver(function(){if(document.body)eng(document.body);}).observe(document.body,{childList:true,subtree:true,characterData:true});}
setInterval(function(){eng(document.body);},3000);
})();
