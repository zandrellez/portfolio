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

// Helpers
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

// Icons
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

// Cube face
function CubeFace({
  face,
  transform,
}: {
  face: CubeSide
  transform: string
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center border border-white/15 bg-[#111111] backdrop-blur-md backface-hidden"
      style={{ transform }}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
        <span className="text-white/80">
          {getTechIcon(face.name)}
        </span>
      </div>

      <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
        {face.short}
      </span>

      <span className="mt-1 text-sm font-medium text-white">
        {face.name}
      </span>
    </div>
  )
}

// 3d cube
function ServiceCube({
  service,
  reverse = false,
}: {
  service: Service
  reverse?: boolean
}) {
  const faces = service.cube

  return (
    <div className="relative flex h-[200px] w-[200px] items-center justify-center sm:h-[260px] sm:w-[260px] lg:h-[340px] lg:w-[340px]">
      <div className="absolute h-[140px] w-[140px] rounded-full bg-white/[0.035] blur-3xl" />

      <div
        className="relative h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] lg:h-[230px] lg:w-[230px]"
        style={{ perspective: "1000px" }}
      >
        <style>{`
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
          <CubeFace face={faces[0]} transform="translateZ(115px)" />
          <CubeFace face={faces[1]} transform="rotateY(180deg) translateZ(115px)" />
          <CubeFace face={faces[2]} transform="rotateY(90deg) translateZ(115px)" />
          <CubeFace face={faces[3]} transform="rotateY(-90deg) translateZ(115px)" />
          <CubeFace face={faces[4]} transform="rotateX(90deg) translateZ(115px)" />
          <CubeFace face={faces[5]} transform="rotateX(-90deg) translateZ(115px)" />
        </div>
      </div>
    </div>
  )
}

// Service content
function ServiceContent({
  service,
}: {
  service: Service
}) {
  return (
    <div className="flex h-full w-full max-w-[620px] flex-col justify-center px-4 py-6 sm:px-10 lg:py-12">
      <div className="mb-3 lg:mb-5 flex items-center gap-3">
        <span className="h-px w-8 bg-white/30" />
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
          Service
        </span>
      </div>

      <h2 className="max-w-xl text-2xl sm:text-4xl lg:text-6xl font-semibold tracking-tight text-white">
        {service.title}
      </h2>

      <p className="mt-3 lg:mt-5 max-w-lg text-xs sm:text-sm lg:text-base leading-6 text-white/45">
        {service.subtitle}
      </p>

      <div className="mt-5 lg:mt-8 space-y-3 lg:space-y-5">
        {service.slots.map((slot, index) => (
          <div key={slot.title} className="group flex gap-3 lg:gap-4">
            <span className="mt-1 text-[10px] font-medium tracking-[0.2em] text-white/25">
              0{index + 1}
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-white">
                {slot.title}
              </h3>
              <p className="mt-1 max-w-md text-[11px] sm:text-xs lg:text-sm leading-5 text-white/40">
                {slot.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Marquee row
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
            className="flex items-center gap-3 opacity-40 transition-opacity duration-300 hover:opacity-100"
          >
            <span className="text-white/80 [&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-9 sm:[&>svg]:w-9">
              {getTechIcon(tool)}
            </span>
            <span className="font-sans text-3xl font-bold tracking-tighter text-white sm:text-5xl">
              {tool}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Services section
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

  // Desktop transforms
  const firstCubeStyle = getTransform(progress, "left", false)
  const firstContentStyle = getTransform(progress, "right", false)
  const secondContentStyle = getTransform(progress, "left", true)
  const secondCubeStyle = getTransform(progress, "right", true)

  // Mobile transforms (Service 1 Cube exits right, Text exits left. Service 2 Cube enters left, Text enters right)
  const mobileDistance = 100 // vw
  const mCube1X = progress * mobileDistance
  const mText1X = progress * -mobileDistance
  const mCube2X = (progress - 1) * mobileDistance
  const mText2X = (progress - 1) * -mobileDistance

  const mFirstOpacity = clamp(1 - progress * 1.8, 0, 1)
  const mSecondOpacity = clamp(progress * 1.8, 0, 1)

  return (
    <section className="bg-[#0a0a0a]">
      
      {/* SHARED STICKY STAGE */}
      <div ref={sectionRef} className="relative h-[250vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.015] blur-[120px]" />
          </div>

          <div className="relative mx-auto h-full max-w-7xl px-5 sm:px-8 lg:px-12">
            

            {/* (mobile view) SERVICE 1 cube */}
            <div
              className="absolute inset-0 flex lg:hidden flex-col items-center justify-center pointer-events-none"
              style={{
                transform: `translate3d(${mCube1X}vw, -22vh, 0)`,
                opacity: mFirstOpacity,
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto">
                <ServiceCube service={firstService} />
              </div>
            </div>

            {/* (mobile view) SERVICE 1 content */}
            <div
              className="absolute inset-0 flex lg:hidden flex-col items-center justify-center overflow-y-auto pointer-events-none"
              style={{
                transform: `translate3d(${mText1X}vw, 20vh, 0)`,
                opacity: mFirstOpacity,
                pointerEvents: progress > 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto w-full max-w-lg px-4">
                <ServiceContent service={firstService} />
              </div>
            </div>

            {/* (mobile view) SERVICE 2 content */}
            <div
              className="absolute inset-0 flex lg:hidden flex-col items-center justify-center overflow-y-auto pointer-events-none"
              style={{
                transform: `translate3d(${mText2X}vw, 20vh, 0)`,
                opacity: mSecondOpacity,
                pointerEvents: progress < 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto w-full max-w-lg px-4">
                <ServiceContent service={secondService} />
              </div>
            </div>

            {/* (mobile view) SERVICE 2 cube */}
            <div
              className="absolute inset-0 flex lg:hidden flex-col items-center justify-center pointer-events-none"
              style={{
                transform: `translate3d(${mCube2X}vw, -22vh, 0)`,
                opacity: mSecondOpacity,
                willChange: "transform, opacity",
              }}
            >
              <div className="pointer-events-auto">
                <ServiceCube service={secondService} reverse />
              </div>
            </div>


            {/* (desktop view) SERVICE 1 CUBE */}
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

            {/* (desktop view) SERVICE 1 CONTENT */}
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

            {/* (desktop view) SERVICE 2 CONTENT */}
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

            {/* (desktop view) SERVICE 2 CUBE */}
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

      <div className="relative py-24 sm:py-32">
        <div className="mx-auto mb-16 max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
            Engineered with technologies powering
          </h2>
          <p className="mt-6 text-base leading-8 text-white/50 sm:text-xl">
            Integrating the modern ecosystem driving today's most ambitious scalable products.
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