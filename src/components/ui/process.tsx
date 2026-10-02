"use client";

import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import {
  processMeta,
  processPhases,
  type ProcessPhase,
} from "../../data/process";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

type SplitTextInstance = InstanceType<typeof SplitText>;

export type ProcessProps = {
  title?: string;
  periodLabel?: string;
  phases?: ProcessPhase[];
  imageUrl?: string;
  imageAlt?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  /** Reveal animation duration, in seconds. */
  duration?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false,
    () => false,
  );
}

/*
  Layout is driven by CSS variables (desktop first, overridden under 600px),
  so the track width and scroll length are derived from the phase count:

    --pad  side padding of the track      --img  image width
    --gap  gap between image and timeline --lbl  width of the title column
    --p    horizontal distance between consecutive phases (they alternate
           top / bottom, so same-side phases sit 2 x --p apart)
    --w    width of a phase's text block --end  empty space after the last phase
*/
const LAYOUT_VARS = [
  "[--pad:5vw] [--img:30vw] [--gap:5vw] [--lbl:30vw] [--p:22.5vw] [--w:28vw] [--end:10vw]",
  "max-[600px]:[--pad:7vw] max-[600px]:[--img:85vw] max-[600px]:[--gap:5vw] max-[600px]:[--lbl:75vw] max-[600px]:[--p:55vw] max-[600px]:[--w:70vw] max-[600px]:[--end:20vw]",
].join(" ");

