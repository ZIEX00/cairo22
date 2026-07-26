import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const buyNowItem = JSON.parse(localStorage.getItem('buyNow') || 'null');
if (buyNowItem && (!cart.length || cart[0]?.name !== buyNowItem.name)) {
  cart = [buyNowItem];
  localStorage.setItem('cart', JSON.stringify(cart));
}
let discount = parseFloat(localStorage.getItem('discount')) || 0;

const orderItems = document.getElementById('orderItems');
const totals = document.getElementById('totals');
const status = document.getElementById('orderStatus');

let total = 0;

cart.forEach(item => {
  total += item.price * item.qty;
  orderItems.innerHTML += `<p>${item.name} × ${item.qty} = ${item.price * item.qty} EGP</p>`;
});

const autoDiscount = total > 500 ? total * 0.1 : 0;
const couponValue = total * discount;
const finalTotal = total - autoDiscount - couponValue;

totals.innerHTML = `
  الاجمالي: ${total} EGP <br>
  خصم: ${autoDiscount} EGP <br>
  كوبون: ${couponValue} EGP <br>
  <strong>النهائي: ${finalTotal} EGP</strong>
`;

window.submitOrder = function submitOrder() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const orderRef = document.getElementById('orderRef').value.trim().toUpperCase();

  if (!name || !phone || !address) {
    alert('من فضلك املي كل البيانات');
    return;
  }

  if (!cart.length) {
    alert('السلة فارغة');
    return;
  }

  status.textContent = 'جاري إرسال الطلب...';

  const order = {
    name,
    phone,
    email,
    address,
    orderRef: orderRef || `C22-${Date.now().toString().slice(-6)}`,
    items: cart,
    total,
    discount: couponValue,
    finalTotal,
    createdAt: new Date().toISOString(),
    status: 'جديد'
  };

  const orders = JSON.parse(localStorage.getItem('cairo22_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('cairo22_orders', JSON.stringify(orders));

  const ordersRef = ref(db, 'orders');
  const newOrderRef = push(ordersRef);
  set(newOrderRef, order)
    .then(() => {
      status.innerHTML = `تم إرسال الطلب بنجاح<br><strong>مرجع الطلب:</strong> ${order.orderRef}<br><span>يمكنك تتبع الطلب لاحقًا باستخدام رقم الهاتف أو المرجع.</span>`;
    })
    .catch(error => {
      console.error('Firebase save order failed:', error);
      status.innerHTML = `حدث خطأ أثناء إرسال الطلب، لكنه حفظ محليًا. حاول مرة أخرى لاحقًا.`;
    });

  const notification = `تم استلام طلبك بنجاح. مرجع الطلب: ${order.orderRef}. الحالة الحالية: جديد.`;
  if (phone) {
    alert(notification);
  }
  if (email) {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent('تم استلام طلبك')}&body=${encodeURIComponent(notification)}`;
  }

  localStorage.removeItem('cart');
  localStorage.removeItem('discount');
  localStorage.removeItem('buyNow');
  cart.length = 0;
};