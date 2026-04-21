import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { ArticleDrawer, ArticleDrawerSource } from "./ArticleDrawer";

interface ArticleDrawerContextValue {
  open: (source: ArticleDrawerSource) => void;
  close: () => void;
}

const Ctx = createContext<ArticleDrawerContextValue | null>(null);

export function ArticleDrawerProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<ArticleDrawerSource | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((src: ArticleDrawerSource) => {
    setSource(src);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <ArticleDrawer
        open={isOpen}
        source={source}
        onClose={close}
        onAnimationEnd={() => {
          if (!isOpen) setSource(null);
        }}
      />
    </Ctx.Provider>
  );
}

export function useArticleDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useArticleDrawer must be used inside ArticleDrawerProvider");
  return ctx;
}
