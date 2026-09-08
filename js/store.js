/* PRINCE HACKS STORE v7 - 100% ONLINE DELIVERY (digital only) */
const $ = id => document.getElementById(id);

let SETTINGS = { storeName:"Prince Hacks Store", upiId:"princehacks@okhdfc", upiName:"Prince Hacks",
  whatsapp:"919999999999", notice:"100% Instant Delivery WhatsApp par | UPI Accepted | Trusted Seller",
  adminPass:"prince123", offerEnd:0, maintenance:false,
  heroTitle:"", heroSub:"", deliveryFee:49, freeAbove:999, codAllowed:true, paymentLink:"",
  zapKey:"", paypal:"", paypalLink:"", binance:"", binanceLink:"" };
let COUPONS = { "PRINCE50":{type:"flat",off:50,min:199}, "WELCOME10":{type:"percent",off:10,min:99} };

const DEFAULT_PRODUCTS = [
  { id:"1", name:"FF Max Headshot Panel - Lifetime", category:"panel", catLabel:"Game Panel", ptype:"digital", price:299, oldPrice:999, rating:4.8, reviews:1250, badge:"BEST SELLER", icon:"🎯", image:"", images:[], color:"linear-gradient(135deg,#ff416c,#ff4b2b)", desc:"Free Fire headshot panel, lifetime validity + setup video.", features:["Lifetime validity","Anti-ban safe","Auto headshot","Hindi setup video"], tags:"ff panel headshot", download:"", video:"", active:true, stock:99, featured:true },
  { id:"2", name:"BGMI VIP Mod Panel - 30 Days", category:"panel", catLabel:"Game Panel", ptype:"digital", price:499, oldPrice:1299, rating:4.7, reviews:860, badge:"HOT", icon:"🔫", image:"", images:[], color:"linear-gradient(135deg,#232526,#414345)", desc:"BGMI VIP panel ESP + aimbot, 30 days key.", features:["ESP + Aimbot","30 days key","Instant key"], tags:"bgmi mod panel", download:"", video:"", active:true, stock:99, featured:true },
  { id:"3", name:"Key Generator Source Code", category:"code", catLabel:"Source Code", ptype:"digital", price:999, oldPrice:2499, rating:4.9, reviews:420, badge:"NEW", icon:"🔑", image:"", images:[], color:"linear-gradient(135deg,#2874f0,#6a11cb)", desc:"Admin panel + key system full code.", features:["Full code","Admin panel","Resell allowed"], tags:"source code website", download:"", video:"", active:true, stock:99, featured:false },
  { id:"4", name:"Video Editing Pack 500+ Presets", category:"video", catLabel:"Video + Files", ptype:"digital", price:199, oldPrice:799, rating:4.6, reviews:980, badge:"70% OFF", icon:"🎬", image:"", images:[], color:"linear-gradient(135deg,#8e2de2,#4a00e0)", desc:"Reels presets + Hindi course.", features:["500+ presets","Hindi course","Drive link"], tags:"video editing reels", download:"", video:"", active:true, stock:99, featured:false },
  { id:"5", name:"Reels Viral Bundle - 1000+ Templates", category:"video", catLabel:"Video + Files", ptype:"digital", price:249, oldPrice:999, rating:4.7, reviews:520, badge:"NEW", icon:"🔥", image:"", images:[], color:"linear-gradient(135deg,#0f2027,#2c5364)", desc:"1000+ viral reels templates + trending audio list + posting guide.", features:["1000+ templates","Trending audio list","Posting guide Hindi me","Instant download"], tags:"reels bundle viral templates", download:"", video:"", active:true, stock:99, featured:false },
  { id:"6", name:"YouTube Growth Course - 0 to Monetized", category:"video", catLabel:"Video + Files", ptype:"digital", price:399, oldPrice:1499, rating:4.9, reviews:210, badge:"", icon:"📺", image:"", images:[], color:"linear-gradient(135deg,#f7971e,#ffd200)", desc:"Zero se monetization tak full Hindi course + thumbnail pack.", features:["20+ Hindi videos","Thumbnail pack free","Monetization checklist","Lifetime access"], tags:"youtube course growth monetization", download:"", video:"", active:true, stock:99, featured:false },
];

let PRODUCTS=[...DEFAULT_PRODUCTS];
let activeCat="all", searchText="", sortBy="pop", priceF="all";
// cart migration: purana [id] format -> [{id,qty}]
let cart=[]; try{ const c=JSON.parse(localStorage.getItem("phs_cart")||"[]");
  cart=c.map(x=>typeof x==="string"?{id:String(x),qty:1}:{id:String(x.id),qty:Math.max(1,+x.qty||1)}); }catch(e){cart=[];}
let wishlist=[]; try{wishlist=JSON.parse(localStorage.getItem("phs_wish")||"[]").map(String);}catch(e){}
let cartCoupon=null, singleBuy=null, singleQty=1, reviewsLoaded=false, galIdx=0;
let prodSig="";
/* SPEED: net-aware page size + caches */
function pageSize(){try{const c=navigator.connection;if(c&&(c.saveData||/2g/i.test(c.effectiveType||"")))return 6;}catch(e){}return 12;}
let pageShown=pageSize(), REV_CACHE=null, REV_PROM=null;
function saveProdCache(){try{const slim=PRODUCTS.map(p=>({...p,image:"",images:[]}));localStorage.setItem("phs_cache",JSON.stringify({t:Date.now(),p:slim}));}catch(e){}}
function loadProdCache(){try{const c=JSON.parse(localStorage.getItem("phs_cache")||"null");if(c&&c.p&&c.p.length&&(Date.now()-c.t)<864e5){PRODUCTS=c.p;return true;}}catch(e){}return false;}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}
function lazyImg(u,fb,style){return `<img src="${u}" loading="lazy" decoding="async"${style?` style="${style}"`:""} onload="this.classList.add('ld')" onerror="this.outerHTML='${fb}'">`;}
/* SKELETON: YouTube-style content-size placeholders (no spinner/blank) */
function skelCards(n){n=n||4;return Array.from({length:n},()=>`<div class="skel-card"><div class="skel-img"></div><div class="skel-body"><div class="skel-line tiny"></div><div class="skel-line" style="width:85%"></div><div class="skel-line short"></div><div class="skel-line tiny"></div></div></div>`).join("");}
function skelRows(n){n=n||3;return Array.from({length:n},()=>`<div class="skel-row"><div class="skel-av"></div><div class="skel-col"><div class="skel-line" style="width:70%"></div><div class="skel-line tiny" style="width:45%"></div></div><div class="skel-line tiny" style="width:60px"></div></div>`).join("");}
function skelText(n){n=n||3;return `<div class="skel-body" style="padding:14px;background:var(--white);border-radius:14px;border:1.5px solid var(--border)">${Array.from({length:n},()=>`<div class="skel-line"></div>`).join("")}<div class="skel-line short"></div></div>`;}
function fadeSwap(el){if(!el)return;el.classList.remove("fade-swap");void el.offsetWidth;el.classList.add("fade-swap");}

