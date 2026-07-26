const defaultAdminEmail = 'admin@cairo22.com';
const defaultAdminPassword = 'cairo22admin';
const STORAGE_KEYS = {
  orders: 'cairo22_orders',
  products: 'cairo22_products',
  loggedIn: 'cairo22_admin_logged_in'
};

const fallbackProducts = [
  { name: 'مكنة تنعيم VGR-', price: 1800, category: 'مكنة تنعيم', brand: 'VGR تنعيم', type: 'تدريج', img: 'https://i.ibb.co/kVnz4XFy/tn3.jpg' },
  { name: 'طقم أسود VGR STEPLESS PRO 4 IN 1', price: 11000, category: 'طقم مكنه', brand: 'VGR', img: 'https://i.ibb.co/8LCrs68n/3.jpg' },
  { name: 'مكنة حلاقة VGR-003', price: 1800, category: 'مكنة حلاقه', brand: 'VGR', type: 'تدريج', img: 'https://i.ibb.co/RpmKQ1Vr/vgr5.jpg' },
  { name: 'كريم شعر wax', price: 50, category: 'كريم', brand: 'wax', img: 'https://i.ibb.co/5bqtB2V/ce1.jpg' },
  { name: 'مقص حلاقة', price: 300, category: 'مقصات', brand: '###', img: 'https://i.ibb.co/7JHF3X7X/ms1.jpg' },
  { name: 'مكواة شعر', price: 2000, category: 'مكوة شعر', brand: '###', img: 'https://i.ibb.co/VYgFMVFP/mk1.jpg' }
];
const defaultProductImage = new URL('../../logo/logo.jpeg', window.location.href).toString();

function getStoredProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || '[]');
    return Array.isArray(stored) && stored.length ? stored : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function getStoredOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

const authMessage = document.getElementById('authMessage');
const ordersContainer = document.getElementById('orders');
const productForm = document.getElementById('productForm');
const modalProductForm = document.getElementById('modalProductForm');
const statusMessage = document.getElementById('statusMessage');
const totalOrdersEl = document.getElementById('totalOrders');
const newOrdersEl = document.getElementById('newOrders');
const pendingOrdersEl = document.getElementById('pendingOrders');
const revenueEl = document.getElementById('revenue');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const chartBox = document.getElementById('chartBox');
const themeToggle = document.getElementById('themeToggle');
const productModal = document.getElementById('productModal');
const openProductModal = document.getElementById('openProductModal');
const showProductsBtn = document.getElementById('showProductsBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalSubmitBtn = document.getElementById('modalSubmitBtn');
const productsList = document.getElementById('productsList');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const createAdminBtn = document.getElementById('createAdminBtn');
const adminBox = document.getElementById('adminBox');
const loginBox = document.getElementById('loginBox');
const sidebar = document.querySelector('.sidebar');
const dashboardElement = document.querySelector('.dashboard');
let currentOrders = [];
let editingProductIndex = null;

function showMessage(text, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = text;
  authMessage.style.color = isError ? '#c62828' : '#2e7d32';
}

function normalizeProductImage(img) {
  const value = (img || '').toString().trim();
  return value || defaultProductImage;
}

function toggleAdmin(isLoggedIn) {
  if (loginBox) loginBox.style.display = isLoggedIn ? 'none' : 'block';
  if (adminBox) adminBox.style.display = isLoggedIn ? 'block' : 'none';
}

function loginAdmin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const isValid = email === defaultAdminEmail && password === defaultAdminPassword;

  if (isValid) {
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    toggleAdmin(true);
    renderDashboard();
    showMessage('تم تسجيل الدخول بنجاح');
  } else {
    showMessage('بيانات الدخول غير صحيحة. استخدم admin@cairo22.com / cairo22admin', true);
  }
}

function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEYS.loggedIn);
  toggleAdmin(false);
  if (authMessage) {
    authMessage.textContent = 'تم تسجيل الخروج';
    authMessage.style.color = '#2e7d32';
  }
}

function renderStats() {
  const orders = currentOrders;
  const newCount = orders.filter(order => (order.status || 'جديد') === 'جديد').length;
  const pendingCount = orders.filter(order => ['جديد', 'قيد التنفيذ'].includes(order.status || 'جديد')).length;
  const doneCount = orders.filter(order => order.status === 'مكتمل').length;
  const revenue = orders.reduce((sum, order) => sum + (Number(order.finalTotal) || 0), 0);

  if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
  if (newOrdersEl) newOrdersEl.textContent = newCount;
  if (pendingOrdersEl) pendingOrdersEl.textContent = pendingCount;
  if (revenueEl) revenueEl.textContent = `${revenue.toLocaleString()} EGP`;
}

function renderChart() {
  if (!chartBox) return;
  const counts = { جديد: 0, 'قيد التنفيذ': 0, مكتمل: 0, ملغي: 0 };
  currentOrders.forEach(order => { counts[order.status || 'جديد'] = (counts[order.status || 'جديد'] || 0) + 1; });
  chartBox.innerHTML = Object.entries(counts).map(([label, value]) => `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;"><div class="bar" style="height:${Math.max(20, value * 42)}px;width:100%;"></div><span style="font-size:12px;color:var(--muted)">${label}</span></div>`).join('');
}

