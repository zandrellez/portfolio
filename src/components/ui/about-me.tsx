"use client"

import * as React from "react"

type AboutSection = {
  id: string
  number: string
  title: string
  description: string
}

const sections: AboutSection[] = [
  {
    id: "hook",
    number: "01",
    title: "THE HOOK",
    description:
      "I am a Full-Stack & Automation Engineer who builds secure, scalable architectures so businesses can operate without friction.",
  },
  {
    id: "story",
    number: "02",
    title: "THE STORY",
    description:
      "With a Cum Laude background in Information Technology and a specialization in Cybersecurity, I view development through a security-first, systems-level lens. Transitioning from leading traditional full-stack builds to architecting AI-powered data pipelines made me realize my true edge: I don't just write code; I design workflows that give people their time back.",
  },
  {
    id: "promise",
    number: "03",
    title: "THE PROMISE",
    description:
      "When you work with me, you get a proactive engineering partner who ships production-ready solutions, anticipates edge cases, and never leaves a system vulnerable or unoptimized.",
  },
]

const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    alt: "Full-stack web and mobile development environment",
    title: "Full-Stack Ecosystems",
  },
  {
    src: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1000&auto=format&fit=crop",
    alt: "AI and workflow automation pipeline",
    title: "AI Workflows & Automation",
  },
  {
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    alt: "Cybersecurity and systems architecture code",
    title: "Security & Systems",
  },
]

