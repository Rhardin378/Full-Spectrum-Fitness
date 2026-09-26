# Theme screenshots — charcoal + coral

Captured from the app running locally with the locked-in theme ([brand_style_guide.md](../../brand_style_guide.md)).

| File | Route | Notes |
|------|-------|--------|
| `screenshot_home.png` | `/` | Full marketing home |
| `screenshot_about.png` | `/about` | About the founder |
| `screenshot_auth.png` | `/auth` | Sign-in tab |
| `screenshot_auth_signup.png` | `/auth` | Sign-up tab |
| `screenshot_auth_theme_errors.png` | `/auth` | Client validation (theme `feedback-error` text) |
| `screenshot_auth_validation.png` | `/auth` | Empty submit (browser validation) |
| `screenshot_dashboard.png` | `/dashboard` | Redirects to `/auth` when not signed in |
| `screenshot_profile.png` | `/profile` | Redirects to `/auth` when not signed in |

Re-capture after auth is configured: `npm run dev` with `.env.local`, then screenshot `/dashboard` and `/profile` while signed in.
