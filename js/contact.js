
// نضبط أزرار التواصل
document.addEventListener("DOMContentLoaded", () => {
    // زر واتساب
    const whatsappBtn = document.querySelectorAll('.card .btn a')[0];
    whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const phoneNumber = '+201093310936'; // رقم واتساب
        const message = encodeURIComponent('مرحباً! أود التواصل معكم.');
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank'); // فتح واتساب في تاب جديد
    });
// Fade-in on scroll
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});
    // زر الهاتف
    const phoneBtn = document.querySelectorAll('.card .btn a')[1];
    phoneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const phoneNumber = '+201097282461';
        window.location.href = `tel:${phoneNumber}`; // فتح الاتصال على الموبايل
    });
});
