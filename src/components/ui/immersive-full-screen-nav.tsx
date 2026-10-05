// Built using Hyperiux Vault: <https://vault.hyperiux.com>
"use client";

import gsap from "gsap";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState, type RefObject } from "react";

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

// Restored all clip paths to satisfy TypeScript constraints
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

const REDUCED_MOTION_FADE_DURATION = 0.2;

export interface FullscreenNavLink {
  label: string;
  href: string;
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
  linkSizeClass?: string;
  headerClassName?: string;
  openDuration?: number;
  closeDuration?: number;
  ease?: string;
  headerOpenColor?: string;
  headerClosedColor?: string;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  children?: (isOpen: boolean) => ReactNode;
}

function FullscreenNav({
  links,
  brand = "ZOE ZAMORA.",
  logoHref = "/",
  logoSrc = "/logo.png", // ADD YOUR PNG PATH HERE
  clipOrigin = "bottom",
  overlayBg = "#1a211b",
  linkColor = "#fdfdf5",
  linkHoverColor = "#93ab92",
  linkSizeClass = "text-5xl",
  headerClassName = "",
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
  const [isScrolled, setIsScrolled] = useState(false); // NEW: Track scroll state

  // NEW: Listen for scroll to hide/show the navbar
  useEffect(() => {
    const handleScroll = () => {
      // Reveal navbar after scrolling down 50 pixels (as the hero shrinks)
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const overlayRef = useRef<HTMLElement | null>(null);
  const linksWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  const { closedInitial, open: openClipPath, closedFinal } = CLIPS[clipOrigin] ?? CLIPS.bottom;
  const isReducedMotion = reduceMotion();

  const onOpenMenu = () => {
    setIsOpen(true);
    timelineRef.current?.kill();

    gsap.set(overlayRef.current, { clipPath: closedInitial });
    gsap.set(linksWrapperRef.current, { opacity: 1, scale: 1 });

    if (isReducedMotion) {
      gsap.set(overlayRef.current, { clipPath: openClipPath, autoAlpha: 0 });

      timelineRef.current = gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: REDUCED_MOTION_FADE_DURATION,
        ease: "power2.out",
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          onOpen?.();
        },
      });
      return;
    }

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
      delay: 0.2,
      ease,
    });
  };

  const onCloseMenu = () => {
    setIsOpen(false);
    timelineRef.current?.kill();

    if (isReducedMotion) {
      gsap.set(linksWrapperRef.current, { scale: 1, opacity: 1 });

      timelineRef.current = gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: REDUCED_MOTION_FADE_DURATION,
        ease: "power2.out",
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          gsap.set(overlayRef.current, { clipPath: closedFinal });
          onClose?.();
        },
      });

      gsap.set(overlayRef.current, { clipPath: closedFinal });
      return;
    }

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
      .to(linksWrapperRef.current, { scale: 0.9, opacity: 0.5, duration: 0.7, ease: "power2.in" })
      .to(overlayRef.current, { clipPath: closedFinal, duration: closeDuration, ease }, "<");
  };

  const onToggleMenu = () => {
    if (isAnimatingRef.current) return;
    if (isOpen) {
      onCloseMenu();
      return;
    }
    onOpenMenu();
  };

  const onLinkMouseEnter = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = linkHoverColor;
  };

  const onLinkMouseLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = linkColor;
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useFocusTrap({ active: isOpen, containerRef: rootRef, initialFocusRef: toggleButtonRef, onEscape: onCloseMenu });

  return (
    <div ref={rootRef}>
      {/* HEADER: w-full to prevent scrollbars, pointer-events-none to let you click through empty space */}
      <header 
        className={`fixed top-0 left-0 right-0 z-70 flex h-24 items-center justify-between px-8 sm:px-12 pointer-events-none w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen || isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
        } ${headerClassName}`}
      >
        {/* LOGO: Completely hidden when closed, fades in when open */}
        <a
          href={logoHref}
          className={`flex items-center group cursor-pointer transition-all duration-300 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="h-10 w-auto object-contain"
              style={{ filter: isOpen ? "invert(1) brightness(2)" : "none" }}
            />
          ) : (
            <span className="font-bold tracking-tight text-lg" style={{ color: headerOpenColor }}>
              {brand}
            </span>
          )}
        </a>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-current/30 transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ color: isOpen ? headerOpenColor : "var(--text-h)" }}
          >
            {theme === "dark" ? (
              <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />
              </svg>
            )}
          </button>
          <button
            ref={toggleButtonRef}
            onClick={onToggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5"
          >
            <span
              style={{ backgroundColor: isOpen ? headerOpenColor : headerClosedColor }}
              className={`block h-[2px] w-8 transition-all duration-700 ease-in-out delay-300 motion-reduce:transition-none ${
                isOpen ? "translate-y-[8px] rotate-45" : isReducedMotion ? "translate-y-0 rotate-0" : ""
              }`}
            />
            <span
              style={{ backgroundColor: isOpen ? headerOpenColor : headerClosedColor }}
              className={`block h-[2px] w-8 transition-all duration-500 delay-300 motion-reduce:transition-none ${
                isOpen ? "scale-x-0 opacity-0" : isReducedMotion ? "scale-x-100 opacity-100" : ""
              }`}
            />
            <span
              style={{ backgroundColor: isOpen ? headerOpenColor : headerClosedColor }}
              className={`block h-[2px] w-8 transition-all duration-700 ease-in-out delay-300 motion-reduce:transition-none ${
                isOpen ? "-translate-y-[8px] -rotate-45" : isReducedMotion ? "translate-y-0 rotate-0" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <nav
        ref={overlayRef}
        style={{ clipPath: closedInitial, backgroundColor: overlayBg }}
        className={`fixed inset-0 z-60 flex flex-col items-center justify-center gap-2 overflow-y-auto ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        role="navigation"
      >
        {/* Changed to w-full */}
        <div ref={linksWrapperRef} className="flex min-h-screen w-full flex-col items-center justify-center motion-reduce:opacity-100">
          {children
            ? children(isOpen)
            : (links as FullscreenNavLink[]).map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={isOpen ? onCloseMenu : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  style={{ color: linkColor }}
                  onMouseEnter={onLinkMouseEnter}
                  onMouseLeave={onLinkMouseLeave}
                  className={`${linkSizeClass} font-normal tracking-tight transition-colors motion-reduce:transition-none`}
                >
                  {label}
                </a>
              ))}
        </div>
      </nav>
    </div>
  );
}

// CustomNavbar Internal Component
const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <path d="M5.87988 0.0556641H15.1201C16.6642 0.0574604 18.1445 0.671867 19.2363 1.76367C20.3281 2.85548 20.9425 4.33584 20.9443 5.87988V15.1201C20.9425 16.6642 20.3281 18.1445 19.2363 19.2363C18.1445 20.3281 16.6642 20.9425 15.1201 20.9443H5.87988C4.33584 20.9425 2.85548 20.3281 1.76367 19.2363C0.671867 18.1445 0.0574604 16.6642 0.0556641 15.1201V5.87988C0.0574603 4.33584 0.671867 2.85548 1.76367 1.76367C2.85548 0.671867 4.33584 0.0574603 5.87988 0.0556641ZM12.4502 5.79199C11.519 5.40629 10.4944 5.30533 9.50586 5.50195C8.51734 5.69858 7.60917 6.1838 6.89648 6.89648C6.1838 7.60917 5.69858 8.51734 5.50195 9.50586C5.30533 10.4944 5.40629 11.519 5.79199 12.4502C6.1777 13.3813 6.83093 14.1774 7.66895 14.7373C8.50694 15.2972 9.49217 15.5957 10.5 15.5957C11.8511 15.5942 13.1462 15.0569 14.1016 14.1016C15.0569 13.1462 15.5942 11.8511 15.5957 10.5C15.5957 9.49217 15.2972 8.50694 14.7373 7.66895C14.1774 6.83093 13.3813 6.1777 12.4502 5.79199ZM10.5 7.19629C11.376 7.19731 12.2156 7.54564 12.835 8.16504C13.4544 8.78444 13.8027 9.62403 13.8037 10.5C13.8037 11.1535 13.6101 11.7926 13.2471 12.3359C12.8841 12.8791 12.3682 13.3027 11.7646 13.5527C11.1609 13.8028 10.4964 13.8677 9.85547 13.7402C9.21456 13.6127 8.62614 13.298 8.16406 12.8359C7.70199 12.3739 7.38725 11.7854 7.25977 11.1445C7.13228 10.5036 7.19719 9.83908 7.44727 9.23535C7.6973 8.63179 8.1209 8.11594 8.66406 7.75293C9.1395 7.43525 9.68836 7.24712 10.2559 7.20508L10.5 7.19629ZM15.7031 3.74902C15.4479 3.79981 15.2133 3.92535 15.0293 4.10938C14.8453 4.29341 14.7197 4.52794 14.6689 4.7832C14.6182 5.03848 14.6445 5.30348 14.7441 5.54395C14.8437 5.78413 15.0124 5.98926 15.2285 6.13379C15.4449 6.27838 15.6997 6.35644 15.96 6.35645C16.309 6.35645 16.6438 6.21747 16.8906 5.9707C17.1374 5.72392 17.2764 5.38905 17.2764 5.04004C17.2764 4.77977 17.1993 4.525 17.0547 4.30859C16.9101 4.09225 16.7042 3.92384 16.4639 3.82422C16.2234 3.72462 15.9584 3.69825 15.7031 3.74902Z" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg width="10" height="19" viewBox="0 0 10 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <path d="M6.38184 0.385742C7.19227 0.274662 7.98805 0.34229 8.85449 0.37793C9.03979 0.385348 9.22788 0.406595 9.4248 0.431641V2.80859C8.97946 2.81236 8.52504 2.81344 8.07422 2.82324L7.51758 2.8418C7.15961 2.85609 6.84471 2.96157 6.59375 3.16797C6.34339 3.37392 6.18263 3.65902 6.09375 3.9873L6.0918 3.99414C6.05287 4.15011 6.02498 4.32615 6.02441 4.49707C6.01276 5.25508 6.0127 6.0129 6.0127 6.76758C6.0127 6.81651 6.02031 6.86155 6.02539 6.88867C6.0298 6.91218 6.0385 6.95323 6.04199 6.9707L6.09375 7.23242H9.27637C9.16172 8.14171 9.04553 9.02094 8.93066 9.92773H6.02441V18.5254H3.20312V9.91602H0.325195V7.20898H3.20312V6.66309C3.20312 5.94768 3.19164 5.24969 3.20312 4.55664C3.21466 4.10654 3.23786 3.67817 3.32422 3.26758L3.3252 3.2627C3.63481 1.67136 4.77561 0.611071 6.38184 0.385742Z" fill="currentColor" />
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <path d="M12.523 5.83716C13.2256 5.77425 13.9204 5.82636 14.5894 6.03149V6.03247C15.6435 6.37056 16.2928 7.09389 16.5748 8.14771V8.14868C16.7248 8.7272 16.773 9.31063 16.8785 9.95532L16.8795 9.96118C16.8975 10.0606 16.9079 10.1631 16.9185 10.2893V16.8831H14.022C14.0223 15.4836 14.0282 14.0864 14.022 12.6858L14.0113 11.2571C14.011 10.886 13.971 10.5122 13.9078 10.1506L13.8375 9.79224C13.761 9.43645 13.613 9.1113 13.3736 8.85083C13.1317 8.58774 12.8116 8.40827 12.4224 8.32251L12.4185 8.32153L12.19 8.28345C12.037 8.26427 11.8831 8.25731 11.73 8.26001L11.5015 8.27075C10.9986 8.30831 10.5548 8.464 10.2047 8.7561C9.85316 9.0494 9.6227 9.45819 9.50934 9.95532V9.95728C9.39316 10.4801 9.33481 11.0356 9.33453 11.5676C9.31371 13.3584 9.3217 15.1407 9.32281 16.926C8.37363 16.9188 7.41182 16.9163 6.44977 16.9163V6.10474H9.19098V8.24146L9.79938 7.52075C10.0645 7.20739 10.2456 6.95483 10.483 6.72778C10.9801 6.25729 11.5695 5.98333 12.2339 5.87427L12.523 5.83716Z" fill="currentColor" />
      <path d="M3.5175 6.104V16.9155H0.632736V6.104H3.5175Z" fill="currentColor" />
      <path d="M2.10547 0.345703C3.06224 0.373859 3.81413 1.15251 3.7959 2.08594C3.77729 3.07221 2.97987 3.83413 2.02539 3.80664H2.02246C1.10984 3.78839 0.327236 2.97556 0.345703 2.0332C0.364056 1.0972 1.16655 0.328815 2.10547 0.345703Z" fill="currentColor" />
    </svg>
  ),
};

const DEFAULT_LINK_Y_OFFSET = 30;
const DEFAULT_LINK_DURATION = 0.8;
const DEFAULT_LINK_STAGGER = 0.07;
const DEFAULT_LINK_CHAR_STAGGER = 0.015;
const IMAGE_INITIAL_SCALE = 0.7;
const DEFAULT_IMAGE_START_SCALE = 0.8;
const DEFAULT_IMAGE_DURATION = 0.9;
const DEFAULT_IMAGE_STAGGER = 0.02;
const DEFAULT_SOCIAL_Y_OFFSET = 14;
const DEFAULT_SOCIAL_DURATION = 0.5;
const DEFAULT_SOCIAL_STAGGER = 0.06;
const LOCATION_Y_OFFSET = 10;
const DELAY_OFFSET = 0.2;
const TAGLINE_DELAY_OFFSET = 0.08;
const IMAGE_DELAY_OFFSET = 0.1;
const SOCIAL_DELAY_OFFSET = 0.2;
const LOCATION_DELAY_OFFSET = 0.25;

function NavLinkHover({
  label,
  href,
  charStagger,
  reduced,
  onClick,
}: {
  label: string;
  href: string;
  charStagger: number;
  reduced: boolean;
  onClick?: () => void;
}) {
  if (reduced) {
    return (
      <a href={href} onClick={onClick}>
        {label}
      </a>
    );
  }

  return (
    <a href={href} onClick={onClick} className="group/link-hover inline-block no-underline">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="relative inline-block overflow-hidden align-middle leading-[1.08]">
        {[...label].map((char, index) => (
          <span
            key={index}
            className="relative inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/link-hover:-translate-y-[1.2em] group-focus-visible/link-hover:-translate-y-[1.2em]"
            style={{ textShadow: "0 1.2em currentColor", transitionDelay: `${index * charStagger}s` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </a>
  );
}

export interface CustomNavbarLink {
  label: string;
  href: string;
}

export interface CustomNavbarSocial {
  type: string;
  href: string;
}

export interface CustomNavbarProps {
  links?: CustomNavbarLink[];
  images?: string[];
  socials?: CustomNavbarSocial[];
  location?: string;
  tagline?: string;
  isOpen?: boolean;
  overlayBg?: string;
  delay?: number;
  linkOffsetY?: number;
  linkDuration?: number;
  linkStagger?: number;
  linkCharStagger?: number;
  imageStartScale?: number;
  imageDuration?: number;
  imageStagger?: number;
  socialOffsetY?: number;
  socialDuration?: number;
  socialStagger?: number;
}

function CustomNavbar({
  links = [],
  images = ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1000&auto=format&fit=crop"],
  socials = [
    { type: "instagram", href: "https://www.instagram.com/zandrellez" },
    { type: "facebook", href: "https://www.facebook.com/zandrellez" },
    { type: "github", href: "https://github.com/zandrellez" },
    { type: "linkedin", href: "https://www.linkedin.com/in/zandrellez" },
  ],
  location = "Rodriguez, Rizal, Philippines",
  tagline = "Engineering clarity out of complexity.",
  isOpen = false,
  overlayBg = "#1a211b",
  delay = 1,
  linkOffsetY = DEFAULT_LINK_Y_OFFSET,
  linkDuration = DEFAULT_LINK_DURATION,
  linkStagger = DEFAULT_LINK_STAGGER,
  linkCharStagger = DEFAULT_LINK_CHAR_STAGGER,
  imageStartScale = DEFAULT_IMAGE_START_SCALE,
  imageDuration = DEFAULT_IMAGE_DURATION,
  imageStagger = DEFAULT_IMAGE_STAGGER,
  socialOffsetY = DEFAULT_SOCIAL_Y_OFFSET,
  socialDuration = DEFAULT_SOCIAL_DURATION,
  socialStagger = DEFAULT_SOCIAL_STAGGER,
}: CustomNavbarProps) {
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const socialsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const locationRef = useRef<HTMLSpanElement | null>(null);
  const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const isReducedMotion = reduceMotion();

  const killAllTweens = () => {
    gsap.killTweensOf([...linksRef.current, ...imagesRef.current, ...socialsRef.current, taglineRef.current, locationRef.current]);
  };

  const resetAnimatedElements = () => {
    gsap.set(linksRef.current, { y: linkOffsetY, opacity: 0 });
    gsap.set(imagesRef.current, { scale: IMAGE_INITIAL_SCALE, opacity: 0 });
    gsap.set(socialsRef.current, { y: socialOffsetY, opacity: 0 });
    gsap.set(taglineRef.current, { y: -12, opacity: 0 });
    gsap.set(locationRef.current, { y: LOCATION_Y_OFFSET, opacity: 0 });
  };

  const setLinkRef = (index: number) => (element: HTMLDivElement | null) => {
    linksRef.current[index] = element;
  };

  const setImageRef = (index: number) => (element: HTMLAnchorElement | null) => {
    imagesRef.current[index] = element;
  };

  const setSocialRef = (index: number) => (element: HTMLAnchorElement | null) => {
    socialsRef.current[index] = element;
  };

  useEffect(() => {
    killAllTweens();
    if (!isOpen) return;
    resetAnimatedElements();

    if (reduceMotion()) {
      gsap.set(taglineRef.current, { y: 0, opacity: 1 });
      gsap.set(linksRef.current, { y: 0, opacity: 1 });
      gsap.set(imagesRef.current, { scale: 1, opacity: 1 });
      gsap.set(socialsRef.current, { y: 0, opacity: 1 });
      gsap.set(locationRef.current, { y: 0, opacity: 1 });
      return;
    }

    const animationDelay = Math.max(delay - DELAY_OFFSET, 0);

    gsap.fromTo(
      taglineRef.current,
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: animationDelay + TAGLINE_DELAY_OFFSET },
    );

    gsap.fromTo(
      linksRef.current,
      { y: linkOffsetY, opacity: 0 },
      { y: 0, opacity: 1, duration: linkDuration, ease: "power2.out", stagger: linkStagger, delay: animationDelay },
    );

    gsap.fromTo(
      imagesRef.current,
      { scale: imageStartScale, opacity: 0 },
      { scale: 1, opacity: 1, duration: imageDuration, ease: "power3.out", stagger: imageStagger, delay: animationDelay + IMAGE_DELAY_OFFSET },
    );

    gsap.fromTo(
      socialsRef.current,
      { y: socialOffsetY, opacity: 0 },
      { y: 0, opacity: 1, duration: socialDuration, ease: "power2.out", stagger: socialStagger, delay: animationDelay + SOCIAL_DELAY_OFFSET },
    );

    gsap.fromTo(
      locationRef.current,
      { y: LOCATION_Y_OFFSET, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: animationDelay + LOCATION_DELAY_OFFSET },
    );
  }, [delay, imageDuration, imageStagger, imageStartScale, isOpen, linkDuration, linkOffsetY, linkStagger, socialDuration, socialOffsetY, socialStagger]);

  return (
    <div style={{ backgroundColor: overlayBg, color: "var(--nav-text)" }} className="flex min-h-screen w-full flex-col justify-between gap-10 px-10 md:px-28 py-10 pt-28">
      
      <div className="flex items-center justify-between gap-10 max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-18 mt-8">
        
        {/* LEFT MENU LINKS */}
        <div className="flex flex-col gap-0">
          {links.map((link, index) => (
            <div key={link.label} ref={setLinkRef(index)} className="z-60 text-[6vw] max-[1025px]:text-[9vw] font-bold" style={{ opacity: 0, transform: `translateY(${linkOffsetY}px)` }}>
              <NavLinkHover label={link.label} href={link.href} charStagger={linkCharStagger} reduced={isReducedMotion} />
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: TAGLINE CENTERED OVER IMAGES */}
        <div className="flex h-full flex-col items-center justify-center gap-10 py-5 max-[1025px]:w-full max-[1025px]:items-center max-[1025px]:py-0">
          
          {tagline && (
            <p ref={taglineRef} className="text-sm font-mono tracking-widest uppercase opacity-70 text-center text-[var(--accent)]">
              {tagline}
            </p>
          )}

          <div className="flex items-end justify-center gap-8 max-[1025px]:w-full max-[1025px]:flex-col max-[1025px]:items-center max-[1025px]:gap-6">
            {[
              { src: images[0], label: "Web & Mobile", href: "#projects" },
              { src: images[1], label: "AI Automation", href: "#automation" },
            ].map((item, index) => (
            <a
                key={index}
                href={item.href}
                ref={setImageRef(index)}
                style={{ opacity: 0, transform: `scale(${IMAGE_INITIAL_SCALE})` }}
                className="relative h-[18vw] w-[22vw] overflow-hidden rounded-xl group cursor-pointer max-[1025px]:h-[40vw] max-[1025px]:w-[80vw] block border border-[var(--accent)]/20"
            >
                <img 
                src={item.src} 
                alt={item.label} 
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a211b]/90 via-[#1a211b]/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100 flex items-end p-6">
                <span className="text-[#fdfdf5] text-sm md:text-lg font-bold tracking-wide uppercase">
                    {item.label}
                </span>
                </div>
            </a>
            ))}
          </div>

        </div>
      </div>

      <div className="flex items-end justify-between max-[1025px]:pb-10">
        <div className="flex items-end gap-6">
          {socials.map((social, index) => (
              <a key={index} href={social.href} target="_blank" rel="noopener noreferrer" ref={setSocialRef(index)} style={{ opacity: 0, transform: `translateY(${socialOffsetY}px)` }} className="hover:text-[var(--accent)] transition-colors">
              {SOCIAL_ICONS[social.type]}
            </a>
          ))}
        </div>
        {location && (
          <span ref={locationRef} className="text-xs font-mono opacity-50 uppercase tracking-widest">
            {location}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const NAV_CONFIG: Partial<FullscreenNavProps> = {
  logoSrc: "/logo.png", // EDIT YOUR PNG PATH HERE
  clipOrigin: "bottom",
  overlayBg: "#1a211b",
  headerOpenColor: "#fdfdf5",
  headerClosedColor: "#1a211b",
  openDuration: 1.2,
  closeDuration: 1.2,
};

const NAV_CONTENT: Partial<CustomNavbarProps> = {
  tagline: "Engineering clarity out of complexity.",
  location: "Rodriguez, Rizal, Philippines", // Updated location[cite: 14]
  links: [
    { label: "Home", href: "#" },
    { label: "Works", href: "#projects" },
    { label: "Certificates", href: "#certificates" },
    { label: "About", href: "#about" },
    { label: "Resume", href: "/resume.pdf" },
  ],
  images: [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1000&auto=format&fit=crop",
  ],
  socials: [
    { type: "instagram", href: "https://www.instagram.com/zandrellez" },
    { type: "facebook", href: "https://www.facebook.com/zandrellez" },
    { type: "github", href: "https://github.com/zandrellez" },
    { type: "linkedin", href: "https://www.linkedin.com/in/zandrellez" },
  ],
};

export interface ImmersiveFullscreenNavProps {
  navConfig?: Partial<FullscreenNavProps>;
  navContent?: Partial<CustomNavbarProps>;
  logoSrc?: string;
  overlayBg?: string;
  headerOpenColor?: string;
  headerClosedColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  ease?: string;
  clipOrigin?: "top" | "bottom" | "left" | "right";
  openDuration?: number;
  closeDuration?: number;
  linkDuration?: number;
  linkStagger?: number;
  linkCharStagger?: number;
  linkOffsetY?: number;
  imageDuration?: number;
  imageStagger?: number;
  imageStartScale?: number;
  socialDuration?: number;
  socialStagger?: number;
  socialOffsetY?: number;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export default function ImmersiveFullscreenNav({ navConfig = NAV_CONFIG, navContent = NAV_CONTENT, ...props }: ImmersiveFullscreenNavProps) {
  const {
    logoSrc,
    overlayBg,
    headerOpenColor,
    headerClosedColor,
    linkColor,
    linkHoverColor,
    ease,
    clipOrigin,
    openDuration,
    closeDuration,
    linkDuration,
    linkStagger,
    linkCharStagger,
    linkOffsetY,
    imageDuration,
    imageStagger,
    imageStartScale,
    socialDuration,
    socialStagger,
    socialOffsetY,
  } = props;

  const config = {
    ...NAV_CONFIG,
    ...navConfig,
    ...(logoSrc !== undefined ? { logoSrc } : {}),
    ...(overlayBg !== undefined ? { overlayBg } : {}),
    ...(headerOpenColor !== undefined ? { headerOpenColor } : {}),
    ...(headerClosedColor !== undefined ? { headerClosedColor } : {}),
    ...(linkColor !== undefined ? { linkColor } : {}),
    ...(linkHoverColor !== undefined ? { linkHoverColor } : {}),
    ...(ease !== undefined ? { ease } : {}),
    ...(clipOrigin !== undefined ? { clipOrigin } : {}),
    ...(openDuration !== undefined ? { openDuration } : {}),
    ...(closeDuration !== undefined ? { closeDuration } : {}),
    ...(props.theme !== undefined ? { theme: props.theme } : {}),
    ...(props.onThemeToggle !== undefined ? { onThemeToggle: props.onThemeToggle } : {}),
  };

  const content = {
    ...NAV_CONTENT,
    ...navContent,
    ...(linkDuration !== undefined ? { linkDuration } : {}),
    ...(linkStagger !== undefined ? { linkStagger } : {}),
    ...(linkCharStagger !== undefined ? { linkCharStagger } : {}),
    ...(linkOffsetY !== undefined ? { linkOffsetY } : {}),
    ...(imageDuration !== undefined ? { imageDuration } : {}),
    ...(imageStagger !== undefined ? { imageStagger } : {}),
    ...(imageStartScale !== undefined ? { imageStartScale } : {}),
    ...(socialDuration !== undefined ? { socialDuration } : {}),
    ...(socialStagger !== undefined ? { socialStagger } : {}),
    ...(socialOffsetY !== undefined ? { socialOffsetY } : {}),
  };

  return (
    <FullscreenNav {...config}>
      {(isOpen) => <CustomNavbar {...content} isOpen={isOpen} overlayBg={config.overlayBg} delay={config.openDuration} />}
    </FullscreenNav>
  );
}