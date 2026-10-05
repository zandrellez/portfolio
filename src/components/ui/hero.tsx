import { useEffect, useRef, useState } from "react"

type GridCard = {
  title: string
  eyebrow: string
  type: "workflow" | "ocr" | "dashboard" | "code" | "stats"
  className: string
}

const gridCards: GridCard[] = [
  {
    title: "AI Workflow",
    eyebrow: "N8N / WEBHOOK",
    type: "workflow",
    className: "grid-card-wide",
  },
  {
    title: "Receipt Intelligence",
    eyebrow: "OCR / AI",
    type: "ocr",
    className: "grid-card-tall",
  },
  {
    title: "Logistics Control",
    eyebrow: "ENTERPRISE / LIVE",
    type: "dashboard",
    className: "grid-card-wide",
  },
  {
    title: "Automation API",
    eyebrow: "REST / AI",
    type: "code",
    className: "grid-card-small",
  },
  {
    title: "System Metrics",
    eyebrow: "REAL-TIME",
    type: "stats",
    className: "grid-card-small",
  },
  {
    title: "Webhook Pipeline",
    eyebrow: "N8N / AUTOMATION",
    type: "workflow",
    className: "grid-card-wide",
  },
  {
    title: "Document Parser",
    eyebrow: "OCR / AI",
    type: "ocr",
    className: "grid-card-tall",
  },
  {
    title: "Operations",
    eyebrow: "LOGISTICS",
    type: "dashboard",
    className: "grid-card-wide",
  },
  {
    title: "AI Endpoint",
    eyebrow: "BACKEND",
    type: "code",
    className: "grid-card-small",
  },
]

function WorkflowMockup() {
  return (
    <div className="hero-workflow">
      <div className="hero-node">
        <small>WEBHOOK</small>
        <span />
      </div>
      <div className="hero-line" />
      <div className="hero-node">
        <small>AI AGENT</small>
        <span />
      </div>
      <div className="hero-line" />
      <div className="hero-node">
        <small>OUTPUT</small>
        <span />
      </div>
    </div>
  )
}

function OcrMockup() {
  return (
    <div className="hero-ocr">
      <div className="hero-ocr-document">
        <div className="hero-ocr-header">
          <span>RECEIPT</span>
          <span>OCR</span>
        </div>
        <div className="hero-ocr-lines">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-ocr-total">
          <span>TOTAL</span>
          <strong>₱1,248</strong>
        </div>
      </div>
      <div className="hero-confidence">
        <span>CONFIDENCE</span>
        <strong>98.4%</strong>
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="hero-dashboard">
      <div className="hero-stat-row">
        <div>
          <small>ORDERS</small>
          <strong>842</strong>
        </div>
        <div>
          <small>REVENUE</small>
          <strong>₱84K</strong>
        </div>
        <div>
          <small>DELIVERY</small>
          <strong>96%</strong>
        </div>
      </div>
      <div className="hero-chart">
        {[35, 48, 42, 65, 55, 78, 68, 92, 72, 88, 84, 100].map(
          (height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          )
        )}
      </div>
    </div>
  )
}

function CodeMockup() {
  return (
    <div className="hero-code">
      <span>POST /api/automation</span>
      <span>{"{"}</span>
      <span>&nbsp;&nbsp;"model": "gpt",</span>
      <span>&nbsp;&nbsp;"workflow": "invoice",</span>
      <span>&nbsp;&nbsp;"status": "success"</span>
      <span>{"}"}</span>
    </div>
  )
}

function StatsMockup() {
  return (
    <div className="hero-stats">
      <div>
        <strong>99.2%</strong>
        <small>UPTIME</small>
      </div>
      <div>
        <strong>24ms</strong>
        <small>LATENCY</small>
      </div>
      <div>
        <strong>4.8K</strong>
        <small>EVENTS</small>
      </div>
      <div>
        <strong>92%</strong>
        <small>ACCURACY</small>
      </div>
    </div>
  )
}

