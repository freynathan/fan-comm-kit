# ToBe.fan — Claude Code Project Memory

## What this project is
ToBe.fan is a network of passion community fan sites (car.fan, fashion.fan, 
vegetarian.fan, and 44+ others). The platform centers on fan identity and 
community trust.

Key URLs:
- tobe.fan/of/username — fan profiles
- geot.ag/!SophieYoga — ! identity pages (location + fan validation + AI search)
- Fan Trust Score system

## The ! Identity Tag — Core Vision

### ! is i upside down
- i = identity
- ! = identity made visible, made public, made AI-readable
- One symbol with four meanings:
  1. i upside down = identity
  2. Exclamation = fan excitement ("I love her!")
  3. Map pin shape = location, she is HERE
  4. AI signal = "pay attention to this verified human"

### The founder story (use in every pitch)
"The # organised content. The @ connected people. The ! — which is i upside down, i for identity — is how humans signal to AI: this person is real, this person is here, this person is loved."

### What !SophieYoga means
- WHO she is → yoga.fan/of/sophie (fan validation, Fan Trust Score, 100 verified yogis)
- WHERE she is → geot.ag/!SophieYoga (map pin Paris 15ème, directions, hours)
- WHY people love her → verified reviews, Fan Trust Score earned not bought
- HOW to find her → JSON-LD schema AI search engines read and cite

### vs the hashtag
- #SophieYoga → Twitter noise, competitors, algorithm, diluted forever
- !SophieYoga → one canonical page, permanently hers, AI-readable, location-pinned

### Architecture
- yoga.fan/of/sophie = source of truth (fan club, validation, content)
- geot.ag/!SophieYoga = discovery layer (identity + location + AI search)
- Both launch TOGETHER — stronger than separate
- .fan subscription includes the ! identity page

### The ! propagation strategy
Every piece of content ToBe.fan publishes uses ! naturally:
- All .fan articles: "!TaylorRussell has 12,000 fans on fashion.fan"
- All social media posts: "Best yoga in Paris: !SophieYoga !ZenFlowParis"
- All newsletters: "This week: !SophieYoga — 100 verified fans"
- All press releases: introduce ! convention explicitly
- Every professional we onboard uses !TheirName in their own content
- Physical materials: studio stickers, business cards, event banners

Goal: ! spreads the same way # spread — through consistent ubiquitous 
use until it becomes instinctive. AI learns that ! = structured 
identity page with fan validation and location data.

### hasht.ag
- Keep the domain
- Deprioritised to protect ! focus — # is already diluted
- Reassess 2028 after ! is established
- Do NOT build hasht.ag features yet

### Build order
1. Phase 1: fashion.fan/of/lvmh (brand demo, Vivatech June)
2. Phase 2: yoga.fan/of/sophie + geot.ag/!SophieYoga (launch together)
3. Phase 3: Scale AI outreach, ! appears in 3rd party press
4. Phase 4: Brand dashboard tools
5. Phase 5: civic.fan (with moderation infrastructure)
6. 2028+: hasht.ag decision point

## Tech stack
- Frontend: React + TanStack Router + Tailwind CSS
- Build: Vite
- Hosting: Vercel (project: fan-comm-kit, auto-deploys from main branch)
- Database: Supabase (project ID: irepzzaizekqzateddwf)
- Auth: Google OAuth via Supabase PKCE flow
- AI content: Anthropic API (key stored in Vercel as ANTHROPIC_API_KEY)
- Repo: github.com/freynathan/fan-comm-kit

## Key people
- Nathan Frey (nathan@hasht.ag) — founder, non-technical
- Admin user ID: 29fba746-4833-406e-8859-ffc2b5692b1b
- Username: nathanfrey

## Database — important tables
- posts: articles (columns: id, author_id, site_id, content, status, slug, 
  title, excerpt, hero_image, content_type, tags, created_at)
  - status values: 'pending', 'approved', 'published'
  - content_type values: 'post', 'embed', 'news', 'entity'
  - ALWAYS query status with .in('status', ['approved', 'published'])
