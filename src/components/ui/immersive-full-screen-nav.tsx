"use client";

import gsap from "gsap";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/nav.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isVisible = (element?: HTMLElement | null): boolean => {
  if (!element || element.hidden) return false;
  const style = window.getComputedStyle(element);
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;
  return element.getClientRects().length > 0;
};

const getFocusableElements = (container?: HTMLElement | null): HTMLElement[] => {
  if (!container) return [];
  return (Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[]).filter(isVisible);
};

interface UseFocusTrapParams {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
}

function useFocusTrap({ active, containerRef, initialFocusRef, onEscape }: UseFocusTrapParams) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusInitial = () => {
      const target = initialFocusRef?.current ?? getFocusableElements(container)[0] ?? container;
      if (!(target instanceof HTMLElement)) return;
      if (target === container && !container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
      }
      target.focus();
    };

    const focusFrame = requestAnimationFrame(focusInitial);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(container);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (activeElement === last || !container.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, initialFocusRef]);
}

const CLIPS = {
  bottom: {
    closedInitial: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  },
  top: {
    closedInitial: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
  },
  left: {
    closedInitial: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
  },
  right: {
    closedInitial: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
  },
};

export interface FullscreenNavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FullscreenNavProps {
  links?: FullscreenNavLink[];
  brand?: string;
  logoHref?: string;
  logoSrc?: string;
  clipOrigin?: keyof typeof CLIPS;
  overlayBg?: string;
  linkColor?: string;
  linkHoverColor?: string;
  openDuration?: number;
  closeDuration?: number;
  ease?: string;
  headerOpenColor?: string;
  headerClosedColor?: string;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  children?: (isOpen: boolean, onClose: () => void) => ReactNode;
}

