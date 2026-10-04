"use client"

import { useEffect, useRef, useState } from "react"
import {
  Code2,
  Database,
  Globe,
  GitBranch,
  Workflow,
  ScanText,
  Cpu,
  Server,
  Sparkles,
} from "lucide-react"

import { services, marqueeTools } from "../../data/services"

type CubeSide = {
  name: string
  short: string
}

type Service = (typeof services)[number]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getTransform(
  progress: number,
  column: "left" | "right",
  incoming: boolean
) {
  const distance = 100
  let y = 0

  if (!incoming) {
    if (column === "left") {
      y = progress * -distance
    } else {
      y = progress * distance
    }
  } else {
    if (column === "left") {
      y = (1 - progress) * distance
    } else {
      y = (progress - 1) * distance
    }
  }

  const opacity = incoming
    ? clamp(progress * 1.8, 0, 1)
    : clamp(1 - progress * 1.8, 0, 1)

  const scale = incoming
    ? 0.94 + opacity * 0.06
    : 1 - progress * 0.06

  return {
    transform: `translate3d(0, ${y}vh, 0) scale(${scale})`,
    opacity,
  }
}

function getTechIcon(name: string) {
  const value = name.toLowerCase()

  if (value.includes("javascript")) return <Code2 />
  if (value.includes("react")) return <Globe />
  if (value.includes("php")) return <Code2 />
  if (value.includes("mysql")) return <Database />
  if (value.includes("html")) return <Globe />
  if (value.includes("git")) return <GitBranch />
  if (value.includes("python")) return <Code2 />
  if (value.includes("openai")) return <Sparkles />
  if (value.includes("n8n")) return <Workflow />
  if (value.includes("ocr")) return <ScanText />
  if (value.includes("api")) return <Server />
  if (value.includes("supabase")) return <Database />

  return <Cpu />
}

// Cube face component
function CubeFace({
  face,
  transform,
}: {
  face: CubeSide
  transform: string
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center border border-[var(--contrast-border)] bg-[var(--contrast-surface)] backdrop-blur-md backface-hidden shadow-xl p-2"
      style={{ transform }}
    >
      <div className="mb-2 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-[var(--contrast-border)] bg-[var(--contrast-accent-soft)]">
        <span style={{ color: "var(--contrast-accent)" }} className="[&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
          {getTechIcon(face.name)}
        </span>
      </div>

      <span 
        className="text-[9px] sm:text-xs font-mono font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--contrast-muted)" }}
      >
        {face.short}
      </span>

      <span className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm font-medium text-center truncate px-1" style={{ color: "var(--contrast-text-h)" }}>
        {face.name}
      </span>
    </div>
  )
}

function ServiceCube({
  service,
  reverse = false,
}: {
  service: Service
  reverse?: boolean
}) {
  const faces = service.cube

  return (
    <div className="relative flex h-[130px] w-[130px] sm:h-[220px] sm:w-[220px] lg:h-[340px] lg:w-[340px] items-center justify-center cube-wrapper">
      <div className="absolute h-[80px] w-[80px] sm:h-[140px] sm:w-[140px] rounded-full bg-[var(--contrast-accent-soft)] blur-3xl" />

      <div
        className="relative h-[100px] w-[100px] sm:h-[160px] sm:w-[160px] lg:h-[230px] lg:w-[230px]"
        style={{ perspective: "1000px" }}
      >
        <style>{`
          .cube-wrapper { --tz: 50px; }
          @media (min-width: 640px) { .cube-wrapper { --tz: 80px; } }
          @media (min-width: 1024px) { .cube-wrapper { --tz: 115px; } }

          @keyframes spin-cube {
            0% { transform: rotateX(-18deg) rotateY(0deg); }
            100% { transform: rotateX(342deg) rotateY(360deg); }
          }
          @keyframes spin-cube-reverse {
            0% { transform: rotateX(-18deg) rotateY(360deg); }
            100% { transform: rotateX(342deg) rotateY(0deg); }
          }
        `}</style>

        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            animation: reverse 
              ? "spin-cube-reverse 12s linear infinite" 
              : "spin-cube 12s linear infinite"
          }}
        >
          {/* Using responsive CSS variable for translation depth */}
          <CubeFace face={faces[0]} transform="translateZ(var(--tz))" />
          <CubeFace face={faces[1]} transform="rotateY(180deg) translateZ(var(--tz))" />
          <CubeFace face={faces[2]} transform="rotateY(90deg) translateZ(var(--tz))" />
          <CubeFace face={faces[3]} transform="rotateY(-90deg) translateZ(var(--tz))" />
          <CubeFace face={faces[4]} transform="rotateX(90deg) translateZ(var(--tz))" />
          <CubeFace face={faces[5]} transform="rotateX(-90deg) translateZ(var(--tz))" />
        </div>
      </div>
    </div>
  )
}