function saveCart(){localStorage.setItem("phs_cart",JSON.stringify(cart));}
function saveWish(){localStorage.setItem("phs_wish",JSON.stringify(wishlist));}
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300);}
function off(p,o){if(!o||o<=p)return 0;return Math.round((1-p/o)*100);}
function findP(id){return PRODUCTS.find(x=>String(x.id)===String(id));}
function esc(s){return String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function copyCoupon(c){try{navigator.clipboard.writeText(c);}catch(e){}toast("Coupon: "+c);const i=$("cartCoupon");if(i)i.value=c;}

/* LIVE REVIEWS (admin-controlled) */
function revStars(n){n=Math.max(1,Math.min(5,+n||5));return "★".repeat(n)+"☆".repeat(5-n);}
function renderReviewsAll(snap){
  const g=$("reviewGrid");if(!g)return;
  const arr=[];if(snap&&snap.exists())snap.forEach(c=>{const v=c.val();if(v&&v.text)arr.push(v);});
  arr.reverse();REV_CACHE=arr;
  g.innerHTML=arr.length?arr.map(r=>`<div class="review" style="animation:none"><div class="stars">${revStars(r.stars)}</div><p>"${esc(r.text)}"</p><b>- ${esc(r.name)}</b></div>`).join("")
    :`<p style="grid-column:1/-1;text-align:center;color:#888;padding:24px 0">💬 Abhi koi review nahi — pehla review <b>tum</b> likho!</p>`;
  statRating(arr);}
function statRating(arr){try{arr=arr||REV_CACHE||[];const el=$("statRate");if(!el)return;
  if(!arr.length){el.innerHTML="4.5 <i class='fa-solid fa-star'></i>";return;}
  const a=arr.reduce((s,r)=>s+(+r.stars||5),0)/arr.length;
  el.innerHTML=a.toFixed(1)+" <i class='fa-solid fa-star'></i>";}catch(e){}}

/* LIVE STATS (real orders se - hardcoded numbers khatam) */
function liveStats(s){
  try{
    let sales=0,customers=0,rev=0;
    const seen={};if(s&&s.exists())Object.values(s.val()).forEach(o=>{const oi=(o.items||[]).reduce((a,i)=>a+(+i.qty||1),0);sales+=oi;rev+=(+o.total||0);const ph=o.phone||"";if(ph&&!seen[ph]){seen[ph]=1;customers++;}});
    const fmt=n=>n>=100000?"1L+":n>=1000?Math.floor(n/1000)+"K+":(n||0)+"";
    const sf=$("statSales");if(sf)sf.textContent=fmt(sales);
    const hc=$("heroCustomers");if(hc)hc.textContent=fmt(customers);
  }catch(e){}
}

/* HERO COUPONS (live - hardcoded PRINCE50/WELCOME10 hata diya) */
function renderHeroCoupons(){
  const box=$("heroCoupons");if(!box)return;
  const ks=Object.keys(COUPONS||{});
  if(!ks.length){box.innerHTML=`<i class="fa-solid fa-ticket"></i> Coupon: <span>abhi koi offer nahi</span>`;return;}
  const parts=ks.slice(0,2).map(c=>{const v=COUPONS[c];return `<b onclick="copyCoupon('${esc(c)}')">${esc(c)}</b> (${v.type==="percent"?v.off+"% off":"-₹"+v.off})`;});
  box.innerHTML=`<i class="fa-solid fa-ticket"></i> Coupon try karo: ${parts.join(" • ")}`;}
function ptypeTag(p){if(p.ptype==="physical")return `<span class="type-tag physical">📦 PHYSICAL</span>`;if(p.ptype==="service")return `<span class="type-tag service">🛠️ SERVICE</span>`;return `<span class="type-tag">⚡ DIGITAL</span>`;}
function gallery(p){const imgs=[p.image,...(p.images||[])].filter(Boolean);return imgs;}
function pImg(p){const g=gallery(p);if(g.length)return lazyImg(g[0],p.icon||"📦");return p.icon||"📦";}

/* THEME */
function toggleTheme(){document.body.classList.toggle("dark");localStorage.setItem("phs_theme",document.body.classList.contains("dark")?"dark":"light");}
if(localStorage.getItem("phs_theme")==="dark")document.body.classList.add("dark");

/* FIREBASE */
function startFirebase(){
  if(typeof firebase==="undefined"||!db){$("syncNote").textContent="(offline mode)";return;}
  try{
    db.ref("settings").on("value",s=>{if(s.exists()){SETTINGS={...SETTINGS,...s.val()};applySettings();startTimer();}});
    db.ref("products").on("value",s=>{
      if(!s.exists()){$("syncNote").textContent="• 🟡 Admin se add karo";return;}
      const v=s.val();
      const sig=JSON.stringify(Object.keys(v).map(k=>[k,v[k].name,v[k].price,v[k].stock,v[k].active,v[k].badge,v[k].category,v[k].oldPrice,v[k].image,v[k].images||[]]));
      if(prodSig===sig)return;prodSig=sig;
      PRODUCTS=Object.keys(v).map(k=>({id:k,...v[k]})).filter(p=>p.active!==false);
      saveProdCache();$("syncNote").textContent="• 🟢 Live ("+PRODUCTS.length+")";renderCats();renderProducts();setDeal();deepLink();});
    db.ref("coupons").on("value",s=>{COUPONS=s.exists()?s.val():{};renderCouponStrip();renderHeroCoupons();});
    db.ref("cats").on("value",s=>{CATS=s.exists()?s.val():{};renderCats();});
    db.ref("orders").on("value",s=>liveStats(s));
    db.ref("reviews").limitToLast(12).on("value",s=>{reviewsLoaded=true;renderReviewsAll(s);});
  }catch(e){}
}
function applySettings(){
  $("storeNameHead").textContent=(SETTINGS.storeName||"Prince Hacks").replace(" Store","");
  $("storeNameFoot").textContent=SETTINGS.storeName;$("storeNameCopy").textContent=SETTINGS.storeName;
  $("noticeText").textContent="";startNotice();$("footerUpi").textContent=SETTINGS.upiId;
  $("footerWhatsapp").textContent="+"+SETTINGS.whatsapp;
  $("waFloat").href=`https://wa.me/${SETTINGS.whatsapp}?text=Namaste! Mujhe product chahiye.`;
  $("socWa").href=`https://wa.me/${SETTINGS.whatsapp}`;
  if(SETTINGS.heroTitle)$("heroTitle").innerHTML=esc(SETTINGS.heroTitle);
  if(SETTINGS.heroSub)$("heroSub").textContent=SETTINGS.heroSub;
  $("maintBar").style.display=SETTINGS.maintenance?"block":"none";
  document.title=SETTINGS.storeName+" - Sab Kuch Kharido";
}
let timerInt=null;
function startTimer(){if(timerInt)clearInterval(timerInt);let end=+SETTINGS.offerEnd||0;if(!end)end=Date.now()+12*3600*1000;
  timerInt=setInterval(()=>{let d=end-Date.now();if(d<0)d=0;
    const h=String(Math.floor(d/3600000)).padStart(2,"0"),m=String(Math.floor(d%3600000/60000)).padStart(2,"0"),s=String(Math.floor(d%60000/1000)).padStart(2,"0");
    if($("dealTimer"))$("dealTimer").textContent=`${h}:${m}:${s}`;},1000);}

/* CATEGORIES - auto (har nayi category khud aa jayegi) */
const CAT_EMOJI={panel:"🎮",code:"💻",video:"🎬",project:"🚀",merch:"👕",service:"🛠️",fashion:"👗",food:"🍔",mobile:"📱",other:"📦"};
let CATS={};
function renderCats(){
  const cats={};PRODUCTS.forEach(p=>{cats[p.category]=cats[p.category]||{l:p.catLabel||p.category,n:0};cats[p.category].n++;});
  $("categoryBtns").innerHTML=`<button class="cat-btn ${activeCat==="all"?"active":""}" data-cat="all">All (${PRODUCTS.length})</button>`+
    Object.keys(cats).map(c=>`<button class="cat-btn ${activeCat===c?"active":""}" data-cat="${esc(c)}">${CATS[c]?.emoji||CAT_EMOJI[c]||"📦"} ${esc(CATS[c]?.label||cats[c].l)} (${cats[c].n})</button>`).join("");
  document.querySelectorAll(".cat-btn").forEach(b=>b.onclick=()=>{document.querySelectorAll(".cat-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeCat=b.dataset.cat;pageShown=pageSize();renderProducts();});
}

/* PRODUCTS */
function filtered(){
  let list=PRODUCTS.filter(p=>(activeCat==="all"||p.category===activeCat)&&((p.name+" "+(p.desc||"")+" "+(p.tags||"")).toLowerCase().includes(searchText)));
  if(priceF==="u300")list=list.filter(p=>p.price<300);
  if(priceF==="m800")list=list.filter(p=>p.price>=300&&p.price<=800);
  if(priceF==="a800")list=list.filter(p=>p.price>800);
  if(sortBy==="low")list=[...list].sort((a,b)=>a.price-b.price);
  if(sortBy==="high")list=[...list].sort((a,b)=>b.price-a.price);
  if(sortBy==="rating")list=[...list].sort((a,b)=>(b.rating||0)-(a.rating||0));
  return list;
}
function renderProducts(){
  const list=filtered();$("productCount").textContent=list.length+" Products";$("statProducts").textContent=PRODUCTS.length+"+";
  const g=$("productGrid");
  if(!list.length){g.innerHTML=`<p style="grid-column:1/-1;text-align:center;padding:40px;color:#888">😕 Kuch nahi mila.</p>`;return;}
  const show=list.slice(0,pageShown);
  g.innerHTML=show.map(cardHTML).join("")+(list.length>pageShown?`<button class="more-btn" style="grid-column:1/-1" onclick="moreProducts()">⬇️ Aur Dikhao (${list.length-pageShown} bache)</button>`:"");
  fadeSwap(g);
}
function moreProducts(){pageShown+=pageSize();renderProducts();}
function cardHTML(p){const w=wishlist.includes(String(p.id)),out=(+p.stock||0)===0,dis=SETTINGS.maintenance,offv=p.oldPrice?off(p.price,p.oldPrice):0;
    return `<div class="card ${out?'is-out':''}" onclick="openProduct('${p.id}')" role="button" tabindex="0" aria-label="${esc(p.name)}">
    <div class="card-img" style="background:${p.color||'#2874f0'}">
    ${p.badge?`<span class="card-badge">${esc(p.badge)}</span>`:""}
    <button class="wish-heart ${w?'active':''}" onclick="event.stopPropagation();toggleWish('${p.id}')" aria-label="Wishlist">${w?'♥':'♡'}</button>${pImg(p)}<button class="qv" onclick="event.stopPropagation();openProduct('${p.id}')">👁 Quick View</button>${out?`<div class="stock-out">OUT OF STOCK</div>`:""}</div>
    <div class="card-body"><div class="card-topline"><span class="card-cat">${esc(p.catLabel||p.category)}</span><span class="rating">${p.rating||4.5} ★ <span>(${p.reviews||0})</span></span></div>
    <h3>${esc(p.name)}</h3>
    <div class="card-price"><b>₹${p.price}</b>${p.oldPrice?`<s>₹${p.oldPrice}</s>`:""}${offv?`<span class="off">${offv}% off</span>`:""}
    <span class="card-live">⚡ Instant</span></div>
    <div class="card-btns"><button class="btn-add" onclick="event.stopPropagation();addToCart('${p.id}')" ${out||dis?"disabled":""}>ADD TO CART</button><button class="m-cart-ic" onclick="event.stopPropagation();addToCart('${p.id}')" ${out||dis?"disabled":""} aria-label="Add to cart">🛒</button>
    <button class="btn-buy" onclick="event.stopPropagation();buyNow('${p.id}')" ${out||dis?"disabled":""}>BUY NOW</button></div></div></div>`;}
function setDeal(){const d=PRODUCTS.find(p=>p.featured)||PRODUCTS.find(p=>p.badge)||PRODUCTS[0];if(!d)return;
  const dg=gallery(d);$("dealEmoji").outerHTML=`<div class="hero-card-emoji" id="dealEmoji">${dg.length?lazyImg(dg[0],d.icon||"🎯","width:84px;height:84px;object-fit:cover;border-radius:18px"):(d.icon||"🎯")}</div>`;$("dealName").textContent=d.name;
  $("dealPrice").textContent="₹"+d.price;$("dealOld").textContent=d.oldPrice?("₹"+d.oldPrice):"";
  $("dealOff").textContent=d.oldPrice?(off(d.price,d.oldPrice)+"% OFF"):"";$("dealBtn").onclick=()=>buyNow(d.id);}
let curOpenId="";
function deepLink(){const h=location.hash.match(/#p-(.+)/);if(h&&findP(h[1])){const id=h[1];if($("productModal")&&$("productModal").classList.contains("show")&&curOpenId===id)return;openProduct(id);}}

/* MODAL + GALLERY + SHARE */
function openProduct(id){
  const p=findP(id);if(!p)return;curOpenId=String(id);galIdx=0;singleQty=1;pushRecent(id);try{history.replaceState(null,"","#p-"+id);}catch(e){}
  const feats=Array.isArray(p.features)?p.features:String(p.features||"").split("\n").filter(Boolean);
  const rel=PRODUCTS.filter(x=>String(x.id)!==String(id)&&x.category===p.category).slice(0,4);
  const w=wishlist.includes(String(p.id)),out=(+p.stock||0)===0,dis=SETTINGS.maintenance;
  $("productModalBody").innerHTML=`
    <div class="pd">
      <div class="pd-media">
        <div class="pd-grab"></div>
        <button class="pd-fav ${w?'on':''}" onclick="toggleWish('${p.id}')" title="Wishlist">${w?'♥':'♡'}</button>
        <div class="gal-main" id="galMain" style="background:${p.color||'#2874f0'}"><span class="gal-shim"></span><span style="font-size:76px">${p.icon||"📦"}</span><span class="gal-wait">📷 Photo load ho rahi...</span></div>
        <div class="gal-thumbs" id="galThumbs"><span class="skel-tb"></span><span class="skel-tb"></span><span class="skel-tb"></span></div>
      </div>
      <div class="pd-info">
        <div class="pd-topline">
          <span class="pd-cat">${esc(p.catLabel||p.category)}</span>
          ${p.badge?`<span class="pd-badge">🏷 ${esc(p.badge)}</span>`:""}
          <span class="pd-stock ${out?'no':''}">${out?"❌ Out of Stock":"✓ In Stock"}</span>
        </div>
        <h2 class="pd-name">${esc(p.name)}</h2>
        <div class="pd-rate"><span class="pd-stars">${"★".repeat(Math.max(1,Math.round(p.rating||4.5)))}</span><b>${p.rating||4.5}</b><span class="pd-sep">•</span>${p.reviews||0} reviews<span class="pd-sep">•</span>👁 ${p.views||0}</div>
        <div class="pd-price-box">
          <span class="pd-price">₹${p.price}</span>${p.oldPrice?`<s>₹${p.oldPrice}</s><span class="pd-off">${off(p.price,p.oldPrice)}% OFF</span>`:""}
          <small>⚡ Instant delivery • 100% online</small>
        </div>
        <div class="pd-trust"><span>⚡ Instant Download</span><span>🔑 Auto Key</span><span>✅ Full Support</span></div>
        ${p.desc?`<p class="pd-desc">${esc(p.desc)}</p>`:""}
        ${feats.length?`<div class="pd-feats">${feats.map(f=>`<span>✔ ${esc(f)}</span>`).join("")}</div>`:""}
        ${p.video?(ytId(p.video)?`<div class="vid-embed"><iframe src="https://www.youtube.com/embed/${ytId(p.video)}" allowfullscreen loading="lazy" title="Demo video"></iframe></div>`:`<a class="vid-btn" href="${p.video}" target="_blank">▶️ Demo Video Dekho</a>`):""}
        <div class="pd-qty">
          <span>Quantity</span>
          <div class="qty-row"><button onclick="chQty(-1)">−</button><b id="qNum">1</b><button onclick="chQty(1,'${p.id}')">+</button></div>
          <small>Bulk quantity = utni keys milengi 🎁</small>
        </div>
        <div id="prodRev" class="pd-rev">${skelText(2)}</div>
        ${rel.length?`<div class="pd-related"><h4>🔥 You may also like</h4><div class="rel-grid">${rel.map(r=>`<div class="rel-item" onclick="openProduct('${r.id}')"><span style="font-size:24px">${r.icon||"📦"}</span><span><b>${esc(r.name)}</b>₹${r.price}</span></div>`).join("")}</div></div>`:""}
        <div class="pd-sharebar"><button onclick="shareWA('${p.id}')">📤 WhatsApp Share</button><button onclick="copyLink('${p.id}')">🔗 Copy Link</button></div>
      </div>
    </div>
    <div class="pd-actions">
      <button class="pd-a-fav ${w?'on':''}" onclick="toggleWish('${p.id}')">♥</button>
      <button class="pd-a-cart" onclick="modalAdd('${p.id}')">🛒 Cart</button>
      <button class="pd-a-buy" onclick="modalBuy('${p.id}')" ${out||dis?"disabled":""}>⚡ Buy Now • ₹${p.price}</button>
    </div>`;
  $("productModal").classList.add("show");loadProdReviews(id);bumpViews(id);
  requestAnimationFrame(()=>setTimeout(()=>{try{const q=findP(id);if(q&&$("galMain")&&$("productModal").classList.contains("show"))renderGal(q);}catch(e){}},60));
}
function renderGal(p){const g=gallery(p),t=$("galThumbs");if(!t)return;
  if(!g.length){t.innerHTML="";const m=$("galMain");if(m)m.classList.add("sk-gone");return;}
  t.innerHTML=g.map((u,i)=>`<button class="${i===galIdx?'sel':''}" onclick="galGo('${p.id}',${i})">${u?lazyImg(u,p.icon||"📦"):(p.icon||"📦")}</button>`).join("");
  const m=$("galMain");if(!m)return;const cur=g[galIdx];
  m.innerHTML=cur?lazyImg(cur,p.icon||"📦"):(p.icon||"📦");
  m.style.background=cur?"#0f172a":(p.color||"#2874f0");
  m.classList.add("sk-gone");
  m.style.cursor=cur?"zoom-in":"default";
  m.onclick=()=>{if(cur)open(cur,"_blank");};
  bindSwipe(p.id);}
function galGo(id,i){const p=findP(id);if(!p)return;const g=gallery(p);if(!g.length)return;
  const prev=galIdx,far=i-prev;
  const dir=far>0?"r":(far<0?"l":"r");
  document.querySelectorAll("#galThumbs button").forEach((b,j)=>b.classList.toggle("sel",j===i));
  const m=$("galMain");if(!m)return;const cur=g[galIdx=i];
  if(cur){
    m.style.background="#0f172a";
    const img=new Image();
    img.onload=()=>{const old=m.querySelectorAll("img");const n=m.appendChild(img);n.classList.add("ld");n.classList.add(dir==="r"?"gal-anim-r":"gal-anim-l");setTimeout(()=>old.forEach(o=>o.remove()),260);};
    img.onerror=()=>{m.innerHTML=`<span>${p.icon||"📦"}</span>`;m.style.background=p.color||"#2874f0";};
    img.src=cur;
  }else{m.innerHTML=`<span>${p.icon||"📦"}</span>`;m.style.background=p.color||"#2874f0";}
  m.style.cursor=cur?"zoom-in":"default";m.onclick=()=>{if(cur)open(cur,"_blank");};}
function chQty(d,pid){const p=pid?findP(pid):null,mx=p?+p.stock||99:99;singleQty=Math.min(mx,Math.max(1,singleQty+d));const e=$("qNum");if(e)e.textContent=singleQty;}
function modalAdd(id){addToCart(id,singleQty);}
function modalBuy(id){buyNow(id,singleQty);}
function closeProduct(){$("productModal").classList.remove("show");curOpenId="";history.replaceState(null,"",location.pathname);}
function shareWA(id){const p=findP(id);open(`https://wa.me/?text=${encodeURIComponent(`Dekho ${p.name} sirf ₹${p.price}! ${location.origin}${location.pathname}#p-${id}`)}`,"_blank");}
function copyLink(id){try{navigator.clipboard.writeText(location.origin+location.pathname+"#p-"+id);}catch(e){}toast("🔗 Copy!");}

/* WISHLIST */
function toggleWish(id){buzz();id=String(id);wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];saveWish();updateWishUI();renderProducts();}
function toggleWishlistView(f){const d=$("wishDrawer"),bg=$("wishBg"),o=d.classList.contains("open"),s=f!==undefined?f:!o;d.classList.toggle("open",s);bg.classList.toggle("show",s);if(s)updateWishUI();}
function updateWishUI(){$("wishCount").textContent=wishlist.length;$("wishHeadCount").textContent=wishlist.length;
  $("wishItems").innerHTML=wishlist.length?wishlist.map(id=>{const p=findP(id);if(!p)return"";return `<div class="cart-item"><div class="cart-item-emoji" style="background:${p.color}">${p.icon}</div><div style="flex:1"><h4>${esc(p.name)}</h4><div class="cp">₹${p.price}</div><button class="btn-buy" style="padding:6px 12px" onclick="buyNow('${p.id}')">BUY</button> <button class="rm-btn" onclick="toggleWish('${p.id}')">Remove</button></div></div>`;}).join(""):`<div class="cart-empty">🤍<p>Wishlist khaali</p></div>`;}

/* CART with QTY + DELIVERY */
function addToCart(id,qty=1){buzz();id=String(id);if(SETTINGS.maintenance){toast("🔧 Maintenance");return;}
  const p=findP(id);if(!p||(+p.stock||0)===0){toast("❌ Out of stock");return;}
  const ex=cart.find(x=>x.id===id);
  if(ex)ex.qty=Math.min(+p.stock||99,ex.qty+qty);else cart.push({id,qty:Math.min(+p.stock||99,qty)});
  saveCart();updateCartUI();toast("✅ Cart me!");openCart();}
function cartQty(id,d){const it=cart.find(x=>x.id===String(id));if(!it)return;const p=findP(id);
  it.qty=Math.max(1,Math.min(+p?.stock||99,it.qty+d));saveCart();updateCartUI();}
function removeFromCart(id){cart=cart.filter(x=>x.id!==String(id));saveCart();updateCartUI();}
function cartSub(){return cart.reduce((s,c)=>{const p=findP(c.id);return p?s+(+p.price)*c.qty:s;},0);}
function hasPhysical(items){return (items||cartItems()).some(c=>{const p=c.p||findP(c.id);return p&&p.ptype==="physical";});}
function cartItems(){return cart.map(c=>({...c,p:findP(c.id)})).filter(x=>x.p);}
function deliveryFee(sub,items){return 0;} // 100% online store - no delivery charge
function couponDisc(sub){if(!cartCoupon||!COUPONS[cartCoupon])return 0;const c=COUPONS[cartCoupon];if(sub<(c.min||0))return 0;return c.type==="percent"?Math.round(sub*c.off/100):Math.min(c.off,sub);}
function applyCartCoupon(){const v=$("cartCoupon").value.trim().toUpperCase();if(!v)return;if(!COUPONS[v]){toast("❌ Galat");return;}if(cartSub()<(COUPONS[v].min||0)){toast(`❌ Min ₹${COUPONS[v].min}`);return;}cartCoupon=v;updateCartUI();toast("🎉 "+v);}
function updateCartUI(){const n=cart.reduce((s,c)=>s+c.qty,0);$("cartCount").textContent=n;$("cartHeadCount").textContent=n;
  const sub=cartSub(),d=couponDisc(sub),fee=deliveryFee(sub,cartItems());
  $("discountRow").style.display=d?"flex":"none";$("discountAmt").textContent="-₹"+d;$("cartTotal").textContent="₹"+(sub-d+fee);
  $("cartItems").innerHTML=cart.length?cart.map(c=>{const p=findP(c.id);if(!p)return"";return `<div class="cart-item"><div class="cart-item-emoji" style="background:${p.color}">${p.icon||"📦"}</div>
  <div style="flex:1"><h4>${esc(p.name)}</h4><div class="cp">₹${p.price} x ${c.qty} = ₹${p.price*c.qty}</div>
  <div class="qty-mini"><button onclick="cartQty('${p.id}',-1)">-</button><b>${c.qty}</b><button onclick="cartQty('${p.id}',1)">+</button></div><br>
  <button class="rm-btn" onclick="removeFromCart('${p.id}')">🗑 Remove</button></div></div>`;}).join("")+
  `<p class="fee-row" style="color:green">⚡ Instant Online Delivery</p>`
  :`<div class="cart-empty"><i class="fa-solid fa-cart-shopping"></i><p>Cart khaali</p></div>`;}
function openCart(){updateCartUI();$("cartDrawer").classList.add("open");$("cartBg").classList.add("show");$("cartPill").style.display="none";}

function closeCart(){$("cartDrawer").classList.remove("open");$("cartBg").classList.remove("show");updateCartUI();}
/* CHECKOUT: UPI + auto key delivery */
function buyNow(id,qty=1){buzz();if(SETTINGS.maintenance){toast("🔧 Maintenance");return;}singleBuy={id:String(id),qty:qty||singleQty||1};closeProduct();closeCart();openCheckout();}
function openCheckout(){if(!singleBuy&&!cart.length){toast("Product chuno!");return;}renderCheckoutForm();$("checkoutModal").classList.add("show");}
function closeCheckout(){$("checkoutModal").classList.remove("show");singleBuy=null;singleQty=1;}
function getItems(){if(singleBuy){const p=findP(singleBuy.id);return p?[{...singleBuy,p}]:[];}return cartItems();}
const PAY_LBL={zapupi:"⚡ Auto UPI",upi:"📱 Manual UPI",paypal:"💳 PayPal",binance:"🪙 Binance"};
function payMtds(){const m=[];if(SETTINGS.zapKey)m.push(["auto","⚡ AutoPay (Instant UPI)","UPI screen khud khulegi — payment 100% automatic"]);if(SETTINGS.upiId)m.push(["upi","📱 Manual UPI (QR)","QR scan karke pay — screenshot WhatsApp par bhejna"]);if(SETTINGS.paypal)m.push(["paypal","💳 PayPal (International)","Card/bank se pay — proof WhatsApp par bhejna"]);if(SETTINGS.binance)m.push(["binance","🪙 Binance (Crypto)","USDT/crypto se pay — proof WhatsApp par bhejna"]);if(!m.length)m.push(["upi","📢 WhatsApp Se Buy","Support se order karo"]);return m;}
let payMtd="auto";
function selPay(m){const vals={};["fName","fPhone","fCoupon"].forEach(id=>{const el=$(id);if(el)vals[id]=el.value;});
  payMtd=m;renderCheckoutForm();Object.keys(vals).forEach(id=>{const el=$(id);if(el)el.value=vals[id];});}
function getBill(){const items=getItems(),sub=items.reduce((s,x)=>s+(+x.p.price)*x.qty,0);
  const d=couponDisc(sub);const fee=deliveryFee(sub,items);return{items,sub,d,fee,total:sub-d+fee};}
function renderCheckoutForm(){const{items,sub,d,total}=getBill();
  const mtds=payMtds();if(!mtds.some(m=>m[0]===payMtd))payMtd=mtds[0][0];
  const lbl=payMtd==="auto"?`⚡ Auto Pay — ₹${total}`:payMtd==="upi"?`📱 UPI QR Se Pay — ₹${total}`:payMtd==="paypal"?`💳 PayPal Se Pay — ₹${total}`:`🪙 Binance Se Pay — ₹${total}`;
  $("checkoutBody").innerHTML=`<h2>🛒 Checkout</h2><p style="color:#777;font-size:13px;margin-bottom:14px">100% Online delivery (ghar delivery nahi) • ${mtds.length<=1?"":"Payment method chuno: "}</p>
  <div class="pay-methods">${mtds.map(m=>`<label class="pay-opt ${payMtd===m[0]?"on":""}" onclick="selPay('${m[0]}')"><b>${m[1]}</b><small>${m[2]}</small></label>`).join("")}</div>
  <div class="checkout-grid"><div>
  <div class="form-group"><label>Naam *</label><input id="fName" placeholder="Prince Kumar"></div>
  <div class="form-group"><label>WhatsApp Number * <small>(keys + files isi par milenge)</small></label><input id="fPhone" maxlength="10" inputmode="numeric" placeholder="10 digit"></div>
  <div class="form-group"><label>Coupon</label><input id="fCoupon" value="${cartCoupon||''}" placeholder="Aap coupon code" style="text-transform:uppercase"></div>
  </div><div class="order-summary"><h4>Summary</h4>
  ${items.map(x=>`<div class="os-row"><span>${x.p.icon||"📦"} ${esc(x.p.name)} x${x.qty}</span><b>₹${x.p.price*x.qty}</b></div>`).join("")}
  ${d?`<div class="os-row" style="color:#388e3c"><span>Coupon</span><b>-₹${d}</b></div>`:""}
  <div class="os-row"><span>Delivery</span><b style="color:green">⚡ INSTANT ONLINE</b></div>
  <div class="os-row" style="font-size:17px"><span><b>Total</b></span><b style="color:#2874f0">₹${total}</b></div></div></div>
  ${payMtd==="auto"&&!SETTINGS.zapKey?`<button class="btn btn-primary btn-block" style="margin-top:14px" onclick="goPay()">${lbl}</button>`
  :`<button class="btn btn-primary btn-block" style="margin-top:14px;${payMtd==="auto"?'background:linear-gradient(135deg,#16a34a,#059669)':''}" onclick="goPay()">${lbl}</button>`}`;}/* togglePayEnd */
function prefillFrm(){try{const f=window._frm||{};if(f.name)$("fName").value=f.name;if(f.phone)$("fPhone").value=f.phone;if(f.coupon)$("fCoupon").value=f.coupon;}catch(e){}}
function readForm(){const g=id=>$(id)?.value.trim()||"";
  const o={name:g("fName"),phone:g("fPhone"),coupon:g("fCoupon").toUpperCase(),pm:"upi"};
  cartCoupon=(o.coupon&&COUPONS[o.coupon])?o.coupon:null;
  if(o.name.length<2){toast("❌ Naam");return null;}
  if(!/^[6-9]\d{9}$/.test(o.phone)){toast("❌ Number");return null;}
  return o;}
function goPay(){const m=payMtd||"upi";if(m==="auto"){zapPay();return;}const f=readForm();if(!f)return;window._frm=f;
  const{total}=getBill(),orderId="PHS"+Math.floor(100000+Math.random()*900000);
  window._oid=orderId;
  if(m==="upi"){if(SETTINGS.upiId){goPayUpi(orderId,total);return;}$("checkoutBody").innerHTML=`<div style="text-align:center;padding:34px"><h2>📢 WhatsApp Se Order</h2><p style="color:#666">Abhi koi payment method set nahi hai — WhatsApp par order karo, admin guide karega.</p></div>
  <button class="btn btn-primary btn-block" onclick="placeOrder('upi')">✅ Order Confirm Karo</button>
  <button class="btn btn-outline btn-block" style="color:#555;border-color:#ccc;margin-top:8px" onclick="renderCheckoutForm()">← Back</button>`;return;}
  const ext=m==="paypal"?{...PAY_EXT("paypal")}:PAY_EXT(m);
  $("checkoutBody").innerHTML=`<div style="text-align:center"><h2>${ext.i} ${ext.t} Se Pay</h2><p><b>${orderId}</b> | <b style="color:#2874f0;font-size:18px">₹${total}</b></p>
  <p style="color:#666;font-size:13px">International ho to PayPal/Binance se pay karo, fir neeche <b>"Maine Pay Kar Diya"</b> dabao aur screenshot WhatsApp par bhejo.</p></div>
  <div class="upi-id-row"><span>${esc(ext.a)}</span><button onclick="navigator.clipboard.writeText('${esc(ext.a)}');toast('Copy!')">Copy</button></div>
  ${ext.link?`<a class="vid-btn" href="${esc(ext.link)}" target="_blank">${ext.i} ${ext.t} se pay karo</a>`:""}
  <button class="btn btn-primary btn-block" style="margin-top:12px;background:#388e3c" onclick="placeOrder('${m}')">✅ Maine Pay Kar Diya</button>
  <button class="btn btn-outline btn-block" style="color:#555;border-color:#ccc;margin-top:8px" onclick="renderCheckoutForm()">← Back</button>`;}
function PAY_EXT(m){return m==="paypal"?{t:"PayPal",i:"💳",a:SETTINGS.paypal,link:SETTINGS.paypalLink}:{t:"Binance",i:"🪙",a:SETTINGS.binance,link:SETTINGS.binanceLink};}
function goPayUpi(orderId,total){
  const upi=`upi://pay?pa=${SETTINGS.upiId}&pn=${encodeURIComponent(SETTINGS.upiName)}&am=${total}&cu=INR&tn=${orderId}`;
  $("checkoutBody").innerHTML=`<div style="text-align:center"><h2>📷 Scan Karo</h2><p><b>${orderId}</b> | <b style="color:#2874f0;font-size:18px">₹${total}</b></p></div>
  <div class="qr-box"><img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upi)}">
  <p style="font-size:13px;margin-top:8px">GPay/PhonePe/Paytm</p>
  <div class="upi-id-row"><span>${SETTINGS.upiId}</span><button onclick="navigator.clipboard.writeText('${SETTINGS.upiId}');toast('Copy!')">Copy</button></div>
  ${SETTINGS.paymentLink?`<a class="vid-btn" href="${SETTINGS.paymentLink}" target="_blank">💳 Card se pay (link)</a>`:""}</div>
  <button class="btn btn-primary btn-block" style="margin-top:12px;background:#388e3c" onclick="placeOrder('upi')">✅ Maine Pay Kiya</button>
  <button class="btn btn-outline btn-block" style="color:#555;border-color:#ccc;margin-top:8px" onclick="renderCheckoutForm()">← Back</button>`;}
async function placeOrder(pm){const f=window._frm||{name:"",phone:""};const{items,sub,d,total}=getBill();
  const orderId=window._oid||("PHS"+Math.floor(100000+Math.random()*900000));
  $("checkoutBody").innerHTML=`<div style="text-align:center;padding:34px"><h2>🔑 Keys nikaal rahe hain...</h2><p style="color:#666">2 second ruko</p></div>`;
  const keys=[];
  for(const x of items){for(let i=0;i<x.qty;i++){const k=await claimKey(x.p.id,orderId);if(k)keys.push({id:x.p.id,name:x.p.name,key:k});}}
  const o={orderId,name:f.name,phone:f.phone,pay:pm==="auto"?"zapupi":(pm||"upi"),
    items:items.map(x=>({id:x.p.id,name:x.p.name,price:x.p.price,qty:x.qty})),
    keys,sub,discount:d,fee:0,total,coupon:cartCoupon,date:new Date().toISOString(),status:"pending"};
  try{if(db)db.ref("orders/"+orderId).set(o);}catch(e){}
  try{if(db)items.forEach(x=>{const left=Math.max(0,(+x.p.stock||99)-x.qty);db.ref("products/"+x.p.id+"/stock").set(left);});}catch(e){}
  renderSuccess(o,false);}
function renderSuccess(o,isPaid){
  const keyTxt=(o.keys||[]).length?(o.keys||[]).map(k=>`${k.name}: ${k.key}`).join(" | "):"keys WhatsApp par milengi";
  const pl=PAY_LBL[o.pay]||"Manual UPI";
  const manual=o.pay!=="zapupi";
  const wa=`https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(`Order ${o.orderId} | ${o.name} | ${o.phone} | ${o.items.map(i=>i.name+"x"+i.qty).join(", ")} | ₹${o.total} (${pl}) | Payment proof: "${manual?"🧾 screenshot isi chat me bheja hai →":"AutoPay honest ho gaya"}" | Keys: ${keyTxt}`)}`;
  const dls=o.items.map(i=>{const p=findP(i.id);return(p&&p.download)?`<a href="${p.download}" target="_blank">⬇️ ${esc(p.name)}</a>`:"";}).join("");
  const keyBox=(o.keys||[]).length?`<div class="dl-box" style="border-color:#f59e0b;background:#fffbeb"><b>🔑 Tumhari Keys (copy kar lo):</b>${(o.keys||[]).map(k=>`<div class="upi-id-row"><span style="font-size:12.5px">${esc(k.name)}:<br><b>${esc(k.key)}</b></span><button onclick="navigator.clipboard.writeText('${esc(k.key)}');toast('Key copy!')">Copy</button></div>`).join("")}</div>`:"";
  $("checkoutBody").innerHTML=`<div class="success-box print-area"><i class="fa-solid fa-circle-check"></i><h2>${isPaid?"✅ Payment Successful! 🎉":"Order Noted! 🎉"}</h2>
  <div class="order-id">${o.orderId}<br>₹${o.total} • ${isPaid?"✅ PAID":"⏳ "+(pl)+" Check Ho Rahi"}</div>
  ${dls?`<div class="dl-box"><b>⬇️ Turant Download:</b>${dls}</div>`:`<div class="dl-box">📩 Download link <b>WhatsApp par</b> milega.</div>`}
  ${keyBox}
  ${manual?`<div class="dl-box" style="border-color:#2874f0;background:#eff6ff"><b>📲 Payment proof bhejo</b><p style="font-size:13px;margin-top:6px">Neeche WhatsApp button dabao aur payment screenshot bhejo — admin check karke turant delivery karega.</p></div>`:""}
  <a class="wa-btn" href="${wa}" target="_blank">${isPaid||!manual?"WhatsApp Par Details Bhejo":"WhatsApp Par Screenshot Bhejo"}</a>
  <button class="inv-btn" onclick="window.print()">🖨️ Bill</button>
  <button class="btn btn-outline btn-block" style="color:#555;border-color:#ccc;margin-top:10px" onclick="finishOrder()">Done</button></div>`;
  confettiBurst();window._oid=null;}
/* ⚡ ZapUPI Auto Payment */
function initZap(){try{if(typeof ZapUPI==="undefined")return;
  ZapUPI.setPaymentCallbacks({onSuccess:function(oid){verifyZap(oid);},onFailed:function(oid){zapFailed(oid,"Payment fail ho gayi.");},onTimeout:function(oid){zapFailed(oid,"Payment ka time khatam ho gaya.");}});}catch(e){}}
function zapPay(){const f=readForm();if(!f)return;
  if(!SETTINGS.zapKey){toast("❌ AutoPay key nahi lagi");return;}
  if(typeof ZapUPI==="undefined"){toast("❌ Net slow hai, dobara dabao");return;}
  const{items,sub,d,total}=getBill();
  if(total<1||total>5000){toast("❌ Amount ₹1-5000 ke beech hona chahiye");return;}
  const orderId="PHS"+Date.now();
  window._frm=f;window._oid=orderId;
  const o={orderId,name:f.name,phone:f.phone,pay:"zapupi",
    items:items.map(x=>({id:x.p.id,name:x.p.name,price:x.p.price,qty:x.qty})),
    keys:[],sub,discount:d,fee:0,total,coupon:cartCoupon,date:new Date().toISOString(),status:"pending"};
  try{if(db)db.ref("orders/"+orderId).set(o);}catch(e){}
  $("checkoutBody").innerHTML=`<div style="text-align:center;padding:34px"><h2>⚡ Payment khul raha hai...</h2><p style="color:#666">Ruko, UPI screen aa rahi hai</p></div>`;
  ZapUPI.createOrder({zap_key:SETTINGS.zapKey,order_id:orderId,amount:String(total),customer_mobile:f.phone,
    remark:(items.map(x=>x.p.name+"x"+x.qty).join(", ")).slice(0,120)},
    {onResponse:function(url,oid){ZapUPI.loadPayment(url);},
     onError:function(err){toast("❌ "+err);renderCheckoutForm();prefillFrm();}});}
async function verifyZap(orderId){
  $("checkoutBody").innerHTML=`<div style="text-align:center;padding:34px"><h2>🔍 Payment check ho rahi hai...</h2><p style="color:#666">2 second ruko</p></div>`;
  ZapUPI.orderStatus({zap_key:SETTINGS.zapKey,order_id:orderId},{
    onResponse:async function(oid,data){const st=data&&data.data?data.data.status:"";
      if(st==="success"){await fulfillZap(oid);}else{zapFailed(oid,"Payment confirm nahi hui.");}},
    onError:function(err){zapFailed(orderId,"Status check fail: "+err);}});}
async function fulfillZap(orderId){
  let o=null;try{if(db){const s=await db.ref("orders/"+orderId).get();if(s.exists())o=s.val();}}catch(e){}
  if(!o){zapFailed(orderId,"Order nahi mila.");return;}
  const keys=[];
  for(const it of (o.items||[])){const p=findP(it.id);for(let i=0;i<(it.qty||1);i++){const k=await claimKey(it.id,orderId);if(k)keys.push({id:it.id,name:it.name,key:k});}
    try{if(db&&p){const left=Math.max(0,(+p.stock||99)-(it.qty||1));db.ref("products/"+it.id+"/stock").set(left);}}catch(e){}}
  o.keys=keys;o.status="paid";
  try{if(db)db.ref("orders/"+orderId).update({keys,status:"paid"});}catch(e){}
  renderSuccess(o,true);}
function zapFailed(orderId,msg){
  $("checkoutBody").innerHTML=`<div class="success-box"><i class="fa-solid fa-circle-xmark" style="font-size:60px;color:#ef4444"></i><h2>Payment Fail ❌</h2>
  <p style="color:#555;font-size:14px">${esc(msg||"")}<br>Order ID: <b>${esc(orderId||"")}</b> (pending me save hai)</p>
  <button class="btn btn-primary btn-block" style="margin-top:12px" onclick="zapPay()">🔁 Dobara Try Karo</button>
  <button class="btn btn-outline btn-block" style="color:#555;border-color:#ccc;margin-top:8px" onclick="renderCheckoutForm();prefillFrm()">Manual UPI Se Karo</button></div>`;}
async function claimKey(pid,orderId){try{if(!db)return "";
  const s=await db.ref("keys/"+pid).get();if(!s.exists())return "";
  let fk="";s.forEach(c=>{if(!fk&&c.val()&&!c.val().used)fk=c.key;});
  if(!fk)return "";
  await db.ref("keys/"+pid+"/"+fk).update({used:true,orderId,date:Date.now()});
  const k=await db.ref("keys/"+pid+"/"+fk+"/key").get();return k.exists()?String(k.val()):"";}catch(e){return "";}}
function finishOrder(){if(singleBuy)cart=cart.filter(x=>x.id!==singleBuy.id);else cart=[];cartCoupon=null;singleBuy=null;singleQty=1;saveCart();updateCartUI();closeCheckout();toast("🎉 Thanks!");}

/* TRACK + MY ORDERS */
const ST_TXT={pending:"⏳ Payment Check",paid:"✅ Paid",done:"✅ Delivered",cancelled:"❌ Cancelled"};
function openTrack(){$("trackBody").innerHTML=`<h2>📦 Track Order</h2><div class="form-group" style="margin-top:12px"><label>Order ID *</label><input id="tId" placeholder="PHS..." style="text-transform:uppercase"></div>
  <button class="btn btn-primary btn-block" onclick="doTrack()">🔍 Check</button><div id="trackRes"></div>`;$("trackModal").classList.add("show");}
function closeTrack(){$("trackModal").classList.remove("show");}
async function doTrack(){const id=$("tId").value.trim().toUpperCase();if(!id)return;$("trackRes").innerHTML="⏳...";
  try{const s=await db.ref("orders/"+id).get();if(!s.exists()){$("trackRes").innerHTML=`<div class="track-result">❌ Nahi mila.</div>`;return;}
  const o=s.val();$("trackRes").innerHTML=`<div class="track-result">🧾 <b>${esc(o.orderId)}</b><br>📦 ${(o.items||[]).map(i=>esc(i.name)+"x"+(i.qty||1)).join(", ")}<br>💰 ₹${o.total}<br>Status: <b>${ST_TXT[o.status]||o.status}</b></div>`;}
  catch(e){$("trackRes").innerHTML=`<div class="track-result">⚠️ Net issue.</div>`;}}
function openMyOrders(){$("myOrdersBody").innerHTML=`<h2>🧾 My Orders</h2><p style="color:#666;font-size:13px">Jis number se order kiya tha wahi dalo</p>
  <div class="form-group" style="margin-top:10px"><label>WhatsApp Number *</label><input id="moPhone" maxlength="10" inputmode="numeric" placeholder="10 digit"></div>
  <button class="btn btn-primary btn-block" onclick="doMyOrders()">📋 Mere Orders Dekho</button><div id="moRes" style="margin-top:12px"></div>`;$("ordersModal").classList.add("show");}
function closeMyOrders(){$("ordersModal").classList.remove("show");}
async function doMyOrders(){const ph=$("moPhone").value.trim();if(!/^[6-9]\d{9}$/.test(ph)){toast("❌ Number");return;}
  $("moRes").innerHTML="⏳...";
  try{const s=await db.ref("orders").get();if(!s.exists()){$("moRes").innerHTML="Koi order nahi.";return;}
  const list=Object.values(s.val()).filter(o=>o.phone===ph).sort((a,b)=>new Date(b.date)-new Date(a.date));
  $("moRes").innerHTML=list.length?list.map(o=>{const dls=(o.items||[]).map(i=>{const p=findP(i.id);return(p&&p.download)?`<a href="${p.download}" target="_blank" style="color:#2874f0;font-weight:800">⬇️ ${esc(i.name)}</a>`:"";}).filter(Boolean).join(" ");
  const kys=(o.keys||[]).map(k=>`<span style="background:#fffbeb;border:1px solid #f59e0b;border-radius:6px;padding:2px 8px;font-size:12px">🔑 ${esc(k.name)}: <b>${esc(k.key)}</b></span>`).join(" ");
  return `<div class="myord"><b>${esc(o.orderId)}</b> - ₹${o.total} - <b>${ST_TXT[o.status]||o.status}</b><br><small>${(o.items||[]).map(i=>esc(i.name)+"x"+(i.qty||1)).join(", ")}<br>${new Date(o.date).toLocaleString("hi-IN")}</small>${dls?`<br>${dls}`:""}${kys?`<br><span style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${kys}</span>`:""}</div>`;}).join(""):"<p>Is number par koi order nahi.</p>";}
  catch(e){$("moRes").innerHTML="⚠️ Net issue.";}}

/* SUPPORT + REVIEW */
function sendQuery(){const n=$("qName").value.trim(),p=$("qPhone").value.trim(),m=$("qMsg").value.trim();
  if(n.length<2||m.length<3){toast("❌ Naam+msg");return;}
  try{if(db)db.ref("queries").push({name:n,phone:p,msg:m,date:Date.now(),status:"new"});}catch(e){}
  open(`https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(`Help: ${n} (${p}) - ${m}`)}`,"_blank");
  $("qName").value="";$("qPhone").value="";$("qMsg").value="";toast("📩 Sent!");}
function submitReview(){const n=$("revName").value.trim(),t=$("revText").value.trim(),s=+$("revStars").value;
  const pv=$("revProd")?.value||"",pp=pv?findP(pv):null,full=pp?`[${pp.name}] ${t}`:t;
  if(n.length<2||t.length<3){toast("❌ Liko");return;}
  try{if(db)db.ref("reviews").push({name:n,text:full,stars:s,date:Date.now(),pid:pv||""});}catch(e){}
  try{if(REV_CACHE)REV_CACHE.push({name:n,text:full,stars:s,date:Date.now(),pid:pv||""});}catch(e){}
  $("reviewGrid").insertAdjacentHTML("afterbegin",`<div class="review"><div class="stars">${"★".repeat(s)}</div><p>"${esc(t)}"</p><b>- ${esc(n)}</b></div>`);
  $("revName").value="";$("revText").value="";toast("⭐ Thanks!");}

/* EVENTS */
document.querySelectorAll(".cat-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".cat-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeCat=b.dataset.cat;renderProducts();}));
$("sortSelect").addEventListener("change",e=>{sortBy=e.target.value;pageShown=pageSize();renderProducts();});
$("priceFilter").addEventListener("change",e=>{priceF=e.target.value;pageShown=pageSize();renderProducts();});
const doSearch=debounce(()=>{pageShown=pageSize();renderProducts();},200);
["searchInput","searchInputMobile"].forEach(id=>$(id)?.addEventListener("input",e=>{searchText=e.target.value.toLowerCase().trim();doSearch();}));
$("productModal").addEventListener("click",e=>{if(e.target.id==="productModal")closeProduct();});
$("checkoutModal").addEventListener("click",e=>{if(e.target.id==="checkoutModal")closeCheckout();});
$("trackModal").addEventListener("click",e=>{if(e.target.id==="trackModal")closeTrack();});
$("ordersModal").addEventListener("click",e=>{if(e.target.id==="ordersModal")closeMyOrders();});

/* MOTION: header shadow + back-top + reveal + counters + bottom-nav sync */
(function(){
  const hd=document.querySelector(".header"),bt=$("backTop");
  addEventListener("scroll",()=>{hd?.classList.toggle("scrolled",scrollY>10);bt?.classList.toggle("show",scrollY>600);},{passive:true});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll(".section-head,.step,.trust,.review,.support-box,.review-form,.filter-bar").forEach(el=>{el.classList.add("reveal");io.observe(el);});
})();
const _uC=updateCartUI,_uW=updateWishUI;
updateCartUI=function(){_uC();try{$("bCart").textContent=cart.reduce((s,c)=>s+c.qty,0);const b=$(".cart-btn");b?.classList.remove("bump");void b?.offsetWidth;b?.classList.add("bump");
const pill=$("cartPill"),n=cart.reduce((s,c)=>s+c.qty,0),open=$("cartDrawer").classList.contains("open");
if(pill){if(n>0&&!open){const sub=cartSub(),d=couponDisc(sub),fee=deliveryFee(sub,cartItems());
pill.style.display="flex";$("pillTxt").textContent=n+" item"+(n>1?"s":"")+" • ₹"+(sub-d+fee).toLocaleString("en-IN");}else pill.style.display="none";}}catch(e){}};
updateWishUI=function(){_uW();try{$("bWish").textContent=wishlist.length;}catch(e){}};

/* v5: notice rotator, coupons strip, recent, revProd, policies, install, confetti, goShop */
let _ni=0,_nt=null;
function startNotice(){const parts=String(SETTINGS.notice||"100% Instant Delivery").split("|").map(s=>s.trim()).filter(Boolean);
  if(_nt)clearInterval(_nt);_ni=0;const el=$("noticeText");if(!el)return;
  el.textContent=parts[0]||"";if(parts.length<2)return;
  _nt=setInterval(()=>{_ni=(_ni+1)%parts.length;el.style.opacity=0;
    setTimeout(()=>{el.textContent=parts[_ni];el.style.opacity=1;},250);},4000);}
function renderCouponStrip(){const box=$("couponStrip");if(!box)return;const ks=Object.keys(COUPONS||{});
  if(!ks.length){$("couponSec").style.display="none";return;}$("couponSec").style.display="block";
  box.innerHTML=ks.map(c=>{const v=COUPONS[c];return `<div class="coupon-ticket" onclick="copyCoupon('${esc(c)}')"><b>${esc(c)}</b><small>${v.type==="percent"?v.off+"% OFF":"₹"+v.off+" OFF"} • Min ₹${v.min||0}</small><span>TAP TO COPY</span></div>`;}).join("");}
function pushRecent(id){try{let r=JSON.parse(localStorage.getItem("phs_recent")||"[]").map(String);
  r=[String(id),...r.filter(x=>x!==String(id))].slice(0,8);localStorage.setItem("phs_recent",JSON.stringify(r));setTimeout(renderRecent,600);}catch(e){}}
function renderRecent(){const box=$("recentRow");if(!box)return;let r=[];try{r=JSON.parse(localStorage.getItem("phs_recent")||"[]");}catch(e){}
  r=r.map(findP).filter(Boolean);if(!r.length){$("recentSec").style.display="none";return;}$("recentSec").style.display="block";
  box.innerHTML=r.map(p=>`<div class="recent-card" onclick="openProduct('${p.id}')"><div class="re">${p.image?lazyImg(p.image,p.icon||"📦","width:52px;height:52px;object-fit:cover;border-radius:12px"):(p.icon||"📦")}</div><b>${esc(p.name).slice(0,34)}</b><span>₹${p.price}</span></div>`).join("");}
function populateRevProd(){const s=$("revProd");if(!s||s.options.length>1)return;
  PRODUCTS.forEach(p=>{const o=document.createElement("option");o.value=p.id;o.textContent=p.name.slice(0,32);s.appendChild(o);});}
const POLICIES={shipping:{t:"⚡ Delivery Policy (100% Online)",b:["Yahan sab kuch ONLINE milta hai — koi ghar delivery nahi hoti.","Payment verify hote hi download link + keys turant screen par dikhte hain.","Setup guide aur backup WhatsApp par 5-10 minute me bheja jata hai.","My Orders me apna number daal ke files/keys dobara download kar sakte ho — lifetime access."]},
refund:{t:"🔄 Refund & Replacement",b:["Corrupt/wrong file mile to 24hr me free replacement. Key kaam na kare to turant nayi key.","Galat product kharidne par 24hr me dusre product se exchange (WhatsApp par baat karo).","WhatsApp par Order ID + screenshot bhejo — bina proof claim nahi hoga."]},
privacy:{t:"🔒 Privacy Policy",b:["Naam aur number sirf order delivery ke liye use hota hai.","Data kisi teesre ko becha/share nahi hota. Payment UPI apps par hoti hai — hum card/CVV/OTP kabhi nahi mangte.","Koi bhi doubt ho to WhatsApp par pucho."]},
terms:{t:"📜 Terms of Use",b:["Panels/codes apne risk par use karo; game-ban ki zimmedari buyer ki. Resell sirf jahan likha ho wahi allowed.","Price/coupon bina notice badal sakte hain. Fraud/chargeback par order block hoga.","Support time Subah 10 - Raat 10."]}};
function openPolicy(k){const p=POLICIES[k];if(!p)return;
  $("policyBody").innerHTML=`<div class="policy-body"><h2>${p.t}</h2>${p.b.map(x=>`<p>• ${x}</p>`).join("")}</div>`;
  $("policyModal").classList.add("show");}
function closePolicy(){$("policyModal").classList.remove("show");}
$("policyModal").addEventListener("click",e=>{if(e.target.id==="policyModal")closePolicy();});
function goShop(){document.getElementById("products").scrollIntoView({behavior:"smooth"});
  setTimeout(()=>{const m=$("searchInputMobile"),d=$("searchInput");
    if(m&&getComputedStyle(m).display!=="none")m.focus({preventScroll:true});else d?.focus({preventScroll:true});},600);}
let _deferred=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();_deferred=e;
  if(!localStorage.getItem("phs_inst")){$("installBar").style.display="flex";$("footInstall").style.display="inline-block";}});
function installApp(){if(_deferred){_deferred.prompt();_deferred.userChoice.then(()=>{_deferred=null;$("installBar").style.display="none";});}
  else toast("Browser menu → Add to Home Screen dabao 📲");}
function dismissInstall(){localStorage.setItem("phs_inst","1");$("installBar").style.display="none";}
function confettiBurst(){try{const c=$("confettiCv"),x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;
  const P=[...Array(120)].map(()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.4,w:6+Math.random()*6,h:8+Math.random()*8,
    vy:2+Math.random()*3,vx:-1.5+Math.random()*3,r:Math.random()*Math.PI,vr:-.1+Math.random()*.2,
    col:["#2874f0","#6a11cb","#22c55e","#f59e0b","#f43f5e","#ffe500"][Math.floor(Math.random()*6)]}));
  let f=0;(function anim(){x.clearRect(0,0,c.width,c.height);f++;
    P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.col;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore();});
    if(f<180)requestAnimationFrame(anim);else x.clearRect(0,0,c.width,c.height);})();}catch(e){}}
