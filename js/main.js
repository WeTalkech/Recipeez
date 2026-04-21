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
const navEl     = document.querySelector('.nav');

function openNav() {
    navLinks.classList.add('open');
    navToggle.classList.add('open');
    document.body.style.overflow = 'hidden';
    navToggle.setAttribute('aria-label', 'Close menu');
    // Move navLinks to body so it escapes the header's stacking context
    document.body.appendChild(navLinks);
}

function closeNav() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-label', 'Open menu');
    // Move navLinks back into the nav for desktop layout
    const navActions = document.querySelector('.nav-actions');
    navEl.insertBefore(navLinks, navActions);
}

navToggle.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeNav() : openNav();
});

// Close nav on link click (mobile) - but not for dropdown triggers
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.closest('.dropdown')) return;
        if (link.closest('.has-dropdown')) { e.preventDefault(); return; }
        closeNav();
    });
});

// Close nav on outside click
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)) {
        closeNav();
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
        if (navLinks.classList.contains('open')) closeNav();
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

// ---- Resize image to fixed frame (cover crop) via Canvas ----
function resizeImageToBlob(file, targetW, targetH) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = targetW;
            canvas.height = targetH;
            const ctx   = canvas.getContext('2d');
            const scale = Math.max(targetW / img.width, targetH / img.height);
            const sw    = targetW  / scale;
            const sh    = targetH  / scale;
            const sx    = (img.width  - sw) / 2;
            const sy    = (img.height - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.88);
        };
        img.src = URL.createObjectURL(file);
    });
}

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

    window.recipePhotoBlob = null;

    photoInput.addEventListener('change', async () => {
        const file = photoInput.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('Photo must be under 10 MB. Please choose a smaller file.');
            photoInput.value = '';
            return;
        }

        window.recipePhotoBlob = await resizeImageToBlob(file, 1200, 800);
        const dataUrl = URL.createObjectURL(window.recipePhotoBlob);
        previewImg.src       = dataUrl;
        fileName.textContent = `${file.name} (resized to 1200×800)`;
        placeholder.hidden   = true;
        preview.hidden       = false;
        removeBtnWrap.hidden = false;
        uploadArea.classList.add('has-photo');
    });

    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        photoInput.value        = '';
        previewImg.src          = '';
        fileName.textContent    = '';
        placeholder.hidden      = false;
        preview.hidden          = true;
        removeBtnWrap.hidden    = true;
        uploadArea.classList.remove('has-photo');
        window.recipePhotoBlob  = null;
    });
}

// ---- Login gate — 3 free recipe views per 24 h, then prompt to subscribe ----
// DISABLED: all users have full access for now — re-enable when ready
/*
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
*/