export default function AboutMe() {
  const [currentImage, setCurrentImage] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  const sectionRefs = React.useRef<(HTMLElement | null)[]>([])

  React.useEffect(() => {
    if (isPaused) return

    const timer = window.setInterval(() => {
      setCurrentImage((current) => {
        return (current + 1) % carouselImages.length
      })
    }, 4500)

    return () => window.clearInterval(timer)
  }, [isPaused])

  const nextImage = () => {
    setCurrentImage((current) => {
      return (current + 1) % carouselImages.length
    })
  }

  return (
    <section className="about-me">
      <style>{`
        .about-me {
          --paper: #f4f3ec;
          --ink: #111111;
          --muted: #93ab92;
          --line: rgba(17, 17, 17, 0.15);

          position: relative;
          width: 100%;
          min-height: 100vh;
          background: var(--paper);
          color: var(--ink);
          font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Subtle Grid Pattern matching Hero */
        .about-me::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.12;
          background-image: radial-gradient(#111111 1px, transparent 1px);
          background-size: 32px 32px;
          z-index: 1;
          background-attachment: fixed;
        }

        .about-layout {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 0.75fr);
          gap: clamp(3rem, 7vw, 7rem);
          width: min(1400px, 92%);
          margin: 0 auto;
        }

        .about-visual {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(2rem, 5vw, 5rem) 0;
        }

        .about-visual-inner {
          position: relative;
          width: min(100%, 500px);
          aspect-ratio: 0.92;
        }

        .about-label {
          position: absolute;
          left: 0;
          top: -1.7rem;
          z-index: 20;
          margin: 0;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .about-carousel {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 78%;
          height: 85%;
          overflow: hidden;
          background: #111;
          border-radius: 1rem;
          isolation: isolate;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .about-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transform: scale(1.035);
          transition: opacity 0.8s ease, transform 1.2s cubic-bezier(.2,.7,.2,1);
        }

        .about-image[data-active="true"] {
          opacity: 1;
          transform: scale(1);
        }

        .about-card-caption {
          position: absolute;
          left: 1.2rem;
          bottom: 1.2rem;
          z-index: 10;
          color: white;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-shadow: 0 1px 12px rgba(0,0,0,0.4);
        }

        .about-card-caption span {
          display: block;
          margin-bottom: 3px;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.85;
          color: #5fb57a;
        }

        .about-clip {
          --name-size: clamp(2.8rem, 4.8vw, 4.8rem);
          --clip-gap: 5rem;
          position: absolute;
          z-index: 14;
          left: 78%;  
          right: -100vw;
          top: calc((100% - 100vh) / 2);
          height: calc(
            (100vh - 100%) / 2 + 14% + (var(--name-size) * 1.2) + var(--clip-gap)
          );
          pointer-events: none;
          background-color: var(--paper);
          background-image: radial-gradient(rgba(17, 17, 17, 0.12) 1px, transparent 1px);
          background-size: 32px 32px;
          background-attachment: fixed;
          -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 24px), transparent);
          mask-image: linear-gradient(to bottom, #000 calc(100% - 24px), transparent);
        }

        .about-name {
          position: absolute;
          z-index: 15;
          top: 21%;
          left: 66%;
          width: max-content;
          pointer-events: none;
        }

        .about-name-text {
          margin: 0;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-size: clamp(2.8rem, 4.8vw, 4.8rem);
          font-weight: 700;
          letter-spacing: -0.06em;
          color: #ffffff;
          text-shadow: 0 3px 20px rgba(0, 0, 0, 0.75), 0 1px 5px rgba(0, 0, 0, 0.9);
          white-space: nowrap;
        }

        .about-arrow {
          position: absolute;
          z-index: 30;
          left: calc(78% - 1px);
          top: 48%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--ink);
          border-radius: 50%;
          background: var(--paper);
          color: var(--ink);
          cursor: pointer;
          transform: translateX(-50%);
          transition: background 0.3s ease, color 0.3s ease, transform 0.4s cubic-bezier(.2,1.5,.5,1);
        }

        .about-arrow:hover {
          background: var(--ink);
          color: var(--paper);
          transform: translateX(-50%) scale(1.08);
        }

        .about-arrow svg {
          width: 14px;
          height: 14px;
        }

        .about-carousel-indicator {
          position: absolute;
          left: 78%;
          bottom: 1rem;
          z-index: 20;
          display: flex;
          gap: 4px;
          transform: translateX(-50%);
        }

        .about-carousel-dot {
          width: 16px;
          height: 2px;
          padding: 0;
          border: 0;
          background: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: width 0.4s ease, background 0.3s ease;
        }

        .about-carousel-dot[data-active="true"] {
          width: 28px;
          background: white;
        }

        /* Pushed down further so the entire text block sits right inside your pink box */
        .about-content {
          padding: clamp(22rem, 24vh, 20rem) 0 15vh;
          margin-left: -12rem;
        }

        .about-intro {
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .about-intro-label {
          margin-bottom: 0.8rem;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .about-intro-title {
          max-width: 440px;
          margin: 0;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-size: clamp(2rem, 3.8vw, 3.8rem);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.065em;
          color: var(--ink);
        }

        .about-intro-title em {
          font-style: normal;
          color: var(--muted);
          font-weight: 700;
        }

        /* Story sections stacked cleanly inside the target box */
        .about-story {
          padding: 2.5rem 0;
          border-top: 1px solid var(--line);
        }

        .about-story:first-of-type {
          border-top: 1px solid var(--line);
        }

        .about-story-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0.8rem;
        }

        .about-story-number {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--muted);
          font-family: monospace;
        }

        .about-story-line {
          width: 28px;
          height: 1px;
          background: var(--ink);
        }

        .about-story-title {
          margin: 0;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-size: clamp(1.1rem, 1.8vw, 1.4rem);
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .about-story-description {
          max-width: 560px;
          margin: 0.8rem 0 0 0;
          font-size: clamp(14px, 1.1vw, 16px);
          font-weight: 400;
          line-height: 1.7;
          color: #333333;
        }

        @media (max-width: 900px) {

        .about-clip {
          display: none;
        }
          .about-layout {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .about-visual {
            position: sticky;
            top: 0;
            height: 85svh;
            min-height: 440px;
            z-index: 5;
            background: var(--paper);
          }

          .about-visual-inner {
            width: min(92%, 440px);
            aspect-ratio: 0.9;
          }

          .about-content {
            padding: 4rem 6% 12vh;
          }
        }
      `}</style>

      <div className="about-layout">

        {/* LEFT STICKY AREA */}
        <aside className="about-visual">
          <div className="about-visual-inner">
            <p className="about-label">Software Engineer</p>

            {/* IMAGE CAROUSEL */}
            <div
              className="about-carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {carouselImages.map((image, index) => (
                <React.Fragment key={image.src}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="about-image"
                    data-active={index === currentImage}
                  />

                  {index === currentImage && (
                    <div className="about-card-caption">
                      <span>0{index + 1} / 0{carouselImages.length}</span>
                      {image.title}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="about-clip" aria-hidden="true" />

            {/* LARGER ONE-LINE NAME WITH DROP SHADOW */}
            <div className="about-name">
              <h2 className="about-name-text">Zoe Andrelle Zamora</h2>
            </div>

            {/* CIRCLE ARROW */}
            <button
              type="button"
              className="about-arrow"
              onClick={nextImage}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h13M13 7l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </aside>

        {/* RIGHT SCROLLING STORY */}
        <main className="about-content">
          <div className="about-intro">
            <span className="about-intro-label">// The Manifesto</span>
            <h1 className="about-intro-title">
              Engineering <em>clarity</em>
              <br />
              out of <em>complexity.</em>
            </h1>
          </div>

          {sections.map((section, index) => (
            <section
              key={section.id}
              ref={(element) => {
                sectionRefs.current[index] = element
              }}
              className="about-story"
            >
              <div className="about-story-header">
                <span className="about-story-number">[ {section.number} // {section.title} ]</span>
                <span className="about-story-line" />
              </div>

              <p className="about-story-description">
                {section.description}
              </p>
            </section>
          ))}
        </main>

      </div>
    </section>
  )
}