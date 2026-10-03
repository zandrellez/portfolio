"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-contact-wrapper {
  --pill-bg-1: color-mix(in oklch, var(--text-h) 6%, var(--surface));
  --pill-bg-2: color-mix(in oklch, var(--text-h) 2%, var(--surface));
  --pill-shadow: color-mix(in oklch, var(--text-h) 12%, transparent);
  --pill-highlight: color-mix(in oklch, var(--text-h) 15%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--bg) 90%, transparent);
  --pill-border: color-mix(in oklch, var(--text-h) 18%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, var(--text-h) 12%, var(--surface));
  --pill-bg-2-hover: color-mix(in oklch, var(--text-h) 6%, var(--surface));
  --pill-border-hover: var(--accent);
  --pill-shadow-hover: color-mix(in oklch, var(--text-h) 20%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--accent) 30%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px var(--accent-glow)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px var(--accent-glow)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 35s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.contact-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--text-h) 8%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--text-h) 8%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
}

.contact-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    var(--accent-glow) 0%,
    color-mix(in oklch, var(--accent) 10%, transparent) 40%,
    transparent 70%
  );
}

.contact-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 12px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1.5px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.contact-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--text-h);
}

.contact-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1.5px color-mix(in oklch, var(--text-h) 10%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--text-h) 18%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.contact-text-glow {
  background: linear-gradient(180deg, var(--text-h) 0%, color-mix(in oklch, var(--text-h) 65%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 25px var(--accent-glow));
}
`;

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={`cursor-pointer ${className || ""}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6 font-mono text-xs tracking-[0.3em] uppercase text-[var(--text-h)] font-semibold opacity-90">
    <span>Full-Stack Architecture</span> <span className="text-[var(--accent)] font-bold">✦</span>
    <span>Security-First</span> <span className="text-[var(--accent)] font-bold">✦</span>
    <span>AI & Automation</span> <span className="text-[var(--accent)] font-bold">✦</span>
    <span>Systems Design</span> <span className="text-[var(--accent)] font-bold">✦</span>
    <span>Mobile & Web Dev</span> <span className="text-[var(--accent)] font-bold">✦</span>
  </div>
);

export default function ContactSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        id="contact"
        ref={wrapperRef}
        className="relative h-screen w-full cinematic-contact-wrapper"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-[var(--bg)] text-[var(--text)]">

          {/* Ambient Glow & Grid Background */}
          <div className="contact-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="contact-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="contact-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none uppercase font-black"
          >
            ZAMORA
          </div>

          {/* 1. Diagonal Marquee */}
          <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-[var(--border)] bg-[var(--surface-raised)] backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-lg">
            <div className="flex w-max animate-footer-scroll-marquee">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto text-center">
            
            {/* Timezone & Location Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full contact-glass-pill text-[var(--text-h)] font-mono text-xs tracking-wider uppercase mb-6 shadow-md font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Rodriguez, Rizal, PH &bull; UTC+8
            </div>

            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black contact-text-glow tracking-tighter mb-10 text-[var(--text-h)]"
            >
              Ready to collaborate?
            </h2>

            {/* Interactive Magnetic Buttons */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full max-w-2xl">
              
              {/* Primary Action Pills */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton 
                  as="a" 
                  href="https://calendly.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="contact-glass-pill px-8 py-5 rounded-full text-[var(--text-h)] font-bold text-sm md:text-base flex items-center gap-3 group shadow-md"
                >
                  <span className="text-[var(--text-h)]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                  </span>
                  Book Discovery Call
                </MagneticButton>

                <MagneticButton 
                  as="a" 
                  href="mailto:hello@zoezamora.com" 
                  className="contact-glass-pill px-8 py-5 rounded-full text-[var(--text-h)] font-bold text-sm md:text-base flex items-center gap-3 group shadow-md"
                >
                  <span className="text-[var(--text-h)]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  Send Direct Email
                </MagneticButton>
              </div>

              {/* Social Links Secondary Row */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full mt-2">
                {[
                  { label: "GitHub", href: "https://github.com/zandrellez" },
                  { label: "LinkedIn", href: "https://www.linkedin.com/in/zandrellez" },
                  { label: "Facebook", href: "https://www.facebook.com/zandrellez" },
                  { label: "Instagram", href: "https://www.instagram.com/zandrellez" },
                ].map((social) => (
                  <MagneticButton 
                    key={social.label}
                    as="a" 
                    href={social.href} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="contact-glass-pill px-6 py-3 rounded-full text-[var(--text-h)] font-mono text-xs uppercase tracking-wider font-semibold hover:text-[var(--text-h)] shadow-sm"
                  >
                    {social.label}
                  </MagneticButton>
                ))}
              </div>

            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="text-[var(--text-h)] text-[10px] md:text-xs font-mono tracking-widest uppercase order-2 md:order-1 font-semibold opacity-80">
              &copy; 2026 ZOE ZAMORA. ALL RIGHTS RESERVED.
            </div>

            <MagneticButton
              as="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="w-12 h-12 rounded-full contact-glass-pill flex items-center justify-center text-[var(--text-h)] group order-3 shadow-md"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
}