- sites: all fan sites (tobe, fashion, car, vegetarian, etc.)
- profiles: user profiles
- admins: admin access control
- entity_pages: brand/entity landing pages (fashion.fan/of/lvmh etc.)
- fan_clubs: fan club memberships and data
- pages: sub-pages in the site builder

## Key site IDs
- fashion.fan: 6f725951-77fb-40a6-b615-e97918f8e0ef

## Admin
- URL: tobe.fan/admin
- Pending queue: AI-generated articles awaiting approval
- Content agent: Supabase Edge Function runs every 2 hours via pg_cron
  generates articles with status 'pending', admin approves to 'approved'

## Architecture rules
- NEVER use .eq('status', 'approved') alone — always use 
  .in('status', ['approved', 'published'])
- content_type must be one of: 'post', 'embed', 'news', 'entity'
- author_id must be set on manual inserts (get from supabase.auth.getUser())
- Slugs format: kebab-case-title + '-' + Date.now()
- SQL always preferred over Supabase UI for schema changes

## Deployment
- Push to main branch → Vercel auto-deploys → live on tobe.fan in ~30 seconds
- Git email must be: frey.nathan@gmail.com
- Never add Co-Authored-By lines to commits

## What we are building (priority order)
1. Fan clubs — core product, brands as primary revenue driver
   - Brand pastes URL → AI builds landing page → built-in fan club
   - fashion.fan/of/lvmh — LVMH demo page for Vivatech mid-June
2. fashion.fan logged-out homepage — premium editorial magazine feel
3. AI Style feature — custom AI feature for fashion.fan
4. Mobile polish

## The Core Thesis

ToBe.fan is NOT a social network. It is the human passion identity 
layer for the AI era.

In a world where AI answers every question, professionals, influencers 
and brands need verified human signals to be discovered. Follower counts 
are gameable. Fan Trust Scores are not.

The one-liner: "ToBe.fan is the human identity layer for the AI era — 
where real fan validation makes professionals, influencers and brands 
discoverable by AI search."

The moat: We own the .fan domain namespace — the internet's address 
for human passion identity.

## The Three Identity Pages (core product)

1. Professional — yoga.fan/of/sophie-relaxing-yoga
   - 90 verified yogis = more credible than 90,000 Instagram followers
   - AI search asks "best yoga instructor in Paris?" → Sophie ranks
   - Pays $19-49/month for her AI identity page
   - Volume play — hundreds of millions of professionals globally

2. Influencer — trek.fan/of/wild-adventures
   - 1M fans = strongest AI authority signal on trekking
   - FanPassport replaces Linktree + media kit + portfolio
   - Pays $49-299/month
   - Viral growth engine — influencers bring their audiences

3. Brand — running.fan/of/nike
   - 100K verified running fans = proof Nike owns the running conversation
   - AI search for "best running shoes" surfaces Nike because humans said so
   - Pays $500-5,000/month for dashboard + loyalty tools + CRM export
   - Enterprise revenue

## The Pricing Pyramid
- Brands: $500-5,000/month (hundreds of brands)
- Influencers: $49-299/month (thousands of influencers)
- Professionals: $19-49/month (millions of professionals)
- Fans: FREE forever — they ARE the product. Their validation = trust signals

## The Network Effect
More fans joining → stronger trust signals → better AI search ranking 
→ more professionals/brands want pages → more fan clubs → more fans

## Fan Trust Score
This is the core product — not the community feed. Every feature must 
ask: does this generate verifiable human validation signals?
- A fan joining = a trust signal
- A fan posting = a deeper signal
- A fan attending an event = the deepest signal
- All structured for AI engines via JSON-LD schema

## Go-To-Market (AI-automated)
- Brands: AI scans brand URLs → builds their page → sends 
  "Are you AI searchable?" email
- Influencers: Auto-build FanPassport → DM with preview link already live
- Professionals: AI cold email at scale by category 
  (yoga instructors, dentists, coaches)
- Fans: Brands + influencers bring them via invite loops

