(() => {
  'use strict';
  const KEY_PRODUCTS = 'mohamedSport_products_v1';
  const KEY_ORDERS = 'mohamedSport_orders_v1';
  const KEY_SETTINGS = 'mohamedSport_settings_v1';
  const $ = selector => document.querySelector(selector);
  const makeId = () => globalThis.crypto?.randomUUID?.() || `p-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const read = (key, fallback) => { try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('ar-EG',{style:'currency',currency:'EGP',maximumFractionDigits:2}).format(Number(value)||0);
  const defaultSettings = {phone:'01100181646',whatsapp:'01100181646',email:'',facebook:''};
  function safeImage(value) {
    const text = String(value || '').trim();
    if (/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\r\n]+$/i.test(text)) return text;
    try { const parsed = new URL(text); return parsed.protocol === 'https:' ? parsed.href : ''; } catch { return ''; }
  }
  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
      if (!allowed.includes(file.type)) return reject(new Error('اختار صورة بصيغة JPG أو PNG أو WEBP أو GIF.'));
      if (file.size > 15 * 1024 * 1024) return reject(new Error('حجم الصورة كبير جدًا. اختار صورة أقل من 15 ميجابايت.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة. جرّب اختيار الصورة مرة أخرى.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('الصورة غير مدعومة أو تالفة.'));
        img.onload = () => {
          const resize = side => {
            const width = img.naturalWidth || img.width, height = img.naturalHeight || img.height;
            const ratio = Math.min(1, side / Math.max(width, height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(width * ratio));
            canvas.height = Math.max(1, Math.round(height * ratio));
            const context = canvas.getContext('2d');
            if (!context) throw new Error('المتصفح لم يتمكن من تجهيز الصورة.');
            context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height);
            context.drawImage(img,0,0,canvas.width,canvas.height);
            return canvas;
          };
          try {
            let canvas = resize(1000);
            let result = canvas.toDataURL('image/jpeg',0.78);
            let size = Math.ceil((result.length-result.indexOf(',')-1)*3/4);
            if(size>520*1024){canvas=resize(800);result=canvas.toDataURL('image/jpeg',0.68);size=Math.ceil((result.length-result.indexOf(',')-1)*3/4);}
            if(size>520*1024) result=canvas.toDataURL('image/jpeg',0.55);
            resolve(result);
          } catch(error) { reject(error); }
        };
        img.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }
  let adminPreviewObjectUrl = null;
  function setAdminImagePreview(src, isObjectUrl = false) {
    const wrap = $('#adminImagePreviewWrap'), image = $('#adminImagePreview');
    if (adminPreviewObjectUrl) { URL.revokeObjectURL(adminPreviewObjectUrl); adminPreviewObjectUrl = null; }
    if (!wrap || !image) return;
    if (!src) { image.removeAttribute('src'); wrap.hidden = true; return; }
    if (isObjectUrl) adminPreviewObjectUrl = src;
    image.src = src; wrap.hidden = false;
  }
  const defaults = [
    { id:'cup-gold-01', name:'كأس البطولة الذهبي', category:'كؤوس', price:650, oldPrice:780, emoji:'🏆', tag:'الأكثر طلبًا', image:'', description:'كأس بتصميم ذهبي أنيق مناسب لبطولات المدارس والأندية والفعاليات الرياضية.', featured:true, available:true },
    { id:'cup-silver-02', name:'كأس النخبة الفضي', category:'كؤوس', price:480, oldPrice:0, emoji:'🏆', tag:'اختيار مميز', image:'', description:'تصميم فضي أنيق لتكريم أصحاب المراكز الأولى والإنجازات الرياضية.', featured:true, available:true },
    { id:'medal-gold-03', name:'ميدالية بطل ذهبية', category:'ميداليات', price:55, oldPrice:65, emoji:'🥇', tag:'قيمة رائعة', image:'', description:'ميدالية ذهبية للاعبين والمشاركين في المسابقات والبطولات.', featured:true, available:true },
    { id:'shield-04', name:'درع التميز الرياضي', category:'دروع', price:390, oldPrice:0, emoji:'🏅', tag:'للتكريم', image:'', description:'درع تكريمي أنيق للمدربين والمنظمين وأصحاب الإنجازات المميزة.', featured:true, available:true },
    { id:'medal-set-05', name:'طقم ميداليات للمراكز الثلاثة', category:'ميداليات', price:145, oldPrice:175, emoji:'🎖️', tag:'طقم متكامل', image:'', description:'طقم ميداليات ذهبي وفضي وبرونزي لتكريم أصحاب المراكز الأول والثاني والثالث.', featured:false, available:true },
    { id:'accessory-06', name:'قاعدة عرض للكأس', category:'إكسسوارات', price:95, oldPrice:0, emoji:'✨', tag:'إضافة عملية', image:'', description:'قاعدة عرض تساعد على إظهار الكأس بشكل منظم بعد انتهاء البطولة.', featured:false, available:true }
  ];
  if (!Array.isArray(read(KEY_PRODUCTS, null))) write(KEY_PRODUCTS, defaults);
  if (!Array.isArray(read(KEY_ORDERS, []))) write(KEY_ORDERS, []);
  const storedSettings = read(KEY_SETTINGS, null);
  if (!storedSettings) write(KEY_SETTINGS, defaultSettings);
  else write(KEY_SETTINGS, {
    ...defaultSettings,
    ...storedSettings,
    phone: String(storedSettings.phone || defaultSettings.phone),
    whatsapp: String(storedSettings.whatsapp || defaultSettings.whatsapp)
  });
  let editingId = null;

  function toast(message) { const el=$('#adminToast'); if (!el) return; el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),3200); }
  function status(message) { $('#adminStatus').textContent = message; }
  function getProducts() { return read(KEY_PRODUCTS, defaults); }
  function resetForm() {
    const form=$('#productForm'); form.reset(); form.elements.id.value=''; form.elements.image.value='';
    form.elements.emoji.value='🏆'; form.elements.featured.checked=true; form.elements.available.checked=true;
    editingId=null; $('#editorTitle').textContent='إضافة منتج جديد'; $('#saveProductBtn').textContent='حفظ المنتج';
    $('#saveProductBtn').disabled=false; $('#cancelEdit').hidden=true; setAdminImagePreview(''); status('');
  }
  function renderProducts() {
    const data=getProducts(); $('#statProducts').textContent=data.length;
    $('#adminProductList').innerHTML = data.length ? data.map(p=>`<article class="admin-product-row"><div class="admin-product-symbol">${safeImage(p.image)?`<img src="${esc(safeImage(p.image))}" alt="">`:`<span>${esc(p.emoji||'🏆')}</span>`}</div><div class="admin-product-copy"><b>${esc(p.name)}</b><small>${esc(p.category)} · ${money(p.price)} ${p.available===false?'· غير متاح':''}</small></div><div class="admin-row-actions"><button class="btn btn-outline btn-small" data-edit="${esc(p.id)}">تعديل</button><button class="btn btn-danger btn-small" data-delete="${esc(p.id)}">حذف</button></div></article>`).join('') : '<div class="admin-empty">لا توجد منتجات. أضف أول منتج من النموذج.</div>';
  }
  function renderOrders() {
    const orders=read(KEY_ORDERS,[]); $('#statOrders').textContent=orders.length; $('#statSales').textContent=money(orders.reduce((sum,o)=>sum+Number(o.total||0),0));
    $('#adminOrderList').innerHTML=orders.length ? orders.map(o=>`<article class="admin-order-row"><div class="order-id"><b>${esc(o.id)}</b><small>${esc(new Date(o.createdAt).toLocaleString('ar-EG'))}</small></div><div class="order-customer"><b>${esc(o.customer?.name||'—')}</b><small>${esc(o.customer?.phone||'')} · ${esc(o.customer?.governorate||'')}</small></div><div class="order-items">${(o.items||[]).map(p=>`${esc(p.name)} × ${Number(p.quantity)||1}`).join('، ')}</div><div class="order-total"><b>${money(o.total)}</b><small>${esc(o.payment||'')}</small></div><span class="order-status">${esc(o.status||'طلب جديد')}</span></article>`).join('') : '<div class="admin-empty"><span>🧾</span><b>مفيش طلبات لسه</b><p>الطلبات التجريبية اللي تتعمل من واجهة المتجر هتظهر هنا على نفس المتصفح.</p></div>';
  }
  function loadSettings() { const s={...defaultSettings,...read(KEY_SETTINGS,{})}; const f=$('#settingsForm'); ['phone','whatsapp','email','facebook'].forEach(k=>{ if(f.elements[k]) f.elements[k].value=s[k]||''; }); }
  function downloadJson(filename, data) { const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url); }
  function renderAll() { renderProducts(); renderOrders(); loadSettings(); }

  document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    $('#adminProductImageFile')?.addEventListener('change', event => {
      const file=event.currentTarget.files?.[0];
      if(!file){setAdminImagePreview(safeImage($('#productForm')?.elements.image?.value||''));return;}
      const allowed=['image/jpeg','image/png','image/webp','image/gif'];
      if(!allowed.includes(file.type)||file.size>15*1024*1024){
        event.currentTarget.value='';
        status(!allowed.includes(file.type)?'اختار صورة بصيغة JPG أو PNG أو WEBP أو GIF.':'حجم الصورة كبير جدًا. اختار صورة أقل من 15 ميجابايت.');
        return;
      }
      setAdminImagePreview(URL.createObjectURL(file),true); status('');
    });
    $('#productForm').addEventListener('submit', async event => {
      event.preventDefault(); const f=event.currentTarget; const fd=new FormData(f);
      const name=String(fd.get('name')||'').trim(); const currentImage=String(fd.get('image')||'').trim();
      const imageFile=f.elements.imageFile?.files?.[0]; const price=Number(fd.get('price')); const oldPrice=Number(fd.get('oldPrice')||0);
      if (!name) { status('اكتب اسم المنتج.'); return; }
      if (!Number.isFinite(price)||price<0) { status('اكتب سعرًا صحيحًا.'); return; }
      let image=safeImage(currentImage);
      if (currentImage && !image) { status('الصورة الحالية غير صالحة. اختار صورة جديدة.'); return; }
      const saveButton=$('#saveProductBtn');
      if(imageFile){
        saveButton.disabled=true; status('جاري تجهيز الصورة وضغطها...');
        try { image=await compressImageFile(imageFile); }
        catch(error){ status(error.message||'تعذر تجهيز الصورة.'); saveButton.disabled=false; return; }
        saveButton.disabled=false;
      }
      const list=getProducts(); const product={ id:editingId || makeId(), name, category:String(fd.get('category')||'كؤوس'), price, oldPrice:oldPrice>price?oldPrice:0, tag:String(fd.get('tag')||'').trim(), emoji:String(fd.get('emoji')||'🏆').trim()||'🏆', image, description:String(fd.get('description')||'').trim(), featured:fd.get('featured')==='on', available:fd.get('available')==='on' };
      const index=list.findIndex(p=>p.id===editingId); if (index>=0) list[index]=product; else list.unshift(product);
      try { write(KEY_PRODUCTS,list); }
      catch(error){ console.error('Save product failed:',error); status('تعذر حفظ المنتج. مساحة تخزين المتصفح قد تكون ممتلئة؛ جرّب صورة أصغر.'); return; }
      renderProducts(); resetForm(); toast(index>=0?'تم تحديث المنتج بنجاح.':'تمت إضافة المنتج بنجاح.');
    });
    $('#cancelEdit').addEventListener('click', resetForm);
    $('#adminProductList').addEventListener('click', event => {
      const edit=event.target.closest('[data-edit]'); const del=event.target.closest('[data-delete]'); const list=getProducts();
      if (edit) { const p=list.find(item=>item.id===edit.dataset.edit); if(!p) return; editingId=p.id; const f=$('#productForm'); ['name','category','price','oldPrice','tag','emoji','image','description'].forEach(k=>{if(f.elements[k]) f.elements[k].value=p[k]??'';}); if(f.elements.imageFile) f.elements.imageFile.value=''; setAdminImagePreview(safeImage(p.image||'')); f.elements.id.value=p.id; f.elements.featured.checked=p.featured!==false; f.elements.available.checked=p.available!==false; $('#editorTitle').textContent='تعديل المنتج'; $('#saveProductBtn').textContent='حفظ التعديلات'; $('#cancelEdit').hidden=false; status('أنت تعدّل منتجًا موجودًا.'); window.scrollTo({top:0,behavior:'smooth'}); }
      if (del) { const p=list.find(item=>item.id===del.dataset.delete); if(!p) return; if(!confirm(`متأكد إنك عاوز تحذف «${p.name}»؟`)) return; write(KEY_PRODUCTS,list.filter(item=>item.id!==p.id)); renderProducts(); toast('تم حذف المنتج.'); if(editingId===p.id) resetForm(); }
    });
    $('#settingsForm').addEventListener('submit', event => { event.preventDefault(); const fd=new FormData(event.currentTarget); const settings={phone:String(fd.get('phone')||'').trim()||defaultSettings.phone,whatsapp:String(fd.get('whatsapp')||'').trim().replace(/\D/g,'')||defaultSettings.whatsapp,email:String(fd.get('email')||'').trim(),facebook:String(fd.get('facebook')||'').trim()}; write(KEY_SETTINGS,settings); $('#settingsStatus').textContent='تم حفظ بيانات التواصل.'; toast('تم حفظ بيانات التواصل.'); });
    $('#exportProducts').addEventListener('click',()=>downloadJson('mohamed-sport-products.json',getProducts()));
    $('#exportOrders').addEventListener('click',()=>downloadJson('mohamed-sport-orders.json',read(KEY_ORDERS,[])));
    $('#resetDemo').addEventListener('click',()=>{ if(!confirm('سيتم مسح المنتجات والطلبات والإعدادات المحلية وإرجاع المنتجات التجريبية. هل أنت متأكد؟')) return; write(KEY_PRODUCTS,defaults); write(KEY_ORDERS,[]); write(KEY_SETTINGS,{...defaultSettings}); resetForm(); renderAll(); toast('تمت إعادة ضبط النسخة التجريبية.'); });
    window.addEventListener('storage',event=>{if([KEY_PRODUCTS,KEY_ORDERS,KEY_SETTINGS].includes(event.key))renderAll();});
  });
})();
