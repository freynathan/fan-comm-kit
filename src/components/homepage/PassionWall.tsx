import { useEffect, useRef, useState } from "react";

interface PassionCard {
  id: string;
  site: string;
  accent: string;
  image: string;
  title: string;
  excerpt: string;
  tags: string[];
}

const HEIGHTS = [300, 220, 280];

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
  isFlipped: boolean;
  onFlip: () => void;
}

function WallCard({ card, height, isFlipped, onFlip }: CardProps) {
  return (
    <div
      className="relative shrink-0 cursor-pointer select-none"
      style={{ width: 260, height, perspective: "1000px" }}
      onClick={(e) => {
        e.stopPropagation();
        onFlip();
      }}
    >
      <div
        className="relative w-full h-full transition-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionDuration: "0.4s",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-[12px] overflow-hidden group"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <img
            src={card.image}
            alt={card.title}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover"
          />
          {/* hover gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0))",
            }}
          />
          {/* dot → pill */}
          <div
            className="absolute top-3 right-3 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 ease-out"
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
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-[12px] overflow-hidden bg-white p-4 flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            border: "0.5px solid #E5E5E5",
          }}
        >
          <div
            className="self-start inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium text-white mb-3"
            style={{ backgroundColor: card.accent }}
          >
            {card.site}
          </div>
          <h3
            className="text-[15px] font-medium leading-[1.35] mb-2 line-clamp-2"
            style={{ color: "#0A0A0A" }}
          >
            {card.title}
          </h3>
          <p
            className="text-[13px] leading-[1.5] line-clamp-2 mb-3"
            style={{ color: "#767676" }}
          >
            {card.excerpt}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
                style={{
                  borderColor: card.accent,
                  color: card.accent,
                  borderWidth: "0.5px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div
            className="mt-auto text-[12px] font-medium"
            style={{ color: card.accent }}
          >
            Read more →
          </div>
        </div>
      </div>
    </div>
  );
}

export function PassionWall() {
  const [flippedId, setFlippedId] = useState<string | null>(null);
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

  // Build a long sequence: repeat cards to allow seamless scroll
  const sequence = [...SAMPLE_CARDS, ...SAMPLE_CARDS, ...SAMPLE_CARDS];
  const singleSetWidth = SAMPLE_CARDS.length * (260 + 12); // card + gap

  // Animate via rAF so we can pause + drag
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
      // wrap
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
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    offsetRef.current = dragRef.current.startOffset + dx;
    setOffset(offsetRef.current);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      className="w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ touchAction: "pan-y" }}
    >
      <style>{`
        .passion-wall-card:hover [data-pill] { width: auto !important; padding-inline: 0 !important; }
        .passion-wall-card:hover [data-pill-label] { opacity: 1 !important; }
      `}</style>
      <div
        ref={trackRef}
        className="flex items-start gap-3 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          willChange: "transform",
          paddingBlock: 8,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {sequence.map((card, i) => {
          const height = HEIGHTS[i % HEIGHTS.length];
          const uniqueId = `${card.id}-${i}`;
          return (
            <div key={uniqueId} className="passion-wall-card">
              <WallCard
                card={card}
                height={height}
                isFlipped={flippedId === uniqueId}
                onFlip={() => {
                  if (dragRef.current.moved) return;
                  setFlippedId((prev) => (prev === uniqueId ? null : uniqueId));
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
