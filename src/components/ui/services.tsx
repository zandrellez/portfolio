"use client"
import { useEffect, useRef, useState, Fragment } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react"
import { services } from "../../data/services"
import "../styles/services.css"

type Service = (typeof services)[number]
type V3 = readonly [number, number, number]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/* -------------------------------------------------------------------------- */
/* Scroll choreography: 3 zones, each with hold + crossfade                    */
/* -------------------------------------------------------------------------- */

const ZONES = [
  { hold: [0, 0.28] as const, exit: [0.28, 0.42] as const, enter: null },
  { hold: [0.42, 0.58] as const, exit: [0.58, 0.72] as const, enter: [0.28, 0.42] as const },
  { hold: [0.72, 1.0] as const, exit: null, enter: [0.58, 0.72] as const },
]

function getTransform(progress: number, column: "left" | "right", incoming: boolean) {
  const distance = 100
  let y = 0
  if (!incoming) {
    y = column === "left" ? progress * -distance : progress * distance
  } else {
    y = column === "left" ? (1 - progress) * distance : (progress - 1) * distance
  }
  const opacity = incoming
    ? clamp(progress * 1.8, 0, 1)
    : clamp(1 - progress * 1.8, 0, 1)
  const scale = incoming ? 0.94 + opacity * 0.06 : 1 - progress * 0.06
  return {
    transform: `translate3d(0, ${y}vh, 0) scale(${scale})`,
    opacity,
  }
}

