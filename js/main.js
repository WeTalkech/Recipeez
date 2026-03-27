// =============================================================
// RECIPEEZ — Main JavaScript
// =============================================================

// ---- Sticky header shadow ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// Close nav on outside click
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// ---- Search panel toggle ----
const searchToggle = document.getElementById('searchToggle');
const searchPanel  = document.getElementById('searchPanel');
const searchClose  = document.getElementById('searchClose');
const searchInput  = document.getElementById('searchInput');

searchToggle.addEventListener('click', () => {
    searchPanel.classList.toggle('open');
    if (searchPanel.classList.contains('open')) {
        setTimeout(() => searchInput.focus(), 50);
    }
});

searchClose.addEventListener('click', () => {
    searchPanel.classList.remove('open');
});

document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        console.log('Searching for:', query);
        // TODO: wire up to real search
    }
});

// Close search on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchPanel.classList.remove('open');
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// ---- Recipe filter tabs ----
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.recipe-card').forEach(card => {
            if (filter === 'all' || card.dataset.tags?.includes(filter)) {
                card.style.display = '';
                requestAnimationFrame(() => card.style.opacity = '1');
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 200);
            }
        });
    });
});

// ---- Heart / save toggle ----
document.querySelectorAll('.btn-heart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const saved = btn.classList.toggle('saved');
        btn.textContent = saved ? '♥' : '♡';
        btn.style.color = saved ? '#e74c3c' : '';

        // Micro animation
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => btn.style.transform = '', 200);
    });
});

// ---- Newsletter form ----
document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const btn   = e.target.querySelector('button');
    if (!input.value) return;

    btn.textContent = 'Subscribed! 🎉';
    btn.disabled = true;
    input.value = '';
    input.placeholder = 'You\'re on the list!';

    setTimeout(() => {
        btn.textContent = 'Subscribe Free';
        btn.disabled = false;
        input.placeholder = 'your@email.com';
    }, 4000);
});

// ---- Smooth scroll for hero CTA ----
document.querySelector('a[href="#recipes"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('recipes');
    if (target) {
        const offset = 88; // header height + buffer
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
});

// ---- Lazy-load images (IntersectionObserver) ----
if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[data-src]');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                io.unobserve(img);
            }
        });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(img => io.observe(img));
}