function GridCardContent({ type }: { type: GridCard["type"] }) {
  if (type === "workflow") return <WorkflowMockup />
  if (type === "ocr") return <OcrMockup />
  if (type === "dashboard") return <DashboardMockup />
  if (type === "code") return <CodeMockup />
  return <StatsMockup />
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  const [scrollProgress, setScrollProgress] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  /* --------------------------------
     SCROLL
  -------------------------------- */
  useEffect(() => {
    let raf = 0

    const updateScroll = () => {
      cancelAnimationFrame(raf)

      raf = requestAnimationFrame(() => {
        const section = sectionRef.current
        if (!section) return

        const rect = section.getBoundingClientRect()
        const distance = section.offsetHeight - window.innerHeight
        const progress = Math.min(
          1,
          Math.max(0, -rect.top / Math.max(distance, 1))
        )

        setScrollProgress(progress)
      })
    }

    updateScroll()
    window.addEventListener("scroll", updateScroll, { passive: true })
    window.addEventListener("resize", updateScroll)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", updateScroll)
      window.removeEventListener("resize", updateScroll)
    }
  }, [])

  /* --------------------------------
     MOUSE PARALLAX
  -------------------------------- */
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  /* --------------------------------
     MATH & ANIMATIONS
  -------------------------------- */
  // Scale down smoothly over the first 70% of the scroll track
  const scaleProgress = Math.min(scrollProgress / 0.7, 1)
  const smoothProgress = 1 - Math.pow(1 - scaleProgress, 3)
  
  // Shrinks from 100% to 88%
  const heroScale = 1 - smoothProgress * 0.50
  
  // Rounds corners from 0px (fullscreen) to 36px (floating card)
  const heroRadius = smoothProgress * 36

  const textX = mouse.x * 16
  const textY = mouse.y * 10
  const portraitX = mouse.x * -24
  const portraitY = mouse.y * -15

  return (
    <section ref={sectionRef} className="hero-scroll">
      
      {/* =====================================
          ONE UNIFIED STICKY WRAPPER
      ====================================== */}
      <div className="hero-sticky">
        
        {/* =====================================
            BACKGROUND GRID
        ====================================== */}
        <div className="hero-grid-layer">
          <div className="hero-grid-motion">
            <div className="hero-grid">
              {/* Duplicated arrays to ensure the infinite scroll has enough content */}
              {[...gridCards, ...gridCards, ...gridCards, ...gridCards, ...gridCards, ...gridCards].map(
                (card, index) => (
                  <article
                    key={`${card.title}-${index}`}
                    className={`hero-grid-card ${card.className}`}
                  >
                    <div className="hero-card-header">
                      <span>{card.eyebrow}</span>
                      <span>↗</span>
                    </div>

                    <h2>{card.title}</h2>
                    <GridCardContent type={card.type} />
                  </article>
                )
              )}
            </div>
          </div>
        </div>

        {/* =====================================
            SCALING HERO CARD
        ====================================== */}
        <div
          className="hero-main-card"
          style={{
            transform: `scale(${heroScale})`,
            borderRadius: `${heroRadius}px`,
          }}
        >
          {/* Background Elements */}
          <div className="hero-card-bg" />
          <div className="hero-card-grid" />

          {/* Top Label */}
          <div className="hero-top-label">
            <span className="hero-dot" />
            <span>Zoe Zamora</span>
          </div>

          {/* Main Text */}
          <div
            className="hero-text-layer"
            style={{
              transform: `translate3d(${textX}px, ${textY}px, 0)`,
            }}
          >
            <h1>
              Engineering
              <br />
              <span className="hero-highlight">Clarity</span> out
              <br />
              of <span className="hero-highlight">Complexity</span>
            </h1>
          </div>

          {/* Right Info */}
          <div className="hero-info">
            <div>
              <strong>Full-Stack Engineering</strong>
            </div>
            <div>
              <strong>AI Automation</strong>
            </div>
          </div>

          {/* Description */}
          <div className="hero-description">
            <small>I BUILD</small>
            <p>
              intelligent products,
              <br />
              automated workflows, and
              <br />
              reliable full-stack systems.
            </p>
          </div>

          {/* Portrait */}
          <div
            className="hero-portrait"
            style={{
              transform: `translate3d(${portraitX}px, ${portraitY}px, 0)`,
            }}
          >
            <img
              src="assets/me.png"
              alt="Developer portrait"
              draggable={false}
            />
          </div>

          {/* Scroll Indicator */}
          <div className="hero-scroll-indicator">
            <span>SCROLL TO EXPLORE</span>
            <div>↓</div>
          </div>

          {/* Corner Branding */}
          <div className="hero-corner">PH UTC+8</div>
        </div>
      </div>
    </section>
  )
}