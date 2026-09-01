import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const deliveryFees = {
  standard: 50,
  express: 100,
  pickup: 0
};

const couponCatalog = {
  CAIRO22: 0.12,
  WELCOME10: 0.1,
  VIP15: 0.15,
  GOLD20: 0.2
};

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
const buyNowItem = JSON.parse(localStorage.getItem('buyNow') || 'null');
if (buyNowItem && (!cart.length || cart[0]?.name !== buyNowItem.name)) {
  cart = [{ ...buyNowItem, qty: buyNowItem.qty || 1 }];
  localStorage.setItem('cart', JSON.stringify(cart));
}

const orderItems = document.getElementById('orderItems');
const subtotalValue = document.getElementById('subtotalValue');
const shippingValue = document.getElementById('shippingValue');
const discountValue = document.getElementById('discountValue');
const finalTotalValue = document.getElementById('finalTotalValue');
const status = document.getElementById('orderStatus');
const submitOrderBtn = document.getElementById('submitOrderBtn');
const deliveryMethodEl = document.getElementById('deliveryMethod');
const paymentMethodEl = document.getElementById('paymentMethod');
const couponCodeEl = document.getElementById('couponCode');
const applyCouponBtn = document.getElementById('applyCouponBtn');
const couponMessageEl = document.getElementById('couponMessage');
const paymentRadios = document.querySelectorAll('input[name="paymentType"]');
const walletFields = document.getElementById('walletFields');

let activeCoupon = '';
let activeCouponPercent = 0;

function safeNumber(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function setPaymentMethod(value) {
  if (paymentMethodEl) paymentMethodEl.value = value;
  paymentRadios.forEach(radio => {
    const isSelected = radio.value === value;
    radio.checked = isSelected;
    radio.closest('.payment-option')?.classList.toggle('selected', isSelected);
  });

  if (walletFields) {
    const showWalletFields = value === 'instapay' || value === 'wallet';
    walletFields.classList.toggle('hidden', !showWalletFields);
  }
}

function applyCoupon(code) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) {
    activeCoupon = '';
    activeCouponPercent = 0;
    if (couponMessageEl) couponMessageEl.textContent = 'يرجى إدخال كود الخصم';
    couponMessageEl.style.color = '#a45a0d';
    renderSummary();
    return;
  }

  const percent = couponCatalog[normalized] || 0;
  if (!percent) {
    activeCoupon = '';
    activeCouponPercent = 0;
    if (couponMessageEl) {
      couponMessageEl.textContent = 'هذا الكود غير صالح';
      couponMessageEl.style.color = '#a52626';
    }
    renderSummary();
    return;
  }

  activeCoupon = normalized;
  activeCouponPercent = percent;
  if (couponMessageEl) {
    couponMessageEl.textContent = `تم تطبيق الكود ${normalized} بنجاح`;
    couponMessageEl.style.color = '#2e7d32';
  }
  renderSummary();
}

function renderSummary() {
  if (!orderItems) return;

  const subtotal = cart.reduce((sum, item) => {
    const qty = safeNumber(item.qty);
    const price = safeNumber(item.price);
    return sum + (price * qty);
  }, 0);

  const deliveryKey = deliveryMethodEl ? deliveryMethodEl.value : 'standard';
  const shipping = deliveryFees[deliveryKey] || 0;
  const baseDiscount = subtotal > 500 ? subtotal * 0.1 : 0;
  const couponDiscount = subtotal * activeCouponPercent;
  const discount = Math.min(baseDiscount + couponDiscount, subtotal + shipping);
  const finalTotal = Math.max(subtotal + shipping - discount, 0);

  orderItems.innerHTML = cart.map(item => {
    const qty = safeNumber(item.qty);
    const price = safeNumber(item.price);
    return `
      <div class="order-item">
        <div>
          <strong>${item.name}</strong>
          <small>الكمية: ${qty}</small>
        </div>
        <strong>${price * qty} EGP</strong>
      </div>
    `;
  }).join('') || '<p>السلة فارغة.</p>';

  if (subtotalValue) subtotalValue.textContent = `${subtotal} EGP`;
  if (shippingValue) shippingValue.textContent = `${shipping} EGP`;
  if (discountValue) discountValue.textContent = `${discount} EGP`;
  if (finalTotalValue) finalTotalValue.textContent = `${finalTotal} EGP`;
}

