import { useEffect, useRef, useState } from "react";
import { useArticleDrawer } from "@/components/article";
import { supabase } from "@/integrations/supabase/client";

interface PassionCard {
  id: string;
  synopsisId?: string;
  site: string;
  accent: string;
  image: string;
  title: string;
  excerpt: string;
  tags: string[];
}

const SAMPLE_CARDS: PassionCard[] = [
  {
    id: "1",
    site: "cocktail.fan",
    accent: "#CF3B12",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    title: "The Negroni Sbagliato — why the mistake became the legend",
    excerpt:
      "When a bartender accidentally grabbed prosecco instead of gin, he created one of the most beloved cocktails of the century.",
    tags: ["cocktail.fan", "lifestyle.fan", "gourmet.fan"],
  },
  {
    id: "2",
    site: "car.fan",
    accent: "#FF2800",
    image:
      "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?auto=format&fit=crop&w=800&q=80",
    title: "Why the 1973 Porsche 911 T is the most honest sports car ever made",
    excerpt:
      "No turbos. No driver aids. Just 2.4 litres of flat-six fury and your own skill standing between you and the scenery.",
    tags: ["car.fan", "lifestyle.fan", "capital.fan"],
  },
  {
    id: "3",
    site: "wildlife.fan",
    accent: "#B7683B",
    image:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
    title: "The Lioness Project — how one conservationist is rewriting the rules",
    excerpt:
      "Dr. Sarah Nkosi has spent 12 years tracking the same pride. What she's learned about female leadership changes everything.",
    tags: ["wildlife.fan", "trek.fan"],
  },
  {
    id: "4",
    site: "yoga.fan",
    accent: "#4A1970",
    image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    title: "The 5am practice — what happens when you commit to a year of dawn yoga",
    excerpt:
      "Six practitioners. Twelve months. One simple rule: practice before the world wakes up.",
    tags: ["yoga.fan", "healthy.fan", "lifestyle.fan"],
  },
  {
    id: "5",
    site: "wine.fan",
    accent: "#790222",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    title: "Burgundy 2022 — the vintage that divided the experts",
    excerpt:
      "Some call it the greatest Pinot Noir year of the decade. Others say the heat destroyed the terroir. Both are right.",
    tags: ["wine.fan", "gourmet.fan", "luxury.fan"],
  },
  {
    id: "6",
    site: "fashion.fan",
    accent: "#9A031E",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    title: "The quiet luxury shift — why the wealthy stopped showing off",
    excerpt:
      "Logomania is dead. The new status signal is fabric weight, cut precision, and knowing where to look.",
    tags: ["fashion.fan", "luxury.fan", "lifestyle.fan"],
  },
  {
    id: "7",
    site: "coffee.fan",
    accent: "#775E35",
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
    title: "The third wave is over — welcome to the fourth wave of coffee",
    excerpt:
      "Specialty coffee has peaked. What comes next is stranger, more personal, and more delicious than anything before it.",
    tags: ["coffee.fan", "gourmet.fan", "lifestyle.fan"],
  },
  {
    id: "8",
    site: "sneaker.fan",
    accent: "#FF312E",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    title: "The Air Jordan 1 Chicago — why one shoe changed everything",
    excerpt:
      "In 1985, Nike released a shoe that broke the NBA's uniform rules. The fine was $5,000 per game. It was worth every cent.",
    tags: ["sneaker.fan", "fashion.fan", "capital.fan"],
  },
  {
    id: "9",
    site: "trek.fan",
    accent: "#898177",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    title: "The GR20 — Europe's most brutal trail, and why you should walk it anyway",
    excerpt:
      "200km through Corsican wilderness. No phone signal. No shortcuts. Just the mountain and the version of yourself you've been avoiding.",
    tags: ["trek.fan", "wildlife.fan", "healthy.fan"],
  },
  {
    id: "10",
    site: "luxury.fan",
    accent: "#DAA520",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    title: "The Patek Philippe Calatrava — the watch that needs no introduction",
    excerpt:
      "You never actually own a Patek Philippe. You merely look after it for the next generation.",
    tags: ["luxury.fan", "capital.fan", "collector.fan"],
  },
];

interface CardProps {
  card: PassionCard;
  height: number;
  width: number;
  onNavigateGuard: () => boolean;
}