function getServiceStyle(globalProgress: number, index: number, column: "left" | "right") {
  const zone = ZONES[index]
  const { hold, enter, exit } = zone
  const distance = 100

  if (globalProgress >= hold[0] && globalProgress <= hold[1]) {
    return { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
  }
  if (enter && globalProgress >= enter[0] && globalProgress <= enter[1]) {
    const t = (globalProgress - enter[0]) / (enter[1] - enter[0])
    return getTransform(t, column, true)
  }
  if (exit && globalProgress >= exit[0] && globalProgress <= exit[1]) {
    const t = (globalProgress - exit[0]) / (exit[1] - exit[0])
    return getTransform(t, column, false)
  }

  // Keep inactive desktop views safely off-screen
  const isBefore = globalProgress < (enter ? enter[0] : hold[0])
  const y = isBefore
    ? (column === "left" ? distance : -distance)
    : (column === "left" ? -distance : distance)
  return { opacity: 0, transform: `translate3d(0, ${y}vh, 0) scale(0.94)` }
}

function getMobileStyle(globalProgress: number, index: number, isCube: boolean) {
  const zone = ZONES[index]
  const { hold, enter, exit } = zone
  const distance = 100

  const calc = (t: number, incoming: boolean) => {
    const opacity = incoming
      ? clamp(t * 1.8, 0, 1)
      : clamp(1 - t * 1.8, 0, 1)
    let x: number
    if (!incoming) {
      x = isCube ? t * distance : t * -distance
    } else {
      x = isCube ? (t - 1) * distance : (t - 1) * -distance
    }
    return { opacity, transform: `translate3d(${x}vw, 0, 0)` }
  }

  if (globalProgress >= hold[0] && globalProgress <= hold[1]) {
    return { opacity: 1, transform: "translate3d(0,0,0)" }
  }
  if (enter && globalProgress >= enter[0] && globalProgress <= enter[1]) {
    const t = (globalProgress - enter[0]) / (enter[1] - enter[0])
    return calc(t, true)
  }
  if (exit && globalProgress >= exit[0] && globalProgress <= exit[1]) {
    const t = (globalProgress - exit[0]) / (exit[1] - exit[0])
    return calc(t, false)
  }

  // Keep inactive mobile slides offscreen instead of at (0, 0, 0)
  const isBefore = globalProgress < (enter ? enter[0] : hold[0])
  const offX = isBefore
    ? (isCube ? -distance : distance)
    : (isCube ? distance : -distance)
  return { opacity: 0, transform: `translate3d(${offX}vw, 0, 0)` }
}

/* -------------------------------------------------------------------------- */
/* 3D toolkit                                                                 */
/* -------------------------------------------------------------------------- */

const u = (n: number) => `calc(var(--u) * ${n})`
const at = (x: number, y: number, z: number, extra = ""): CSSProperties => ({
  transform: `translate3d(${u(x)}, ${u(y)}, ${u(z)})${extra ? " " + extra : ""}`,
})
const cssVars = (v: Record<string, string | number>) => v as CSSProperties

type Face = "front" | "back" | "right" | "left" | "top" | "bottom"

function Box({
  w,
  h,
  d,
  faces = {},
  className = "",
  style,
}: {
  w: number
  h: number
  d: number
  faces?: Partial<Record<Face, ReactNode>>
  className?: string
  style?: CSSProperties
}) {
  const spec: Record<Face, [number, number, string]> = {
    front: [w, h, `translateZ(${u(d / 2)})`],
    back: [w, h, `rotateY(180deg) translateZ(${u(d / 2)})`],
    right: [d, h, `rotateY(90deg) translateZ(${u(w / 2)})`],
    left: [d, h, `rotateY(-90deg) translateZ(${u(w / 2)})`],
    top: [w, d, `rotateX(90deg) translateZ(${u(h / 2)})`],
    bottom: [w, d, `rotateX(-90deg) translateZ(${u(h / 2)})`],
  }
  return (
    <div className={`sv-3d ${className}`} style={style}>
      {(Object.keys(spec) as Face[]).map((f) => {
        const [fw, fh, t] = spec[f]
        return (
          <div
            key={f}
            className={`sv-face sv-mat sv-face--${f}`}
            style={{ width: u(fw), height: u(fh), left: u(-fw / 2), top: u(-fh / 2), transform: t }}
          >
            {faces[f]}
          </div>
        )
      })}
    </div>
  )
}

function Slab({
  w,
  h,
  d,
  radius,
  layers = 6,
  front,
}: {
  w: number
  h: number
  d: number
  radius: number
  layers?: number
  front?: ReactNode
}) {
  return (
    <div className="sv-3d">
      {Array.from({ length: layers }, (_, i) => {
        const z = -d / 2 + (d * i) / (layers - 1)
        return (
          <i
            key={i}
            className="sv-slice"
            style={{
              width: u(w),
              height: u(h),
              left: u(-w / 2),
              top: u(-h / 2),
              borderRadius: u(radius),
              transform: `translateZ(${u(z)})`,
            }}
          >
            {i === layers - 1 ? front : null}
          </i>
        )
      })}
    </div>
  )
}

type Pulse = { delay: number; dur?: number; reverse?: boolean }

function Segment({
  a,
  b,
  t = 0.3,
  solid = false,
  pulses = [],
}: {
  a: V3
  b: V3
  t?: number
  solid?: boolean
  pulses?: Pulse[]
}) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const dz = b[2] - a[2]
  const len = Math.hypot(dx, dy, dz)
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI
  const elev = (Math.atan2(dz, Math.hypot(dx, dy)) * 180) / Math.PI
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]

  return (
    <div
      className="sv-3d"
      style={{
        ...cssVars({ "--len": u(len) }),
        width: u(len),
        marginLeft: u(-len / 2),
        transform: `translate3d(${u(mid[0])}, ${u(mid[1])}, ${u(mid[2])}) rotateZ(${theta}deg) rotateY(${-elev}deg)`,
      }}
    >
      {solid
        ? [0, 90, 180, 270].map((k) => (
            <i
              key={k}
              className={`sv-rod ${k % 180 === 0 ? "sv-rod--a" : "sv-rod--b"}`}
              style={{ height: u(t), top: u(-t / 2), transform: `rotateX(${k}deg) translateZ(${u(t / 2)})` }}
            />
          ))
        : null}
      <i className="sv-rib" style={{ height: u(solid ? 0.28 : t), top: u(solid ? -0.14 : -t / 2) }} />
      <i
        className="sv-rib"
        style={{ height: u(solid ? 0.28 : t), top: u(solid ? -0.14 : -t / 2), transform: "rotateX(90deg)" }}
      />
      {pulses.map((p, i) => (
        <span
          key={i}
          className="sv-pulse"
          style={{
            ...cssVars({ "--dur": `${p.dur ?? 2.8}s` }),
            animationDelay: `${p.delay}s`,
            animationDirection: p.reverse ? "reverse" : "normal",
          }}
        >
          <i />
          <i />
          <i />
        </span>
      ))}
    </div>
  )
}

function Orb({
  pos,
  r,
  on = false,
  delay = 0,
  billboard = "none",
  className = "",
}: {
  pos: V3
  r: number
  on?: boolean
  delay?: number
  billboard?: "none" | "spin" | "camera"
  className?: string
}) {
  const orb = (
    <i
      className={`sv-orb ${on ? "sv-orb--on" : ""} ${className}`}
      style={{ ...cssVars({ "--d": `${delay}s` }), width: u(r * 2), height: u(r * 2), left: u(-r), top: u(-r) }}
    />
  )
  return (
    <div className="sv-3d" style={at(...pos)}>
      {billboard === "none" ? orb : <div className={`sv-bb sv-bb--${billboard}`}>{orb}</div>}
    </div>
  )
}