function FullscreenNav({
  brand = "ZOE ZAMORA.",
  logoSrc = "assets/zz.png",
  clipOrigin = "right",
  overlayBg = "#1a211b",
  openDuration = 1.2,
  closeDuration = 1.2,
  ease = "power4.inOut",
  headerOpenColor = "#fdfdf5",
  headerClosedColor = "#1a211b",
  theme = "light",
  onThemeToggle,
  onOpen,
  onClose,
  children,
}: FullscreenNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const overlayRef = useRef<HTMLElement | null>(null);
  const linksWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const { closedInitial, open: openClipPath, closedFinal } = CLIPS[clipOrigin] ?? CLIPS.right;

  const onOpenMenu = () => {
    setIsOpen(true);
    timelineRef.current?.kill();

    gsap.set(overlayRef.current, { clipPath: closedInitial });
    gsap.set(linksWrapperRef.current, { opacity: 1, scale: 1 });

    const timeline = gsap.timeline({
      onStart: () => {
        isAnimatingRef.current = true;
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        onOpen?.();
      },
    });

    timelineRef.current = timeline;

    timeline.to(overlayRef.current, {
      clipPath: openClipPath,
      duration: openDuration,
      delay: 0.15,
      ease,
    });
  };

  const onCloseMenu = () => {
    setIsOpen(false);
    timelineRef.current?.kill();

    const timeline = gsap.timeline({
      onStart: () => {
        isAnimatingRef.current = true;
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        onClose?.();
      },
    });

    timelineRef.current = timeline;

    timeline
      .to(linksWrapperRef.current, { scale: 0.95, opacity: 0.5, duration: 0.6, ease: "power2.in" })
      .to(overlayRef.current, { clipPath: closedFinal, duration: closeDuration, ease }, "<");
  };

  const onToggleMenu = () => {
    if (isAnimatingRef.current) return;
    if (isOpen) {
      onCloseMenu();
    } else {
      onOpenMenu();
    }
  };

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isOpen) onCloseMenu();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useFocusTrap({ active: isOpen, containerRef: rootRef, initialFocusRef: toggleButtonRef, onEscape: onCloseMenu });

  const resolvedLogoSrc = logoSrc.startsWith("http")
    ? logoSrc
    : `${import.meta.env.BASE_URL}${logoSrc.replace(/^\//, "")}`;

  return (
    <div ref={rootRef}>
      <header
        className={`nav-header ${isOpen || isScrolled ? "is-visible" : ""} ${isOpen ? "is-open" : ""}`}
      >
        <a
          href={`${import.meta.env.BASE_URL}`}
          onClick={handleLogoClick}
          className="nav-logo"
          aria-label="Home"
        >
          {logoSrc ? (
            <img src={resolvedLogoSrc} alt="Logo" className="nav-logo-img" />
          ) : (
            <span className="nav-logo-text" style={{ color: headerOpenColor }}>
              {brand}
            </span>
          )}
        </a>

        <div className="nav-controls">
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="nav-theme-btn"
            style={{ color: isOpen ? headerOpenColor : "var(--text-h)" }}
          >
            {theme === "dark" ? (
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />
              </svg>
            )}
          </button>

          <button
            ref={toggleButtonRef}
            onClick={onToggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="nav-burger-btn"
          >
            <span
              style={{
                backgroundColor: isOpen ? headerOpenColor : headerClosedColor,
                transform: isOpen ? "translateY(8px) rotate(45deg)" : "none",
              }}
              className="nav-burger-line"
            />
            <span
              style={{
                backgroundColor: isOpen ? headerOpenColor : headerClosedColor,
                transform: isOpen ? "scaleX(0)" : "scaleX(1)",
                opacity: isOpen ? 0 : 1,
              }}
              className="nav-burger-line"
            />
            <span
              style={{
                backgroundColor: isOpen ? headerOpenColor : headerClosedColor,
                transform: isOpen ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
              className="nav-burger-line"
            />
          </button>
        </div>
      </header>

      <nav
        ref={overlayRef}
        style={{ clipPath: closedInitial, backgroundColor: overlayBg }}
        className={`nav-overlay ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isOpen}
        role="navigation"
      >
        <div ref={linksWrapperRef} className="w-full">
          {children && children(isOpen, onCloseMenu)}
        </div>
      </nav>
    </div>
  );
}

const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  github: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

export interface CustomNavbarLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface CustomNavbarProps {
  links?: CustomNavbarLink[];
  images?: string[];
  socials?: { type: string; href: string }[];
  location?: string;
  tagline?: string;
  isOpen?: boolean;
  onClose?: () => void;
  overlayBg?: string;
  delay?: number;
}

function CustomNavbar({
  links = [],
  images = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1000&auto=format&fit=crop",
  ],
  socials = [
    { type: "instagram", href: "https://www.instagram.com/zandrellez" },
    { type: "facebook", href: "https://www.facebook.com/zandrellez" },
    { type: "github", href: "https://github.com/zandrellez" },
    { type: "linkedin", href: "https://www.linkedin.com/in/zandrellez" },
  ],
  location: locationText = "Rodriguez, Rizal, Philippines",
  tagline = "Engineering clarity out of complexity.",
  isOpen = false,
  onClose,
  overlayBg = "#1a211b",
  delay = 1,
}: CustomNavbarProps) {
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const socialsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const locationRef = useRef<HTMLSpanElement | null>(null);
  const navigate = useNavigate();
  const currentLocation = useLocation();

  useEffect(() => {
    gsap.killTweensOf([
      ...linksRef.current,
      ...imagesRef.current,
      ...socialsRef.current,
      taglineRef.current,
      locationRef.current,
    ]);

    if (!isOpen) return;

    gsap.set(linksRef.current, { y: 24, opacity: 0 });
    gsap.set(imagesRef.current, { scale: 0.85, opacity: 0 });
    gsap.set(socialsRef.current, { y: 14, opacity: 0 });
    gsap.set(taglineRef.current, { y: -10, opacity: 0 });
    gsap.set(locationRef.current, { y: 10, opacity: 0 });

    const animDelay = Math.max(delay - 0.2, 0.4);

    gsap.to(taglineRef.current, { y: 0, opacity: 0.7, duration: 0.6, ease: "power2.out", delay: animDelay });
    gsap.to(linksRef.current, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", stagger: 0.06, delay: animDelay + 0.05 });
    gsap.to(imagesRef.current, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: animDelay + 0.1 });
    gsap.to(socialsRef.current, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.05, delay: animDelay + 0.2 });
    gsap.to(locationRef.current, { y: 0, opacity: 0.5, duration: 0.5, ease: "power2.out", delay: animDelay + 0.25 });
  }, [isOpen, delay]);

  const handleLinkClick = (link: CustomNavbarLink) => (e: MouseEvent<HTMLAnchorElement>) => {
    onClose?.();

    // If opening the PDF / external link in a new tab:
    if (link.external) {
      e.preventDefault();
      window.open(link.href, "_blank", "noopener,noreferrer");
      return;
    }

    // Home navigation
    if (link.href === "/" || link.href === "#home") {
      e.preventDefault();
      if (currentLocation.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    // All Works page
    if (link.href === "/all-works") {
      e.preventDefault();
      navigate("/all-works");
      return;
    }

    // Contact anchor scroll
    if (link.href.includes("#contact")) {
      e.preventDefault();
      if (currentLocation.pathname !== "/") {
        navigate("/#contact");
      } else {
        const contactEl = document.getElementById("contact");
        if (contactEl) {
          contactEl.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.hash = "contact";
        }
      }
    }
  };

  return (
    <div style={{ backgroundColor: overlayBg, color: "var(--nav-text)" }} className="nav-container">
      <div className="nav-grid">
        <div className="nav-links-list">
          {links.map((link, index) => (
            <div
              key={link.label}
              ref={(el) => { linksRef.current[index] = el; }}
              className="nav-link-row"
            >
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={handleLinkClick(link)}
                className="nav-link-anchor"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>

        <div className="nav-right-col">
          {tagline && (
            <p ref={taglineRef} className="nav-tagline">
              {tagline}
            </p>
          )}

          <div className="nav-cards">
            {[
              { src: images[0], label: "Web & Mobile", href: "/all-works" },
              { src: images[1], label: "AI Automation", href: "/all-works" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                ref={(el) => { imagesRef.current[index] = el; }}
                onClick={(e) => {
                  e.preventDefault();
                  onClose?.();
                  navigate(item.href);
                }}
                className="nav-card-item"
              >
                <img src={item.src} alt={item.label} />
                <div className="nav-card-caption">
                  <span>{item.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="nav-footer">
        <div className="nav-socials">
          {socials.map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              ref={(el) => { socialsRef.current[index] = el; }}
            >
              {SOCIAL_ICONS[social.type]}
            </a>
          ))}
        </div>
        {locationText && (
          <span ref={locationRef} className="nav-location">
            {locationText}
          </span>
        )}
      </div>
    </div>
  );
}

export interface ImmersiveFullscreenNavProps {
  navConfig?: Partial<FullscreenNavProps>;
  navContent?: Partial<CustomNavbarProps>;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export default function ImmersiveFullscreenNav({
  navConfig = {},
  navContent = {},
  theme = "light",
  onThemeToggle,
}: ImmersiveFullscreenNavProps) {
  const config = {
    brand: "ZOE ZAMORA.",
    logoSrc: "assets/zz.png",
    clipOrigin: "right" as const,
    overlayBg: "var(--nav-bg)",
    headerOpenColor: "var(--nav-text)",
    headerClosedColor: "var(--text-h)",
    openDuration: 1.1,
    closeDuration: 0.9,
    theme,
    onThemeToggle,
    ...navConfig,
  };

  const resumeHref = `${import.meta.env.BASE_URL}resume.pdf`;

  const content = {
    tagline: "Engineering clarity out of complexity.",
    location: "Rodriguez, Rizal, Philippines",
    links: [
      { label: "Home", href: "/" },
      { label: "Work", href: "/all-works" },
      { label: "Contact", href: "/#contact" },
      { label: "Resume", href: resumeHref, external: true },
    ],
    ...navContent,
  };

  return (
    <FullscreenNav {...config}>
      {(isOpen, onClose) => (
        <CustomNavbar
          {...content}
          isOpen={isOpen}
          onClose={onClose}
          overlayBg={config.overlayBg}
          delay={config.openDuration}
        />
      )}
    </FullscreenNav>
  );
}