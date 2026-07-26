const fallbackProducts = [
  { name: 'مكنة تنعيم VGR-', price: 1400, category: 'مكنة تنعيم', brand: 'VGR تنعيم', type: 'تدريج', img: 'https://i.ibb.co/LXRZX0JG/tn4.jpg' },
  { name: 'مكنة تنعيم VGR-350', price: 1200, category: 'مكنة تنعيم', brand: 'VGR تنعيم', type: 'زيرو', img: 'https://i.ibb.co/3YL6xYQs/tn1.jpg' },
  { name: 'مكنة حلاقة kemei', price: 850, category: 'مكنة حلاقه', brand: 'kemei', type: 'زيرو', img: 'https://i.ibb.co/k2WByJNR/keeme1.jpg' },
  { name: 'مكنة حلاقة kemei', price: 750, category: 'مكنة حلاقه', brand: 'kemei', type: 'تدريج', img: 'https://i.ibb.co/jvMw3zr4/keme2.jpg' },
  { name: 'مكنة حلاقة VGR-003', price: 1800, category: 'مكنة حلاقه', brand: 'VGR', type: 'تدريج', img: 'https://i.ibb.co/RpmKQ1Vr/vgr5.jpg' },
  { name: 'مكنة حلاقة VGR', price: 2600, category: 'مكنة حلاقه', brand: 'VGR', type: 'تدريج', img: 'https://i.ibb.co/39vQXk9s/vgr3.jpg' },
  { name: 'طقم أسود VGR STEPLESS PRO 4 IN 1', price: 11000, category: 'طقم مكنه', brand: 'VGR', img: 'https://i.ibb.co/8LCrs68n/3.jpg' },
  { name: 'طقم أسود VGR PRO 3IN1', price: 6500, category: 'طقم مكنه', brand: 'VGR', img: 'https://i.ibb.co/Cs7312fM/4.jpg' },
  { name: 'كريم شعر wax', price: 50, category: 'كريم', brand: 'wax', img: 'https://i.ibb.co/5bqtB2V/ce1.jpg' },
  { name: 'كريم فرد أمريكي للشعر', price: 450, category: 'كريم', brand: '###', img: 'https://i.ibb.co/1JsBVLv1/1.jpg' },
  { name: 'مقص حلاقة', price: 300, category: 'مقصات', brand: '###', img: 'https://i.ibb.co/7JHF3X7X/ms1.jpg' },
  { name: 'مكواة شعر', price: 2000, category: 'مكوة شعر', brand: '###', img: 'https://i.ibb.co/VYgFMVFP/mk1.jpg' }
];

let products = fallbackProducts;
const defaultProductImage = new URL('../../logo/logo.jpeg', window.location.href).toString();

function refreshProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem('cairo22_products') || '[]');
    products = Array.isArray(stored) && stored.length ? stored : fallbackProducts;
  } catch {
    products = fallbackProducts;
  }
}

window.addEventListener('productsUpdated', refreshProducts);

let currentCategory = 'all';
let currentBrand = 'all';
let currentType = 'all';
let searchValue = '';
let minPrice = 0;
let maxPrice = Infinity;
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const list = document.getElementById('productList');
const cartCount = document.getElementById('count');
const cartItems = document.getElementById('cartItems');
const totalEl = document.getElementById('total');
const sidebar = document.getElementById('cartSidebar');

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

function applyFilters() {
  let filtered = products;

  if (currentCategory !== 'all') filtered = filtered.filter(item => item.category === currentCategory);
  if (currentBrand !== 'all') filtered = filtered.filter(item => item.brand === currentBrand);
  if (currentType !== 'all') filtered = filtered.filter(item => item.type === currentType);
  if (searchValue) filtered = filtered.filter(item => (item.name || '').toLowerCase().includes(searchValue));

  filtered = filtered.filter(item => item.price >= minPrice && item.price <= maxPrice);
  displayProducts(filtered);
}

function filterCategory(cat) {
  currentCategory = cat;
  applyFilters();
}

function filterBrand(brand) {
  currentBrand = brand;
  applyFilters();
}

function filterType(type) {
  currentType = type;
  applyFilters();
}

function searchProduct() {
  searchValue = (document.getElementById('searchInput').value || '').toLowerCase();
  applyFilters();
}

function filterByPrice() {
  minPrice = Number(document.getElementById('minPrice').value) || 0;
  maxPrice = Number(document.getElementById('maxPrice').value) || Infinity;
  applyFilters();
}

function displayProducts(items) {
  if (!list) return;
  list.innerHTML = '';

  items.forEach((product) => {
    const productIndex = products.indexOf(product);
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${(product.img || '').toString().trim() || defaultProductImage}" alt="${product.name}" onerror="this.onerror=null;this.src='${defaultProductImage}';" />
      <h3>${product.name}</h3>
      <p>${product.price} EGP</p>
      <button onclick="addToCart(${productIndex})">أضف إلى السلة</button>
      <button onclick="goToDetails(${productIndex})">عرض المنتج</button>
      <button onclick="buyNow(${productIndex})">اشتري الآن</button>
    `;
    list.appendChild(div);
  });
}

function goToDetails(index) {
  const product = products[index];
  localStorage.setItem('productDetails', JSON.stringify(product));
  window.location.href = 'view.html';
}

function toggleCart() {
  if (sidebar) sidebar.classList.toggle('active');
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
}

function updateCart() {
  if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

  if (!cartItems) return;
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="color:#777;">السلة فارغة الآن.</p>';
    if (totalEl) totalEl.textContent = 'Total: 0 EGP';
    return;
  }

  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div style="font-size:13px;color:#7a7a7a;">${item.price} × ${item.qty}</div>
      </div>
      <div class="cart-actions">
        <button onclick="decreaseQty(${i})">−</button>
        <button onclick="increaseQty(${i})">+</button>
        <button onclick="removeItem(${i})">×</button>
      </div>
    `;
    cartItems.appendChild(row);
  });

  if (totalEl) totalEl.textContent = `Total: ${total} EGP`;
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

function buyNow(index) {
  const product = products[index];
  if (!product) return;
  localStorage.setItem('buyNow', JSON.stringify(product));
  localStorage.setItem('cart', JSON.stringify([{ ...product, qty: 1 }]));
  window.location.href = 'checkout.html';
}

function checkoutCart() {
  if (cart.length === 0) {
    alert('السلة فارغة! الرجاء إضافة منتجات أولًا.');
    return;
  }

  localStorage.setItem('cartCheckout', JSON.stringify(cart));
  window.location.href = 'checkout.html';
}

window.addEventListener('load', () => {
  refreshProducts();
  document.body.classList.add('loaded');
  initReveal();
  updateCart();
  applyFilters();
});