function submitOrder() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const city = document.getElementById('city').value.trim();
  const address = document.getElementById('address').value.trim();
  const notes = document.getElementById('notes').value.trim();
  const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'cash';
  const deliveryMethod = deliveryMethodEl ? deliveryMethodEl.value : 'standard';
  const orderRef = document.getElementById('orderRef').value.trim().toUpperCase();

  if (!name || !phone || !address || !city) {
    alert('من فضلك أكمل الاسم، الهاتف، المدينة، والعنوان.');
    return;
  }

  if (!cart.length) {
    alert('السلة فارغة، الرجاء إضافة منتجات أولًا.');
    return;
  }

  if (paymentMethod === 'instapay' || paymentMethod === 'wallet') {
    const paymentPhone = document.getElementById('paymentPhone').value.trim();
    const paymentReference = document.getElementById('paymentReference').value.trim();

    if (!paymentPhone || !paymentReference) {
      alert('يرجى إدخال رقم الهاتف أو المحفظة وتفاصيل الإيداع أو رقم العملية.');
      return;
    }
  }

  if (submitOrderBtn) {
    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = 'جاري إرسال الطلب...';
  }

  const subtotal = cart.reduce((sum, item) => sum + safeNumber(item.price) * safeNumber(item.qty), 0);
  const shipping = deliveryFees[deliveryMethod] || 0;
  const baseDiscount = subtotal > 500 ? subtotal * 0.1 : 0;
  const couponDiscount = subtotal * activeCouponPercent;
  const discount = Math.min(baseDiscount + couponDiscount, subtotal + shipping);
  const finalTotal = Math.max(subtotal + shipping - discount, 0);

  const paymentDetails = {
    method: paymentMethod,
    walletType: document.getElementById('walletType')?.value || null,
    phone: document.getElementById('paymentPhone')?.value || null,
    reference: document.getElementById('paymentReference')?.value || null
  };

  const orderId = `C22-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  const order = {
    id: orderId,
    name,
    phone,
    email,
    city,
    address,
    notes,
    paymentMethod,
    paymentDetails,
    deliveryMethod,
    couponCode: activeCoupon || null,
    orderRef: orderRef || `C22-${Date.now().toString().slice(-6)}`,
    items: cart.map(item => ({ ...item, qty: safeNumber(item.qty) })),
    subtotal,
    shipping,
    discount,
    finalTotal,
    createdAt: new Date().toISOString(),
    status: 'جديد'
  };

  const orders = JSON.parse(localStorage.getItem('cairo22_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('cairo22_orders', JSON.stringify(orders));
  localStorage.removeItem('cart');
  localStorage.removeItem('discount');
  localStorage.removeItem('buyNow');

  if (status) {
    status.textContent = 'تم إرسال الطلب بنجاح';
  }

  const trackingUrl = `../../tracking.html?orderRef=${encodeURIComponent(order.orderRef)}`;
  setTimeout(() => {
    window.location.href = trackingUrl;
  }, 600);
}

if (deliveryMethodEl) {
  deliveryMethodEl.addEventListener('change', renderSummary);
}

if (paymentMethodEl) {
  paymentMethodEl.addEventListener('change', (event) => {
    setPaymentMethod(event.target.value);
  });
}

paymentRadios.forEach(radio => {
  radio.addEventListener('change', (event) => {
    setPaymentMethod(event.target.value);
  });
});

if (applyCouponBtn) {
  applyCouponBtn.addEventListener('click', () => applyCoupon(couponCodeEl?.value));
}

if (submitOrderBtn) {
  submitOrderBtn.addEventListener('click', submitOrder);
}

if (couponCodeEl) {
  couponCodeEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyCoupon(couponCodeEl.value);
    }
  });
}

setPaymentMethod('cash');
renderSummary();
window.submitOrder = submitOrder;