// ---- Show confirmation nudge when arriving from registration ----
(function () {
    if (!document.getElementById('loginForm')) return;
    if (new URLSearchParams(window.location.search).get('registered') !== '1') return;
    const notice = document.createElement('p');
    notice.style.cssText = 'background:#f0fdf4;border:1px solid #86efac;color:#166534;font-size:.9rem;padding:12px 16px;border-radius:8px;margin-bottom:16px;text-align:center;';
    notice.textContent = '✅ Account created! Check your email to confirm, then log in below.';
    document.getElementById('loginForm').prepend(notice);
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
        options: {
            data: { first_name: firstName, last_name: lastName, username },
            emailRedirectTo: window.location.origin + '/welcome.html'
        }
    });

    if (error) {
        btn.textContent = 'Create Account';
        btn.disabled = false;
        showErr(error.message);
    } else {
        btn.textContent = 'Account created! Redirecting…';
        setTimeout(() => { window.location.href = 'login.html?registered=1'; }, 1500);
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

// ---- Submit recipe — Ingredient groups ----
const ingredientGroups = document.getElementById('ingredientGroups');
if (ingredientGroups) {
    function makeIngredientRow(placeholder) {
        placeholder = placeholder || 'e.g. 1 cup sugar';
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `<input type="text" class="form-group" style="padding:13px 16px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:inherit;font-size:.93rem;outline:none;transition:border-color .25s ease;" placeholder="${placeholder}"><button type="button" class="btn-remove" aria-label="Remove">×</button>`;
        return row;
    }

    function makeIngredientGroup() {
        const group = document.createElement('div');
        group.className = 'ingredient-group';
        group.innerHTML = `
            <div class="ingredient-group-header">
                <input type="text" class="ingredient-group-name" placeholder="Group label (optional, e.g. Topping)">
                <button type="button" class="btn-remove-group" aria-label="Remove group">Remove Group</button>
            </div>
            <div class="ingredient-group-rows"></div>
            <button type="button" class="btn-add-row btn-add-in-group">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Ingredient
            </button>`;
        group.querySelector('.ingredient-group-rows').appendChild(makeIngredientRow());
        return group;
    }

    function refreshRemoveGroupButtons() {
        const groups = ingredientGroups.querySelectorAll('.ingredient-group');
        groups.forEach(g => {
            g.querySelector('.btn-remove-group').style.display = groups.length > 1 ? '' : 'none';
        });
    }

    document.getElementById('addIngredientGroup').addEventListener('click', () => {
        ingredientGroups.appendChild(makeIngredientGroup());
        refreshRemoveGroupButtons();
    });

    ingredientGroups.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-in-group') || e.target.closest('.btn-add-in-group')) {
            const group = e.target.closest('.ingredient-group');
            group.querySelector('.ingredient-group-rows').appendChild(makeIngredientRow());
        }
        if (e.target.classList.contains('btn-remove')) {
            const groupRows = e.target.closest('.ingredient-group-rows');
            if (groupRows.querySelectorAll('.ingredient-row').length > 1) {
                e.target.closest('.ingredient-row').remove();
            }
        }
        if (e.target.classList.contains('btn-remove-group')) {
            if (ingredientGroups.querySelectorAll('.ingredient-group').length > 1) {
                e.target.closest('.ingredient-group').remove();
                refreshRemoveGroupButtons();
            }
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

// ---- Submit recipe form — save to Supabase ----
(function () {
    if (!document.querySelector('.submit-form-wrap')) return;

    async function checkAuth() {
        let session = null;
        if (window.sb) {
            const { data } = await sb.auth.getSession();
            session = data.session;
        }
        if (!session) { window.location.href = 'login.html'; return; }

        document.getElementById('submitSection').style.visibility = '';

        const submitBtn = document.querySelector('.submit-form-wrap').closest('section').querySelector('[type="submit"]');
        if (!submitBtn) return;

        submitBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const title       = document.getElementById('recipe-title')?.value.trim();
            const category    = document.getElementById('recipe-category')?.value;
            const description = document.getElementById('recipe-description')?.value.trim();

            if (!title)       { alert('Please enter a recipe title.'); return; }
            if (!category)    { alert('Please select a category.'); return; }
            if (!description) { alert('Please add a description.'); return; }

            const rawGroups = Array.from(document.querySelectorAll('#ingredientGroups .ingredient-group')).map(g => ({
                group: g.querySelector('.ingredient-group-name').value.trim(),
                items: Array.from(g.querySelectorAll('.ingredient-group-rows .ingredient-row input')).map(i => i.value.trim()).filter(Boolean)
            })).filter(g => g.items.length > 0);
            const ingredients = (rawGroups.length === 1 && !rawGroups[0].group)
                ? rawGroups[0].items
                : rawGroups;
            const instructions = Array.from(document.querySelectorAll('#instructionsList .instruction-row textarea'))
                                      .map(t => t.value.trim()).filter(Boolean);

            this.textContent = 'Submitting…';
            this.disabled = true;

            // Upload photo if provided (use resized blob if available)
            let photoUrl = null;
            const photoBlob = window.recipePhotoBlob;
            const photoFile = document.getElementById('recipe-photo')?.files[0];
            const uploadData = photoBlob || photoFile;
            if (uploadData) {
                const path = `${session.user.id}/${Date.now()}.jpg`;
                const { error: upErr } = await sb.storage.from('recipe-photos').upload(path, uploadData, { contentType: 'image/jpeg' });
                if (!upErr) {
                    const { data: urlData } = sb.storage.from('recipe-photos').getPublicUrl(path);
                    photoUrl = urlData.publicUrl;
                }
            }

            const { error } = await sb.from('recipes').insert({
                user_id:     session.user.id,
                title,
                category,
                cuisine:     document.getElementById('recipe-cuisine')?.value.trim()    || null,
                difficulty:  document.getElementById('recipe-difficulty')?.value        || null,
                servings:    parseInt(document.getElementById('recipe-servings')?.value) || null,
                prep_time:   parseInt(document.getElementById('recipe-prep')?.value)     || null,
                cook_time:   parseInt(document.getElementById('recipe-cook')?.value)     || null,
                description,
                ingredients,
                instructions,
                photo_url:   photoUrl,
                status:      'pending'
            });

            if (error) {
                this.textContent = 'Submit Your Recipe →';
                this.disabled = false;
                alert('Submission failed: ' + error.message);
            } else {
                document.querySelector('.submit-form-wrap').innerHTML = `
                    <div style="text-align:center;padding:60px 20px;">
                        <div style="font-size:3rem;margin-bottom:16px;">🎉</div>
                        <h2 style="font-family:'Playfair Display',serif;margin-bottom:12px;">Recipe Submitted!</h2>
                        <p style="color:var(--text-muted);max-width:400px;margin:0 auto 28px;">
                            Your recipe is under review. We'll publish it within 3 business days.
                        </p>
                        <a href="index.html" class="btn btn-amber">Back to Home</a>
                    </div>`;
            }
        });
    }

    checkAuth();
})();

