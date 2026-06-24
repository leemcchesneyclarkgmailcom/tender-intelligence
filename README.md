# 🛰️ Tender Intelligence

> Enterprise SaaS platform for monitoring government contracts, tenders, procurement notices, and infrastructure projects worldwide.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Tender Intelligence continuously monitors public procurement portals, government tender websites, and infrastructure announcements, then applies AI to summarize opportunities, assess risk, score win probability, and classify industry — giving construction, consulting, defence, technology, and mining firms a real-time intelligence edge.

---

## ✨ Features

### Collection Layer
- **Continuous monitoring** of government procurement portals (SAM.gov, AusTender, TED, UNGM, and more)
- **Live web scan** that queries fresh procurement notices via AI-powered web search
- **Configurable scan frequency** per source with last-scan tracking

### AI Processing (powered by Z.ai SDK)
- **Tender summarization** — executive summaries generated from full specifications
- **Risk assessment** — 0–100 risk score with low/medium/high/critical classification and explanatory notes
- **Opportunity scoring** — win-probability and opportunity score with rationale
- **Industry classification** — automatic tagging across 7 industries
- **Budget & deadline extraction** — structured from unstructured tender text
- **Semantic search** — natural-language queries expanded into structured filters via LLM
- **Market intelligence reports** — AI-generated executive summaries, highlights, and recommendations

### Search & Discovery
- **Natural-language search** (e.g. "Australian civil works over $50M")
- **Structured filters** — industry, country, status, risk level, procurement type, budget range
- **Saved searches** with email-notification toggles
- **Bookmark/favorite** tenders for quick access

### Dashboard
- **KPI overview** with sparkline trends (active tenders, pipeline value, closing soon, win probability, alerts, risk, competitors)
- **Tender feed** with AI-enriched cards
- **Opportunity pipeline** — drag-and-drop Kanban across 6 stages (identified → qualifying → pursuing → bidding → won → lost)
- **Competitor intelligence** — win-rate charts, threat posture, activity timeline
- **Deadline calendar** — monthly view with industry-coloured deadlines and urgency tracking
- **Market analytics** — geographic distribution, industry radar, risk-vs-opportunity scatter, buyer concentration
- **Tender comparison** — side-by-side comparison of up to 3 tenders with AI recommendation

### Automation
- **Daily scanning** of configured sources
- **Alert generation** for new tenders, deadline reminders, risk changes, competitor activity
- **Weekly reports** and market-intelligence summaries
- **Audit logs** for enterprise compliance

