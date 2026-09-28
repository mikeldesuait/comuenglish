# ComuEnglish

Study app for English exams: A2, B1, B2.

**Author:** Miguel Garcia
**Company:** ComuTech
**Website:** comutec.es/comuenglish (production target)
**Repo:** github.com/mikeldesuait/comuenglish
**Production (beta):** mikeldesuait.github.io/comuenglish/

---

## Content

| Module | A2 | B1 | B2 |
|--------|----|----|-----|
| Fundamentals (units) | 15 | 10 | 10 |
| Reading (texts) | 15 | 12 | 10 |
| Listening (audios) | 10 | 10 | 8 |
| Writing (tasks) | 8 | 10 | 10 |
| Speaking (prompts) | 10 | 12 | 12 |
| **Total items** | | | **1,009** |

---

## Features

### Content & learning
- Three levels: A2 Elementary, B1 Intermediate, B2 Upper Intermediate
- Four content modules: Fundamentals, Comprehension, Production, Mock Exam
- Fundamentals: 7 phases per unit with progress tracking (1/7 to 7/7)
- Reading: texts with CEFR-style questions
- Listening: browser TTS with max 2 plays per audio
- Writing: DeepSeek evaluation using CEFR rubric
- Speaking: voice recording + transcription + DeepSeek analysis
- Mock Exam: timed sections with CEFR Scale result
- Real-time option shuffle (prevents pattern memorization)

### Coaching system
- **Onboarding**: user selects level, exam date, days per week
- **Auto calculation**: app computes minutes per day needed
- **Calendar generation**: 3 passes (learn, review, consolidate) + 6 mock exams
- **My Plan (Today)**: shows tasks for the current day
- **Time tracking**: user logs time spent on each task
- **Progress dashboard**: real metrics and projections
- **Streak**: consecutive days studying
- **Post-plan actions**: study ahead or review when finished

### Accounts & sync
- Email/password login (Supabase Auth)
- Sign up with email confirmation (Resend + custom domain)
- Password recovery with token_hash flow + smart redirect to user's webmail
- Change password from Settings (for logged-in users)
- Persistent session across reloads
- Progress synced to Supabase (cloud) with row-level security
- Offline-first: localStorage cache + background sync

---

## Architecture

    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
    │   Browser    │─────▶│   Supabase   │─────▶│   DeepSeek   │
    │  (frontend)  │      │  (backend)   │      │   (LLM API)  │
    └──────────────┘      └──────────────┘      └──────────────┘
          │                      │
          │ localStorage         │ Auth (users)
          │ (cache)              │ Postgres (user_progress, RLS)
          │                      │ Edge Function (deepseek-proxy)
          │                      │ Secrets (DEEPSEEK_API_KEY)
          │                      │ SMTP (Resend → notifications.comutech.es)

**Key security points:**
- The DeepSeek API key never reaches the browser
- All DeepSeek calls go through an authenticated Supabase Edge Function
- Only logged-in users can use AI features
- Row-Level Security ensures users only see their own progress

---

## Project structure

    comuenglish/
      index.html
      css/   base.css, layout.css, widgets.css
      js/
        app.js, router.js, state.js
        core/
          auth.js             ← Supabase auth helpers
          cloud.js            ← sync with user_progress table
          password-guard.js   ← (legacy, no longer used for critical flow)
          planner.js, storage.js, scoring.js, backup.js
        views/
          home, how, today, progress, onboarding,
          fundamentals, comprehension, production, mock,
          login.js            ← login / signup / forgot password
          auth-callback.js    ← processes token_hash from email
          reset-password.js   ← new password form (frozen until changed)
          pending-reset-modal.js ← (legacy modal, can be removed)
        widgets/
          exercise, audio-player, recorder, progress,
          settings-modal, timer, speech-analyzer, time-tracker
        services/
          supabase.js         ← client (PKCE disabled, uses token_hash)
          deepseek.js         ← calls Edge Function
      supabase/
        functions/
          deepseek-proxy/
            index.ts          ← Edge Function (Deno)
      data/  a2/, b1/, b2/
      _backups/               ← local .bak files (gitignored)
      docs-coaching-plan.md

