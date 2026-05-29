# ToBe.fan — Claude Code Project Memory

## What this project is
ToBe.fan is a network of passion community fan sites (car.fan, fashion.fan, 
vegetarian.fan, and 33+ others). The platform centers on fan identity and 
community trust.

Key URLs:
- tobe.fan/of/username — fan profiles
- hasht.ag/#topic — hashtag identity  
- geot.ag/!location — geotags
- Fan Trust Score system

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

## Fan club strategy
- Fans: identity, access, community, status
- Brands: zero-party data, AI search moat, direct channel, loyalty metrics
- Monetisation: free fan / verified fan (paid) / brand ambassador tiers
- AI visibility angle: fan club membership signals brand authority to AI search

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