function ServiceContent({
  service,
}: {
  service: Service
}) {
  return (
    <div className="flex w-full max-w-[620px] flex-col justify-center px-4 py-2 sm:px-10 lg:py-12">
      <div className="mb-1.5 lg:mb-5 flex items-center gap-3">
        <span className="h-px w-6 lg:w-8" style={{ backgroundColor: "var(--accent)" }} />
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: "var(--accent)" }}>
          Service
        </span>
      </div>

      <h2 
        className="max-w-xl text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight"
        style={{ color: "var(--text-h)" }}
      >
        {service.title}
      </h2>

      <p 
        className="mt-1.5 lg:mt-5 max-w-lg text-xs sm:text-sm lg:text-base leading-relaxed"
        style={{ color: "var(--text)" }}
      >
        {service.subtitle}
      </p>

      <div className="mt-4 lg:mt-8 space-y-3 lg:space-y-5">
        {service.slots.map((slot, index) => (
          <div key={slot.title} className="group flex gap-2.5 lg:gap-4">
            <span 
              className="mt-0.5 text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em]"
              style={{ color: "var(--accent)" }}
            >
              0{index + 1}
            </span>
            <div>
              <h3 className="text-xs sm:text-base font-bold leading-tight" style={{ color: "var(--text-h)" }}>
                {slot.title}
              </h3>
              <p className="mt-1 max-w-md text-[11px] sm:text-sm leading-snug sm:leading-relaxed" style={{ color: "var(--text)" }}>
                {slot.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: string[]
  reverse?: boolean
}) {
  const repeated = [...items, ...items, ...items]

  return (
    <div className="relative overflow-hidden whitespace-nowrap">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 35s linear infinite;
        }
      `}</style>

      <div
        className={`flex w-max items-center gap-16 sm:gap-24 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {repeated.map((tool, index) => (
          <div 
            key={`${tool}-${index}`} 
            className="flex items-center gap-3 opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            <span className="[&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-9 sm:[&>svg]:w-9" style={{ color: "var(--accent)" }}>
              {getTechIcon(tool)}
            </span>
            <span className="font-sans text-3xl font-bold tracking-tighter sm:text-5xl" style={{ color: "var(--text-h)" }}>
              {tool}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const updateScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current
        if (!section) return

        const rect = section.getBoundingClientRect()
        const scrollableHeight = section.offsetHeight - window.innerHeight
        if (scrollableHeight <= 0) return

        const rawProgress = -rect.top / scrollableHeight
        
        let lockedProgress = 0
        if (rawProgress < 0.3) {
          lockedProgress = 0
        } else if (rawProgress > 0.7) {
          lockedProgress = 1
        } else {
          lockedProgress = (rawProgress - 0.3) / 0.4
        }

        setProgress(clamp(lockedProgress, 0, 1))
      })
    }

    updateScroll()
    window.addEventListener("scroll", updateScroll, { passive: true })
    window.addEventListener("resize", updateScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", updateScroll)
      window.removeEventListener("resize", updateScroll)
    }
  }, [])

  const firstService = services[0]
  const secondService = services[1]

  const firstCubeStyle = getTransform(progress, "left", false)
  const firstContentStyle = getTransform(progress, "right", false)
  const secondContentStyle = getTransform(progress, "left", true)
  const secondCubeStyle = getTransform(progress, "right", true)

  const mobileDistance = 100
  const mCube1X = progress * mobileDistance
  const mText1X = progress * -mobileDistance
  const mCube2X = (progress - 1) * mobileDistance
  const mText2X = (progress - 1) * -mobileDistance

  const mFirstOpacity = clamp(1 - progress * 1.8, 0, 1)
  const mSecondOpacity = clamp(progress * 1.8, 0, 1)

  return (
    <section style={{ backgroundColor: "var(--bg)" }}>
      
      <div ref={sectionRef} className="relative h-[250vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-soft)] blur-[120px]" />
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 h-full lg:h-auto">
            
            {/* Mobile View Service 1 Cube (Perfectly spaced near the top) */}
            <div
              className="absolute inset-x-0 top-[5vh] flex lg:hidden justify-center pointer-events-none"
              style={{
                transform: `translate3d(${mCube1X}vw, 0, 0)`,
                opacity: mFirstOpacity,
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto">
                <ServiceCube service={firstService} />
              </div>
            </div>

            {/* Mobile View Service 1 Content (Sits cleanly below the cube) */}
            <div
              className="absolute inset-x-0 top-[27vh] flex lg:hidden justify-center pointer-events-none"
              style={{
                transform: `translate3d(${mText1X}vw, 0, 0)`,
                opacity: mFirstOpacity,
                pointerEvents: progress > 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto w-full max-w-lg px-2">
                <ServiceContent service={firstService} />
              </div>
            </div>

            {/* Mobile View Service 2 Content */}
            <div
              className="absolute inset-x-0 top-[27vh] flex lg:hidden justify-center pointer-events-none"
              style={{
                transform: `translate3d(${mText2X}vw, 0, 0)`,
                opacity: mSecondOpacity,
                pointerEvents: progress < 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto w-full max-w-lg px-2">
                <ServiceContent service={secondService} />
              </div>
            </div>

            {/* Mobile View Service 2 Cube */}
            <div
              className="absolute inset-x-0 top-[5vh] flex lg:hidden justify-center pointer-events-none"
              style={{
                transform: `translate3d(${mCube2X}vw, 0, 0)`,
                opacity: mSecondOpacity,
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto">
                <ServiceCube service={secondService} reverse />
              </div>
            </div>

            {/* Desktop View Service 1 Cube */}
            <div
              className="absolute inset-y-0 left-0 hidden lg:flex w-1/2 items-center justify-center"
              style={{
                ...firstCubeStyle,
                pointerEvents: progress > 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <ServiceCube service={firstService} />
            </div>

            {/* Desktop View Service 1 Content */}
            <div
              className="absolute inset-y-0 right-0 hidden lg:flex w-1/2 items-center justify-center"
              style={{
                ...firstContentStyle,
                pointerEvents: progress > 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <ServiceContent service={firstService} />
            </div>

            {/* Desktop View Service 2 Content */}
            <div
              className="absolute inset-y-0 left-0 hidden lg:flex w-1/2 items-center justify-center"
              style={{
                ...secondContentStyle,
                pointerEvents: progress < 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <ServiceContent service={secondService} />
            </div>

            {/* Desktop View Service 2 Cube */}
            <div
              className="absolute inset-y-0 right-0 hidden lg:flex w-1/2 items-center justify-center"
              style={{
                ...secondCubeStyle,
                pointerEvents: progress < 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <ServiceCube service={secondService} reverse />
            </div>

          </div>
        </div>
      </div>

      <div className="relative py-24 sm:py-32 border-t border-[var(--border)]">
        <div className="mx-auto mb-16 max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl" style={{ color: "var(--text-h)" }}>
            The Toolkit
          </h2>
          <p className="mt-6 text-base leading-8 sm:text-xl" style={{ color: "var(--text)" }}>
            Modern technologies and intelligent platforms I leverage to architect scalable, high-speed software.
          </p>
        </div>

        <div className="w-full space-y-8 sm:space-y-12">
          <MarqueeRow items={marqueeTools.row1} />
          <MarqueeRow items={marqueeTools.row2} reverse />
        </div>
      </div>
      
    </section>
  )
}