export default function Process({
  title = processMeta.title,
  periodLabel = processMeta.periodLabel,
  phases = processPhases,
  imageUrl = processMeta.imageUrl,
  imageAlt = processMeta.imageAlt,
  textColor = "#0a0a0a",
  mutedTextColor = "#52525b",
  activeColor = "#ff5f00",
  backgroundColor = "#f4f3ec",
  duration = 1.2,
}: ProcessProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, duration);
  const count = phases.length;

  // Bumped when the viewport width changes so the text splits and scroll
  // ranges are rebuilt for the new layout.
  const [layoutKey, setLayoutKey] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let lastWidth = window.innerWidth;

    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        setLayoutKey((k) => k + 1);
      }, 250);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const slider = sliderRef.current;
    if (!section || !slider || count === 0) return;

    const splits: SplitTextInstance[] = [];

    const ctx = gsap.context(() => {
      const getDistance = () =>
        Math.max(0, slider.offsetWidth - window.innerWidth);

      // x position of an element inside the (translated) slider, in px.
      const xInSlider = (el: Element) =>
        el.getBoundingClientRect().left - slider.getBoundingClientRect().left;

      const sectionScroll = {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      };

      // Horizontal slide, spans the whole section scroll.
      gsap.fromTo(
        slider,
        { x: 0 },
        { x: () => -getDistance(), ease: "none", scrollTrigger: sectionScroll },
      );

      if (reducedMotion) return;

      // Axis line draws left to right, staying just ahead of the phases.
      const line = section.querySelector<HTMLElement>("[data-line]");
      if (line) {
        gsap.set(line, { transformOrigin: "0% 50%" });
        gsap.fromTo(
          line,
          {
            scaleX: () =>
              gsap.utils.clamp(
                0,
                1,
                (window.innerWidth * 0.55 - xInSlider(line)) / line.offsetWidth,
              ),
          },
          { scaleX: 1, ease: "none", scrollTrigger: sectionScroll },
        );
      }

      const d = normalizedDuration;
      const items = gsap.utils.toArray<HTMLElement>("[data-phase]", section);

      items.forEach((item, index) => {
        const isTop = index % 2 === 0;
        const stem = item.querySelector("[data-stem]");
        const dot = item.querySelector("[data-dot]");
        const titleEl = item.querySelector("[data-title]");
        const descEl = item.querySelector("[data-desc]");
        if (!stem || !dot || !titleEl || !descEl) return;

        gsap.set(stem, {
          scaleY: 0,
          transformOrigin: isTop ? "50% 100%" : "50% 0%",
        });
        gsap.set(dot, { scale: 0 });

        const titleSplit = new SplitText(titleEl, {
          type: "lines",
          mask: "lines",
        });
        const descSplit = new SplitText(descEl, {
          type: "lines",
          mask: "lines",
        });
        splits.push(titleSplit, descSplit);

        // Scroll range (px from the section start) in which this phase
        // reveals: from its dot sitting at 85% of the viewport width to 50%.
        const getRange = () => {
          const distance = getDistance();
          const vw = window.innerWidth;
          const minSpan = window.innerHeight * 0.35;
          const x = xInSlider(item);

          let start = Math.max(0, x - vw * 0.85);
          let end = Math.min(distance, Math.max(0, x - vw * 0.5));
          end = Math.min(distance, Math.max(end, start + minSpan));
          start = Math.max(0, Math.min(start, end - minSpan));

          return { start: Math.round(start), end: Math.round(end) };
        };

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: () => `top+=${getRange().start} top`,
              end: () => `top+=${getRange().end} top`,
              scrub: true,
            },
            defaults: { ease: "none" },
          })
          .to(stem, { scaleY: 1, duration: d * 0.4 })
          .to(dot, { scale: 1, duration: d * 0.4 }, "<")
          .fromTo(
            titleSplit.lines,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: d,
              stagger: 0.02,
              ease: "power2.out",
            },
            d * 0.2,
          )
          .fromTo(
            descSplit.lines,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: d,
              stagger: 0.02,
              ease: "power2.out",
            },
            "<",
          );
      });
    }, section);

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, [count, normalizedDuration, reducedMotion, layoutKey]);

  const sectionStyle = {
    color: textColor,
    backgroundColor,
    "--total": `calc(var(--pad) * 2 + var(--img) + var(--gap) + var(--lbl) + var(--p) * ${Math.max(count - 1, 0)} + var(--w) + var(--end))`,
    "--area": `calc(var(--lbl) + var(--p) * ${Math.max(count - 1, 0)} + var(--w) + var(--end))`,
    // Pinned height (100vh) + exactly the horizontal distance to travel.
    height: "max(100vh, calc(100vh + var(--total) - 100vw))",
  } as CSSProperties;

  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const mutedStyle: CSSProperties = { color: mutedTextColor };

  return (
    <section
      ref={sectionRef}
      id="process"
      className={`relative w-full ${LAYOUT_VARS}`}
      style={sectionStyle}
    >
      <div className="sticky top-0 h-screen w-screen overflow-hidden pt-[10%]">
        <div
          ref={sliderRef}
          className="flex h-[30vw] items-center max-[600px]:h-[75vh]"
          style={{
            width: "var(--total)",
            paddingInline: "var(--pad)",
            columnGap: "var(--gap)",
          }}
        >
          <div className="h-full w-[var(--img)] shrink-0 overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:rounded-[5vw]">
            <img
              src={imageUrl}
              alt={imageAlt}
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>

          <div
            className="relative h-full shrink-0"
            style={{ width: "var(--area)" }}
          >
            {/* Axis */}
            <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center">
              <div
                className="size-[.8vw] shrink-0 rounded-full max-[600px]:size-[2vw]"
                style={activeStyle}
              />
              <div
                data-line
                className="h-px flex-1"
                style={activeStyle}
              />
              <div
                className="size-[.8vw] shrink-0 rounded-full max-[600px]:size-[2vw]"
                style={activeStyle}
              />
            </div>

            {/* Title column */}
            <div
              className="absolute left-0 top-0 h-1/2 pr-[3vw] pt-[2vw] max-[600px]:pr-[7vw] max-[600px]:pt-[5vw]"
              style={{ width: "var(--lbl)" }}
            >
              <h2 className="text-[2.6vw] font-medium leading-[0.95] max-[600px]:text-[7.5vw]">
                {title}
              </h2>
            </div>
            <div
              className="absolute left-0 top-1/2 pt-[2vw] max-[600px]:pt-[5vw]"
              style={{ width: "var(--lbl)" }}
            >
              <p
                className="text-[1.65vw] leading-none max-[600px]:text-[4.2vw]"
                style={mutedStyle}
              >
                {periodLabel}
              </p>
            </div>

            {/* Phases: even index sits above the axis, odd index below */}
            {phases.map((phase, index) => {
              const isTop = index % 2 === 0;
              const number = String(index + 1).padStart(2, "0");

              const dot = (
                <div
                  data-dot
                  className="-ml-[.5vw] size-[1vw] shrink-0 rounded-full max-[600px]:-ml-[1.25vw] max-[600px]:size-[2.5vw]"
                  style={activeStyle}
                />
              );
              const stem = (
                <div
                  data-stem
                  className="w-px flex-1 rounded-full"
                  style={activeStyle}
                />
              );

              return (
                <div
                  key={`${index}-${phase.title}`}
                  data-phase
                  className={`absolute h-1/2 ${isTop ? "top-0" : "bottom-0"}`}
                  style={{
                    left: `calc(var(--lbl) + var(--p) * ${index})`,
                    width: "var(--w)",
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-start">
                    {isTop ? (
                      <>
                        {dot}
                        {stem}
                      </>
                    ) : (
                      <>
                        {stem}
                        {dot}
                      </>
                    )}
                  </div>

                  <div
                    className={`relative space-y-[1vw] pl-[3vw] pr-[1vw] max-[600px]:space-y-[2vw] max-[600px]:pl-[7vw] ${
                      isTop ? "" : "flex h-full flex-col justify-end"
                    }`}
                  >
                    <h4
                      data-title
                      className="text-[2.2vw] leading-none max-[600px]:text-[6vw]"
                    >
                      {`${number} - ${phase.title}`}
                    </h4>
                    <p
                      data-desc
                      className="w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:text-[4.8vw]"
                      style={mutedStyle}
                    >
                      {phase.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}