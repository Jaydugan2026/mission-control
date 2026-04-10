# Deploy to Vercel

## Option 1: Vercel CLI (Recommended)

### Step 1: Install Vercel CLI (already done)

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Link Project

```bash
cd mission-control-web
vercel link
```

- Press Enter to accept defaults
- Name it `mission-control` or similar
- Link to your Vercel account

### Step 4: Deploy

```bash
vercel --prod
```

Your app will be live at `https://mission-control-xxx.vercel.app`

---

## Option 2: Vercel Web Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repo (or push to GitHub first)
4. Click "Deploy"

Default settings work automatically:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

---

## PWA Installation

After deployment:

### Desktop (Chrome/Edge)
1. Open your deployed URL
2. Click the install icon (⬇️) in address bar
3. App appears in dock/Applications

### Safari (Mac/iOS)
1. Open in Safari
2. Share → Add to Home Screen
3. App appears on home screen

### Android
1. Open in Chrome
2. Menu → Install App
3. App appears on home screen

---

## Custom Domain (Optional)

In Vercel dashboard:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown

---

## Environment Variables

For future API integrations, add these in Vercel dashboard:

```
JOBnimbus_TOKEN=mnq46909lsjqbvyx
```

---

## Post-Deploy Checklist

- [ ] App loads at Vercel URL
- [ ] All pages work (Dashboard, Tasks, Pipeline, Calendar, Office, Settings)
- [ ] PWA install prompt appears
- [ ] Black/white theme displays correctly
- [ ] Run button shows slash command modal
- [ ] Copy button copies command to clipboard