---

## How to run locally

    cd comuenglish
    python3 -m http.server 8000

Open http://localhost:8000

---

## Supabase setup (reference)

**Project:** ComuEnglish
**Project ref:** uexnfoqglhgjovvchqcu
**Region:** Central EU (Frankfurt)
**Site URL:** https://mikeldesuait.github.io/comuenglish/
**Redirect URLs (allowed):**
- http://localhost:8000/**
- https://mikeldesuait.github.io/comuenglish/**
- https://mikeldesuait.github.io/comuenglish/#/auth-callback
- https://comutec.es/comuenglish/**

### Database

Table `user_progress`:
- `id` — bigint, primary key
- `user_id` — uuid, references auth.users
- `data` — jsonb, contains entire app state
- `updated_at` — timestamptz
- `created_at` — timestamptz
- unique constraint on `user_id`

**RLS enabled** with 4 policies:
- select own row
- insert own row
- update own row
- delete own row

### Auth

- Email/password enabled
- "Confirm email" currently **disabled** (dev mode)
- **TODO for production:** enable it and configure redirect URLs

### Email template (Reset Password)

Body uses:

    <h2>Reset your password</h2>

    <p>We received a request to reset your password. Follow the link below to choose a new one.</p>

    <p><a href="{{ .RedirectTo }}?code={{ .Token }}">Reset password</a></p>

    <p>If you didn't request this, you can safely ignore this email.</p>

**IMPORTANT:** the flow uses `token_hash` (not PKCE). The client calls `supabase.auth.verifyOtp({ token_hash, type: "recovery" })`.

### Edge Function: `deepseek-proxy`

Located in `supabase/functions/deepseek-proxy/index.ts`.

**What it does:**
1. Receives `{ messages, options }` from the frontend
2. Verifies the user's JWT via `supabase.auth.getUser()`
3. Reads `DEEPSEEK_API_KEY` from Supabase secrets
4. Forwards request to DeepSeek API
5. Returns `{ content }` to the frontend

**Required secret:** `DEEPSEEK_API_KEY`
**JWT verification in dashboard:** disabled (handled in code)

---

## Password recovery flow (current design)

**Flow:**
1. User clicks "¿Olvidaste tu contraseña?" in the login screen
2. Enters email → app calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split("#")[0] })`
3. **App redirects the current tab to the user's webmail** (based on email domain — Gmail, Outlook, iCloud, etc.) after 1.2s
4. User opens the email → clicks the link
5. Email link goes to `https://mikeldesuait.github.io/comuenglish/#/auth-callback?token_hash=...&type=recovery`
6. `auth-callback.js`:
   - Reads `token_hash` from URL
   - Calls `supabase.auth.verifyOtp({ token_hash, type: "recovery" })`
   - **Sets `localStorage.reset_in_progress = Date.now()`** (global flag)
   - Navigates to `#/reset-password`
7. `reset-password.js`:
   - Checks `reset_in_progress` → if not active, redirects to login
   - Shows password form
   - **The router blocks any navigation while `reset_in_progress` is active**
   - User changes password → `supabase.auth.updateUser({ password })`
   - Clears `reset_in_progress`
   - Calls `supabase.auth.signOut()`
   - Redirects to login
8. User logs in with the new password

**Why `token_hash` and not PKCE:**
PKCE has a bug in certain versions of `supabase-js` where `exchangeCodeForSession` returns `invalid flow state, no valid flow state found`. The `token_hash` + `verifyOtp` flow is more reliable for SPAs without a backend.

**Why `localStorage.reset_in_progress` and not `sessionStorage`:**
The flag must be visible across all tabs of the same origin to prevent any tab from auto-logging in when the session is created.

---

## DeepSeek setup

**For the app to work**, the `DEEPSEEK_API_KEY` secret must be set in Supabase:

1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Add `DEEPSEEK_API_KEY` with the value from https://platform.deepseek.com
3. The key is used by the `deepseek-proxy` Edge Function

