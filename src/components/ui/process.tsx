"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  processMeta,
  processPhases,
  type ProcessPhase,
} from "../../data/process";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// All styling lives in index.css (.process-* classes). Colors come from its
// CSS variables (--accent, --surface, --border, ...), so dark mode works too.

export type ProcessProps = {
  title?: string;
  periodLabel?: string;
  intro?: string;
  phases?: ProcessPhase[];
};

/** The line's tip sits at this fraction of the viewport height. */
const ANCHOR = 0.6;
/** Dash offset (in pathLength units) that keeps the line fully hidden. */
const HIDDEN_OFFSET = 1.01;
const DESKTOP_QUERY = "(min-width: 768px)";
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

type Point = { x: number; y: number };

/** Deterministic pseudo-random in [0, 1): hand-drawn look that never changes between renders. */
function rand(i: number, k: number) {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Builds the line through every node.
 * Desktop: loose S-curves swinging between left and right nodes.
 * Mobile: a straight vertical line.
 * Control points are ordered so the line only ever moves downward, which lets
 * us map a screen y-position to "how much of the line is drawn".
 */
function buildPath(points: Point[], width: number, height: number, wide: boolean) {
  if (points.length === 0) return "";

  const first = points[0];
  const last = points[points.length - 1];
  const startY = Math.max(6, first.y - 110);
  const endY = Math.min(height - 6, last.y + 110);

  if (!wide) return `M ${first.x} ${startY} L ${first.x} ${endY}`;

  const f = (n: number) => n.toFixed(1);

  const segment = (a: Point, b: Point, i: number) => {
    const dy = b.y - a.y;
    const c1y = a.y + dy * (0.3 + 0.12 * rand(i, 1));
    const c2y = a.y + dy * (0.58 + 0.12 * rand(i, 2));
    const c1x = a.x + (rand(i, 3) - 0.5) * width * 0.07;
    const c2x = b.x + (rand(i, 4) - 0.5) * width * 0.07;
    return ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(b.x)} ${f(b.y)}`;
  };

  const center = width / 2;
  let d = `M ${f(center)} ${f(startY)}`;
  d += segment({ x: center, y: startY }, first, -1);
  for (let i = 0; i < points.length - 1; i++) {
    d += segment(points[i], points[i + 1], i);
  }
  d += segment(last, { x: center, y: endY }, points.length);
  return d;
}

export default function Process({
  title = processMeta.title,
  periodLabel = processMeta.periodLabel,
  intro = processMeta.intro,
  phases = processPhases,
}: ProcessProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const count = phases.length;

  // Bumped when the layout may have changed (width change, fonts loaded) so the
  // line is redrawn through the nodes' new positions.
  const [layoutKey, setLayoutKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
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
    document.fonts?.ready.then(() => {
      if (!cancelled) setLayoutKey((k) => k + 1);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const svg = svgRef.current;
    if (!track || !svg || count === 0) return;

    const wide = window.matchMedia(DESKTOP_QUERY).matches;
    const steps = Array.from(track.querySelectorAll<HTMLElement>("[data-step]"));
    const drawPath = svg.querySelector<SVGPathElement>("[data-draw]");
    const tip = svg.querySelector<SVGGElement>("[data-tip]");

    const ctx = gsap.context(() => {
      // 1. Draw the route through the real node positions.
      const width = track.offsetWidth;
      const height = track.offsetHeight;
      const trackRect = track.getBoundingClientRect();

      const points = steps.map((step) => {
        const r = step.querySelector("[data-node-wrap]")!.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - trackRect.left,
          y: r.top + r.height / 2 - trackRect.top,
        };
      });

      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const d = buildPath(points, width, height, wide);
      svg
        .querySelectorAll<SVGPathElement>("[data-path]")
        .forEach((p) => p.setAttribute("d", d));

      if (reducedMotion) {
        // Fully drawn and revealed, no scroll-linked motion.
        steps.forEach((s) => s.classList.add("is-lit"));
        return;
      }
      if (!drawPath || !tip) return;

      // 2. Map a y-position on the line to a 0..1 draw progress.
      const total = drawPath.getTotalLength();
      const SAMPLES = 240;
      const ys = new Float32Array(SAMPLES + 1);
      for (let k = 0; k <= SAMPLES; k++) {
        ys[k] = drawPath.getPointAtLength((total * k) / SAMPLES).y;
      }

      const progressForY = (y: number) => {
        if (y <= ys[0]) return 0;
        if (y >= ys[SAMPLES]) return 1;
        let lo = 0;
        let hi = SAMPLES;
        while (hi - lo > 1) {
          const mid = (lo + hi) >> 1;
          if (ys[mid] <= y) lo = mid;
          else hi = mid;
        }
        const t = (y - ys[lo]) / Math.max(1e-6, ys[hi] - ys[lo]);
        return (lo + t) / SAMPLES;
      };

      // Progress at which the line's tip touches each node.
      const thresholds = points.map((pt) => progressForY(pt.y) - 0.003);

      // 3. One paused timeline per step: number pops in, card slides in.
      const lit: boolean[] = steps.map(() => false);
      const timelines = steps.map((step, i) => {
        const dot = step.querySelector("[data-dot]");
        const ring = step.querySelector("[data-ring]");
        const card = step.querySelector("[data-card]");
        const items = step.querySelectorAll("[data-item]");
        const fromX = wide ? (i % 2 === 0 ? -50 : 50) : 40;

        return gsap
          .timeline({ paused: true })
          .fromTo(
            dot,
            { opacity: 0, scale: 0.7 },
            { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)" },
            0,
          )
          .fromTo(
            ring,
            { opacity: 0.65, scale: 1 },
            {
              opacity: 0,
              scale: 2.2,
              duration: 0.9,
              ease: "power2.out",
              immediateRender: false,
            },
            0.05,
          )
          .fromTo(
            card,
            { opacity: 0, x: fromX },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
            0.12,
          )
          .fromTo(
            items,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.07 },
            0.3,
          );
      });

      const setLit = (i: number, on: boolean, instant: boolean) => {
        steps[i].classList.toggle("is-lit", on);
        const tl = timelines[i];
        if (instant) tl.progress(on ? 1 : 0).pause();
        else if (on) tl.timeScale(1).play();
        else tl.timeScale(1.8).reverse();
      };

      // 4. Render the line from `proxy.p`. Numbers react to the line that is
      //    actually on screen (not the raw scroll), so they pop exactly when
      //    the tip touches them, even while the line is easing toward its target.
      const proxy = { p: 0 };

      const render = (instant = false) => {
        const p = proxy.p;
        drawPath.style.strokeDashoffset = String(HIDDEN_OFFSET * (1 - p));

        const pt = drawPath.getPointAtLength(total * p);
        tip.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        tip.style.opacity = p > 0.003 && p < 0.997 ? "1" : "0";

        steps.forEach((_, i) => {
          const on = p >= thresholds[i];
          if (on !== lit[i]) {
            lit[i] = on;
            setLit(i, on, instant);
          }
        });
      };

      const getTarget = () =>
        progressForY(window.innerHeight * ANCHOR - track.getBoundingClientRect().top);

      const jumpToTarget = () => {
        gsap.killTweensOf(proxy);
        proxy.p = getTarget();
        render(true);
      };

      jumpToTarget();

      ScrollTrigger.create({
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => {
          gsap.to(proxy, {
            p: getTarget(),
            duration: 0.5,
            ease: "power3.out",
            overwrite: true,
            onUpdate: () => render(),
          });
        },
        onRefresh: jumpToTarget,
      });
    }, track);

    return () => {
      ctx.revert();
      steps.forEach((s) => s.classList.remove("is-lit"));
      drawPath?.style.removeProperty("stroke-dashoffset");
      tip?.style.removeProperty("opacity");
    };
  }, [count, reducedMotion, layoutKey]);

  return (
    <section id="process" className="process-section">
      <header className="process-header">
        <span className="subtitle-mono">{periodLabel}</span>
        <h2>{title}</h2>
        {intro ? <p className="process-intro">{intro}</p> : null}
      </header>

      <div ref={trackRef} className="process-track">
        <svg ref={svgRef} className="process-svg" aria-hidden>
          <path data-path className="process-guide" />
          <path
            data-path
            data-draw
            className="process-draw"
            pathLength={1}
            strokeDasharray="1 2"
            strokeDashoffset={0}
          />
          <g data-tip className="process-tip">
            <circle r={16} className="process-tip-glow" />
            <circle r={5} className="process-tip-core" />
          </g>
        </svg>

        {phases.map((phase, index) => {
          const number = String(index + 1).padStart(2, "0");

          return (
            <div
              key={`${index}-${phase.title}`}
              data-step
              className={`process-step ${index % 2 === 0 ? "is-left" : "is-right"}`}
            >
              <div data-node-wrap className="process-node">
                <span data-ring className="process-ring" />
                <div data-dot className="process-dot">
                  {index + 1}
                </div>
              </div>

              <div data-card className="process-card">
                <article className="process-card-inner" data-index={number}>
                  <span data-item className="subtitle-mono">
                    Step {number}
                  </span>
                  <h3 data-item>{phase.title}</h3>
                  <p data-item>{phase.description}</p>
                  {phase.tags?.length ? (
                    <ul data-item className="process-tags">
                      {phase.tags.map((tag) => (
                        <li key={tag} className="process-tag">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}