const _rP=renderProducts;
renderProducts=function(){_rP();try{renderCouponStrip();renderHeroCoupons();populateRevProd();renderRecent();}catch(e){}};

/* DEVICE ADAPTIVE: phone=app feel, PC=power feel */
function detectDevice(){const mobi=matchMedia("(pointer:coarse)").matches||innerWidth<768;
  document.body.classList.toggle("mobi",mobi);document.body.classList.toggle("desk",!mobi);}
addEventListener("resize",()=>detectDevice());detectDevice();
/* gallery touch-swipe (phone) */
function bindSwipe(pid){const m=$("galMain");if(!m||m.dataset.sw)return;m.dataset.sw="1";let sx=0;
  m.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;},{passive:true});
  m.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)<45)return;
    const p=findP(pid);if(!p)return;const g=gallery(p);if(g.length<2)return;
    galGo(pid,(galIdx+(dx<0?1:-1)+g.length)%g.length);},{passive:true});}
/* keyboard shortcuts (PC): / = search, Esc = close all */
addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeProduct();closeCart();toggleWishlistView(false);closeCheckout();closeTrack();closeMyOrders();closePolicy();return;}
  if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||"")){e.preventDefault();goShop();}});

applySettings();updateCartUI();updateWishUI();
const hasCache=loadProdCache(); // stale-while-revalidate: page turant khulega
if(hasCache){renderCats();renderProducts();setDeal();$("syncNote").textContent="• ⏳ Sync...";}
else{$("productGrid").innerHTML=skelCards();renderCats();}
/* PHONE v6: haptics + search suggestions */
function buzz(){try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}}
/* v7: youtube embed + product reviews + views */
function ytId(u){try{u=String(u||"");let m=u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);return m?m[1]:"";}catch(e){return "";}}
const _vq={};let _vt=null;
function bumpViews(id){try{if(!db)return;_vq[id]=(_vq[id]||0)+1;
  if(_vt)return;_vt=setTimeout(flushViews,8000);}catch(e){}}
