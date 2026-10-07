import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
// 👇 Updated imports to use the two separate rows
import { marqueeToolsRow1, marqueeToolsRow2, toolCategories, toolsSection } from "../../data/tools";
import type { MarqueeTool, ToolCategory } from "../../data/tools";

/* -------------------------------------------------------------------------- /
/ Helpers                                                                    /
/ -------------------------------------------------------------------------- */
const iconUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const COMPACT_QUERY = "(max-width: 767px)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

const compactTail = (i: number) => `${[16.67, 50, 83.33, 33.33, 66.67][i] ?? 50}%`;

const FLOATER_SLOTS = [
  { top: "-22px", right: "-18px", size: 56, delay: "0s" },
  { top: "26%", right: "-34px", size: 68, delay: "-1.4s" },
  { top: "52%", right: "-16px", size: 48, delay: "-2.6s" },
  { top: "74%", right: "-30px", size: 40, delay: "-0.8s" },
  { bottom: "-20px", right: "22%", size: 44, delay: "-3.2s" },
] as const;

/* -------------------------------------------------------------------------- /
/ Marquee                                                                    /
/ -------------------------------------------------------------------------- */
const MARQUEE_COPIES = 4; 

function MarqueeRow({ tools, reverse = false }: { tools: MarqueeTool[]; reverse?: boolean }) {
  return (
    <div className="tools-marquee-row" data-reverse={reverse || undefined}>
      <div className="tools-marquee-track">
        {Array.from({ length: MARQUEE_COPIES }).map((_, copy) => (
          <ul key={copy} className="tools-marquee-group" aria-hidden={copy > 0 || undefined}>
            {tools.map((tool) => (
              <li
                key={`${copy}-${tool.name}`}
                className="tools-chip"
                style={
                  {
                    "--logo": `url(${iconUrl(tool.slug)})`,
                    "--brand": tool.color ? `#${tool.color}` : "var(--accent)",
                  } as CSSProperties
                }
              >
                <span className="tools-chip-logo" aria-hidden="true" />
                <span>{tool.name}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- /
/ Panel (angled container: mockup + skills + floating logos)                 /
/ -------------------------------------------------------------------------- */
function Mockup({ category }: { category: ToolCategory }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="tools-mockup">
      {!failed && (
        <img
          src={category.mockup}
          alt={`${category.title} mockup`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      {failed && <span className="tools-mockup-fallback">{category.title}</span>}
    </figure>
  );
}

function Panel({ category, index }: { category: ToolCategory; index: number }) {
  return (
    <div
      id="tools-panel"
      className="tools-panel"
      role="region"
      aria-label={`${category.title} skills`}
      style={{ "--shift": index - 2, "--tail": compactTail(index) } as CSSProperties}
    >
      <div className="tools-panel-card">
        {category.floaters.slice(0, FLOATER_SLOTS.length).map((floater, i) => {
          const slot = FLOATER_SLOTS[i];
          return (
            <span
              key={floater.slug}
              className="tools-floater"
              title={floater.name}
              style={
                {
                  "--ft": "top" in slot ? slot.top : "auto",
                  "--fb": "bottom" in slot ? slot.bottom : "auto",
                  "--fr": slot.right,
                  "--fs": `${slot.size}px`,
                  animationDelay: slot.delay,
                } as CSSProperties
              }
            >
              <img
                src={iconUrl(floater.slug)}
                alt={floater.name}
                loading="lazy"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
            </span>
          );
        })}
        <div className="tools-panel-body">
          <Mockup category={category} />
          <div className="tools-skills">
            <p className="subtitle-mono">{category.tagline}</p>
            <p className="tools-panel-quote">{category.description}</p>
            {category.groups.map((group) => (
              <div key={group.label} className="tools-group">
                <h4>{group.label}</h4>
                <ul>
                  {group.items.map((item) => (
                    <li key={item} className="tools-tag">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- /
/ Section                                                                    /
/ -------------------------------------------------------------------------- */
export default function Tools() {
  const [active, setActive] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<string>("mouse");
  const compact = useMediaQuery(COMPACT_QUERY);

  const hoverEnabled = !compact;

  useEffect(() => {
    if (active === null) return;
    const onDown = (e: PointerEvent) => {
      if (!dockRef.current?.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  useEffect(() => {
    if (!compact || active === null) return;
    const id = window.setTimeout(() => {
      const panel = document.getElementById("tools-panel");
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      const margin = 16;
      if (rect.top < margin || rect.bottom > window.innerHeight - margin) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }
    }, 80);
    return () => window.clearTimeout(id);
  }, [active, compact]);

  const handleClick = (e: MouseEvent, i: number) => {
    const hoverClick = hoverEnabled && lastPointer.current === "mouse" && e.detail > 0;
    setActive((prev) => (hoverClick ? i : prev === i ? null : i));
  };

  const activeCategory = active !== null ? toolCategories[active] : null;

  return (
    <section
      id="tools"
      className={`tools-section${activeCategory ? " has-active" : ""}`}
      aria-labelledby="tools-title"
    >
      <header className="process-header tools-dim">
        <p className="subtitle-mono">{toolsSection.eyebrow}</p>
        <h2 id="tools-title" className="tools-title">
          {toolsSection.title}
        </h2>
        <p className="process-intro">{toolsSection.description}</p>
      </header>

      {/* 👇 Now rendering the two distinct rows */}
      <div className="tools-marquee tools-dim" aria-label="Core technologies">
        <MarqueeRow tools={marqueeToolsRow1} />
        <MarqueeRow tools={marqueeToolsRow2} reverse />
      </div>

      <div
        ref={dockRef}
        className="tools-dock"
        onPointerLeave={(e) => {
          if (hoverEnabled && e.pointerType === "mouse") setActive(null);
        }}
      >
        {activeCategory && <Panel key={activeCategory.id} category={activeCategory} index={active!} />}
        <ul className="tools-icons">
          {toolCategories.map((cat, i) => {
            const isActive = active === i;
            return (
              <li
                key={cat.id}
                className={`tools-item${isActive ? " is-active" : " tools-dim"}`}
                onPointerEnter={(e) => {
                  lastPointer.current = e.pointerType;
                  if (hoverEnabled && e.pointerType === "mouse") setActive(i);
                }}
              >
                <button
                  type="button"
                  className="tools-icon-btn"
                  aria-expanded={isActive}
                  aria-controls={isActive ? "tools-panel" : undefined}
                  onPointerDown={(e) => (lastPointer.current = e.pointerType)}
                  onClick={(e) => handleClick(e, i)}
                >
                  <span className="tools-icon" aria-hidden="true">
                    {cat.icon}
                  </span>
                  <span className="tools-item-title">{cat.title}</span>
                </button>
                <p className="tools-item-desc">{cat.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}