## civic.fan
Buy the domain now. Build later (Phase 5) — requires robust moderation 
infrastructure first. Political content needs 24/7 moderation at scale.

## Current bugs / known issues
- Shared content block bug: two Content blocks in page builder share same 
  state — keyed by type instead of unique block ID
- Page builder block deletes don't persist (not saved to DB on delete)

## Design system
- Font: Playfair Display (editorial headings)
- Site color used as accent only, white header
- Tailwind CSS utility classes
- Mobile-first responsive

## Supabase MCP
- Connected via ~/.claude.json
- Can query DB directly without copy-pasting SQL

## Domain Portfolio (47 domains)

### Active
- fashion.fan (primary demo site — LVMH demo mid-June)
- yoga.fan

### Professional Tier (key revenue play)
- medical.fan — doctors, dentists, specialists, therapists
- massage.fan — massage therapists, bodyworkers, physiotherapists
- legal.fan — lawyers, notaries, legal consultants
- coaching.fan — business, life, executive, sports coaches
- beauty.fan — aestheticians, stylists, makeup artists
- gym.fan — personal trainers, fitness coaches

### Passion/Community Sites
- car.fan, ball.fan, barbecue.fan, bike.fan, biz.fan, boat.fan
- burger.fan, capital.fan, church.fan, cocktail.fan, coffee.fan
- collector.fan, dance.fan, discount.fan, diy.fan, events.fan
- foody.fan, gourmet.fan, healthy.fan, lifestyle.fan, luxury.fan
- martial-arts.fan, mosque.fan, museum.fan, par.fan, racket.fan
- robotic.fan, running.fan, synagogue.fan, temples.fan, tobe.fan
- trek.fan, tunes.fan, vegetarian.fan, walking-tour.fan, wine.fan
- wintersports.fan, singlelife.fan

### Future / Strategic
- civic.fan — buy now, build Phase 5 (requires moderation infrastructure)

### Domain Strategy
- Professional tier domains = highest revenue per user ($19-49/month)
- Each domain = both a passion community AND a professional identity namespace
- Pattern: medical.fan (industry hub) + medical.fan/of/dr-sophie (AI identity page)
- Target: any professional who relies on local reputation + word of mouth

## Fan Club Architecture (Phase 1 priority)

### fan_clubs table columns (22 total)
id, owner_id, site_id, name, slug, tagline, description, type (passion/brand),
cover_image_url, accent_color, welcome_message, benefits (jsonb), features (jsonb),
is_free, price_monthly, member_count, post_count, fan_trust_score,
visibility, brand_url, brand_ai_summary, site_slug, created_at

### features jsonb structure
{
  "community_feed": true,
  "fan_tiers": false,
  "exclusive_content": false,
  "events": false,
  "challenges": false,
  "shop_the_look": false,
  "ai_advisor": false,
  "brand_dashboard": false,
  "fan_trust_score": true,
  "newsletter": false,
  "ai_search_bar": false,
  "faq_blocks": false,
  "polls": false,
  "leaderboard": false,
  "fan_match": false,
  "embed_widget": false,
  "ai_digest": false,
  "crm_export": false,
  "sub_clubs": false,
  "loyalty_tiers": false
}

### Fan club types
- passion: fan-created community around a topic
- brand: brand-owned club, has brand_url, brand_dashboard, embed_widget

### Phase 1 build order
1. Fan Club Builder in admin (/admin/fan-clubs)
2. Fan Club public page (fashion.fan/of/lvmh)
3. fashion.fan logged-out homepage

### LVMH demo requirements (Vivatech mid-June)
- fashion.fan/of/lvmh must be live and beautiful
- AI bar must work
- Fan count must show
- JSON-LD FAQ blocks for AI search pitch
- Mobile must look good

### Design philosophy for fan clubs
- Emotional connection over transactional
- Belonging not just membership
- Identity-first: I am a car.fan of Porsche
- Contextual and conversational over scroll-and-consume
- Notification control is a trust feature not an afterthought