function flushViews(){if(!db){_vt=null;return;}const k=Object.keys(_vq);if(!k.length){_vt=null;return;}
  k.forEach(id=>{const c=_vq[id];_vq[id]=0;db.ref("products/"+id+"/views").transaction(v=>(v||0)+c);});
  _vt=null;}
async function loadProdReviews(pid){const box=$("prodRev");if(!box)return;
  try{
    if(!REV_CACHE){if(!REV_PROM)REV_PROM=(db?db.ref("reviews").limitToLast(80).get().catch(()=>null):Promise.resolve(null)).then(s=>{const a=[];if(s&&s.exists())s.forEach(c=>a.push(c.val()));REV_CACHE=a;return a;});await REV_PROM;}
    const list=(REV_CACHE||[]).filter(r=>r&&(r.pid===String(pid)));
    if(!list.length){box.innerHTML=`<p style="color:#888;font-size:13px">💬 Abhi koi review nahi — pehle tum likho!</p>`;return;}
    box.innerHTML=`<h4 style="margin:12px 0 8px">⭐ Reviews (${list.length})</h4>`+list.slice(-3).reverse().map(r=>`<div class="review" style="margin-bottom:8px"><div class="stars">${"★".repeat(r.stars||5)}${"☆".repeat(5-(r.stars||5))}</div><p>"${esc(r.text)}"</p><b>- ${esc(r.name)}</b></div>`).join("");
  }catch(e){box.innerHTML="";}}