### Enterprise Features
- **Multi-tenant architecture** (Tenant → Users → Teams → Permissions)
- **Role-based access control** (owner, admin, manager, analyst, viewer)
- **Team management** with pursuit assignment
- **Immutable audit logs** of all user and system activity

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Database | [Prisma ORM](https://www.prisma.io/) (SQLite for dev, PostgreSQL-ready) |
| Charts | [Recharts](https://recharts.org/) |
| Drag & Drop | [@dnd-kit](https://dndkit.com/) |
| State | React Query + Zustand |
| AI | [Z.ai Web Dev SDK](https://www.npmjs.com/package/z-ai-web-dev-sdk) (LLM + web search) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) (light/dark) |
| Icons | [lucide-react](https://lucide.dev/) |
| Package Manager | [Bun](https://bun.sh/) |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 20+ or [Bun](https://bun.sh/) 1.1+
- A Z.ai SDK configuration file (optional — platform falls back to deterministic heuristics when AI is unavailable)

### Installation

```bash
# Clone the repository
git clone https://github.com/leemcchesneyclarkgmailcom/tender-intelligence.git
cd tender-intelligence

# Install dependencies
bun install
# or: npm install

# Set up environment variables
cp .env.example .env

# Push the database schema and seed realistic data
bun run db:push
bun run scripts/seed.ts

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### AI Configuration (optional but recommended)

The Z.ai SDK reads configuration from `~/.z-ai-config` or `/etc/.z-ai-config`. Create the file:

```json
{
  "baseUrl": "https://internal-api.z.ai/v1",
  "apiKey": "your-api-key",
  "token": "your-token"
}
```

When the AI service is unreachable, the platform transparently falls back to deterministic heuristics and displays an "AI Fallback" status indicator in the sidebar.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run db:migrate` | Create a database migration |
| `bun run db:reset` | Reset the database (dev only) |
| `bun run scripts/seed.ts` | Seed realistic tender data |

---

## 📂 Project Structure

```
tender-intelligence/
├── prisma/
│   └── schema.prisma              # Multi-tenant database schema (13 models)
├── scripts/
│   └── seed.ts                    # Realistic seed data (30 tenders, 8 users, 6 competitors)
├── src/
│   ├── app/
│   │   ├── api/                   # 20+ API routes (dashboard, tenders, pipeline, etc.)
│   │   ├── layout.tsx             # Root layout with ThemeProvider
│   │   ├── page.tsx               # Main SPA shell (12 sections)
│   │   └── globals.css            # Tailwind + custom theme (teal enterprise palette)
│   ├── components/
│   │   ├── ui/                    # shadcn/ui component library
│   │   └── tenderintel/
│   │       ├── AppShell.tsx       # Sidebar + topbar + footer layout
│   │       ├── TenderDetailDrawer.tsx  # AI-powered tender detail panel
│   │       ├── shared.tsx         # StatCard, Sparkline, ScoreRing, badges, skeletons
│   │       ├── types.ts           # Shared TypeScript types
│   │       └── sections/          # 12 feature sections
│   │           ├── Dashboard.tsx
│   │           ├── TenderFeed.tsx
│   │           ├── Pipeline.tsx       # DnD Kanban
│   │           ├── Compare.tsx        # Tender comparison
│   │           ├── Calendar.tsx       # Deadline calendar
│   │           ├── Analytics.tsx      # Market analytics deep-dive
│   │           ├── Competitors.tsx
│   │           ├── Searches.tsx       # Saved searches + alerts
│   │           ├── Reports.tsx        # AI report generation
│   │           ├── Teams.tsx          # Teams & permissions
│   │           ├── Sources.tsx        # Collection sources + live scan
│   │           └── AuditLogs.tsx
│   └── lib/
│       ├── ai.ts                  # Z.ai SDK wrapper (summarize, risk, search, reports)
│       ├── db.ts                  # Prisma client singleton
│       ├── tenant.ts              # Multi-tenant helpers
│       └── format.ts              # Currency, date, and label formatters
├── .env.example
├── Dockerfile                     # Production container
├── docker-compose.yml             # Full-stack orchestration
├── .github/workflows/ci.yml       # CI/CD pipeline
└── README.md
```

---

## 🗄️ Data Model

The Prisma schema defines 14 models for a multi-tenant architecture:

- **Tenant** — top-level organization (plan, industry, seat limit)
- **User** — tenant-scoped users with roles (owner/admin/manager/analyst/viewer)
- **Team** + **TeamMember** — pursuit teams with lead/member roles
- **CollectionSource** — monitored procurement portals with scan frequency
- **Tender** — core entity with AI-enriched fields (summary, riskScore, opportunityScore, winProbability, industries, keyRequirements, embedding)
- **PipelineEntry** — Kanban pursuit tracking (stage, priority, owner, pursuitValue)
- **Competitor** + **CompetitorActivity** — competitive intelligence
- **SavedSearch** — natural-language saved queries with notification toggles
- **Alert** — typed alerts (new_tender, deadline_reminder, risk_change, competitor, etc.)
- **Report** — AI-generated reports (weekly, market_intelligence, competitor_brief, pipeline_review)
- **Bookmark** — user tender favorites
- **AuditLog** — immutable compliance trail

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build the image directly
docker build -t tender-intelligence .
docker run -p 3000:3000 -e DATABASE_URL=file:./db/custom.db tender-intelligence
```

The `docker-compose.yml` includes:
- Next.js application container
- Volume for SQLite database persistence
- Health check endpoint

---

## 🔌 API Overview

All API routes are under `/api/` and return JSON:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Aggregated KPIs, charts, and recent activity |
| `/api/tenders` | GET | List tenders with filters (industry, country, status, risk, budget, sort) |
| `/api/tenders/[id]` | GET | Single tender with pipeline + alerts |
| `/api/tenders/[id]/analyze` | POST | Run AI analysis pipeline (summary, risk, scoring) |
| `/api/search` | POST | Semantic search via LLM query expansion |
| `/api/pipeline` | GET, POST | List/create pipeline entries |
| `/api/pipeline/[id]` | PATCH, DELETE | Update stage / remove entry |
| `/api/competitors` | GET, POST | Competitor intelligence |
| `/api/saved-searches` | GET, POST | Saved searches CRUD |
| `/api/saved-searches/[id]` | DELETE | Remove saved search |
| `/api/alerts` | GET | List alerts (with unread filter) |
| `/api/alerts/[id]` | PATCH, DELETE | Mark read / delete |
| `/api/reports` | GET | List reports |
| `/api/reports/generate` | POST | Generate AI report |
| `/api/bookmarks` | GET, POST | List/create bookmarks |
| `/api/bookmarks/[id]` | GET, DELETE | Check status / remove bookmark |
| `/api/teams` | GET | Teams with members and pipeline stats |
| `/api/audit-logs` | GET | Filterable audit trail |
| `/api/sources` | GET | Collection sources with scan stats |
| `/api/scan` | POST | Trigger live web scan |
| `/api/users` | GET | Tenant users |
| `/api/tenants` | GET | Current tenant info |
| `/api/ai-health` | GET | LLM reachability probe |

---

## 🎨 Design System

- **Color palette:** Teal primary (`#14b8a6`) on slate sidebar, with amber/violet/cyan/rose/emerald accents
- **Light & dark mode** via `next-themes`
- **Responsive:** Mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation, 44px touch targets
- **Custom scrollbars** with `ti-scroll` utility class
- **Animations:** Hover lifts, pulsing live indicators, animated sparklines, skeleton loaders

---

## 🧪 Verification

The platform has been verified end-to-end via automated browser testing:

- ✅ All 12 sections render without runtime errors
- ✅ AI analysis pipeline runs (with live LLM or deterministic fallback)
- ✅ Semantic search returns ranked results
- ✅ Pipeline Kanban supports drag-and-drop stage moves
- ✅ AI report generation completes
- ✅ Live web scan returns real procurement results
- ✅ Bookmark flow works end-to-end
- ✅ `bun run lint` passes with 0 errors and 0 warnings

---

## 🗺️ Roadmap

- [ ] PostgreSQL migration for production
- [ ] Vector database (pgvector) for true semantic search
- [ ] Queue workers (BullMQ + Redis) for daily scans and alert generation
- [ ] NextAuth.js authentication with multi-tenant session resolution
- [ ] Real portal scraping (SAM.gov, AusTender, TED APIs)
- [ ] Trained win-probability model on historical bid outcomes
- [ ] WebSocket real-time notifications
- [ ] PDF export for reports
- [ ] Mobile-optimized Kanban view

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the App Router
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Prisma](https://www.prisma.io/) for the type-safe ORM
- [Z.ai](https://z.ai/) for the AI SDK
- [Recharts](https://recharts.org/) for the charting library
- [@dnd-kit](https://dndkit.com/) for accessible drag-and-drop

---

Built with ❤️ for procurement teams who need a competitive intelligence edge.
