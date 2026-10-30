(() => {
  'use strict';
  const KEY_PRODUCTS = 'mohamedSport_products_v1';
  const KEY_CART = 'mohamedSport_cart_v1';
  const KEY_ORDERS = 'mohamedSport_orders_v1';
  const KEY_SETTINGS = 'mohamedSport_settings_v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const makeId = () => (globalThis.crypto?.randomUUID?.() || `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const defaults = [
    { id: 'cup-gold-01', name: 'كأس البطولة الذهبي', category: 'كؤوس', price: 650, oldPrice: 780, emoji: '🏆', tag: 'الأكثر طلبًا', image: '', description: 'كأس بتصميم ذهبي أنيق مناسب لبطولات المدارس والأندية والفعاليات الرياضية.', featured: true, available: true, stock: 15 },
    { id: 'cup-silver-02', name: 'كأس النخبة الفضي', category: 'كؤوس', price: 480, oldPrice: 0, emoji: '🏆', tag: 'اختيار مميز', image: '', description: 'تصميم فضي أنيق لتكريم أصحاب المراكز الأولى والإنجازات الرياضية.', featured: true, available: true, stock: 10 },
    { id: 'medal-gold-03', name: 'ميدالية بطل ذهبية', category: 'ميداليات', price: 55, oldPrice: 65, emoji: '🥇', tag: 'قيمة رائعة', image: '', description: 'ميدالية ذهبية للاعبين والمشاركين في المسابقات والبطولات.', featured: true, available: true, stock: 50 },
    { id: 'shield-04', name: 'درع التميز الرياضي', category: 'دروع', price: 390, oldPrice: 0, emoji: '🏅', tag: 'للتكريم', image: '', description: 'درع تكريمي أنيق للمدربين والمنظمين وأصحاب الإنجازات المميزة.', featured: true, available: true, stock: 8 },
    { id: 'medal-set-05', name: 'طقم ميداليات للمراكز الثلاثة', category: 'ميداليات', price: 145, oldPrice: 175, emoji: '🎖️', tag: 'طقم متكامل', image: '', description: 'طقم ميداليات ذهبي وفضي وبرونزي لتكريم أصحاب المراكز الأول والثاني والثالث.', featured: false, available: true, stock: 12 },
    { id: 'accessory-06', name: 'قاعدة عرض للكأس', category: 'إكسسوارات', price: 95, oldPrice: 0, emoji: '✨', tag: 'إضافة عملية', image: '', description: 'قاعدة عرض تساعد على إظهار الكأس بشكل منظم بعد انتهاء البطولة.', featured: false, available: true, stock: 20 }
  ];
  const read = (key, fallback) => { try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  function products() {
    let data = read(KEY_PRODUCTS, null);
    if (!Array.isArray(data)) { data = defaults; write(KEY_PRODUCTS, data); }
    return data;
  }
  function cart() { const data = read(KEY_CART, []); return Array.isArray(data) ? data : []; }
  function settings() {
    const stored = read(KEY_SETTINGS, {}) || {};
    return {
      phone: String(stored.phone || '01100181646'),
      whatsapp: String(stored.whatsapp || '01100181646'),
      email: String(stored.email || ''),
      facebook: String(stored.facebook || '')
    };
  }
  function esc(value = '') { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function money(value) { return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 }).format(Number(value) || 0); }
  function validImage(value) {
    const text = String(value || '').trim();
    if (/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\r\n]+$/i.test(text)) return text;
    try { const url = new URL(text); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
  }
  function normalizeWhatsApp(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = '20' + digits.slice(1);
    return digits;
  }
  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type)) return reject(new Error('اختار صورة بصيغة JPG أو PNG أو WEBP أو GIF.'));
      if (file.size > 15 * 1024 * 1024) return reject(new Error('حجم الصورة كبير جدًا. اختار صورة أقل من 15 ميجابايت.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة. جرّب اختيار الصورة مرة أخرى.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('الصورة غير مدعومة أو تالفة.'));
        img.onload = () => {
          let maxSide = 1000;
          const resize = (side) => {
            const ratio = Math.min(1, side / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * ratio));
            canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * ratio));
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('المتصفح لم يتمكن من تجهيز الصورة.');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return canvas;
          };
          try {
            let canvas = resize(maxSide);
            let result = canvas.toDataURL('image/jpeg', 0.78);
            let size = Math.ceil((result.length - result.indexOf(',') - 1) * 3 / 4);
            if (size > 520 * 1024) {
              canvas = resize(800);
              result = canvas.toDataURL('image/jpeg', 0.68);
              size = Math.ceil((result.length - result.indexOf(',') - 1) * 3 / 4);
            }
            if (size > 520 * 1024) result = canvas.toDataURL('image/jpeg', 0.55);
            resolve(result);
          } catch (error) { reject(error); }
        };
        img.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }
  let quickPreviewObjectUrl = null;
  function setQuickImagePreview(src, isObjectUrl = false) {
    const wrap = $('#quickImagePreviewWrap');
    const image = $('#quickImagePreview');
    if (quickPreviewObjectUrl) { URL.revokeObjectURL(quickPreviewObjectUrl); quickPreviewObjectUrl = null; }
    if (!wrap || !image) return;
    if (!src) { image.removeAttribute('src'); wrap.hidden = true; return; }
    if (isObjectUrl) quickPreviewObjectUrl = src;
    image.src = src;
    wrap.hidden = false;
  }
  function showToast(message) { const el = $('#toast'); if (!el) return; el.textContent = message; el.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => el.classList.remove('show'), 3000); }

  let activeCategory = 'الكل';
  let searchTerm = '';
  let editingQuickProductId = null;

  function productVisual(product, extraClass = '') {
    const image = validImage(product.image || '');
    return image
      ? `<div class="product-visual ${extraClass}"><img src="${esc(image)}" alt="${esc(product.name)}" loading="lazy" onerror="this.parentElement.classList.add('image-failed');this.remove()"><span class="visual-badge">${esc(product.tag || 'اختيار مميز')}</span></div>`
      : `<div class="product-visual ${extraClass}"><span class="visual-glow"></span><span class="product-emoji">${esc(product.emoji || '🏆')}</span><span class="visual-badge">${esc(product.tag || 'اختيار مميز')}</span><span class="visual-mark">MOHAMED SPORT</span></div>`;
  }
  function renderProducts() {
    const grid = $('#productGrid'); if (!grid) return;
    let items = products().filter(p => p.available !== false);
    if (activeCategory !== 'الكل') items = items.filter(p => p.category === activeCategory);
    if (searchTerm) items = items.filter(p => `${p.name} ${p.category} ${p.description || ''} ${p.tag || ''}`.toLocaleLowerCase('ar').includes(searchTerm.toLocaleLowerCase('ar')));
    const sort = $('#sortSelect')?.value || 'featured';
    if (sort === 'price-low') items.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-high') items.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'name') items.sort((a, b) => String(a.name).localeCompare(String(b.name), 'ar'));
    else items.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    $('#emptyProducts').hidden = items.length > 0;
    grid.innerHTML = items.map((p, index) => `<article class="product-card" style="--card-index:${index}">
      ${productVisual(p)}
      <div class="product-info"><div class="product-meta"><span>${esc(p.category || 'منتجات')}</span><span class="product-rating">✦ ترشيحنا</span></div>
      <h3>${esc(p.name)}</h3><p class="product-description">${esc(p.description || 'اختيار مميز لبطولتك القادمة.')}</p>
      <div class="product-price-row"><div><strong>${money(p.price)}</strong>${Number(p.oldPrice) > Number(p.price) ? `<del>${money(p.oldPrice)}</del>` : ''}</div><button class="add-cart" data-add="${esc(p.id)}" aria-label="إضافة ${esc(p.name)} إلى السلة">＋</button></div>
      <div class="product-management-actions" aria-label="إدارة المنتج">
        <button class="manage-product-edit" type="button" data-edit-product="${esc(p.id)}">✎ تعديل</button>
        <button class="manage-product-delete" type="button" data-delete-product="${esc(p.id)}">× حذف</button>
      </div></div>
    </article>`).join('');
    if (!items.length) grid.innerHTML = '';
  }

  function openQuickProductModal(product = null) {
    const modal = $('#productModal');
    const form = $('#quickProductForm');
    if (!modal || !form) return;

    form.reset();
    editingQuickProductId = product ? product.id : null;
    form.elements.id.value = product ? product.id : '';
    if (product) {
      for (const key of ['name', 'category', 'price', 'oldPrice', 'tag', 'emoji', 'image', 'description', 'stock']) {
        if (form.elements[key]) form.elements[key].value = product[key] ?? (key === 'emoji' ? '🏆' : key === 'stock' ? 10 : '');
      }
      setQuickImagePreview(validImage(product.image || ''));
    } else {
      if (form.elements.emoji) form.elements.emoji.value = '🏆';
      if (form.elements.stock) form.elements.stock.value = 10;
      if (form.elements.image) form.elements.image.value = '';
      setQuickImagePreview('');
    }
    if (form.elements.featured) form.elements.featured.checked = product ? product.featured !== false : true;
    if (form.elements.available) form.elements.available.checked = product ? product.available !== false : true;
    $('#productModalTitle').textContent = product ? 'تعديل المنتج' : 'إضافة منتج جديد';
    $('#quickProductSubmit').textContent = product ? 'حفظ التعديلات' : 'حفظ وإضافة المنتج';
    $('#quickProductStatus').textContent = '';
    modal.hidden = false;
    document.body.classList.add('modal-open');
    form.elements.name?.focus();
  }

  function closeQuickProductModal() {
    const modal = $('#productModal');
    const form = $('#quickProductForm');
    if (modal) modal.hidden = true;
    document.body.classList.remove('modal-open');
    editingQuickProductId = null;
    if (form) form.reset();
    setQuickImagePreview('');
    if ($('#productModalTitle')) $('#productModalTitle').textContent = 'إضافة منتج جديد';
    if ($('#quickProductSubmit')) $('#quickProductSubmit').textContent = 'حفظ وإضافة المنتج';
    if ($('#quickProductStatus')) $('#quickProductStatus').textContent = '';
  }

  async function saveQuickProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const status = $('#quickProductStatus');
    const name = String(fd.get('name') || '').trim();
    const category = String(fd.get('category') || 'كؤوس');
    const price = Number(fd.get('price'));
    const stock = Number(fd.get('stock') ?? 10);
    const oldPriceInput = String(fd.get('oldPrice') || '').trim();
    const oldPrice = oldPriceInput ? Number(oldPriceInput) : 0;
    let image = validImage(String(fd.get('image') || '').trim());
    const imageFile = form.elements.imageFile?.files?.[0];

    if (!name) { status.textContent = 'اكتب اسم المنتج.'; return; }
    if (!Number.isFinite(price) || price < 0) { status.textContent = 'اكتب سعرًا صحيحًا.'; return; }
    if (imageFile) {
      const submitButton = $('#quickProductSubmit');
      if (submitButton) submitButton.disabled = true;
      status.textContent = 'جاري تجهيز الصورة وضغطها...';
      try { image = await compressImageFile(imageFile); }
      catch (error) {
        status.textContent = error.message || 'تعذر تجهيز الصورة.';
        if (submitButton) submitButton.disabled = false;
        return;
      }
      if (submitButton) submitButton.disabled = false;
    }

    const list = products();
    const id = String(fd.get('id') || editingQuickProductId || '').trim();
    const item = {
      id: id || makeId(), name, category, price, stock,
      oldPrice: oldPrice > price ? oldPrice : 0,
      tag: String(fd.get('tag') || '').trim(),
      emoji: String(fd.get('emoji') || '🏆').trim() || '🏆',
      image, description: String(fd.get('description') || '').trim(),
      featured: fd.get('featured') === 'on',
      available: fd.get('available') === 'on'
    };
    const index = list.findIndex(p => p.id === id);
    if (index >= 0) list[index] = item;
    else list.unshift(item);

    try {
      write(KEY_PRODUCTS, list);
    } catch (error) {
      console.error('Save product error:', error);
      status.textContent = 'تعذر حفظ المنتج في المتصفح.';
      return;
    }

    renderProducts();
    closeQuickProductModal();
    showToast(index >= 0 ? 'تم تعديل المنتج بنجاح.' : 'تمت إضافة المنتج بنجاح.');
  }

  function setCategory(category) {
    activeCategory = category;
    $$('#categoryFilters [data-filter]').forEach(button => button.classList.toggle('active', button.dataset.filter === category));
    renderProducts();
    $('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function saveCart(next) { write(KEY_CART, next); renderCart(); }
  function cartDetails() {
    const all = products();
    return cart().map(item => { const p = all.find(product => product.id === item.id); return p ? { ...p, quantity: Math.max(1, Number(item.quantity) || 1) } : null; }).filter(Boolean);
  }
  function cartTotal() { return cartDetails().reduce((sum, p) => sum + Number(p.price) * p.quantity, 0); }
  function renderCart() {
    const items = cartDetails(); const count = items.reduce((n, p) => n + p.quantity, 0); const total = cartTotal();
    if ($('#cartCount')) $('#cartCount').textContent = count;
    if ($('#drawerCount')) $('#drawerCount').textContent = `(${count})`;
    if ($('#cartItems')) $('#cartItems').innerHTML = items.map(p => `<article class="cart-item"><div class="cart-item-art">${validImage(p.image) ? `<img src="${esc(validImage(p.image))}" alt="">` : `<span>${esc(p.emoji || '🏆')}</span>`}</div><div class="cart-item-content"><b>${esc(p.name)}</b><strong>${money(p.price)}</strong><div class="quantity-control"><button data-qty="${esc(p.id)}" data-change="-1" aria-label="تقليل الكمية">−</button><span>${p.quantity}</span><button data-qty="${esc(p.id)}" data-change="1" aria-label="زيادة الكمية">＋</button><button class="remove-item" data-remove="${esc(p.id)}">حذف</button></div></div></article>`).join('');
    $('#cartEmpty').hidden = items.length !== 0; $('#cartSummary').hidden = items.length === 0;
    if ($('#cartSubtotal')) $('#cartSubtotal').textContent = money(total);
    if ($('#cartTotal')) $('#cartTotal').textContent = money(total);
    if ($('#checkoutTotal')) $('#checkoutTotal').textContent = money(total);
  }
  function addToCart(id) {
    const p = products().find(item => item.id === id); if (!p || p.available === false) return;
    const items = cart(); const existing = items.find(item => item.id === id);
    if (existing) existing.quantity = Math.min(99, Number(existing.quantity || 1) + 1); else items.push({ id, quantity: 1 });
    saveCart(items); showToast(`تمت إضافة «${p.name}» إلى السلة`);
  }
  function openCart() { $('#cartOverlay').hidden = false; $('#cartDrawer').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); document.body.classList.add('drawer-open'); }
  function closeCart() { $('#cartOverlay').hidden = true; $('#cartDrawer').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); document.body.classList.remove('drawer-open'); }
  function updateContact() {
    const s = settings();
    const phone = String(s.phone || '').trim();
    const phoneTel = phone.replace(/[^\d+]/g, '');
    const waDisplay = String(s.whatsapp || '').trim();
    const wa = normalizeWhatsApp(waDisplay);
    const email = String(s.email || '').trim();

    if ($('#footerPhone')) $('#footerPhone').textContent = phone || 'أضف رقم الهاتف من الإدارة';
    if ($('#footerWhatsappNumber')) $('#footerWhatsappNumber').textContent = waDisplay || 'أضف رقم واتساب من الإدارة';
    if ($('#footerEmail')) $('#footerEmail').textContent = email || 'أضف البريد من الإدارة';

    const phoneLink = $('#footerPhoneLink');
    if (phoneLink) { phoneLink.href = phoneTel ? `tel:${phoneTel}` : '#contact'; phoneLink.style.opacity = phone ? '1' : '.7'; }
    const whatsappNumberLink = $('#footerWhatsappNumberLink');
    if (whatsappNumberLink) {
      whatsappNumberLink.href = wa ? `https://wa.me/${wa}` : '#contact';
      if (wa) { whatsappNumberLink.target = '_blank'; whatsappNumberLink.rel = 'noopener'; }
    }
    const emailLink = $('#footerEmailLink');
    if (emailLink) emailLink.href = email ? `mailto:${email}` : '#contact';

    const waLink = wa ? `https://wa.me/${wa}` : '#contact';
    ['footerWhatsapp', 'floatingWhatsapp', 'customContact', 'newsletterContact'].forEach(id => {
      const el = document.getElementById(id); if (!el) return;
      el.href = id === 'footerWhatsapp' || id === 'floatingWhatsapp' ? waLink : wa ? `${waLink}?text=${encodeURIComponent('مرحبًا، أريد الاستفسار عن منتجات محمد سبورت')}` : '#contact';
      if (wa) { el.target = '_blank'; el.rel = 'noopener'; }
    });
    const facebook = $('#footerFacebook');
    if (facebook) { const url = String(s.facebook || '').trim(); facebook.href = /^https:\/\//i.test(url) ? url : '#contact'; facebook.style.opacity = url ? '1' : '.55'; }
  }
  function openCheckout() {
    if (!cartDetails().length) { showToast('ضيف منتج للسلة الأول.'); return; }
    closeCart(); $('#checkoutTotal').textContent = money(cartTotal()); $('#checkoutModal').hidden = false; document.body.classList.add('modal-open');
  }
  function closeCheckout() { $('#checkoutModal').hidden = true; document.body.classList.remove('modal-open'); }
  function refreshStoredData() { renderProducts(); renderCart(); updateContact(); }

  document.addEventListener('DOMContentLoaded', () => {
    products(); renderProducts(); renderCart(); updateContact();
    $('#currentYear').textContent = new Date().getFullYear();
    $('#searchInput')?.addEventListener('input', e => { searchTerm = e.currentTarget.value.trim(); renderProducts(); if (searchTerm) { activeCategory = 'الكل'; $$('#categoryFilters [data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === 'الكل')); } });
    $('#categoryFilters')?.addEventListener('click', e => { const button = e.target.closest('[data-filter]'); if (button) setCategory(button.dataset.filter); });
    $$('.category-card').forEach(button => button.addEventListener('click', () => { const category = button.dataset.category; $('#searchInput').value = ''; searchTerm = ''; setCategory(category); }));
    $('#sortSelect')?.addEventListener('change', renderProducts);
    $('#showAllProducts')?.addEventListener('click', e => { e.preventDefault(); $('#searchInput').value = ''; searchTerm = ''; setCategory('الكل'); });
    $('#clearFilters')?.addEventListener('click', () => { $('#searchInput').value = ''; searchTerm = ''; setCategory('الكل'); });
    $('#openAddProduct')?.addEventListener('click', () => openQuickProductModal());
    $('#closeProductModal')?.addEventListener('click', closeQuickProductModal);
    $('#cancelQuickProduct')?.addEventListener('click', closeQuickProductModal);
    $('#productModal')?.addEventListener('click', e => { if (e.target === $('#productModal')) closeQuickProductModal(); });
    $('#quickProductForm')?.addEventListener('submit', saveQuickProduct);
    $('#quickProductImageFile')?.addEventListener('change', event => {
      const file = event.currentTarget.files?.[0];
      if (!file) { setQuickImagePreview(validImage($('#quickProductForm')?.elements.image?.value || '')); return; }
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type) || file.size > 15 * 1024 * 1024) {
        event.currentTarget.value = '';
        $('#quickProductStatus').textContent = !allowed.includes(file.type)
          ? 'اختار صورة بصيغة JPG أو PNG أو WEBP أو GIF.'
          : 'حجم الصورة كبير جدًا. اختار صورة أقل من 15 ميجابايت.';
        return;
      }
      setQuickImagePreview(URL.createObjectURL(file), true);
      $('#quickProductStatus').textContent = '';
    });
    $('#productGrid')?.addEventListener('click', e => {
      const edit = e.target.closest('[data-edit-product]');
      const del = e.target.closest('[data-delete-product]');
      const add = e.target.closest('[data-add]');
      if (edit) {
        const product = products().find(p => p.id === edit.dataset.editProduct);
        if (product) openQuickProductModal(product);
        return;
      }
      if (del) {
        const product = products().find(p => p.id === del.dataset.deleteProduct);
        if (!product || !confirm(`متأكد إنك عاوز تحذف «${product.name}»؟`)) return;
        write(KEY_PRODUCTS, products().filter(p => p.id !== product.id));
        write(KEY_CART, cart().filter(item => item.id !== product.id));
        renderProducts(); renderCart();
        if (editingQuickProductId === product.id) closeQuickProductModal();
        showToast('تم حذف المنتج.');
        return;
      }
      if (add) addToCart(add.dataset.add);
    });
    $('#openCart')?.addEventListener('click', openCart); $('#closeCart')?.addEventListener('click', closeCart); $('#cartOverlay')?.addEventListener('click', closeCart); $('#continueShopping')?.addEventListener('click', closeCart);
    $('#cartItems')?.addEventListener('click', e => {
      const remove = e.target.closest('[data-remove]'); const qty = e.target.closest('[data-qty]'); let items = cart();
      if (remove) { items = items.filter(i => i.id !== remove.dataset.remove); saveCart(items); return; }
      if (qty) { items = items.map(i => i.id === qty.dataset.qty ? { ...i, quantity: Math.max(1, Math.min(99, Number(i.quantity || 1) + Number(qty.dataset.change))) } : i); saveCart(items); }
    });
    $('#goCheckout')?.addEventListener('click', openCheckout); $('#closeCheckout')?.addEventListener('click', closeCheckout);
    $('#checkoutModal')?.addEventListener('click', e => { if (e.target === $('#checkoutModal')) closeCheckout(); });
    $('#paymentMethod')?.addEventListener('change', e => { $('#paymentExplainer').textContent = e.target.value === 'instapay' ? 'التحويل الإلكتروني يتم يدويًا بعد التواصل وتأكيد بيانات الدفع. لا تحوّل أي مبلغ قبل تأكيد تفاصيل الطلب.' : 'سيتم التواصل معك لتأكيد تفاصيل الطلب والشحن قبل التجهيز والدفع عند الاستلام.'; });

    // 📦 تعديل إرسال الطلب لخصم المخزن وتسجيل الطلب في تقارير المبيعات اليومية
    $('#checkoutForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const items = cartDetails();
      if (!items.length) { closeCheckout(); showToast('السلة فارغة.'); return; }

      const allProducts = read(KEY_PRODUCTS, []);
      for (const cartItem of items) {
        const pIdx = allProducts.findIndex(p => p.id === cartItem.id);
        if (pIdx >= 0) {
          const currentStock = Number(allProducts[pIdx].stock ?? 10);
          allProducts[pIdx].stock = Math.max(0, currentStock - cartItem.quantity);
        }
      }
      write(KEY_PRODUCTS, allProducts);

      const form = new FormData(e.currentTarget);
      const order = {
        id: `MS-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString(),
        customer: {
          name: String(form.get('name') || '').trim(),
          phone: String(form.get('phone') || '').trim(),
          address: String(form.get('address') || '').trim(),
          governorate: String(form.get('governorate') || '').trim(),
          notes: String(form.get('notes') || '').trim()
        },
        payment: form.get('payment') === 'instapay' ? 'تحويل إلكتروني / InstaPay يدويًا' : 'الدفع عند الاستلام',
        items: items.map(p => ({ id: p.id, name: p.name, price: Number(p.price), quantity: p.quantity })),
        total: cartTotal(),
        status: 'بانتظار تأكيد المتجر',
        demo: true
      };

      const orders = read(KEY_ORDERS, []);
      orders.unshift(order);
      write(KEY_ORDERS, orders);
      write(KEY_CART, []);

      e.currentTarget.reset();
      closeCheckout();
      renderCart();
      renderProducts();

      showToast(`تم تسجيل طلبك برقم ${order.id}.`);
      const phone = normalizeWhatsApp(settings().whatsapp);
      if (phone && confirm(`تم تسجيل طلبك ${order.id}. هل تريد فتح واتساب لإرسال تفاصيل الطلب؟`)) {
        const text = `طلب جديد من محمد سبورت%0Aرقم الطلب: ${order.id}%0Aالاسم: ${order.customer.name}%0Aالهاتف: ${order.customer.phone}%0Aالعنوان: ${order.customer.address}، ${order.customer.governorate}%0Aالمنتجات: ${order.items.map(p => `${p.name} × ${p.quantity} (${money(p.price * p.quantity)})`).join('؛ ')}%0Aالإجمالي: ${money(order.total)}`;
        window.open(`https://wa.me/${String(phone).replace(/\D/g, '')}?text=${text}`, '_blank', 'noopener');
      }
    });

    $('#menuToggle')?.addEventListener('click', () => $('#mainNav')?.classList.toggle('nav-open'));
    $$('#mainNav a').forEach(a => a.addEventListener('click', () => $('#mainNav')?.classList.remove('nav-open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeCheckout(); closeQuickProductModal(); $('#mainNav')?.classList.remove('nav-open'); } });
    window.addEventListener('storage', e => { if ([KEY_PRODUCTS, KEY_SETTINGS, KEY_CART].includes(e.key)) refreshStoredData(); });
  });
})();