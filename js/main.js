// =============================================================
// RECIPEEZ — Main JavaScript
// =============================================================

// ---- Sticky header shadow ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ---- Nav auth state — swap Log In ↔ Profile ----
(async function () {
    if (!window.sb) return;
    const { data: { session } } = await sb.auth.getSession();
    const loginBtn = document.querySelector('.nav-actions a[href="login.html"]');
    if (!loginBtn) return;
    if (session) {
        loginBtn.href = 'profile.html';
        loginBtn.textContent = 'Profile';
    }
})();

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close nav on link click (mobile) - but not for dropdown triggers
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Don't close menu if clicking within a dropdown
        if (link.closest('.dropdown')) {
            return;
        }
        // Don't close menu if clicking the dropdown trigger
        if (link.closest('.has-dropdown')) {
            e.preventDefault();
            return;
        }
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

// ---- Mobile dropdown toggle ----
const categoriesLink = document.querySelector('.has-dropdown > a');
if (categoriesLink) {
    categoriesLink.addEventListener('click', (e) => {
        // Only prevent default on mobile (when nav-toggle is visible)
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const dropdown = document.querySelector('.has-dropdown .dropdown');
            if (dropdown) {
                dropdown.classList.toggle('mobile-open');
            }
        }
    });
}

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

// Close search / nav / gate modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchPanel.classList.remove('open');
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
        document.getElementById('gateModal')?.classList.remove('open');
    }
});

// ---- Recipe filter tabs ----
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.recipe-card, .blog-card').forEach(card => {
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

// ---- Recipe sort ----
(function () {
    const recipeSort = document.getElementById('recipeSort');
    if (!recipeSort) return;
    const grid = document.querySelector('.recipes-grid');
    if (!grid) return;

    // Store original order once on page load
    Array.from(grid.querySelectorAll('.recipe-card')).forEach((c, i) => c.dataset.index = i);

    recipeSort.addEventListener('change', () => {
        const cards = Array.from(grid.querySelectorAll('.recipe-card'));
        cards.sort((a, b) => {
            if (recipeSort.value === 'rating') {
                return parseFloat(b.dataset.rating || 0) - parseFloat(a.dataset.rating || 0);
            }
            if (recipeSort.value === 'time') {
                return parseInt(a.dataset.time || 0) - parseInt(b.dataset.time || 0);
            }
            return parseInt(a.dataset.index) - parseInt(b.dataset.index);
        });
        cards.forEach(card => grid.appendChild(card));
    });
})()

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

// ---- Photo upload preview ----
const photoInput = document.getElementById('recipe-photo');
if (photoInput) {
    const uploadArea    = document.getElementById('photoUploadArea');
    const placeholder   = uploadArea.querySelector('.upload-placeholder');
    const preview       = document.getElementById('photoPreview');
    const previewImg    = document.getElementById('photoPreviewImg');
    const fileName      = document.getElementById('photoFileName');
    const removeBtn     = document.getElementById('removePhoto');
    const removeBtnWrap = document.getElementById('removePhotoWrap');

    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('Photo must be under 10 MB. Please choose a smaller file.');
            photoInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src       = e.target.result;
            fileName.textContent = file.name;
            placeholder.hidden   = true;
            preview.hidden       = false;
            removeBtnWrap.hidden = false;
            uploadArea.classList.add('has-photo');
        };
        reader.readAsDataURL(file);
    });

    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        photoInput.value       = '';
        previewImg.src         = '';
        fileName.textContent   = '';
        placeholder.hidden     = false;
        preview.hidden         = true;
        removeBtnWrap.hidden   = true;
        uploadArea.classList.remove('has-photo');
    });
}

