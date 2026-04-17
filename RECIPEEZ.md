# Recipeez — Project Overview

## What It Is

Recipeez is a recipe-sharing website where users can browse, submit, and discover recipes. It is a static site — no server-side framework, no build step — just HTML, CSS, and vanilla JavaScript deployed via Vercel.

Live URL: **recipeez.co.za** (also accessible at recipeez-chi.vercel.app)

---

## Pages

| File | Purpose |
|---|---|
| [index.html](index.html) | Homepage — hero, featured recipes grid, newsletter signup |
| [recipes.html](recipes.html) | Full recipe listing with filter/sort |
| [recipe-single.html](recipe-single.html) | Single recipe detail page (loaded dynamically via `?id=` URL param) |
| [submit-recipe.html](submit-recipe.html) | Authenticated form to submit a new recipe |
| [login.html](login.html) | Email + password login |
| [register.html](register.html) | New account registration |
| [profile.html](profile.html) | Logged-in user profile page |
| [about.html](about.html) | About page |
| [blog.html](blog.html) | Blog listing |
| [contact.html](contact.html) | Contact form |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Hosting | Vercel (auto-deploy from GitHub `main` branch) |
| DNS | Cloudflare (nameservers for recipeez.co.za) |
| Source control | GitHub — `WeTalkech/Recipeez` (org repo, public) |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| File storage | Supabase Storage — `recipe-photos` bucket |
| Frontend | Vanilla HTML / CSS / JavaScript (no framework) |
| Supabase SDK | UMD CDN bundle (`@supabase/supabase-js@2`) loaded via `<script>` tag |

---

## Project Structure

```
Recipeez/
├── index.html
├── recipes.html
├── recipe-single.html
├── submit-recipe.html
├── login.html
├── register.html
├── profile.html
├── about.html
├── blog.html
├── contact.html
├── css/
│   └── style.css          # All site styles
├── js/
│   ├── supabase-client.js # Initialises Supabase, exposes window.sb
│   └── main.js            # All page logic and Supabase interactions
├── assets/
│   └── Chef's hat.png     # Used for hat-based star ratings
└── logo/
    └── logo.png
```

Every HTML page loads scripts in this order, just before `</body>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="js/supabase-client.js"></script>
<script src="js/main.js"></script>
```

---

## Supabase Setup

### Client initialisation — [js/supabase-client.js](js/supabase-client.js)

Initialises the Supabase client and attaches it to `window.sb` so every script on the page can use it.

### Database tables

**`recipes`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| user_id | uuid (FK → auth.users) | Owner |
| title | text | |
| category | text | e.g. Breakfast, Dinner |
| cuisine | text | Optional |
| difficulty | text | Easy / Medium / Hard |
| servings | int | |
| prep_time | int | Minutes |
| cook_time | int | Minutes |
| description | text | |
| ingredients | text[] | Array of strings |
| instructions | text[] | Array of step strings |
| photo_url | text | Public URL from Supabase Storage |
| status | text | `pending` → `published` / `rejected` |
| created_at | timestamptz | |

**`profiles`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK → auth.users) | |
| username | text | |
| first_name | text | |
| last_name | text | |

Profiles are auto-created via a Supabase database trigger on `auth.users` insert.

### Row Level Security (RLS)

- **recipes SELECT** — public can read rows where `status = 'published'`
- **recipes INSERT** — authenticated users can insert their own rows (`user_id = auth.uid()`)

### Storage

Bucket: `recipe-photos` (public)  
Upload path pattern: `{user_id}/{timestamp}.{ext}`

---

## Authentication

Handled entirely through Supabase Auth (`sb.auth.*`). No passwords or session tokens are stored in localStorage.

| Action | API call |
|---|---|
| Login | `sb.auth.signInWithPassword({ email, password })` |
| Register | `sb.auth.signUp({ email, password, options: { data: { first_name, last_name, username } } })` |
| Logout | `sb.auth.signOut()` |
| Session check | `sb.auth.getSession()` |

After registration, Supabase sends a confirmation email. The user must confirm before logging in.

---

## Key Features in main.js

### Nav auth state
On every page load, checks for a live session. If logged in, swaps the "Log In" nav link to "Profile".

### Recipe grid — [index.html](index.html) / [recipes.html](recipes.html)
Queries `recipes` where `status = 'published'`, ordered by newest first. Renders recipe cards linking to `recipe-single.html?id={uuid}`.

### Recipe single page — [recipe-single.html](recipe-single.html)
Reads the `?id=` URL parameter, fetches the full recipe row (including a join to `profiles` for the author name), and populates the page: banner image, title, tags, meta strip, stats, description, ingredients list, and instructions list.

### Submit recipe — [submit-recipe.html](submit-recipe.html)
Checks for an active session; redirects to login if not authenticated. On submit:
1. Uploads the photo to Supabase Storage and gets a public URL.
2. Inserts a new row into `recipes` with `status = 'pending'`.

### Moderation
Recipes are manually reviewed in the Supabase Table Editor. Change `status` from `pending` to `published` to make a recipe live.

### Login gate
Guest users get 3 free recipe views per 24-hour window (tracked in localStorage). On the 4th view, content is locked and a sign-up prompt appears.

---

## Deployment

Vercel is connected to the `WeTalkech/Recipeez` GitHub repository, `main` branch.  
Every push to `main` triggers an automatic redeployment — no build command needed (framework = Other, output directory = `./`).

To deploy: commit and push to `main`.

---

## What Is Not Yet Wired Up

- **Homepage stats** — `#statRecipes`, `#statCooks`, `#statRating` elements exist but are not populated from the database.
- **Category counts** — `#catCountBreakfast` etc. are not yet queried.
- **Comments / likes / ratings** on recipe single page — UI placeholders exist, no backend logic.
- **Contact form** — submits locally but does not send an email (EmailJS not configured).
- **Search** — search panel UI exists; query is logged to console but not executed against the database.
- **Recipe sort** — sort UI works on static cards; does not re-query Supabase with ORDER BY.
- **Heart/save toggle** — visual only; saved recipes are not persisted to the database.