function WallCard({ card, height, width, onNavigateGuard }: CardProps) {
  const { open } = useArticleDrawer();

  const fire = () => {
    if (card.synopsisId) {
      open({ kind: "synopsis", synopsisId: card.synopsisId });
      return;
    }
    open({
      kind: "inline",
      data: {
        title: card.title,
        siteName: card.site,
        siteAccent: card.accent,
        siteEmoji: "⭐",
        image: card.image,
        excerpt: card.excerpt,
        content: card.excerpt,
        tags: card.tags,
      },
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // Reject if the track was being dragged
        if (!onNavigateGuard()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        fire();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        fire();
      }}
      className="relative cursor-pointer select-none block group text-left p-0 bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      style={{ width, height }}
      draggable={false}
    >
      <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: 14 }}>
        <img
          src={card.image}
          alt={card.title}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* dot → pill */}
        <div
          className="absolute top-3 right-3 z-20 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 ease-out pointer-events-none"
          style={{
            backgroundColor: card.accent,
            height: 18,
            width: 10,
            padding: 0,
          }}
          data-pill
        >
          <span
            className="text-white text-[11px] font-medium whitespace-nowrap opacity-0 transition-opacity duration-200"
            style={{ paddingInline: 10 }}
            data-pill-label
          >
            {card.site}
          </span>
        </div>

        {/* Hover overlay — curtain rising from bottom */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Hover content */}
        <div
          className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-[250ms] ease-out pointer-events-none"
          style={{
            transform: "translateY(8px)",
          }}
          data-overlay-content
        >
          <div
            className="self-start inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium text-white mb-2"
            style={{ backgroundColor: card.accent }}
          >
            {card.site}
          </div>
          <h3 className="text-[14px] font-medium leading-[1.35] text-white mb-2 line-clamp-2">
            {card.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{
                  border: "0.5px solid rgba(255,255,255,0.3)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Masonry column template — fixed pattern that repeats across the infinite scroll
type ColumnSlot =
  | { kind: "single"; width: number; height: number; marginTop: number }
  | { kind: "stack"; width: number; height: number; marginTop: number; gap: number };

const COLUMN_TEMPLATE: ColumnSlot[] = [
  { kind: "single", width: 200, height: 340, marginTop: 0 },   // Col 1 — portrait tall
  { kind: "stack",  width: 260, height: 155, marginTop: 40, gap: 8 }, // Col 2 — double stacked
  { kind: "single", width: 220, height: 380, marginTop: 0 },   // Col 3 — portrait tall
  { kind: "single", width: 300, height: 200, marginTop: 80 },  // Col 4 — landscape single wide
  { kind: "single", width: 180, height: 280, marginTop: 20 },  // Col 5 — portrait medium
  { kind: "stack",  width: 240, height: 145, marginTop: 60, gap: 8 }, // Col 6 — double stacked
  { kind: "single", width: 210, height: 360, marginTop: 0 },   // Col 7 — portrait tall
  { kind: "single", width: 280, height: 190, marginTop: 100 }, // Col 8 — landscape single
];

const COLUMN_GAP = 10;
const WALL_HEIGHT = 420;

interface BuiltColumn {
  slot: ColumnSlot;
  cards: PassionCard[];
  key: string;
}

export function PassionWall() {
  const [cards, setCards] = useState<PassionCard[]>(SAMPLE_CARDS);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startOffset: number; moved: boolean }>({
    active: false,
    startX: 0,
    startOffset: 0,
    moved: false,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: synopses, error } = await supabase
        .from("news_synopses")
        .select("id, title, synopsis_content, site_id")
        .order("created_at", { ascending: false })
        .limit(SAMPLE_CARDS.length);

      if (cancelled || error || !synopses?.length) return;

      const siteIds = Array.from(new Set(synopses.map((synopsis) => synopsis.site_id).filter(Boolean))) as string[];
      const { data: sites } = siteIds.length
        ? await supabase
            .from("sites")
            .select("id, name, slug, emoji, accent_color")
            .in("id", siteIds)
        : { data: [] };

      if (cancelled) return;

      const siteById = new Map((sites ?? []).map((site) => [site.id, site]));
      const mapped = synopses.map((synopsis, index) => {
        const fallback = SAMPLE_CARDS[index % SAMPLE_CARDS.length];
        const site = synopsis.site_id ? siteById.get(synopsis.site_id) : null;
        const siteLabel = site?.slug || site?.name || fallback.site;

        return {
          ...fallback,
          id: synopsis.id,
          synopsisId: synopsis.id,
          site: siteLabel,
          accent: site?.accent_color || fallback.accent,
          title: synopsis.title,
          excerpt: synopsis.synopsis_content,
          tags: [siteLabel],
        };
      });

      setCards(mapped);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Build one full pass of columns by walking template + cards in order
  const buildBase = (): BuiltColumn[] => {
    const cols: BuiltColumn[] = [];
    let cardIdx = 0;
    const cardPool = cards.length ? cards : SAMPLE_CARDS;
    // Repeat template enough times to consume all cards at least once
    const passes = Math.max(1, Math.ceil((cardPool.length * 2) / COLUMN_TEMPLATE.length));
    for (let p = 0; p < passes; p++) {
      for (let s = 0; s < COLUMN_TEMPLATE.length; s++) {
        const slot = COLUMN_TEMPLATE[s];
        const need = slot.kind === "stack" ? 2 : 1;
        const columnCards: PassionCard[] = [];
        for (let i = 0; i < need; i++) {
          columnCards.push(cardPool[cardIdx % cardPool.length]);
          cardIdx++;
        }
        cols.push({
          slot,
          cards: columnCards,
          key: `p${p}-s${s}`,
        });
      }
    }
    return cols;
  };

  const baseColumns = buildBase();
  const sequence = [...baseColumns, ...baseColumns];
  const singleSetWidth = baseColumns.reduce(
    (acc, c) => acc + c.slot.width + COLUMN_GAP,
    0
  );

  // Animate via rAF
  useEffect(() => {
    let raf = 0;
    const speed = 40; // px/sec

    const tick = (t: number) => {
      if (lastTickRef.current == null) lastTickRef.current = t;
      const dt = (t - lastTickRef.current) / 1000;
      lastTickRef.current = t;

      if (!paused && !dragRef.current.active) {
        offsetRef.current -= speed * dt;
      }
      if (offsetRef.current <= -singleSetWidth) {
        offsetRef.current += singleSetWidth;
      }
      if (offsetRef.current > 0) {
        offsetRef.current -= singleSetWidth;
      }
      setOffset(offsetRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, singleSetWidth]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startOffset: offsetRef.current,
      moved: false,
    };
    // Do NOT capture on pointerdown — only after movement, so child clicks still fire
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4 && !dragRef.current.moved) {
      dragRef.current.moved = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }
    if (dragRef.current.moved) {
      offsetRef.current = dragRef.current.startOffset + dx;
      setOffset(offsetRef.current);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    // Reset moved flag shortly after so child onClick can read it during the click
    if (!wasMoved) {
      // immediate reset is fine — no drag occurred
      dragRef.current.moved = false;
    } else {
      // Delay reset until after the synthetic click would fire
      setTimeout(() => {
        dragRef.current.moved = false;
      }, 50);
    }
  };



  return (
    <div
      className="w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ touchAction: "pan-y", height: WALL_HEIGHT }}
    >
      <style>{`
        .passion-wall-card:hover [data-pill] { width: auto !important; padding-inline: 0 !important; }
        .passion-wall-card:hover [data-pill-label] { opacity: 1 !important; }
        .passion-wall-card:hover [data-overlay-content] { transform: translateY(0) !important; }
      `}</style>
      <div
        ref={trackRef}
        className="flex items-start cursor-grab active:cursor-grabbing h-full"
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          willChange: "transform",
          gap: COLUMN_GAP,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {sequence.map((col, ci) => {
          const { slot, cards } = col;
          if (slot.kind === "stack") {
            return (
              <div
                key={`${col.key}-${ci}`}
                className="shrink-0 flex flex-col"
                style={{
                  width: slot.width,
                  marginTop: slot.marginTop,
                  gap: slot.gap,
                }}
              >
                {cards.map((card, idx) => (
                  <div key={`${card.id}-${idx}`} className="passion-wall-card">
                    <WallCard
                      card={card}
                      height={slot.height}
                      width={slot.width}
                      onNavigateGuard={() => !dragRef.current.moved}
                    />
                  </div>
                ))}
              </div>
            );
          }
          const card = cards[0];
          return (
            <div
              key={`${col.key}-${ci}`}
              className="shrink-0 passion-wall-card"
              style={{
                width: slot.width,
                marginTop: slot.marginTop,
              }}
            >
              <WallCard
                card={card}
                height={slot.height}
                width={slot.width}
                onNavigateGuard={() => !dragRef.current.moved}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