// ---- Login gate — 3 free recipe views per 24 h, then prompt to subscribe ----
(async function () {
    const lockedWrapper = document.querySelector('.recipe-locked-wrapper');
    if (!lockedWrapper) return; // not a recipe page

    let isLoggedIn = false;
    if (window.sb) {
        const { data: { session } } = await sb.auth.getSession();
        isLoggedIn = !!session;
    } else {
        isLoggedIn = !!localStorage.getItem('recipeez_user');
    }
    if (isLoggedIn) return; // logged-in users see everything

    const FREE_LIMIT = 3;
    const COUNT_KEY  = 'recipeez_free_views';
    const START_KEY  = 'recipeez_window_start';
    const WINDOW_MS  = 24 * 60 * 60 * 1000; // 24 hours

    // Reset counter if 24 h window has elapsed
    const windowStart = parseInt(localStorage.getItem(START_KEY) || '0', 10);
    if (windowStart && Date.now() - windowStart >= WINDOW_MS) {
        localStorage.removeItem(COUNT_KEY);
        localStorage.removeItem(START_KEY);
    }

    let views = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);

    if (views >= FREE_LIMIT) {
        // Limit already reached — lock content and show gate
        lockedWrapper.classList.add('is-locked');
        setTimeout(() => {
            document.getElementById('gateModal')?.classList.add('open');
        }, 900);
    } else {
        // Within free limit — count this view and allow full access
        if (views === 0) {
            localStorage.setItem(START_KEY, Date.now()); // start 24 h window
        }
        localStorage.setItem(COUNT_KEY, views + 1);
    }

    // Close modal on X button — content lock stays, modal dismisses
    document.getElementById('gateModalClose')?.addEventListener('click', () => {
        document.getElementById('gateModal').classList.remove('open');
    });

    // Close modal on backdrop click
    document.getElementById('gateModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.classList.remove('open');
        }
    });
})();

// ---- Login form — Supabase auth ----
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return;

    const btn = document.querySelector('#loginForm .auth-submit');
    btn.textContent = 'Logging in…';
    btn.disabled = true;

    const form = document.getElementById('loginForm');
    let err = form.querySelector('.auth-error');
    const showErr = (msg) => {
        if (!err) {
            err = document.createElement('p');
            err.className = 'auth-error';
            err.style.cssText = 'color:#e74c3c;font-size:.875rem;margin-top:-.5rem;margin-bottom:.5rem;';
            form.querySelector('.auth-submit').before(err);
        }
        err.textContent = msg;
        btn.textContent = 'Log In';
        btn.disabled = false;
    };

    if (!window.sb) return showErr('Auth service unavailable. Please refresh and try again.');

    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
        showErr(error.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : error.message);
    } else {
        window.location.href = 'index.html';
    }
});

// ---- Register form — Supabase auth ----
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('reg-first-name').value.trim();
    const lastName  = document.getElementById('reg-last-name').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const username  = document.getElementById('reg-username').value.trim();
    const password  = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    const terms     = document.querySelector('#registerForm [name="terms"]');

    const form = document.getElementById('registerForm');
    let err = form.querySelector('.auth-error');
    const showErr = (msg) => {
        if (!err) {
            err = document.createElement('p');
            err.className = 'auth-error';
            err.style.cssText = 'color:#e74c3c;font-size:.875rem;margin-top:-.5rem;margin-bottom:.5rem;';
            form.querySelector('.auth-submit').before(err);
        }
        err.textContent = msg;
    };

    if (!firstName)              return showErr('Please enter your first name.');
    if (!username)               return showErr('Please choose a username.');
    if (password.length < 8)     return showErr('Password must be at least 8 characters.');
    if (password !== password2)  return showErr('Passwords do not match.');
    if (terms && !terms.checked) return showErr('Please accept the Terms of Use to continue.');

    if (!window.sb) return showErr('Auth service unavailable. Please refresh and try again.');

    const btn = form.querySelector('.auth-submit');
    btn.textContent = 'Creating account…';
    btn.disabled = true;

    const { error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, username } }
    });

    if (error) {
        btn.textContent = 'Create Account';
        btn.disabled = false;
        showErr(error.message);
    } else {
        btn.textContent = 'Account created!';
        const ok = document.createElement('p');
        ok.style.cssText = 'color:#27ae60;font-size:.875rem;margin-top:.5rem;text-align:center;';
        ok.textContent = 'Check your email to confirm your account, then log in.';
        btn.after(ok);
    }
});

// ---- Contact form ----
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Message sent!';
    btn.disabled = true;
    e.target.reset();
    setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
    }, 4000);
});