function renderOrders() {
  if (!ordersContainer) return;
  const query = (searchInput?.value || '').toLowerCase().trim();
  const selectedStatus = statusFilter?.value || 'all';
  let filtered = currentOrders.filter(order => {
    const matchesQuery = !query || [order.name, order.phone, order.orderRef].filter(Boolean).join(' ').toLowerCase().includes(query);
    const matchesStatus = selectedStatus === 'all' || (order.status || 'جديد') === selectedStatus;
    return matchesQuery && matchesStatus;
  });

  ordersContainer.innerHTML = '';
  if (!filtered.length) {
    ordersContainer.innerHTML = '<tr><td colspan="5" class="muted">لا توجد طلبات مطابقة.</td></tr>';
    return;
  }

  filtered.forEach((data, index) => {
    const status = data.status || 'جديد';
    const statusClass = status === 'مكتمل' ? 'done' : status === 'ملغي' ? 'cancel' : 'pending';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${data.name || '—'}<br><small class="muted">${data.phone || '—'}</small></td>
      <td>${data.orderRef || '—'}</td>
      <td><span class="pill ${statusClass}">${status}</span></td>
      <td><button class="admin-btn secondary" data-action="show-products" data-index="${index}" style="width:100%;">عرض المنتجات</button></td>
      <td>
        <select data-index="${index}">
          <option value="جديد" ${status === 'جديد' ? 'selected' : ''}>جديد</option>
          <option value="قيد التنفيذ" ${status === 'قيد التنفيذ' ? 'selected' : ''}>قيد التنفيذ</option>
          <option value="مكتمل" ${status === 'مكتمل' ? 'selected' : ''}>مكتمل</option>
          <option value="ملغي" ${status === 'ملغي' ? 'selected' : ''}>ملغي</option>
        </select>
        <button class="admin-btn success" data-action="save" data-index="${index}" style="margin-top:6px;">حفظ</button>
        <button class="admin-btn secondary" data-action="invoice" data-index="${index}" style="margin-top:6px;">فاتورة</button>
        <button class="admin-btn danger" data-action="delete" data-index="${index}" style="margin-top:6px;">حذف</button>
      </td>
    `;
    ordersContainer.appendChild(row);
  });
}

function renderProducts() {
  if (!productsList) return;
  const products = getStoredProducts();
  productsList.innerHTML = '';

  if (!products.length) {
    productsList.innerHTML = '<div class="product-item"><div class="product-meta"><strong>لا توجد منتجات حتى الآن</strong></div></div>';
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-item';
    card.innerHTML = `
      <img class="product-thumb" src="${normalizeProductImage(product.img)}" alt="${product.name || 'منتج'}" onerror="this.onerror=null;this.src='${defaultProductImage}';" />
      <div class="product-meta">
        <strong>${product.name || 'منتج بدون اسم'}</strong>
        <div class="muted">${Number(product.price || 0).toLocaleString()} EGP</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="admin-btn secondary" type="button" data-action="edit-product" data-index="${index}">تعديل</button>
        <button class="admin-btn danger" type="button" data-action="delete-product" data-index="${index}">حذف</button>
      </div>
    `;
    productsList.appendChild(card);
  });
}

function renderDashboard() {
  currentOrders = getStoredOrders();
  renderStats();
  renderChart();
  renderOrders();
  renderProducts();
}

function saveOrderStatus(index, status) {
  const orders = getStoredOrders();
  if (!orders[index]) return;
  orders[index].status = status;
  saveOrders(orders);
  currentOrders = orders;
  statusMessage.textContent = 'تم تحديث الحالة بنجاح';
  renderDashboard();
}

function deleteOrder(index) {
  if (!confirm('هل تريد حذف هذا الطلب؟')) return;
  const orders = getStoredOrders();
  orders.splice(index, 1);
  saveOrders(orders);
  currentOrders = orders;
  statusMessage.textContent = 'تم حذف الطلب';
  renderDashboard();
}

function buildPageUrl(pageName) {
  return new URL(`../../${pageName}`, window.location.href).toString();
}

function openInvoicePage(data) {
  const params = new URLSearchParams({
    orderRef: data.orderRef || '',
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    status: data.status || 'جديد',
    total: data.finalTotal || 0,
    items: (data.items || []).map(item => `${item.name} × ${item.qty}`).join(' | ')
  });
  window.open(`${buildPageUrl('invoice.html')}?${params.toString()}`, '_blank', 'noopener,noreferrer');
}

function openProductsPage() {
  window.open(new URL('products.html', window.location.href).toString(), '_blank', 'noopener,noreferrer');
}

function resetProductForm() {
  if (productForm) productForm.reset();
  if (modalProductForm) modalProductForm.reset();
  editingProductIndex = null;
  if (modalSubmitBtn) modalSubmitBtn.textContent = 'إضافة المنتج';
}

function openEditProductModal(index) {
  const products = getStoredProducts();
  const product = products[index];
  if (!product) return;

  editingProductIndex = index;
  document.getElementById('modalProductName').value = product.name || '';
  document.getElementById('modalProductPrice').value = product.price || '';
  document.getElementById('modalProductCategory').value = product.category || '';
  document.getElementById('modalProductBrand').value = product.brand || '';
  document.getElementById('modalProductType').value = product.type || '';
  document.getElementById('modalProductImg').value = product.img || '';
  document.getElementById('modalProductDescription').value = product.description || '';
  if (modalSubmitBtn) modalSubmitBtn.textContent = 'تعديل المنتج';
  openModal();
}

function addProduct(event) {
  event.preventDefault();
  const name = (document.getElementById('productName').value || document.getElementById('modalProductName').value).trim();
  const price = Number(document.getElementById('productPrice').value || document.getElementById('modalProductPrice').value);
  const category = (document.getElementById('productCategory').value || document.getElementById('modalProductCategory').value).trim();
  const brand = (document.getElementById('productBrand').value || document.getElementById('modalProductBrand').value).trim();
  const type = (document.getElementById('productType').value || document.getElementById('modalProductType').value).trim();
  const img = (document.getElementById('productImg').value || document.getElementById('modalProductImg').value).trim();
  const description = (document.getElementById('productDescription').value || document.getElementById('modalProductDescription').value).trim();
  const payload = {
    name,
    price,
    category,
    brand,
    type,
    img: normalizeProductImage(img),
    description,
    createdAt: new Date().toISOString()
  };

  if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0) {
    if (statusMessage) statusMessage.textContent = 'أدخل اسمًا وسعرًا صحيحين';
    return;
  }

  const products = getStoredProducts();
  if (editingProductIndex !== null && products[editingProductIndex]) {
    products[editingProductIndex] = { ...products[editingProductIndex], ...payload };
    if (statusMessage) statusMessage.textContent = 'تم تعديل المنتج بنجاح';
  } else {
    products.unshift(payload);
    if (statusMessage) statusMessage.textContent = 'تمت إضافة المنتج بنجاح';
  }

  saveProducts(products);
  window.dispatchEvent(new Event('productsUpdated'));
  resetProductForm();
  if (productModal) productModal.classList.remove('show');
  renderDashboard();
}

function deleteProduct(index) {
  if (!confirm('هل تريد حذف هذا المنتج؟')) return;
  const products = getStoredProducts();
  if (!products[index]) return;
  products.splice(index, 1);
  saveProducts(products);
  window.dispatchEvent(new Event('productsUpdated'));
  if (statusMessage) statusMessage.textContent = 'تم حذف المنتج بنجاح';
  renderDashboard();
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  if (themeToggle) themeToggle.textContent = isDark ? '☀️ الوضع الفاتح' : '🌙 الوضع الداكن';
}

function openModal() { if (productModal) productModal.classList.add('show'); }
function closeModal() { if (productModal) productModal.classList.remove('show'); resetProductForm(); }

if (localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true') {
  toggleAdmin(true);
  renderDashboard();
} else {
  toggleAdmin(false);
}

if (loginForm) loginForm.addEventListener('submit', loginAdmin);
if (createAdminBtn) createAdminBtn.addEventListener('click', () => {
  document.getElementById('email').value = defaultAdminEmail;
  document.getElementById('password').value = defaultAdminPassword;
  loginAdmin(new Event('submit'));
});
if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);
if (showProductsBtn) showProductsBtn.addEventListener('click', openProductsPage);
if (productForm) productForm.addEventListener('submit', addProduct);
if (modalProductForm) modalProductForm.addEventListener('submit', addProduct);
if (openProductModal) openProductModal.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (productModal) productModal.addEventListener('click', (event) => { if (event.target === productModal) closeModal(); });
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (searchInput) searchInput.addEventListener('input', renderOrders);
if (statusFilter) statusFilter.addEventListener('change', renderOrders);
if (productsList) productsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const index = Number(button.getAttribute('data-index'));
  const action = button.getAttribute('data-action');

  if (action === 'edit-product') {
    openEditProductModal(index);
  } else if (action === 'delete-product') {
    deleteProduct(index);
  }
});

ordersContainer?.addEventListener('click', (event) => {
  const target = event.target;
  if (!target.matches('button')) return;
  const index = target.getAttribute('data-index');
  const action = target.getAttribute('data-action');
  const order = currentOrders[index];
  if (!order) return;

  if (action === 'save') {
    const select = ordersContainer.querySelector(`select[data-index="${index}"]`);
    saveOrderStatus(index, select.value);
  } else if (action === 'delete') {
    deleteOrder(index);
  } else if (action === 'invoice') {
    openInvoicePage(order);
  } else if (action === 'show-products') {
    openProductsPage();
  }
});
