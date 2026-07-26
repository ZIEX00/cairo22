(function () {
  const translations = {
    ar: {
      home: 'الرئيسية',
      products: 'المنتجات',
      contact: 'تواصل معنا',
      shopNow: 'تسوق الآن',
      contactUs: 'تواصل معنا',
      checkout: 'إتمام الطلب',
      addToCart: 'أضف إلى السلة',
      buyNow: 'اشتري الآن',
      viewProduct: 'عرض المنتج',
      cartTitle: 'السلة',
      checkoutTitle: 'إتمام الطلب',
      confirmOrder: 'تأكيد الطلب',
      adminPanel: 'لوحة التحكم',
      loginTitle: 'تسجيل الدخول',
      loginBtn: 'دخول',
      noProduct: 'لم يتم العثور على بيانات المنتج 😢',
      addToCartBtn: 'أضف للسلة',
      buyNowBtn: 'اشتري الان',
      searchPlaceholder: 'ابحث عن منتج...',
      minPrice: 'اقل سعر',
      maxPrice: 'اعلى سعر',
      filterPrice: 'فلتر السعر',
      orderName: 'الاسم',
      phone: 'رقم الموبايل',
      email: 'البريد الإلكتروني (اختياري)',
      address: 'العنوان',
      orderRef: 'مرجع الطلب (اختياري)',
      orderSummary: 'ملخص الطلب',
      backToSite: 'العودة للموقع',
      dashboardTitle: 'لوحة إدارة Cairo22',
      addProductTitle: 'إضافة منتج',
      saveProduct: 'حفظ المنتج',
      closeModal: 'إغلاق',
      addNewProduct: 'إضافة منتج جديد'
    },
    en: {
      home: 'Home',
      products: 'Products',
      contact: 'Contact',
      shopNow: 'Shop Now',
      contactUs: 'Contact Us',
      checkout: 'Checkout',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      viewProduct: 'View Product',
      cartTitle: 'Cart',
      checkoutTitle: 'Checkout',
      confirmOrder: 'Confirm Order',
      adminPanel: 'Admin Panel',
      loginTitle: 'Login',
      loginBtn: 'Login',
      noProduct: 'Product details were not found 😢',
      addToCartBtn: 'Add to Cart',
      buyNowBtn: 'Buy Now',
      searchPlaceholder: 'Search for a product...',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      filterPrice: 'Filter Price',
      orderName: 'Name',
      phone: 'Phone Number',
      email: 'Email (optional)',
      address: 'Address',
      orderRef: 'Order Reference (optional)',
      orderSummary: 'Order Summary',
      backToSite: 'Back to site',
      dashboardTitle: 'Cairo22 Admin Dashboard',
      addProductTitle: 'Add Product',
      saveProduct: 'Save Product',
      closeModal: 'Close',
      addNewProduct: 'Add New Product'
    }
  };

  function applyTheme(themeName) {
    document.body.classList.toggle('dark', themeName === 'dark');
    document.documentElement.dataset.theme = themeName;
  }

  function applyLanguage(langName) {
    document.documentElement.lang = langName;
    document.documentElement.dir = langName === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (translations[langName] && translations[langName][key]) {
        el.textContent = translations[langName][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (translations[langName] && translations[langName][key]) {
        el.placeholder = translations[langName][key];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (translations[langName] && translations[langName][key]) {
        el.title = translations[langName][key];
      }
    });
  }

  function init() {
    const savedTheme = localStorage.getItem('siteTheme') || 'light';
    const savedLang = localStorage.getItem('siteLang') || 'ar';
    applyTheme(savedTheme);
    applyLanguage(savedLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
