# NeriBuzz 🗞️

Your Nigerian News Pulse — a real-time news aggregator pulling live RSS feeds from Punch, Vanguard, BBC Africa, Al Jazeera, ESPN and more.

---

## Project Structure

```
neribuzz/
├── pages/
│   ├── _app.js          # Global CSS import
│   ├── index.js         # Home page
│   └── api/
│       └── news.js      # Server-side RSS fetcher (runs on Vercel)
├── components/
│   └── NeriBuzz.jsx     # Main React component
├── styles/
│   └── globals.css      # Animations, fonts, base styles
├── package.json
└── next.config.js
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## Deploy to Vercel via GitHub

### Step 1 — Create GitHub repo
1. Go to **github.com** → click **New repository**
2. Name it `neribuzz` (or anything you like)
3. Leave it **Public** or **Private** — your choice
4. Click **Create repository**

### Step 2 — Push this code to GitHub
Open your terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial NeriBuzz commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/neribuzz.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3 — Deploy on Vercel
1. Go to **vercel.com** → Sign in with GitHub
2. Click **Add New → Project**
3. Find and select your `neribuzz` repo
4. Vercel auto-detects Next.js — no extra settings needed
5. Click **Deploy**

That's it. Vercel gives you a live URL like `neribuzz.vercel.app` in about 60 seconds.

---

## Environment Variables (Optional but recommended)

To set a custom admin password instead of the default, add this in Vercel:

1. Go to your project on Vercel → **Settings → Environment Variables**
2. Add:
   - **Name:** `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value:** `your-strong-password-here`
3. Redeploy

> ⚠️ Default credentials: `admin` / `neribuzz2025` — change this before going live.

---

## Adding or Changing RSS Feeds

Edit `pages/api/news.js` and add/remove entries from the `FEEDS` array:

```js
{ url: "https://yoursite.com/feed/", source: "Your Source", category: "Nigeria" }
```

Valid categories: `Nigeria`, `International`, `Business`, `Sports`, `Entertainment`, `Technology`, `Health`, `Politics`

---

## How It Works

- **`/api/news`** — A Next.js API route runs on Vercel's serverless functions. It uses `rss-parser` to fetch all RSS feeds directly on the server (no CORS issues), then returns clean JSON to the browser. Responses are cached for 30 minutes on Vercel's CDN edge.
- **`components/NeriBuzz.jsx`** — The React frontend calls `/api/news` on load and every hour. It parses dates, marks recent stories as Breaking, and renders the full UI.
- **Admin panel** — Accessible via the "Admin" button. Blog posts and categories are stored in `localStorage` in the browser.

---

## Tech Stack

| Layer    | Technology           |
|----------|----------------------|
| Framework | Next.js 14          |
| Hosting   | Vercel (free tier)  |
| RSS parser| rss-parser npm pkg  |
| Icons     | lucide-react        |
| Fonts     | Google Fonts (Inter + Playfair Display) |