// ---- Load recipes from Supabase ----
(async function () {
    const grid = document.querySelector('.recipes-grid');
    if (!grid || !window.sb) return;

    const { data: recipes, error } = await sb
        .from('recipes')
        .select('id, title, category, description, photo_url, prep_time, cook_time, difficulty, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(12);

    if (error || !recipes?.length) {
        grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:60px 0;">No recipes yet — be the first to <a href="submit-recipe.html" style="color:var(--primary);">submit one!</a></p>';
        return;
    }

    grid.innerHTML = recipes.map(r => {
        const totalTime = (r.prep_time || 0) + (r.cook_time || 0);
        const img = r.photo_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
        const desc = r.description ? (r.description.length > 90 ? r.description.slice(0, 90) + '…' : r.description) : '';
        return `
            <a href="recipe-single.html?id=${r.id}" class="recipe-card">
                <div class="card-img-wrap">
                    <img src="${img}" alt="${r.title}" loading="lazy">
                    <button class="btn-heart" aria-label="Save recipe">♡</button>
                </div>
                <div class="card-body">
                    <div class="card-tags">
                        <span class="tag">${r.category || 'Recipe'}</span>
                        ${r.difficulty ? `<span class="tag tag-${r.difficulty.toLowerCase()}">${r.difficulty}</span>` : ''}
                    </div>
                    <h3 class="card-title">${r.title}</h3>
                    <p class="card-desc">${desc}</p>
                    <div class="card-footer">
                        ${totalTime ? `<span class="card-time"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${totalTime} min</span>` : ''}
                    </div>
                </div>
            </a>`;
    }).join('');

    // Re-attach heart listeners on dynamically added cards
    grid.querySelectorAll('.btn-heart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const saved = btn.classList.toggle('saved');
            btn.textContent = saved ? '♥' : '♡';
            btn.style.color = saved ? '#e74c3c' : '';
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => btn.style.transform = '', 200);
        });
    });
})();

