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

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  ICONS                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                CUBE FACE                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                3D CUBE                                    */
/* -------------------------------------------------------------------------- */

function ServiceCube({
  service,
  reverse = false,
}: {
  service: Service
  reverse?: boolean
}) {
  const faces = service.cube

  return (
    <div className="relative flex h-[280px] w-[280px] items-center justify-center sm:h-[340px] sm:w-[340px]">
      <div className="absolute h-[180px] w-[180px] rounded-full bg-white/[0.035] blur-3xl" />

      <div
        className="relative h-[190px] w-[190px] sm:h-[230px] sm:w-[230px]"
        style={{ perspective: "1000px" }}
      >
        <style>{`
          /* Adding 360 degrees to both the X and Y axes creates a seamless 3D tumble */
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
            /* Reduced from 20s to 12s for a faster, dynamic spin */
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

/* -------------------------------------------------------------------------- */
/*                              SERVICE CONTENT                               */
/* -------------------------------------------------------------------------- */

function ServiceContent({
  service,
}: {
  service: Service
}) {
  return (
    <div className="flex h-full w-full max-w-[620px] flex-col justify-center px-6 py-12 sm:px-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px w-8 bg-white/30" />
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
          Service
        </span>
      </div>

      <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {service.title}
      </h2>

      <p className="mt-5 max-w-lg text-sm leading-6 text-white/45 sm:text-base">
        {service.subtitle}
      </p>

      <div className="mt-8 space-y-5">
        {service.slots.map((slot, index) => (
          <div key={slot.title} className="group flex gap-4">
            <span className="mt-1 text-[10px] font-medium tracking-[0.2em] text-white/25">
              0{index + 1}
            </span>
            <div>
              <h3 className="text-sm font-medium text-white">
                {slot.title}
              </h3>
              <p className="mt-1.5 max-w-md text-xs leading-5 text-white/40 sm:text-sm">
                {slot.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              MARQUEE ROW                                   */
/* -------------------------------------------------------------------------- */

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: string[]
  reverse?: boolean
}) {
  // Triple the items to ensure seamless endless scrolling without empty gaps
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

/* -------------------------------------------------------------------------- */
/*                              SERVICES SECTION                              */
/* -------------------------------------------------------------------------- */

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
        
        // --- THE SCROLL LOCK LOGIC ---
        // 0.0 to 0.3: Locked on Service 1
        // 0.3 to 0.7: Transitioning
        // 0.7 to 1.0: Locked on Service 2
        let lockedProgress = 0
        if (rawProgress < 0.3) {
          lockedProgress = 0
        } else if (rawProgress > 0.7) {
          lockedProgress = 1
        } else {
          // Calculate the smooth transition in the middle
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

  return (
    <section className="bg-[#0a0a0a]">
      
      {/* ------------------------------------------------------------------ */}
      {/* STICKY STAGE (Cubes & Service Details)                             */}
      {/* ------------------------------------------------------------------ */}
      <div ref={sectionRef} className="relative h-[250vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.015] blur-[120px]" />
          </div>

          <div className="relative mx-auto h-full max-w-7xl px-5 sm:px-8 lg:px-12">
            
            {/* SERVICE 1 */}
            <div
              className="absolute inset-y-0 left-0 flex w-full items-center justify-center lg:w-1/2"
              style={{
                ...firstCubeStyle,
                pointerEvents: progress > 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <ServiceCube service={firstService} />
            </div>

            <div
              className="absolute inset-y-0 right-0 flex w-full items-center justify-center lg:w-1/2"
              style={{
                ...firstContentStyle,
                pointerEvents: progress > 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <ServiceContent service={firstService} />
            </div>

            {/* SERVICE 2 */}
            <div
              className="absolute inset-y-0 left-0 flex w-full items-center justify-center lg:w-1/2"
              style={{
                ...secondContentStyle,
                pointerEvents: progress < 0.5 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
            >
              <ServiceContent service={secondService} />
            </div>

            <div
              className="absolute inset-y-0 right-0 flex w-full items-center justify-center lg:w-1/2"
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

      {/* ------------------------------------------------------------------ */}
      {/* NORMAL FLOW SECTION (Text Buffer + Marquee)                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative py-24 sm:py-32">
        {/* Intro Text Buffer matching reference image layout */}
        <div className="mx-auto mb-16 max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
            Engineered with technologies powering
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/50 sm:text-xl">
            Integrating the modern ecosystem driving today's most ambitious scalable products.
          </p>
        </div>

        {/* Marquee Tools */}
        <div className="w-full space-y-8 sm:space-y-12">
          <MarqueeRow items={marqueeTools.row1} />
          <MarqueeRow items={marqueeTools.row2} reverse />
        </div>
      </div>
      
    </section>
  )
}