// ---- Submit recipe — Add / Remove ingredient rows ----
const ingredientsList = document.getElementById('ingredientsList');
if (ingredientsList) {
    document.getElementById('addIngredient').addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `<input type="text" class="form-group" style="padding:13px 16px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:inherit;font-size:.93rem;outline:none;transition:border-color .25s ease;" placeholder="e.g. 1 cup sugar"><button type="button" class="btn-remove" aria-label="Remove">×</button>`;
        ingredientsList.appendChild(row);
    });

    ingredientsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const rows = ingredientsList.querySelectorAll('.ingredient-row');
            if (rows.length > 1) e.target.closest('.ingredient-row').remove();
        }
    });
}

// ---- Submit recipe — Add / Remove instruction steps ----
const instructionsList = document.getElementById('instructionsList');
if (instructionsList) {
    const updateStepNumbers = () => {
        instructionsList.querySelectorAll('.step-number').forEach((el, i) => {
            el.textContent = i + 1;
        });
    };

    document.getElementById('addStep').addEventListener('click', () => {
        const stepNum = instructionsList.querySelectorAll('.instruction-row').length + 1;
        const row = document.createElement('div');
        row.className = 'instruction-row';
        row.style.cssText = 'align-items:flex-start;gap:14px;margin-bottom:12px;';
        row.innerHTML = `<span class="step-number" style="margin-top:0;flex-shrink:0;">${stepNum}</span><textarea class="form-group" style="flex:1;padding:13px 16px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:inherit;font-size:.93rem;outline:none;min-height:90px;resize:vertical;transition:border-color .25s ease;" placeholder="Describe this step…"></textarea><button type="button" class="btn-remove" style="margin-top:0;" aria-label="Remove">×</button>`;
        instructionsList.appendChild(row);
    });

    instructionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const rows = instructionsList.querySelectorAll('.instruction-row');
            if (rows.length > 1) {
                e.target.closest('.instruction-row').remove();
                updateStepNumbers();
            }
        }
    });
}

// ---- Submit recipe form ----
(function () {
    if (!document.querySelector('.submit-form-wrap')) return;

    async function checkAuth() {
        let loggedIn = false;
        if (window.sb) {
            const { data: { session } } = await sb.auth.getSession();
            loggedIn = !!session;
        } else {
            loggedIn = !!localStorage.getItem('recipeez_user');
        }
        if (!loggedIn) { window.location.href = 'login.html'; return; }

        document.querySelector('.submit-form-wrap').closest('section').querySelector('[type="submit"]')
            ?.addEventListener('click', function (e) {
                const title = document.getElementById('recipe-title')?.value.trim();
                if (!title) return;
                e.preventDefault();
                this.textContent = 'Recipe submitted!';
                this.disabled = true;
                setTimeout(() => {
                    this.textContent = 'Submit Your Recipe →';
                    this.disabled = false;
                }, 4000);
            });
    }

    checkAuth();
})();

// ---- Chef hat rating display ----
(function () {
    const HAT = "assets/Chef's%20hat.png";

    function hatRow(rating) {
        let s = '<span class="hat-rating">';
        for (let i = 1; i <= 5; i++) {
            const cls = i <= Math.floor(rating) ? 'filled'
                      : (i === Math.ceil(rating) && rating % 1 >= 0.25) ? 'half'
                      : 'empty';
            s += `<img src="${HAT}" class="hat ${cls}" alt="">`;
        }
        return s + '</span>';
    }

    // Full 5-hat display for card ratings
    document.querySelectorAll('.card-rating').forEach(el => {
        const m = el.textContent.match(/([\d.]+)\s*\((\d+)\)/);
        if (!m) return;
        const rating = parseFloat(m[1]);
        el.innerHTML = `${hatRow(rating)} ${rating.toFixed(1)} <em>(${m[2]})</em>`;
    });

    // Single hat for compact spots (sidebar minis + recipe banner meta strip)
    const singleHat = `<img src="${HAT}" class="hat filled" style="height:0.9em;vertical-align:-0.05em;" alt="">`;
    document.querySelectorAll('.sidebar-mini-meta').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/★/g, singleHat);
    });
    document.querySelectorAll('.recipe-meta-item').forEach(el => {
        if (el.textContent.includes('★')) {
            el.innerHTML = el.innerHTML.replace(/★/g, singleHat);
        }
    });
})();

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
