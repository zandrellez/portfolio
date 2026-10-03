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

const LAYOUT_VARS = [
  "[--pad:5vw] [--img:30vw] [--gap:5vw] [--lbl:30vw] [--p:22.5vw] [--w:28vw] [--end:10vw] [--t-left:0px] [--t-width:var(--lbl)]",
  "max-md:[--pad:7vw] max-md:[--img:85vw] max-md:[--gap:15vw] max-md:[--lbl:0vw] max-md:[--p:65vw] max-md:[--w:75vw] max-md:[--end:20vw] max-md:[--t-left:calc(-1*(var(--img)+var(--gap)))] max-md:[--t-width:85vw]",
].join(" ");

export default function Process({
  title = processMeta.title,
  periodLabel = processMeta.periodLabel,
  phases = processPhases,
  imageUrl = processMeta.imageUrl,
  imageAlt = processMeta.imageAlt,
  textColor = "var(--text-h)",
  mutedTextColor = "var(--text)",
  activeColor = "var(--accent)",
  backgroundColor = "var(--bg)",
  duration = 1.2,
}: ProcessProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, duration);
  const count = phases.length;

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

      const xInSlider = (el: Element) =>
        el.getBoundingClientRect().left - slider.getBoundingClientRect().left;

      const sectionScroll = {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      };

      gsap.fromTo(
        slider,
        { x: 0 },
        { x: () => -getDistance(), ease: "none", scrollTrigger: sectionScroll },
      );

      if (reducedMotion) return;

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
    backgroundColor,
    "--total": `calc(var(--pad) * 2 + var(--img) + var(--gap) + var(--lbl) + var(--p) * ${Math.max(count - 1, 0)} + var(--w) + var(--end))`,
    "--area": `calc(var(--lbl) + var(--p) * ${Math.max(count - 1, 0)} + var(--w) + var(--end))`,
    height: "max(100vh, calc(100vh + var(--total) - 100vw))",
  } as CSSProperties;

  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const titleStyle: CSSProperties = { color: textColor };
  const mutedStyle: CSSProperties = { color: mutedTextColor };

  return (
    <section
      ref={sectionRef}
      id="process"
      className={`relative w-full border-t border-[var(--border)] ${LAYOUT_VARS}`}
      style={sectionStyle}
    >
      <div className="sticky top-0 h-screen w-screen overflow-hidden pt-[10%] max-md:pt-[15%]">
        <div
          ref={sliderRef}
          className="flex h-[30vw] items-center max-md:h-[65vh]"
          style={{
            width: "var(--total)",
            paddingInline: "var(--pad)",
            columnGap: "var(--gap)",
          }}
        >
          {/* Main Image */}
          <div className="h-full w-[var(--img)] shrink-0 overflow-hidden rounded-[1vw] max-md:h-[60vw] max-md:rounded-[5vw]">
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
            {/* Horizontal Axis */}
            <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center">
              <div
                className="size-[.8vw] shrink-0 rounded-full max-md:size-[2vw]"
                style={activeStyle}
              />
              <div
                data-line
                className="h-px flex-1"
                style={activeStyle}
              />
              <div
                className="size-[.8vw] shrink-0 rounded-full max-md:size-[2vw]"
                style={activeStyle}
              />
            </div>

            <div
              className="absolute top-0 md:h-1/2 pr-[3vw] pt-[2vw] max-md:pr-0 max-md:pt-0"
              style={{ width: "var(--t-width)", left: "var(--t-left)" }}
            >
              <h2 className="text-[2.6vw] font-bold leading-[0.95] max-md:text-[10vw]" style={titleStyle}>
                {title}
              </h2>
              <p
                className="mt-[1.5vw] text-[16px] uppercase tracking-widest max-md:mt-[3vw]"
                style={mutedStyle}
              >
                // {periodLabel}
              </p>
            </div>

            {/* Alternating Phases */}
            {phases.map((phase, index) => {
              const isTop = index % 2 === 0;
              const number = String(index + 1).padStart(2, "0");

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
                        <div
                          data-dot
                          className="-ml-[.5vw] size-[1vw] shrink-0 rounded-full max-md:-ml-[1.25vw] max-md:size-[2.5vw]"
                          style={activeStyle}
                        />
                        <div
                          data-stem
                          className="w-px flex-1 rounded-full"
                          style={activeStyle}
                        />
                      </>
                    ) : (
                      <>
                        <div
                          data-stem
                          className="w-px flex-1 rounded-full"
                          style={activeStyle}
                        />
                        <div
                          data-dot
                          className="-ml-[.5vw] size-[1vw] shrink-0 rounded-full max-md:-ml-[1.25vw] max-md:size-[2.5vw]"
                          style={activeStyle}
                        />
                      </>
                    )}
                  </div>

                  <div
                    className={`relative space-y-[1vw] pl-[3vw] pr-[1vw] max-md:space-y-[3vw] max-md:pl-[6vw] ${
                      isTop ? "pt-[2vw] max-md:pt-[4vw]" : "flex h-full flex-col justify-end pb-[2vw] max-md:pb-[4vw]"
                    }`}
                  >
                    <h4
                      data-title
                      className="text-[2.2vw] font-bold leading-tight max-md:text-[6.5vw]"
                      style={titleStyle}
                    >
                      {number} <span style={{ opacity: 0.4 }}>&mdash;</span> {phase.title}
                    </h4>
                    <p
                      data-desc
                      className="w-[90%] text-[16px] leading-[1.6] max-md:text-[14px] max-md:w-full"
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