// ---- Recipe single page — load from Supabase ----
(async function () {
    if (!document.querySelector('.recipe-banner')) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id || !window.sb) return;

    const { data: r, error } = await sb
        .from('recipes')
        .select('*, profiles(username, first_name)')
        .eq('id', id)
        .eq('status', 'published')
        .single();

    if (error || !r) return;

    // Page title & breadcrumb
    document.title = `${r.title} — Recipeez`;
    const crumbs = document.querySelectorAll('.recipe-banner-content .breadcrumb span');
    if (crumbs.length) crumbs[crumbs.length - 1].textContent = r.title;

    // Banner image
    if (r.photo_url) {
        const bannerImg = document.querySelector('.recipe-banner > img');
        if (bannerImg) { bannerImg.src = r.photo_url; bannerImg.alt = r.title; }
    }

    // Tags
    const tagRow = document.querySelector('.tag-row');
    if (tagRow) tagRow.innerHTML = `
        <span class="tag" style="background:rgba(255,255,255,0.15);color:#fff;">${r.category || ''}</span>
        ${r.difficulty ? `<span class="tag tag-${r.difficulty.toLowerCase()}">${r.difficulty}</span>` : ''}`;

    // Title
    const bannerTitle = document.querySelector('.recipe-banner-title');
    if (bannerTitle) bannerTitle.textContent = r.title;

    // Meta strip
    const metaItems = document.querySelectorAll('.recipe-meta-item span');
    if (metaItems[0]) metaItems[0].innerHTML = `Prep: <strong>${r.prep_time ? r.prep_time + ' min' : '—'}</strong>`;
    if (metaItems[1]) metaItems[1].innerHTML = `Cook: <strong>${r.cook_time ? r.cook_time + ' min' : '—'}</strong>`;
    if (metaItems[2]) metaItems[2].innerHTML = `Serves: <strong>${r.servings || '—'}</strong>`;

    // Stats card
    const statVals = document.querySelectorAll('.recipe-stat-value');
    if (statVals[0]) statVals[0].textContent = r.prep_time ? `${r.prep_time} min` : '—';
    if (statVals[1]) statVals[1].textContent = r.cook_time ? `${r.cook_time} min` : '—';
    if (statVals[2]) statVals[2].textContent = r.servings || '—';
    if (statVals[3]) statVals[3].textContent = r.difficulty || '—';

    // Description
    const desc = document.querySelector('.recipe-description');
    if (desc) desc.textContent = r.description;

    // Ingredients — supports flat array (legacy) or grouped [{group, items}] format
    const ingList = document.querySelector('.ingredients-list');
    if (ingList && r.ingredients?.length) {
        if (typeof r.ingredients[0] === 'object' && r.ingredients[0] !== null) {
            ingList.innerHTML = r.ingredients.map(g =>
                (g.group ? `<div class="ingredient-group-title">${g.group}</div>` : '') +
                g.items.map(ing => `<div class="ingredient-item"><div class="ingredient-check"></div> ${ing}</div>`).join('')
            ).join('');
        } else {
            ingList.innerHTML = r.ingredients.map(ing =>
                `<div class="ingredient-item"><div class="ingredient-check"></div> ${ing}</div>`
            ).join('');
        }
    }

    // Instructions
    const insList = document.querySelector('.instructions-list');
    if (insList && r.instructions?.length) {
        insList.innerHTML = r.instructions.map((step, i) =>
            `<div class="instruction-step">
                <div class="step-number">${i + 1}</div>
                <div class="step-content"><p>${step}</p></div>
            </div>`
        ).join('');
    }

    // Author
    const authorName = document.querySelector('.author-name');
    const authorAvatar = document.getElementById('authorAvatar');
    if (authorName) {
        const username = r.profiles?.username || r.profiles?.first_name || 'Anonymous';
        authorName.textContent = `@${username}`;
        if (authorAvatar) authorAvatar.textContent = username.charAt(0).toUpperCase();
    }
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

// ---- Hero / About stats — load real counts from Supabase ----
(async function () {
    const elRecipes = document.getElementById('statRecipes');
    const elCooks   = document.getElementById('statCooks');
    if ((!elRecipes && !elCooks) || !window.sb) return;

    const [recipesRes, cooksRes] = await Promise.all([
        sb.from('recipes').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        sb.from('profiles').select('*', { count: 'exact', head: true })
    ]);

    const recipeCount = recipesRes.count ?? 0;
    const cookCount   = cooksRes.count ?? 0;

    function fmt(n) {
        if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'k';
        return n.toString();
    }

    if (elRecipes) elRecipes.textContent = recipeCount > 0 ? fmt(recipeCount) + '+' : '0';
    if (elCooks)   elCooks.textContent   = cookCount   > 0 ? fmt(cookCount)   + '+' : '0';
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
