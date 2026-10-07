import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { marqueeTools, toolCategories, toolsSection } from "../../data/tools";
import type { MarqueeTool, ToolCategory } from "../../data/tools";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const iconUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

/** Positions for the bubbles that float around the panel (outside its edge). */
const FLOATER_SLOTS = [
  { top: "-22px", right: "-18px", size: 56, delay: "0s" },
  { top: "26%", right: "-34px", size: 68, delay: "-1.4s" },
  { top: "52%", right: "-16px", size: 48, delay: "-2.6s" },
  { top: "74%", right: "-30px", size: 40, delay: "-0.8s" },
  { bottom: "-20px", right: "22%", size: 44, delay: "-3.2s" },
] as const;

/* -------------------------------------------------------------------------- */
/* Marquee                                                                    */
/* -------------------------------------------------------------------------- */

const MARQUEE_COPIES = 4; // two copies = one full loop; four keeps ultrawide screens filled

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

/* -------------------------------------------------------------------------- */
/* Panel (angled container: mockup + skills + floating logos)                 */
/* -------------------------------------------------------------------------- */

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
      style={{ "--shift": index - 2 } as CSSProperties}
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
                  top: "top" in slot ? slot.top : undefined,
                  bottom: "bottom" in slot ? slot.bottom : undefined,
                  right: slot.right,
                  width: slot.size,
                  height: slot.size,
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
            {/* On mobile the description lives here, since the icon row is too narrow */}
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

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export default function Tools() {
  const [active, setActive] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<string>("mouse");

  // Tap outside / Escape closes (needed for touch, where there is no hover-out)
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

  const handleClick = (e: MouseEvent, i: number) => {
    // Mouse: hover already opened it, so a click shouldn't close it again.
    // Touch / pen / keyboard: click toggles.
    const isMouse = lastPointer.current === "mouse" && e.detail > 0;
    setActive((prev) => (isMouse ? i : prev === i ? null : i));
  };

  const activeCategory = active !== null ? toolCategories[active] : null;
  const row2 = [...marqueeTools.slice(4), ...marqueeTools.slice(0, 4)];

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

      <div className="tools-marquee tools-dim" aria-label="Core technologies">
        <MarqueeRow tools={marqueeTools} />
        <MarqueeRow tools={row2} reverse />
      </div>

      <div
        ref={dockRef}
        className="tools-dock"
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setActive(null);
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
                  if (e.pointerType === "mouse") setActive(i);
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