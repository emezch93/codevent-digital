# CodeVent Digital

**Building Developers One Step at a Time.**

CodeVent Digital is a web development training and digital product platform that takes beginners from zero to shipping real projects through a structured, free-to-start learning path. It combines a curriculum, a community, a shop, and an AI-powered assistant into one connected experience.

🔗 **Live site:** [codeventdigital.site](https://codeventdigital.site)
📧 **Email:** codeventdigitalinfo@gmail.com
💬 **WhatsApp:** [+234 818 594 7780](https://wa.me/2348185947780)
📍 **Based in:** Surulere, Lagos, Nigeria

---

## What This Is

CodeVent Digital follows a four-stage roadmap:

1. **Learn** — free, structured, bitesize courses (HTML, CSS, JavaScript and beyond)
2. **Build** — guided projects that scale from simple pages to full web apps
3. **Validate** — community and mentor feedback on real submitted projects
4. **Monetize** — access to the Shop, mentorship, and real-world opportunities

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Homepage — roadmap, stats, testimonials, sign in/up |
| `learning.html` | Structured course curriculum |
| `community.html` | WhatsApp groups, channel, and mentorship access |
| `shop.html` | Digital products — eBooks, courses, source code |
| `testimonial.html` | Learner success stories and platform stats |
| `toolkit.html` | CodeVent Developer Toolkit — cheat sheets, checklists, templates, planners |
| `chat.html` | AI learning assistant (CodeVent AI) |
| `about.html` | Founder and platform background |
| `contact.html` | Contact form and direct channels |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service |

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript — no framework, no build step
- **Hosting:** Cloudflare Pages, custom domain (`codeventdigital.site`)
- **PWA:** Full manifest + service worker (`sw.js`), installable, offline-capable
- **AI Chat:** `chat.html` → Cloudflare Worker → Gemini 2.5 Flash (stateless backend, frontend owns memory via `localStorage`)
- **Enrollment:** Google Form + linked Google Sheet, wired through `enroll-config.js`
- **Analytics-free stat counters:** `counter.js` — IntersectionObserver-based, animates in view

## Project Structure

```
codevent-digital/
├── index.html
├── learning.html
├── community.html
├── shop.html
├── testimonial.html
├── toolkit.html
├── chat.html
├── about.html
├── contact.html
├── privacy.html
├── terms.html
├── enroll-config.js       # single source of truth for enrollment link
├── counter.js             # animated stat counters
├── pwa-register.js        # service worker registration + install prompt
├── sw.js                  # active service worker (cache-first assets, network-first HTML)
├── favicon.svg            # brand mark, gradient "</>" logo
├── icons/                 # full PWA icon set (any + maskable)
├── manifest.json
├── robots.txt
└── sitemap.xml
```

## Running Locally

No build step required — this is a static site.

```bash
git clone https://github.com/emezch93/codevent-digital.git
cd codevent-digital
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

Deployed via Cloudflare Pages, connected directly to this repository's `main` branch. Pushing to `main` triggers an automatic rebuild and deploy to `codeventdigital.site`.

## Contributing

This is a solo-maintained project. Issues and suggestions are welcome, but direct pull requests are not currently accepted.

## License

© 2026 CodeVent Digital. All rights reserved.
