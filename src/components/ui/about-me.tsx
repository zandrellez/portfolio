import { useEffect, useRef, useMemo } from 'react';
import "../styles/about-me.css";

const HEADLINE_LINE_1 = ['Technology', 'should', 'feel', 'like', 'magic,'];
const HEADLINE_LINE_2 = ['not', 'a', 'maze.'];
const FULL_HEADLINE = 'Technology should feel like magic, not a maze.';

export default function AboutMe() {
  const containerRef = useRef<HTMLElement>(null);

  // Dynamically calculate building experience from May 2024 to present
  const experienceYears = useMemo(() => {
    const startDate = new Date(2024, 4, 1); // May 1, 2024
    const currentDate = new Date();
    const diffInMilliseconds = currentDate.getTime() - startDate.getTime();
    const years = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25));
    return `${Math.max(1, years)}+ Years Building`;
  }, []);

  useEffect(() => {
    const rootEl = containerRef.current;
    if (!rootEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');

            const emphasis = entry.target.querySelector('.editorial-emphasis');
            if (emphasis) emphasis.classList.add('is-visible');

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    const animatables = rootEl.querySelectorAll('[data-animate]');
    animatables.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <article ref={containerRef} id="about" className="about-editorial">
      {/* Subtle grain overlay */}
      <div className="editorial-grain" aria-hidden="true" />

      <header className="editorial-header">
        <div className="editorial-meta" data-animate="fade-up">
          <span className="editorial-category">About</span>
          <span className="editorial-divider">/</span>
          <span className="editorial-date">October 2026</span>
        </div>

        <h1
          className="editorial-headline"
          data-animate="headline"
          aria-label={FULL_HEADLINE}
        >
          <span className="headline-line" aria-hidden="true">
            {HEADLINE_LINE_1.map((word, i) => (
              <span
                key={word}
                className="headline-word"
                style={{ transitionDelay: `${0.15 + i * 0.07}s` }}
              >
                {word}
              </span>
            ))}
          </span>

          <span className="headline-line" aria-hidden="true">
            <span className="editorial-italic">
              {HEADLINE_LINE_2.map((word, i) => (
                <span
                  key={word}
                  className="headline-word"
                  style={{
                    transitionDelay: `${
                      0.15 + (HEADLINE_LINE_1.length + i) * 0.07 + 0.12
                    }s`,
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </span>
        </h1>
      </header>

      <div className="editorial-content">
        <div className="editorial-grid">
          <aside className="editorial-sidebar" data-animate="fade-up">
            <div className="editorial-label">Profile</div>
            <div className="editorial-info">
              <div className="editorial-info-item">
                <span className="editorial-info-label">Discipline</span>
                <span className="editorial-info-value">Software & Intelligent Systems</span>
              </div>
              <div className="editorial-info-item">
                <span className="editorial-info-label">Stack</span>
                <span className="editorial-info-value">Web, Mobile & AI Workflows</span>
              </div>
              <div className="editorial-info-item">
                <span className="editorial-info-label">Experience</span>
                <span className="editorial-info-value">{experienceYears}</span>
              </div>
              <div className="editorial-info-item">
                <span className="editorial-info-label">Philosophy</span>
                <span className="editorial-info-value">Human-First Engineering</span>
              </div>
            </div>
          </aside>

          <div className="editorial-body">
            <p className="editorial-lead" data-animate="fade-up">
              Complexity is easy. Making things feel simple? That requires{' '}
              <span className="editorial-highlight">intentional engineering</span>.
            </p>

            <p className="editorial-text" data-animate="fade-up">
              It’s easy to write complex code that only the developer understands. What is harder, and far more rewarding, is building software that makes the person using it feel capable.
            </p>

            <p className="editorial-text" data-animate="fade-up">
              Having spent plenty of time frustrated by clunky interfaces and repetitive manual workflows, I approach development from the user inward. I combine full-stack architecture with targeted AI tools to turn confusing processes into seamless, one-click experiences.{' '}
              <em className="editorial-emphasis">
                I build the solutions I wish existed when I am on the other side of the screen.
              </em>
            </p>

            <p className="editorial-text" data-animate="fade-up">
              Whether it is a full web application, a responsive mobile interface, or an automated pipeline running quietly in the background, my goal remains constant: bulletproof engineering under the hood, and an experience so intuitive you never have to think twice.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}