function Plinth() {
  const layers = 7
  return (
    <div className="sv-3d" style={at(0, 10, 0)}>
      {Array.from({ length: layers }, (_, i) => (
        <i
          key={i}
          className={`sv-disc ${i === 0 ? "sv-disc--top" : ""}`}
          style={{
            width: u(48),
            height: u(48),
            left: u(-24),
            top: u(-24),
            filter: i === 0 ? undefined : `brightness(${1 - i * 0.07})`,
            transform: `rotateX(90deg) translateZ(${u(-i * 0.22)})`,
          }}
        />
      ))}
    </div>
  )
}

function SceneFrame({ children, rig = "sway" }: { children: ReactNode; rig?: "sway" | "still" }) {
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty("--tx", String(clamp(x, -0.6, 0.6) * 18))
    el.style.setProperty("--ty", String(clamp(y, -0.6, 0.6) * -12))
  }
  const onLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--tx", "0")
    e.currentTarget.style.setProperty("--ty", "0")
  }
  return (
    <div className="sv-scene" aria-hidden="true" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="sv-halo" />
      <div className="sv-stage">
        <div className="sv-tilt">
          <div className={`sv-rig sv-rig--${rig}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Scene 1 — Laptop + phone (web & mobile)                                     */
/* -------------------------------------------------------------------------- */

function Deck() {
  return (
    <>
      <div className="sv-keys">
        {[12, 12, 11].map((n, r) => (
          <div key={r} className="sv-keyrow">
            {Array.from({ length: n }, (_, i) => (
              <i key={i} className="sv-key" />
            ))}
          </div>
        ))}
        <div className="sv-keyrow">
          <i className="sv-key sv-key--sm" />
          <i className="sv-key sv-key--sm" />
          <i className="sv-key sv-key--space" />
          <i className="sv-key sv-key--sm" />
        </div>
      </div>
      <i className="sv-pad" />
    </>
  )
}

function Screen() {
  return (
    <div className="sv-screen">
      <div className="sv-screen__side">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="sv-screen__main">
        <div className="sv-screen__bar">
          <b />
          <span />
        </div>
        <div className="sv-screen__stats">
          <i />
          <i />
          <i />
        </div>
        <div className="sv-screen__chart">
          {[42, 64, 50, 82, 60, 94, 72].map((h, i) => (
            <i key={i} style={{ height: `${h}%`, animationDelay: `${-i * 0.55}s` }} />
          ))}
        </div>
      </div>
      <i className="sv-screen__glare" />
    </div>
  )
}

function PhoneScreen() {
  return (
    <div className="sv-phone">
      <i className="sv-phone__island" />
      <i className="sv-phone__avatar" />
      <i className="sv-phone__line" style={{ width: "70%" }} />
      <i className="sv-phone__line" style={{ width: "46%" }} />
      <i className="sv-phone__card" />
      <i className="sv-phone__card" />
      <i className="sv-phone__btn" />
    </div>
  )
}

function DeviceScene() {
  return (
    <SceneFrame>
      <Plinth />
      <div className="sv-3d" style={at(-3, 0, -2)}>
        <Box w={30} h={1.4} d={20} style={at(0, 9.3, 0)} faces={{ top: <Deck /> }} />
        <Box w={23} h={1.1} d={1.4} style={at(0, 8.2, -9.6)} />
        <div className="sv-3d" style={at(0, 8.5, -9.6, "rotateX(14deg)")}>
          <Box w={30} h={20} d={1} style={at(0, -10.3, 0)} faces={{ front: <Screen /> }} />
        </div>
      </div>
      <div className="sv-3d" style={at(16, 2.5, 9.5, "rotateY(-24deg) rotateX(-4deg)")}>
        <Slab w={7.6} h={15} d={0.9} radius={1.5} layers={7} front={<PhoneScreen />} />
      </div>
    </SceneFrame>
  )
}

/* -------------------------------------------------------------------------- */
/* Scene 2 — Hub and spokes (workflow automation)                              */
/* -------------------------------------------------------------------------- */

const CUBE_SPOTS: V3[] = [
  [-13.5, 6.3, 13.5],
  [13.5, 6.3, 13.5],
  [13.5, 6.3, -13.5],
  [-13.5, 6.3, -13.5],
]
const CORE: V3 = [0, -3.2, 0]

function PipelineScene({ labels }: { labels: string[] }) {
  return (
    <SceneFrame>
      <Plinth />
      {CUBE_SPOTS.map((p, i) => (
        <Segment
          key={`rod-${i}`}
          a={CORE}
          b={p}
          t={1.15}
          solid
          pulses={[
            { delay: i * 0.55, dur: 2.6 },
            { delay: i * 0.55 + 1.3, dur: 2.6, reverse: true },
          ]}
        />
      ))}
      {CUBE_SPOTS.map((p, i) => (
        <div key={`cube-${i}`} className="sv-3d" style={at(...p)}>
          <Box
            w={7.4}
            h={7.4}
            d={7.4}
            className="sv-bob"
            style={{ animationDelay: `${-i * 1.4}s` }}
            faces={{
              front: <b className="sv-cube-label">{labels[i] ?? ""}</b>,
              top: <i className="sv-inset" />,
              right: <i className="sv-led" />,
            }}
          />
        </div>
      ))}
      <div className="sv-3d" style={at(...CORE)}>
        <i
          className="sv-ring"
          style={{ ...cssVars({ "--r": "rotateX(90deg)" }), width: u(15), height: u(15), left: u(-7.5), top: u(-7.5) }}
        />
        <i
          className="sv-ring sv-ring--b"
          style={{ ...cssVars({ "--r": "rotateX(62deg) rotateY(28deg)" }), width: u(19), height: u(19), left: u(-9.5), top: u(-9.5) }}
        />
      </div>
      <Orb pos={CORE} r={4.2} on billboard="camera" className="sv-orb--core" />
    </SceneFrame>
  )
}

/* -------------------------------------------------------------------------- */
/* Scene 3 — Layered neural network (AI integration)                           */
/* -------------------------------------------------------------------------- */

const NN_LAYERS = [4, 5, 5, 3]
const NN_NODES = NN_LAYERS.flatMap((n, L) =>
  Array.from({ length: n }, (_, k) => ({
    L,
    k,
    pos: [(L - 1.5) * 9.6, (k - (n - 1) / 2) * 4.7 - 3, (((k * 3 + L * 5) % 5) - 2) * 2.7] as V3,
    r: L === NN_LAYERS.length - 1 ? 1.9 : 1.5,
  })),
)
const NN_EDGES = (() => {
  const out: { a: number; b: number; L: number }[] = []
  let offset = 0
  for (let L = 0; L < NN_LAYERS.length - 1; L++) {
    const n = NN_LAYERS[L]
    const m = NN_LAYERS[L + 1]
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (Math.abs(i / (n - 1) - j / (m - 1)) <= 0.5) out.push({ a: offset + i, b: offset + n + j, L })
      }
    }
    offset += n
  }
  return out
})()

function NeuralScene() {
  return (
    <SceneFrame rig="still">
      <Plinth />
      <div className="sv-spin">
        {NN_EDGES.map((e, i) => (
          <Segment
            key={i}
            a={NN_NODES[e.a].pos}
            b={NN_NODES[e.b].pos}
            t={0.2}
            pulses={i % 2 === 0 ? [{ delay: e.L * 0.7 + (i % 3) * 0.35, dur: 3.3 }] : []}
          />
        ))}
        {NN_NODES.map((n, i) => (
          <Orb
            key={i}
            pos={n.pos}
            r={n.r}
            billboard="spin"
            delay={-(n.L * 0.7 + (i % 3) * 0.2)}
          />
        ))}
      </div>
    </SceneFrame>
  )
}

function ServiceScene({ service }: { service: Service }) {
  if (service.id === "web-mobile") return <DeviceScene />
  if (service.id === "workflow-automation") {
    const labels = service.cube.slice(0, 4).map((f) => f.short)
    return <PipelineScene labels={labels} />
  }
  return <NeuralScene />
}

/* -------------------------------------------------------------------------- */
/* Content + accordion                                                         */
/* -------------------------------------------------------------------------- */

function ServiceContent({ service }: { service: Service }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="sv-content">
      <h2 className="sv-title">{service.title}</h2>
      <p className="sv-subtitle">{service.subtitle}</p>
      <p className="sv-pitch">{service.pitch}</p>

      <ul className="sv-list">
        {service.slots.map((slot, index) => {
          const isOpen = open === index
          const id = `${service.id}-slot-${index}`
          return (
            <li key={slot.title} className="sv-row" data-open={isOpen}>
              <button
                type="button"
                id={`${id}-btn`}
                className="sv-row__btn"
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span className="sv-row__led" aria-hidden="true" />
                <span className="sv-row__title">{slot.title}</span>
                <span className="sv-row__plus" aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
              <div
                id={`${id}-panel`}
                role="region"
                aria-labelledby={`${id}-btn`}
                aria-hidden={!isOpen}
                className="sv-row__panel"
              >
                <div className="sv-row__clip">
                  <p className="sv-row__desc">{slot.description}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return isDesktop
}

/* -------------------------------------------------------------------------- */
/* Main section                                                                */
/* -------------------------------------------------------------------------- */
export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)
  const isDesktop = useIsDesktop()

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
        if (rawProgress < 0.1) lockedProgress = 0
        else if (rawProgress > 0.9) lockedProgress = 1
        else lockedProgress = (rawProgress - 0.1) / 0.8

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

  return (
    <section style={{ backgroundColor: "var(--bg)" }} aria-label="Services">
      <div ref={sectionRef} className="relative h-[350vh]">
        <div className="sv-root sticky top-0 h-screen overflow-hidden flex items-center">
          <div className="sv-ambient" aria-hidden="true" />

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 h-full lg:h-auto">
            {services.map((service, i) => {
              const isEven = i % 2 === 0
              const cubeCol = isEven ? "left" : "right"
              const contentCol = isEven ? "right" : "left"

              const dCube = getServiceStyle(progress, i, cubeCol)
              const dContent = getServiceStyle(progress, i, contentCol)
              const mCube = getMobileStyle(progress, i, true)
              const mContent = getMobileStyle(progress, i, false)

              const isCurrent = mContent.opacity > 0.1
              const isCurrentDesktop = dContent.opacity > 0.1

              return (
                <Fragment key={service.id}>
                  {!isDesktop && (
                    <>
                      {/* ---- Mobile scene ---- */}
                      <div
                        className="absolute inset-x-0 flex lg:hidden justify-center pointer-events-none"
                        style={{
                          ...mCube,
                          top: "3vh",
                          visibility: mCube.opacity > 0 ? "visible" : "hidden",
                          zIndex: mCube.opacity > 0.1 ? 5 : 0,
                          willChange: "transform, opacity",
                        }}
                      >
                        <div style={{ pointerEvents: mCube.opacity > 0.1 ? "auto" : "none" }}>
                          {mCube.opacity > 0 && <ServiceScene service={service} />}
                        </div>
                      </div>

                      {/* ---- Mobile content ---- */}
                      <div
                        className="absolute inset-x-0 flex lg:hidden justify-center pointer-events-none"
                        style={{
                          ...mContent,
                          top: "calc(8vh + var(--u) * 48)",
                          visibility: mContent.opacity > 0 ? "visible" : "hidden",
                          zIndex: isCurrent ? 20 : 0,
                          willChange: "transform, opacity",
                        }}
                      >
                        <div
                          className="w-full max-w-lg px-2"
                          style={{
                            pointerEvents: isCurrent ? "auto" : "none",
                          }}
                        >
                          <ServiceContent service={service} />
                        </div>
                      </div>
                    </>
                  )}

                  {isDesktop && (
                    <>
                      {/* ---- Desktop scene ---- */}
                      <div
                        className={`absolute inset-y-0 hidden lg:flex w-1/2 items-center justify-center ${isEven ? "left-0" : "right-0"}`}
                        style={{
                          ...dCube,
                          visibility: dCube.opacity > 0 ? "visible" : "hidden",
                          zIndex: dCube.opacity > 0.1 ? 5 : 0,
                          pointerEvents: dCube.opacity > 0.1 ? "auto" : "none",
                          willChange: "transform, opacity",
                        }}
                      >
                        {dCube.opacity > 0 && <ServiceScene service={service} />}
                      </div>

                      {/* ---- Desktop content ---- */}
                      <div
                        className={`absolute inset-y-0 hidden lg:flex w-1/2 items-center justify-center ${isEven ? "right-0" : "left-0"}`}
                        style={{
                          ...dContent,
                          visibility: dContent.opacity > 0 ? "visible" : "hidden",
                          zIndex: isCurrentDesktop ? 20 : 0,
                          pointerEvents: isCurrentDesktop ? "auto" : "none",
                          willChange: "transform, opacity",
                        }}
                      >
                        <ServiceContent service={service} />
                      </div>
                    </>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}