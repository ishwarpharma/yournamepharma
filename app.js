// CUSTOMER SETTINGS — change these four values for each clone
const CUSTOMER = {
  firm_name: "ISHWAR PHARMA",
  whatsapp_number: "919876543210",
  address: "Enter business address here",
  margin_percent: 0,
};
(function(){'use strict';
const $=s=>document.querySelector(s);const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
let deferredInstallPrompt=null,products=[],config=CUSTOMER,qtyDraft={},cart=loadCart(),mode='list',activeProduct=null,categoryPage=0,categoryPageSize=16,categoryAutoplayTimer=null,categoryPointerStart=null,swipeClickUntil=0,categoryCarouselVisible=false,categoryCarouselBound=false;
const CART_KEY='medicine_store_cart_v1';
function loadCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||'{}')}catch(e){return {}}}
function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function slug(s){return String(s||'').toLowerCase().trim()}
function roundFair(n){let step=n<5?.05:n<10?.10:n<20?.25:n<50?.50:n<100?1:n<200?5:10;return Math.round((n+Number.EPSILON)/step)*step}
function sellingPrice(p){let raw=Number(p.price||0)*(1+Number(config.margin_percent||0)/100);return Math.round(roundFair(raw)*100)/100}
function priceStatus(p){if(!(Number(p.price)>0))return 'zero';let s=sellingPrice(p);if(Number(p.mrp)>0&&s>Number(p.mrp)+.001)return 'above-mrp';return 'ok'}
function imageTag(p){return p.image?`<button class="product-image-button" type="button" data-detail="${p.id}" aria-label="View details for ${esc(p.title)}"><img class="thumb" loading="lazy" src="${esc(p.image)}" alt="" onerror="this.style.visibility='hidden'"></button>`:'<span class="thumb"></span>'}
function categories(){let c=new Set();products.forEach(p=>(p.categories||[]).forEach(x=>c.add(x)));return [...c].sort((a,b)=>a.localeCompare(b))}
function vendors(){return [...new Set(products.map(p=>p.vendor).filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function fillSelect(sel,items,all){let counts={};products.forEach(p=>{if(sel==='#company'){counts[p.vendor]=(counts[p.vendor]||0)+1}else{(p.categories||[]).forEach(c=>counts[c]=(counts[c]||0)+1)}});$(sel).innerHTML=`<option value="">${all}</option>`+items.map(x=>`<option value="${esc(x)}">${esc(x)} (${counts[x]||0})</option>`).join('')}
function categoryIcon(name){let value=slug(name),kind='medicine';if(/antibacterial|anti-bacterial|anti-fungal|anti-parasitic/.test(value))kind='cross';else if(/heart|cardiac|blood pressure|cholesterol/.test(value))kind='heart';else if(/diabetes/.test(value))kind='drop';else if(/vitamin|nutrition|protein|calcium|iron/.test(value))kind='sparkle';else if(/cough|cold|allergy|asthma|respiratory|sinus/.test(value))kind='lungs';else if(/skin|fungal/.test(value))kind='skin';else if(/eye|ear/.test(value))kind='eye';else if(/pain|muscle|joint|arthritis/.test(value))kind='pulse';else if(/women/.test(value))kind='flower';else if(/digestive|acidity|stomach|diarrhea|constipation|liver/.test(value))kind='stomach';else if(/first aid|wound/.test(value))kind='cross';let artwork={medicine:'<rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-35 12 12)"></rect><path d="m9 8 7 9"></path>',cross:'<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"></path>',heart:'<path d="M20.8 8.7c0 4.1-8.8 10-8.8 10s-8.8-5.9-8.8-10a4.6 4.6 0 0 1 8.8-1.6 4.6 4.6 0 0 1 8.8 1.6Z"></path>',drop:'<path d="M12 3s-6.5 7.3-6.5 11.6a6.5 6.5 0 0 0 13 0C18.5 10.3 12 3 12 3Z"></path><path d="M9 15a3 3 0 0 0 3 3"></path>',sparkle:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"></path>',lungs:'<path d="M12 5v8m0-4c-2-3-3-4-4-3-2 2-4 6-4 10a3 3 0 0 0 5 2l3-3m0-6c2-3 3-4 4-3 2 2 4 6 4 10a3 3 0 0 1-5 2l-3-3"></path>',skin:'<circle cx="12" cy="12" r="8.5"></circle><path d="M8.5 13.5c1.4 1.2 2.5 1.7 3.5 1.7 1.9 0 2.9-1 3.5-2.7M9 9h.01M15 9h.01"></path>',eye:'<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.5"></circle>',pulse:'<path d="M3 12h4l2.2-6 4.1 12 2.2-6H21"></path>',flower:'<circle cx="12" cy="12" r="2"></circle><path d="M12 10c-4-1-5-5-2-6 3-1 4 3 2 6Zm2 2c1-4 5-5 6-2 1 3-3 4-6 2Zm-2 2c4 1 5 5 2 6-3 1-4-3-2-6Zm-2-2c-1 4-5 5-6 2-1-3 3-4 6-2Z"></path>',stomach:'<path d="M9 4v5c0 2 1 3 3 3h2c2 0 3 1 3 3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5c0-2 1-3 3-4V4m2 0h4"></path>'};return `<svg class="category-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${artwork[kind]}</svg>`}
function categoryPageSizeForViewport(){return matchMedia('(max-width: 680px)').matches?8:matchMedia('(max-width: 900px)').matches?12:16}
function updateCategoryControls(){let pageCount=Math.ceil(categories().length/categoryPageSize);categoryPage=Math.min(categoryPage,pageCount-1);$('#categoryTrack').style.transform=`translateX(-${categoryPage*100}%)`;$('#categoryTrack').querySelectorAll('.category-page').forEach((page,i)=>{page.setAttribute('aria-hidden',String(i!==categoryPage));page.inert=i!==categoryPage});$('#categoryPrev').disabled=categoryPage===0;$('#categoryNext').disabled=categoryPage>=pageCount-1;$('#categoryPageStatus').textContent=`${categoryPage+1} / ${pageCount} · ${categories().length} categories`;$('#categoryPagination').innerHTML=Array.from({length:pageCount},(_,i)=>`<button class="page-dot${i===categoryPage?' active':''}" type="button" data-page="${i}" aria-label="Show category page ${i+1}"${i===categoryPage?' aria-current="page"':''}></button>`).join('')}
function renderCategoryShowcase(){
  let counts={};
  products.forEach(p=>(p.categories||[]).forEach(c=>counts[c]=(counts[c]||0)+1));
  let names=categories().filter(name=>products.some(p=>(p.categories||[]).includes(name)&&p.image))
    .sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b));
  $('#categoryShowcase').innerHTML=names.map(name=>{
    let seen=new Set();
    let items=products.filter(p=>(p.categories||[]).includes(name)&&p.image&&!seen.has(p.image)&&seen.add(p.image));
    return `<section class="category-showcase-row">
      <div class="category-showcase-heading"><button class="category-showcase-category" type="button" data-category-heading="${esc(name)}">${esc(name)}</button></div>
      <div class="category-showcase-track" role="group" aria-label="${esc(name)} medicine images">
        ${items.map(p=>`<button class="category-showcase-tile" type="button" data-detail="${p.id}" aria-label="View details for ${esc(p.title)}"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"></button>`).join('')}
      </div>
    </section>`;
  }).join('');
}
function renderCategories(){let counts={};products.forEach(p=>(p.categories||[]).forEach(c=>counts[c]=(counts[c]||0)+1));let items=categories().sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b)),palette=['#ef6d52','#128778','#d49a12','#5677c9','#da668d','#6d9049'];categoryPageSize=categoryPageSizeForViewport();let pages=[];for(let i=0;i<items.length;i+=categoryPageSize)pages.push(items.slice(i,i+categoryPageSize));categoryPage=Math.min(categoryPage,pages.length-1);$('#categoryTrack').innerHTML=pages.map((page,pageIndex)=>`<section class="category-page" aria-label="Category page ${pageIndex+1} of ${pages.length}">${page.map((name,i)=>`<button class="category-card" type="button" data-category="${esc(name)}" style="--category-accent:${palette[(pageIndex*categoryPageSize+i)%palette.length]}" aria-label="${esc(name)}, ${counts[name].toLocaleString('en-IN')} ${counts[name]===1?'product':'products'}"><span class="category-icon" aria-hidden="true">${categoryIcon(name)}</span><strong>${esc(name)}</strong><span class="category-count">${counts[name].toLocaleString('en-IN')}</span></button>`).join('')}</section>`).join('');updateCategoryControls();bindCategoryCarousel()}
function stopCategoryAutoplay(){clearTimeout(categoryAutoplayTimer);categoryAutoplayTimer=null}
function scheduleCategoryAutoplay(){stopCategoryAutoplay();let pageCount=Math.ceil(categories().length/categoryPageSize),section=$('#categoryBrowse');if(pageCount<2||!categoryCarouselVisible||document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches||section.matches(':hover')||section.contains(document.activeElement))return;categoryAutoplayTimer=setTimeout(()=>{categoryPage=(categoryPage+1)%pageCount;updateCategoryControls();scheduleCategoryAutoplay()},5000)}
function showCategoryPage(page){let pageCount=Math.ceil(categories().length/categoryPageSize);if(!pageCount)return;categoryPage=Math.max(0,Math.min(page,pageCount-1));updateCategoryControls();scheduleCategoryAutoplay()}
function bindCategoryCarousel(){if(categoryCarouselBound)return;categoryCarouselBound=true;let section=$('#categoryBrowse'),grid=$('#categoryGrid');if('IntersectionObserver'in window){new IntersectionObserver(entries=>{categoryCarouselVisible=entries[0].isIntersecting;scheduleCategoryAutoplay()}).observe(section)}else{categoryCarouselVisible=true}section.addEventListener('pointerenter',stopCategoryAutoplay);section.addEventListener('pointerleave',scheduleCategoryAutoplay);section.addEventListener('focusin',stopCategoryAutoplay);section.addEventListener('focusout',()=>setTimeout(scheduleCategoryAutoplay,0));grid.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;categoryPointerStart={x:e.clientX,y:e.clientY};stopCategoryAutoplay()});window.addEventListener('pointerup',e=>{if(!categoryPointerStart)return;let dx=e.clientX-categoryPointerStart.x,dy=e.clientY-categoryPointerStart.y;categoryPointerStart=null;if(Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)*1.25){swipeClickUntil=Date.now()+500;showCategoryPage(categoryPage+(dx<0?1:-1))}else scheduleCategoryAutoplay()});window.addEventListener('pointercancel',()=>{categoryPointerStart=null;scheduleCategoryAutoplay()});grid.addEventListener('click',e=>{if(Date.now()<swipeClickUntil&&e.target.closest('[data-category]')){e.preventDefault();e.stopImmediatePropagation();swipeClickUntil=0}});['categoryPrev','categoryNext','categoryPagination'].forEach(id=>$('#'+id).addEventListener('click',()=>setTimeout(scheduleCategoryAutoplay,0)));document.addEventListener('visibilitychange',scheduleCategoryAutoplay);scheduleCategoryAutoplay()}
function initConfig(){let name=config.firm_name||'Medicine Store',mobile=String(config.whatsapp_number||'').replace(/[^0-9]/g,'');$('#storeName').textContent=name;$('#brandMark').textContent=(name.match(/[A-Za-z]/g)||['R','X']).slice(0,2).join('').toUpperCase();$('#footerStore').textContent=name;$('#phoneLink').href=mobile?'tel:'+mobile:'#';$('#phoneLink').textContent=mobile||'Mobile not configured';$('#footerContact').textContent=[config.address,mobile?'WhatsApp: '+mobile:''].filter(Boolean).join(' · ');$('#introText').textContent=`Browse the catalogue, check medicine information and place your order with ${name}.`;$('#markupNote').textContent=`Price margin: ${Number(config.margin_percent||0)}%`}
function matches(p){let q=slug($('#search').value).split(/\s+/).filter(Boolean),cat=$('#category').value,co=$('#company').value;if(cat&&!(p.categories||[]).includes(cat))return false;if(co&&p.vendor!==co)return false;let hay=slug([p.title,p.searchText,p.vendor,(p.categories||[]).join(' ')].join(' '));return q.every(t=>hay.includes(t))}
function visible(){return products.filter(matches)}
function mrpDisplay(p){let mrp=Number(p.mrp);if(!(mrp>0))return '';let status=priceStatus(p),sale=sellingPrice(p),discount=status==='ok'&&sale<mrp?Math.round((mrp-sale)/mrp*100):0;return `<div class="mrp-line"><span class="mrp">MRP ${money(mrp)}</span>${discount>0?`<span class="discount-badge">${discount}% OFF</span>`:''}</div>`}
function productRow(p){let status=priceStatus(p),q=qtyDraft[p.id]||'';let price=status==='zero'?'Price on request':status==='above-mrp'?'Price under review':money(sellingPrice(p));return `<article class="product-row" data-id="${p.id}"><div class="product-main">${imageTag(p)}<div class="product-copy"><button class="product-name" data-detail="${p.id}">${esc(p.title)}</button><div class="product-meta"><span class="company-tag">${esc(p.vendor)}</span> · ${esc((p.categories||[]).join(', '))}</div></div></div><div class="price-col"><div class="price">${price}</div>${mrpDisplay(p)}${status==='above-mrp'?'<div class="price-note">Exceeds MRP</div>':''}</div>${status==='ok'?`<input class="qty-input" type="number" min="0" max="9999" step="1" inputmode="numeric" placeholder="Qty" value="${esc(q)}" aria-label="Quantity for ${esc(p.title)}">`:`<div class="unavailable">${status==='zero'?'Ask for price':'Review required'}</div>`}${status==='ok'?`<button class="add-one" data-add="${p.id}">Add</button>`:'<span></span>'}</article>`}
function productCard(p){let status=priceStatus(p),q=qtyDraft[p.id]||'';return `<article class="product-card" data-id="${p.id}"><div class="product-main">${imageTag(p)}<div><button class="product-name" data-detail="${p.id}">${esc(p.title)}</button><div class="product-meta">${esc(p.vendor)} · ${esc((p.categories||[]).join(', '))}</div></div></div><div class="card-bottom"><div><div class="price">${status==='ok'?money(sellingPrice(p)):status==='zero'?'Price on request':'Price under review'}</div>${mrpDisplay(p)}</div>${status==='ok'?`<input class="qty-input" type="number" min="0" max="9999" placeholder="Qty" value="${esc(q)}" aria-label="Quantity">`:'<span></span>'}${status==='ok'?`<button class="add-one" data-add="${p.id}">Add</button>`:''}</div></article>`}
function render(){let list=visible(),hasQuery=Boolean($('#search').value.trim()||$('#category').value||$('#company').value);let headingParts=[$('#category').value,$('#company').value].filter(Boolean);let searchTerm=$('#search').value.trim();if(searchTerm)headingParts.push('Search: '+searchTerm);$('#productHeading').textContent=headingParts.length?headingParts.join(' · '):'Product catalogue';$('#categoryShowcase').hidden=Boolean($('#category').value||$('#search').value.trim()||$('#company').value);$('#products').className=mode==='list'?'products-list':'products-grid';$('#products').innerHTML=hasQuery?list.map(mode==='list'?productRow:productCard).join(''):'';$('#products').hidden=!hasQuery||list.length===0;$('#catalogueHead').hidden=!hasQuery;$('#empty').hidden=!hasQuery||list.length>0;$('#resultCount').textContent=hasQuery?`Showing ${list.length.toLocaleString('en-IN')} of ${products.length.toLocaleString('en-IN')} products`:`Choose a category or search to explore ${products.length.toLocaleString('en-IN')} products.`;$('#productCount').textContent=products.length.toLocaleString('en-IN');updateBulk()}
function updateBulk(){let count=Object.values(qtyDraft).filter(x=>Number(x)>0).length;$('#selectedCount').textContent=count;$('#bulkbar').style.display=count?'flex':'none'}
function addItem(id,qty){let p=products.find(x=>x.id===id);if(!p||priceStatus(p)!=='ok')return;cart[id]=(Number(cart[id])||0)+qty;saveCart();toast(`${qty} × ${p.title} added to cart`)}
function addDrafts(){let count=0;Object.entries(qtyDraft).forEach(([id,q])=>{let n=Math.floor(Number(q));if(n>0&&n<=9999&&priceStatus(products.find(p=>p.id===id)||{})==='ok'){cart[id]=(Number(cart[id])||0)+n;count++;}});qtyDraft={};saveCart();render();toast(count?`${count} products added to cart`:'Enter quantities first')}
function cartEntries(){return Object.entries(cart).map(([id,q])=>({p:products.find(p=>p.id===id),q:Number(q)})).filter(x=>x.p&&x.q>0)}
function renderCart(){let lines=cartEntries(),units=lines.reduce((a,x)=>a+x.q,0),total=lines.reduce((a,x)=>a+sellingPrice(x.p)*x.q,0);$('#cartCount').textContent=units;$('#bottomCartCount').textContent=units;$('#drawerCount').textContent=`(${units})`;$('#cartTotal').textContent=money(total);$('#cartLines').innerHTML=lines.length?lines.map(({p,q})=>`<div class="cart-line" data-cart-id="${p.id}"><div><b>${esc(p.title)}</b><small>${esc(p.vendor)} · ${money(sellingPrice(p))} each</small><small>${money(sellingPrice(p)*q)}</small></div><div class="cart-line-actions"><input type="number" min="1" max="9999" value="${q}" aria-label="Quantity"><button class="remove" data-remove="${p.id}">Remove</button></div></div>`).join(''):'<div class="empty"><h3>Your cart is empty</h3><p>Add products from the catalogue.</p></div>'}
function openCart(){renderCart();$('#overlay').hidden=false;$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false')}
function closeCart(){ $('#overlay').hidden=true;$('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true') }
function toast(msg){let t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1900)}
async function showDetail(id){
 let p=products.find(x=>x.id===id);if(!p)return;activeProduct=p;$('#detailContent').innerHTML='<p>Loading medicine information…</p>';$('#productDialog').showModal();
 try{
  let body=p.bodyHtml||'<p>Medicine information is not available for this product.</p>',status=priceStatus(p),price=status==='ok'?money(sellingPrice(p)):status==='zero'?'Price on request':'Price under review';
  $('#detailContent').innerHTML=`${p.image?`<div class="detail-image-wrap"><img class="detail-product-image" src="${esc(p.image)}" alt="${esc(p.title)}" loading="eager"></div>`:''}<p class="eyebrow">${esc(p.vendor)} · ${(p.categories||[]).map(esc).join(', ')}</p><h2 class="detail-title">${esc(p.title)}</h2><div class="detail-meta">Medicine information supplied in the product catalogue</div><div class="detail-price">${price}${mrpDisplay(p)}</div><div class="detail-body">${sanitizeBody(body)}</div><div class="detail-actions">${status==='ok'?`<input id="detailQty" type="number" min="1" max="9999" value="1"><button class="primary" id="detailAdd">Add to cart</button>`:'<span class="price-note">Please contact the distributor for price confirmation.</span>'}</div>`;
  $('#detailAdd')?.addEventListener('click',()=>{let n=Math.max(1,Math.min(9999,Math.floor(Number($('#detailQty').value)||1)));addItem(id,n);$('#productDialog').close()})
 }catch(e){$('#detailContent').innerHTML='<h2 class="detail-title">Medicine information</h2><p>Could not load medicine information.</p>'}
}
function sanitizeBody(raw){let doc=new DOMParser().parseFromString(String(raw||''),'text/html'),allowed=new Set(['P','BR','STRONG','B','EM','I','UL','OL','LI','H2','H3','H4','DIV','SPAN']);doc.querySelectorAll('script,style,iframe,object,embed,form,svg,math').forEach(n=>n.remove());doc.body.querySelectorAll('*').forEach(n=>{if(!allowed.has(n.tagName)){n.replaceWith(...n.childNodes);return}[...n.attributes].forEach(a=>n.removeAttribute(a.name))});return doc.body.innerHTML}
function makeOrderPdf(customer,lines){
 const {jsPDF}=window.jspdf||{};
 if(!jsPDF){window.print();return false}
 const doc=new jsPDF({unit:'mm',format:'a4'}),left=15,right=195;let y=18;
 const line=(text,x=left,sz=10,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(sz);doc.text(String(text),x,y);};
 doc.setFontSize(18);doc.setFont('helvetica','bold');doc.text(config.firm_name||'Medicine Store',left,y);y+=8;
 doc.setFontSize(9);doc.setFont('helvetica','normal');
 (config.address||'').split(/\n/).forEach(t=>{doc.text(t,left,y);y+=4});
 y+=3;doc.setFontSize(15);doc.setFont('helvetica','bold');doc.text('ORDER REQUEST',left,y);y+=8;
 doc.setFontSize(9);doc.setFont('helvetica','normal');
 [['Order date',new Date().toLocaleString('en-IN')],['Customer',customer.name],['Shop',customer.shop],['Customer mobile',customer.mobile],['Delivery address',customer.address],['Notes',customer.notes||'-']].forEach(([k,v])=>{
   const lines0=doc.splitTextToSize(String(v||'-'),right-left-30);doc.setFont('helvetica','bold');doc.text(k,left,y);doc.setFont('helvetica','normal');doc.text(lines0,left+30,y);y+=Math.max(5,lines0.length*4)+1;
 });
 y+=3;doc.setFont('helvetica','bold');doc.text('Product',left,y);doc.text('Qty',132,y);doc.text('Rate',150,y);doc.text('Amount',right,y,{align:'right'});y+=3;doc.line(left,y,right,y);y+=5;
 let total=0;
 lines.forEach(({p,q})=>{
   const rate=sellingPrice(p),amount=rate*q;total+=amount;
   const nameLines=doc.splitTextToSize(p.title,110);
   if(y+Math.max(7,nameLines.length*4)>280){doc.addPage();y=18}
   doc.setFont('helvetica','normal');doc.text(nameLines,left,y);doc.text(String(q),132,y);doc.text(money(rate),150,y);doc.text(money(amount),right,y,{align:'right'});y+=Math.max(7,nameLines.length*4);
 });
 y+=2;doc.line(left,y,right,y);y+=8;doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Order total: '+money(total),right,y,{align:'right'});
 y+=12;doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('This is an order request. Prices, stock and fulfilment are subject to confirmation.',left,y);
 const filename=(config.firm_name||'order').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()+'-order-'+Date.now()+'.pdf';
 doc.save(filename);return true;
}
function checkout(){
 let lines=cartEntries();if(!lines.length){toast('Your cart is empty');return}
 closeCart();let total=lines.reduce((a,x)=>a+sellingPrice(x.p)*x.q,0);
 $('#checkoutContent').innerHTML=`<p class="eyebrow">ORDER REQUEST</p><h2>Customer details</h2><p class="detail-meta">Your order will be prepared as a PDF. WhatsApp will open with the distributor's number; attach the downloaded PDF and press Send.</p><form id="orderForm" class="checkout-form"><label>Customer / chemist name<input name="name" maxlength="100" required></label><label>Shop name<input name="shop" maxlength="120" required></label><label>Mobile number<input name="mobile" inputmode="tel" maxlength="20" required></label><label class="wide">Delivery address<textarea name="address" rows="2" maxlength="1000" required></textarea></label><label class="wide">Order notes<textarea name="notes" rows="2" maxlength="1000"></textarea></label><div class="wide checkout-summary"><b>${lines.length} product lines · ${money(total)}</b><br>${lines.map(x=>`${esc(x.p.title)} × ${x.q}`).join('<br>')}</div><button class="primary wide" type="submit">Create PDF & open WhatsApp</button><p class="wide detail-meta" id="orderStatus" role="status" aria-live="polite"></p></form>`;
 $('#checkoutDialog').showModal();
 $('#orderForm').addEventListener('submit',e=>{
   e.preventDefault();const form=e.currentTarget,customer=Object.fromEntries(new FormData(form).entries()),status=$('#orderStatus');
   const number=String(config.whatsapp_number||'').replace(/\D/g,'');
   if(!number){status.textContent='Please configure CUSTOMER.whatsapp_number at the top of app.js.';return}
   const ok=makeOrderPdf(customer,lines);
   if(!ok){status.textContent='PDF library did not load. Use the browser print dialog to save the order as PDF, then open WhatsApp.';return}
   const message=`New order from ${customer.name} (${customer.shop}). The order PDF has been downloaded. Please find it attached.`;
   window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`,'_blank','noopener');
   status.textContent='PDF downloaded. In WhatsApp, attach the downloaded PDF and press Send.';
   cart={};saveCart();
 });
}
function bind(){let timer;$('#search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(render,100)});$('#clearSearch').onclick=()=>{$('#search').value='';render()};$('#emptyReset').onclick=()=>{$('#search').value='';$('#category').value='';$('#company').value='';render()};$('#categoryGrid').addEventListener('click',e=>{let card=e.target.closest('[data-category]');if(card){$('#category').value=card.dataset.category;render();$('#catalogueHead').scrollIntoView({behavior:'smooth',block:'start'})}});$('#categoryShowcase').addEventListener('click',e=>{
let heading=e.target.closest('[data-category-heading]');
if(heading){$('#category').value=heading.dataset.categoryHeading;render();$('#catalogueHead').scrollIntoView({behavior:'smooth',block:'start'});return}
let tile=e.target.closest('[data-detail]');if(tile)showDetail(tile.dataset.detail)
});$('#categoryPrev').onclick=()=>{if(categoryPage>0){categoryPage--;updateCategoryControls()}};$('#categoryNext').onclick=()=>{if(categoryPage<Math.ceil(categories().length/categoryPageSize)-1){categoryPage++;updateCategoryControls()}};$('#categoryPagination').addEventListener('click',e=>{let dot=e.target.closest('[data-page]');if(dot){categoryPage=Number(dot.dataset.page);updateCategoryControls()}});let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{let nextSize=categoryPageSizeForViewport();if(nextSize!==categoryPageSize){categoryPageSize=nextSize;categoryPage=0;renderCategories()}},120)});$('#listMode').onclick=()=>{mode='list';$('#listMode').classList.add('active');$('#gridMode').classList.remove('active');render()};$('#gridMode').onclick=()=>{mode='grid';$('#gridMode').classList.add('active');$('#listMode').classList.remove('active');render()};$('#products').addEventListener('input',e=>{if(e.target.matches('.qty-input')){let id=e.target.closest('[data-id]').dataset.id;qtyDraft[id]=e.target.value;updateBulk()}});$('#products').addEventListener('click',e=>{let d=e.target.closest('[data-detail]'),a=e.target.closest('[data-add]');if(d)showDetail(d.dataset.detail);if(a){let host=a.closest('[data-id]'),q=Number(host.querySelector('.qty-input')?.value)||1;addItem(a.dataset.add,Math.max(1,Math.min(9999,Math.floor(q))));if(host.querySelector('.qty-input'))host.querySelector('.qty-input').value='';qtyDraft[a.dataset.add]='';updateBulk()}});$('#bottomHome').onclick=()=>{$('#search').value='';$('#category').value='';$('#company').value='';render();window.scrollTo({top:0,behavior:'smooth'})};
$('#bottomCategory').onclick=()=>$('#categoryPickerDialog').showModal();
$('#bottomCompany').onclick=()=>$('#companyPickerDialog').showModal();
$('#categoryPickerDone').onclick=()=>{$('#categoryPickerDialog').close();render()};
$('#companyPickerDone').onclick=()=>{$('#companyPickerDialog').close();render()};
$('#categoryPickerClose').onclick=()=>$('#categoryPickerDialog').close();
$('#companyPickerClose').onclick=()=>$('#companyPickerDialog').close();
$('#category').addEventListener('change',()=>{render();$('#categoryPickerDialog').close()});
$('#company').addEventListener('change',()=>{render();$('#companyPickerDialog').close()});

$('#bottomReset').onclick=()=>{$('#search').value='';$('#category').value='';$('#company').value='';render()};
$('#bottomCart').onclick=openCart;
$('#addSelected').onclick=addDrafts;$('#cartOpen').onclick=openCart;$('#cartClose').onclick=closeCart;$('#overlay').onclick=closeCart;$('#checkout').onclick=checkout;$('#detailClose').onclick=()=>$('#productDialog').close();$('#checkoutClose').onclick=()=>$('#checkoutDialog').close();$('#cartLines').addEventListener('change',e=>{if(e.target.matches('input')){let id=e.target.closest('[data-cart-id]').dataset.cartId,n=Math.max(1,Math.min(9999,Math.floor(Number(e.target.value)||1)));cart[id]=n;saveCart()}});$('#cartLines').addEventListener('click',e=>{let b=e.target.closest('[data-remove]');if(b){delete cart[b.dataset.remove];saveCart()}});
$('#bottomInstall').onclick=handleInstallClick;
$('#installClose').onclick=()=>$('#installDialog').close();
$('#installDone').onclick=()=>$('#installDialog').close();
$('#reloadUpdatedSite').onclick=()=>window.location.reload();
$('#dismissUpdate').onclick=()=>$('#updateNotice').hidden=true;
}
async function start(){try{
 const response=await fetch('ishwarshopify.json');
 if(!response.ok)throw Error('Could not load ishwarshopify.json');
 products=await response.json();
 if(!Array.isArray(products)||!products.length)throw Error('No products found. Check ishwarshopify.json.');
 initConfig();fillSelect('#category',categories(),'All categories');fillSelect('#company',vendors(),'All companies');renderCategories();renderCategoryShowcase();bind();render();renderCart();
 }catch(e){$('#products').innerHTML=`<div class="empty panel"><h3>Catalogue could not be loaded</h3><p>${esc(e.message)}. Keep ishwarshopify.json beside index.html and use a website host or local web server.</p></div>`}}
function showInstallInstructions(kind){
 const box=$('#installInstructions');
 let html='';
 if(kind==='ios') html=`<p class="eyebrow">INSTALL WEBSITE</p><h2>Add to your iPhone</h2><ol><li>Tap the <b>Share</b> icon in Safari (square with an upward arrow).</li><li>Scroll down and choose <b>Add to Home Screen</b>.</li><li>Keep the suggested name and tap <b>Add</b>.</li></ol><p class="install-tip">Use Safari for this process. The website will then appear as an app icon on your home screen.</p>`;
 else if(kind==='android') html=`<p class="eyebrow">INSTALL WEBSITE</p><h2>Add to your home screen</h2><ol><li>Tap <b>Install</b> if your browser offers the installation prompt.</li><li>If no prompt appears, open the browser menu (⋮).</li><li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li></ol><p class="install-tip">The website opens in an app-like window. No Play Store download is needed.</p>`;
 else html=`<p class="eyebrow">INSTALL WEBSITE</p><h2>Add to your desktop</h2><ol><li>Look for the install icon in the address bar, or open the browser menu.</li><li>Choose <b>Install</b> or <b>Install this site as an app</b>.</li><li>Confirm the installation.</li></ol><p class="install-tip">A shortcut/app window will be added to your computer. Availability depends on your browser.</p>`;
 box.innerHTML=html;$('#installDialog').showModal();
}
async function handleInstallClick(){
 if(deferredInstallPrompt){
   deferredInstallPrompt.prompt();
   const choice=await deferredInstallPrompt.userChoice;
   deferredInstallPrompt=null;
   if(choice&&choice.outcome==='accepted'){$('#bottomInstall').querySelector('span:last-child').textContent='Installed';return}
 }
 const ua=navigator.userAgent||'';
 const ios=/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
 const android=/Android/i.test(ua);
 const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 if(standalone){showInstallInstructions('installed');$('#installInstructions').innerHTML='<p class="eyebrow">ALREADY INSTALLED</p><h2>You are using the app</h2><p>This website is already running from its home-screen or desktop app shortcut.</p>';return}
 showInstallInstructions(ios?'ios':android?'android':'desktop');
}
function setupPwa(){
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event});
 window.addEventListener('appinstalled',()=>{$('#bottomInstall').querySelector('span:last-child').textContent='Installed';deferredInstallPrompt=null});
 if(!('serviceWorker' in navigator))return;
 const hadController=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(hadController)$('#updateNotice').hidden=false;
 });
 navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('Offline support could not be enabled:',err));
}
setupPwa();
start();
})();
