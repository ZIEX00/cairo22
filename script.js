const fallbackProducts = [
  { name: 'مكنة تنعيم VGR-', price: 1800, img: 'https://i.ibb.co/kVnz4XFy/tn3.jpg' },
  { name: 'طقم أسود VGR STEPLESS PRO 4 IN 1', price: 11000, img: 'https://i.ibb.co/8LCrs68n/3.jpg' },
  { name: 'مكنة حلاقة VGR-003', price: 1800, img: 'https://i.ibb.co/RpmKQ1Vr/vgr5.jpg' },
  { name: 'كريم شعر wax', price: 50, img: 'https://i.ibb.co/5bqtB2V/ce1.jpg' },
  { name: 'مقص حلاقة', price: 300, img: 'https://i.ibb.co/7JHF3X7X/ms1.jpg' },
  { name: 'مكواة شعر', price: 2000, img: 'https://i.ibb.co/VYgFMVFP/mk1.jpg' }
];

let products = fallbackProducts;

function refreshProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem('cairo22_products') || '[]');
    products = Array.isArray(stored) && stored.length ? stored : fallbackProducts;
  } catch {
    products = fallbackProducts;
  }
}

window.addEventListener('productsUpdated', refreshProducts);

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const list = document.getElementById('productList');
const cartCount = document.getElementById('count');
const cartItems = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const grandTotalEl = document.getElementById('grandTotal');
const sidebar = document.getElementById('cartSidebar');

function showMessage(msg) {
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function renderProducts() {
  if (!list) return;
  list.innerHTML = '';

  products.forEach((product, index) => {
    const safeImg = (product.img || '').toString().trim() || 'logo/logo.jpeg';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${safeImg}" alt="${product.name}" onerror="this.onerror=null;this.src='logo/logo.jpeg';" />
      <h3>${product.name}</h3>
      <p>${product.price} EGP</p>
      <button onclick="addToCart(${index})">أضف إلى السلة</button>
      <button onclick="viewProduct(${index})">عرض المنتج</button>
      <button onclick="buyNow(${index})">اشتري الآن</button>
    `;
    list.appendChild(card);
  });
}

function viewProduct(index) {
  const product = products[index];
  localStorage.setItem('productDetails', JSON.stringify(product));
  window.location.href = 'links/html/view.html';
}

function buyNow(index) {
  const product = products[index];
  if (!product) return;
  localStorage.setItem('buyNow', JSON.stringify(product));
  localStorage.setItem('cart', JSON.stringify([{ ...product, qty: 1 }]));
  window.location.href = 'links/html/checkout.html';
}

function toggleCart() {
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

function addToCart(index) {
  const product = products[index];
  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCart();
  saveCart();
  showMessage('تمت إضافة المنتج للسلة');
}

function updateCart() {
  if (cartCount) {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalCount;
  }

  if (!cartItems) return;

  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="color:#ccc;">السلة فارغة الآن.</p>';
    if (subtotalEl) subtotalEl.textContent = 'الإجمالي: 0 EGP';
    if (shippingEl) shippingEl.textContent = 'الشحن: مجاني';
    if (grandTotalEl) grandTotalEl.textContent = 'الإجمالي النهائي: 0 EGP';
    return;
  }

  let subtotal = 0;
  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div style="font-size:13px;color:#cfcfcf;">${item.price} × ${item.qty}</div>
      </div>
      <div class="cart-actions">
        <button onclick="decreaseQty(${index})">−</button>
        <button onclick="increaseQty(${index})">+</button>
        <button onclick="removeItem(${index})">×</button>
      </div>
    `;
    cartItems.appendChild(itemDiv);
  });

  const shipping = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = `الإجمالي: ${subtotal} EGP`;
  if (shippingEl) shippingEl.textContent = `الشحن: ${shipping === 0 ? 'مجاني' : `${shipping} EGP`}`;
  if (grandTotalEl) grandTotalEl.textContent = `الإجمالي النهائي: ${total} EGP`;
}

function increaseQty(index) {
  cart[index].qty += 1;
  updateCart();
  saveCart();
}

function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1);
  }
  updateCart();
  saveCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
  saveCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function goToCheckout() {
  if (cart.length === 0) {
    showMessage('السلة فارغة، أضف منتجات أولًا');
    return;
  }
  window.location.href = 'links/html/checkout.html';
}

function initReveal() {
  const faders = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  faders.forEach(fader => observer.observe(fader));
}

function typeEffect() {
  const target = document.getElementById('typing-text');
  if (!target) return;
  const text = 'اكتشف جمالك مع Cairo22';
  let index = 0;

  const tick = () => {
    target.textContent += text[index];
    index += 1;
    if (index < text.length) {
      setTimeout(tick, 80);
    }
  };

  tick();
}

window.addEventListener('load', () => {
  refreshProducts();
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
  document.body.classList.add('loaded');
  renderProducts();
  initReveal();
  typeEffect();
  updateCart();
});