**Users never see this key.** The frontend only sends the user's session token.

---

## Pending tasks

### High priority (before public launch)
- [ ] Enable "Confirm email" in Supabase Auth
- [ ] Configure Supabase redirect URLs for production domain
- [ ] Verify RLS with two test users
- [ ] Rotate publishable key + DeepSeek secret (both were shared in chat during setup)
- [ ] Test full flow on comutec.es/comuenglish after deployment

### Features
- [ ] Auto-reschedule when user falls behind
- [ ] Calendar view (full schedule)
- [ ] Vacation mode (pause plan)
- [ ] PWA (installable, offline)
- [ ] Notifications for daily study reminder
- [ ] Pricing page (Free / Monthly / Lifetime)
- [ ] Analytics (which modules users actually use)

### Cleanup / technical debt
- [ ] Remove `pending-reset-modal.js` (legacy, replaced by `reset_in_progress` flow)
- [ ] Remove `password-guard.js` (legacy, no longer used)
- [ ] Remove `pending_reset` (sessionStorage flag, no longer needed)
- [ ] Remove `sent_reset_email` references if any remain
- [ ] Consider adding a "change password" option in the reset screen for logged-in users
- [ ] Rate limiting on `deepseek-proxy` if user base grows

---

## Design

- Modern minimal design with high-contrast text
- Palette: orange (action), green (success), amber (warning), deep blue (focus)
- Topbar with 2 groups: marketing (Home, How it works) + personal (My Plan, Settings)
- Home: one-screen pitch with hidden background icons and UK flags
- How it works: 3-step method + slideshow + comparison
- Onboarding: compact horizontal layout
- Login: tabbed (sign in / sign up), password visibility toggle, forgot password
- Reset password: frozen form, blocks navigation until changed

---

## Commercial notes

- Branded as ComuEnglish (not Cambridge)
- Levels: A2 Elementary, B1 Intermediate, B2 Upper Intermediate
- No references to Cambridge, KET, PET or FCE in the UI or code
- CEFR level codes (A2, B1, B2) are public standard

---

## Development notes

### Where things live

- **Auth logic** → `js/core/auth.js`
- **Cloud sync** → `js/core/cloud.js`
- **State store** → `js/state.js` (persists to localStorage + schedules cloud save)
- **Routing / guards** → `js/router.js` (guards `today` and blocks navigation during `reset_in_progress`)
- **Login UI** → `js/views/login.js`
- **Auth callback (email link)** → `js/views/auth-callback.js`
- **Reset password form** → `js/views/reset-password.js`
- **Settings modal (account, change password, backups)** → `js/widgets/settings-modal.js`
- **DeepSeek client (frontend)** → `js/services/deepseek.js`
- **DeepSeek proxy (backend)** → `supabase/functions/deepseek-proxy/index.ts`

### Common gotchas

- After modifying `index.html` or JS files, hard reload with **Ctrl+Shift+R** (aggressive caching)
- The `_backups/` folder is gitignored — safe to delete locally
- localStorage key is `comuenglish-state-v1` (do NOT change without a migration)
- `reset_in_progress` flag in localStorage blocks navigation globally — do not remove accidentally
- Email template must use `{{ .RedirectTo }}?code={{ .Token }}` (NOT `{{ .ConfirmationURL }}`)
- **Auth tokens are single-use** — after clicking a reset link, it can't be used again

### How to check sync works

1. Open app, log in
2. Make any change (complete a task, etc.)
3. Open DevTools console → look for `[cloud] saved at ...`
4. Check Supabase → Table Editor → `user_progress` → `updated_at` should update

### How to test password recovery

1. Open an incognito window
2. Request password reset with a valid email
3. App redirects to Gmail (or other webmail)
4. Open the email → click the link
5. Should land on `#/auth-callback?token_hash=...` → then auto-navigate to `#/reset-password`
6. Enter a new password (different from current)
7. Should show success screen → then login
8. Log in with new password

**Important:** tokens are single-use. If you click the email link twice, the second time will fail.

---

## License

Personal use until commercial release.