function showSugg(inp,boxId){const box=$(boxId);if(!box)return;const q=inp.value.toLowerCase().trim();
  if(q.length<1){box.classList.remove("show");return;}
  const m=PRODUCTS.filter(p=>(p.name+" "+(p.tags||"")).toLowerCase().includes(q)).slice(0,6);
  if(!m.length){box.classList.remove("show");return;}
  box.innerHTML=m.map(p=>`<button onclick="pickSugg('${p.id}')"><span class="si">${p.image?lazyImg(p.image,p.icon||"📦","width:30px;height:30px;object-fit:cover;border-radius:8px"):(p.icon||"📦")}</span><span>${esc(p.name).slice(0,36)}</span><b>₹${p.price}</b></button>`).join("");
  box.classList.add("show");}
function pickSugg(id){document.querySelectorAll(".sugg").forEach(s=>s.classList.remove("show"));openProduct(id);}
$("searchInput")?.addEventListener("input",e=>showSugg(e.target,"suggD"));
$("searchInputMobile")?.addEventListener("input",e=>showSugg(e.target,"suggM"));
document.addEventListener("click",e=>{if(!e.target.closest(".search-box"))document.querySelectorAll(".sugg").forEach(s=>s.classList.remove("show"));});
document.addEventListener("scroll",()=>document.querySelectorAll(".sugg").forEach(s=>s.classList.remove("show")),{passive:true});

renderProducts();setDeal();startFirebase();startTimer();deepLink();initZap();
/* CUSTOM EMOJI ENGINE - har emoji ko designed chip me wrap */
(function(){var RE_SPLIT=/([\u2600-\u27BF\u2B00-\u2BFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])/g;
function hasEmoji(s){return /[\u2600-\u27BF\u2B00-\u2BFF\uD800-\uDBFF]/.test(s);}
function ceWrapAll(){if(!document.body)return;try{
var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;
if(!n.nodeValue||!hasEmoji(n.nodeValue)||!p||(p.classList&&p.classList.contains("ce")))return NodeFilter.FILTER_REJECT;
return NodeFilter.FILTER_ACCEPT;}});
var list=[],w;while((w=walker.nextNode()))list.push(w);
list.forEach(function(n){var parts=n.nodeValue.split(RE_SPLIT),frag=document.createDocumentFragment(),added=false;
parts.forEach(function(p){if(!p)return;
if(hasEmoji(p)){var s=document.createElement("span");s.className="ce";s.textContent=p;frag.appendChild(s);added=true;}
else frag.appendChild(document.createTextNode(p));});
if(added)n.parentNode.replaceChild(frag,n);});
}catch(e){}}
setInterval(ceWrapAll,1400);})();
