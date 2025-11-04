// التحكم في مظهر الهيدر عند السكرول
const header = document.querySelector('.site-header');
let lastScroll = 0;

const handleScroll = () => {
    const currentScroll = window.pageYOffset;
    
    // إضافة كلاس scrolled عندما نتجاوز ارتفاع معين
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
};

// تفعيل مراقبة السكرول
window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

// Nav toggle for small screens
document.addEventListener('DOMContentLoaded', function(){
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav-list');
    toggle && toggle.addEventListener('click', function(){
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('show');
    });

  // Simple scroll reveal for sections
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  },{threshold:0.12});

  document.querySelectorAll('section').forEach(sec=>observer.observe(sec));

  // Observe hero separately to add in-view quickly
  const hero = document.querySelector('.hero');
  if(hero) observer.observe(hero);

  // Language toggle with persistence
  const langToggle = document.getElementById('lang-toggle');
  function applyLang(lang){
    const enMode = lang === 'en';
    if(enMode){
      document.documentElement.classList.add('en-active');
      document.documentElement.lang = 'en';
      if(langToggle) langToggle.textContent = 'AR';
    } else {
      document.documentElement.classList.remove('en-active');
      document.documentElement.lang = 'ar';
      if(langToggle) langToggle.textContent = 'EN';
    }
    if(langToggle) langToggle.setAttribute('aria-pressed', String(enMode));
  }

  // initialize language from localStorage or default to ar
  const saved = localStorage.getItem('siteLang') || (document.documentElement.lang === 'en' ? 'en' : 'ar');
  applyLang(saved);

  if(langToggle){
    langToggle.addEventListener('click', function(){
      const next = document.documentElement.classList.contains('en-active') ? 'ar' : 'en';
      applyLang(next);
      localStorage.setItem('siteLang', next);
    });
  }

  // Optional: animate numeric stats if numeric
  const statEls = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        const text = el.textContent.trim();
        const num = parseInt(text.replace(/\D/g,''),10);
        if(!isNaN(num)){
          animateNumber(el, num, 1400);
        }
        obs.unobserve(el);
      }
    });
  },{threshold:0.4});
  statEls.forEach(el=>statObserver.observe(el));
});

function animateNumber(el, to, duration){
  const start = 0;
  const startTime = performance.now();
  function tick(now){
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const val = Math.floor(start + (to - start) * easeOutCubic(t));
    el.textContent = val + (el.textContent.includes('+')?'+':'');
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function easeOutCubic(t){return 1 - Math.pow(1 - t, 3)}

// Job application form submission (careers page)
document.addEventListener('DOMContentLoaded', () => {
  const applyForm = document.getElementById('applyForm');
  if (!applyForm) return;
  const msg = document.getElementById('applyMsg');

  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = 'جاري الإرسال...';
    const formData = new FormData(applyForm);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Network error');
      msg.textContent = 'تم إرسال طلبك بنجاح. شكراً لك!';
      applyForm.reset();
    } catch (err) {
      console.error(err);
      msg.textContent = 'حدث خطأ أثناء الإرسال. حاول لاحقاً.';
    }
  });
});
