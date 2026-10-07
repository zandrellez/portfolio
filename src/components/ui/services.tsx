"use client"
import { useEffect, useRef, useState, Fragment } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react"
import { services } from "../../data/services"

type Service = (typeof services)[number]
type V3 = readonly [number, number, number]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/* -------------------------------------------------------------------------- */
/* Scroll choreography (unchanged): 3 zones, each with hold + crossfade        */
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
  return { opacity: 0, transform: "translate3d(0,0,0) scale(1)" }
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
  return { opacity: 0, transform: "translate3d(0,0,0)" }
}

/* -------------------------------------------------------------------------- */
/* 3D toolkit                                                                  */
/*                                                                             */
/* Every object is built from real solids: 6-face boxes, stacked slices for    */
/* rounded shapes, and oriented segments for rods/wires. All sizes are in      */
/* "scene units" (u) so a whole scene scales with one CSS variable.            */
/* Lighting is baked per face (top lightest, right/left darker, bottom darkest)*/
/* and the cameras only sway, so the light direction always reads correctly.   */
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

/** Rounded solid built from stacked slices (gives a real edge, unlike a flat card). */
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

/** A rod or wire between two 3D points, optionally carrying light pulses. */
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
      {/* inner light wire (visible through glass rods, standalone otherwise) */}
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

/** Shaded sphere. `billboard` keeps it facing the camera while a parent rotates. */
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

/** Cylindrical stage every object stands on: stacked discs with a lit top. */
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

      {/* laptop */}
      <div className="sv-3d" style={at(-3, 0, -2)}>
        <Box w={30} h={1.4} d={20} style={at(0, 9.3, 0)} faces={{ top: <Deck /> }} />
        <Box w={23} h={1.1} d={1.4} style={at(0, 8.2, -9.6)} />
        {/* lid: pivots on the hinge, 104° open */}
        <div className="sv-3d" style={at(0, 8.5, -9.6, "rotateX(14deg)")}>
          <Box w={30} h={20} d={1} style={at(0, -10.3, 0)} faces={{ front: <Screen /> }} />
        </div>
      </div>

      {/* phone */}
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

      {/* core */}
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
/* Content + accordion (one row open at a time, description inside the card)   */
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

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const CSS = `
.sv-root{--u:clamp(2.5px,.44vh,4.2px)}
@media (min-width:1024px){.sv-root{--u:clamp(5px,min(.62vw,.95vh),7.5px)}}

/* ambient backdrop */
.sv-ambient{position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(640px circle at 50% 52%,var(--accent-soft),transparent 70%),
    radial-gradient(circle,var(--border) 1px,transparent 1.2px) 0 0/28px 28px;
  -webkit-mask-image:radial-gradient(ellipse 70% 62% at 50% 50%,#000 20%,transparent 100%);
  mask-image:radial-gradient(ellipse 70% 62% at 50% 50%,#000 20%,transparent 100%);
  opacity:.9}

/* ---- 3D scene ---- */
.sv-scene{position:relative;width:calc(var(--u)*52);height:calc(var(--u)*52);flex:none;touch-action:pan-y;
  --m-top:color-mix(in srgb,var(--contrast-surface-raised) 72%,white);
  --m-front:color-mix(in srgb,var(--contrast-surface-raised) 90%,white);
  --m-side:color-mix(in srgb,var(--contrast-surface) 62%,black);
  --m-under:color-mix(in srgb,var(--contrast-surface) 30%,black);
  --edge:color-mix(in srgb,var(--contrast-text-h) 18%,transparent);
  --acc:var(--contrast-accent);--acc-glow:var(--contrast-accent-glow)}
.sv-halo{position:absolute;left:4%;right:4%;bottom:8%;height:40%;border-radius:50%;
  background:radial-gradient(closest-side,var(--contrast-accent-soft),transparent);
  filter:blur(calc(var(--u)*2.5));animation:sv-breathe 5s ease-in-out infinite}
@keyframes sv-breathe{50%{opacity:.5;transform:scale(1.08)}}
.sv-stage{position:absolute;inset:0;perspective:calc(var(--u)*190);perspective-origin:50% 42%}
.sv-tilt{position:absolute;inset:0;transform-style:preserve-3d;
  transform:rotateX(calc(var(--ty,0)*1deg)) rotateY(calc(var(--tx,0)*1deg));
  transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.sv-rig{position:absolute;left:50%;top:calc(50% + var(--u)*3);width:0;height:0;transform-style:preserve-3d;will-change:transform}
.sv-rig--sway{animation:sv-sway 11s ease-in-out infinite}
.sv-rig--still{transform:rotateX(-18deg)}
@keyframes sv-sway{
  0%,100%{transform:rotateX(-22deg) rotateY(-38deg)}
  50%{transform:rotateX(-22deg) rotateY(-20deg)}}

.sv-3d{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d}
.sv-face{position:absolute;backface-visibility:hidden;overflow:hidden;box-shadow:inset 0 0 0 1px var(--edge)}
.sv-mat.sv-face--top{background:linear-gradient(155deg,var(--m-top),color-mix(in srgb,var(--m-top) 80%,black))}
.sv-mat.sv-face--front,.sv-mat.sv-face--back{background:linear-gradient(160deg,var(--m-front),color-mix(in srgb,var(--m-front) 68%,black))}
.sv-mat.sv-face--right,.sv-mat.sv-face--left{background:linear-gradient(90deg,var(--m-side),color-mix(in srgb,var(--m-side) 78%,black))}
.sv-mat.sv-face--bottom{background:var(--m-under)}
.sv-slice{position:absolute;background:linear-gradient(160deg,var(--m-front),var(--m-side));box-shadow:inset 0 0 0 1px var(--edge)}

/* plinth */
.sv-disc{position:absolute;border-radius:50%;background:radial-gradient(circle,var(--m-front),var(--m-side))}
.sv-disc--top{
  background:
    radial-gradient(circle,transparent 0 56%,var(--edge) 56.4%,transparent 57.2%),
    radial-gradient(circle,transparent 0 80%,color-mix(in srgb,var(--acc) 70%,transparent) 80.4%,transparent 81.6%),
    radial-gradient(circle at 50% 38%,var(--m-top),var(--m-front) 72%);
  box-shadow:inset 0 0 calc(var(--u)*4) rgba(0,0,0,.35),0 0 calc(var(--u)*5) var(--acc-glow)}

/* rods, wires, pulses */
.sv-rod{position:absolute;left:0;width:100%;box-shadow:inset 0 0 0 1px var(--edge)}
.sv-rod--a{background:color-mix(in srgb,var(--m-top) 46%,transparent)}
.sv-rod--b{background:color-mix(in srgb,var(--m-side) 52%,transparent)}
.sv-rib{position:absolute;left:0;width:100%;border-radius:99px;opacity:.7;
  background:linear-gradient(90deg,transparent,var(--acc) 10%,var(--acc) 90%,transparent);
  box-shadow:0 0 calc(var(--u)*1) var(--acc-glow)}
.sv-pulse{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d;opacity:0;
  animation:sv-travel var(--dur,2.8s) cubic-bezier(.45,0,.55,1) infinite}
.sv-pulse i{position:absolute;width:calc(var(--u)*1.8);height:calc(var(--u)*1.8);left:calc(var(--u)*-.9);top:calc(var(--u)*-.9);
  border-radius:50%;background:radial-gradient(circle,#fff 0 22%,var(--acc) 48%,transparent 70%)}
.sv-pulse i:nth-child(2){transform:rotateX(90deg)}
.sv-pulse i:nth-child(3){transform:rotateY(90deg)}
@keyframes sv-travel{
  0%{transform:translateX(0);opacity:0}
  12%{opacity:1}88%{opacity:1}
  100%{transform:translateX(var(--len));opacity:0}}

/* spheres */
.sv-orb{position:absolute;border-radius:50%;
  background:radial-gradient(circle at 34% 28%,color-mix(in srgb,var(--contrast-text-h) 75%,transparent) 0 7%,var(--m-top) 28%,var(--m-front) 62%,color-mix(in srgb,var(--m-front) 38%,black) 100%);
  box-shadow:inset calc(var(--u)*-.25) calc(var(--u)*-.35) calc(var(--u)*.7) rgba(0,0,0,.45),0 0 0 1px var(--edge)}
.sv-orb::after{content:"";position:absolute;inset:0;border-radius:50%;opacity:0;
  background:radial-gradient(circle at 34% 28%,#fff 0 9%,var(--acc) 34%,color-mix(in srgb,var(--acc) 36%,black) 100%);
  box-shadow:0 0 calc(var(--u)*2.2) var(--acc-glow);
  animation:sv-fire 3.6s ease-in-out infinite;animation-delay:var(--d,0s)}
.sv-orb--on::after{opacity:1;animation:none}
.sv-orb--core{box-shadow:0 0 calc(var(--u)*7) var(--acc-glow),0 0 calc(var(--u)*14) var(--acc-glow)}
.sv-orb--core::after{box-shadow:inset calc(var(--u)*-.5) calc(var(--u)*-.7) calc(var(--u)*1.2) rgba(0,0,0,.4)}
@keyframes sv-fire{0%,55%,100%{opacity:0}18%,34%{opacity:1}}

.sv-bb{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d}
.sv-bb--spin{transform:rotateX(18deg);animation:sv-unspin 36s linear infinite}
.sv-bb--camera{transform:rotateY(29deg) rotateX(22deg)}
.sv-spin{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d;animation:sv-spin 36s linear infinite}
@keyframes sv-spin{to{transform:rotateY(360deg)}}
@keyframes sv-unspin{from{transform:rotateY(0) rotateX(18deg)}to{transform:rotateY(-360deg) rotateX(18deg)}}

.sv-ring{position:absolute;border-radius:50%;transform:var(--r);
  border:1px dashed color-mix(in srgb,var(--acc) 75%,transparent);animation:sv-ring 16s linear infinite}
.sv-ring--b{animation-duration:23s;animation-direction:reverse}
@keyframes sv-ring{from{transform:var(--r) rotateZ(0)}to{transform:var(--r) rotateZ(360deg)}}
.sv-bob{animation:sv-bob 6s ease-in-out infinite}
@keyframes sv-bob{50%{transform:translateY(calc(var(--u)*-.7))}}

/* cube face details */
.sv-cube-label{position:absolute;inset:0;display:grid;place-items:center;font-weight:650;letter-spacing:-.02em;
  font-size:calc(var(--u)*2.3);color:var(--acc);text-shadow:0 0 calc(var(--u)*1.6) var(--acc-glow)}
.sv-inset{position:absolute;inset:calc(var(--u)*1.1);border-radius:calc(var(--u)*.6);box-shadow:inset 0 0 0 1px var(--edge)}
.sv-led{position:absolute;left:50%;bottom:calc(var(--u)*1.3);width:calc(var(--u)*2.4);height:calc(var(--u)*.45);
  border-radius:99px;transform:translateX(-50%);background:var(--acc);box-shadow:0 0 calc(var(--u)*1.2) var(--acc-glow)}

/* laptop details */
.sv-keys{position:absolute;left:calc(var(--u)*2.4);right:calc(var(--u)*2.4);top:calc(var(--u)*2.2);display:grid;gap:calc(var(--u)*.45)}
.sv-keyrow{display:flex;gap:calc(var(--u)*.45);height:calc(var(--u)*1.9)}
.sv-key{flex:1;border-radius:calc(var(--u)*.35);
  background:linear-gradient(180deg,color-mix(in srgb,var(--m-front) 82%,black),color-mix(in srgb,var(--m-front) 52%,black));
  box-shadow:0 calc(var(--u)*.25) 0 rgba(0,0,0,.5),inset 0 1px 0 var(--edge)}
.sv-key--sm{flex:1.4}.sv-key--space{flex:5}
.sv-pad{position:absolute;left:calc(var(--u)*10);right:calc(var(--u)*10);bottom:calc(var(--u)*1.8);height:calc(var(--u)*5);
  border-radius:calc(var(--u)*.8);background:color-mix(in srgb,var(--m-front) 86%,black);
  box-shadow:inset 0 0 0 1px var(--edge),inset 0 1px 3px rgba(0,0,0,.4)}
.sv-screen{position:absolute;inset:calc(var(--u)*.9);border-radius:calc(var(--u)*.7);background:var(--contrast-bg);overflow:hidden;display:flex;
  box-shadow:inset 0 0 0 1px var(--edge),0 0 calc(var(--u)*3) color-mix(in srgb,var(--acc) 25%,transparent)}
.sv-screen__side{width:13%;display:flex;flex-direction:column;gap:calc(var(--u)*1.2);padding:calc(var(--u)*1.5) calc(var(--u)*1);border-right:1px solid var(--edge)}
.sv-screen__side i{height:calc(var(--u)*.7);border-radius:99px;background:var(--edge)}
.sv-screen__side i:first-child{background:var(--acc)}
.sv-screen__main{flex:1;min-width:0;padding:calc(var(--u)*1.5);display:flex;flex-direction:column;gap:calc(var(--u)*1.3)}
.sv-screen__bar{display:flex;justify-content:space-between;align-items:center}
.sv-screen__bar b{width:30%;height:calc(var(--u)*.8);border-radius:99px;background:var(--contrast-text-h);opacity:.75}
.sv-screen__bar span{width:calc(var(--u)*2.2);height:calc(var(--u)*2.2);border-radius:50%;background:var(--acc);box-shadow:0 0 calc(var(--u)*1.2) var(--acc-glow)}
.sv-screen__stats{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--u)*.9)}
.sv-screen__stats i{height:calc(var(--u)*3.8);border-radius:calc(var(--u)*.5);background:var(--contrast-surface);box-shadow:inset 0 0 0 1px var(--edge)}
.sv-screen__stats i:first-child{background:color-mix(in srgb,var(--acc) 16%,var(--contrast-surface));box-shadow:inset 0 0 0 1px var(--acc)}
.sv-screen__chart{flex:1;display:flex;align-items:flex-end;gap:calc(var(--u)*.9)}
.sv-screen__chart i{flex:1;border-radius:calc(var(--u)*.3) calc(var(--u)*.3) 0 0;transform-origin:bottom;
  background:linear-gradient(180deg,var(--acc),color-mix(in srgb,var(--acc) 10%,transparent));animation:sv-bar 4.5s ease-in-out infinite}
@keyframes sv-bar{50%{transform:scaleY(.7)}}
.sv-screen__glare{position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.12),transparent 38%);pointer-events:none}

/* phone details */
.sv-phone{position:absolute;inset:calc(var(--u)*.45);border-radius:calc(var(--u)*1.1);background:var(--contrast-bg);overflow:hidden;
  display:flex;flex-direction:column;gap:calc(var(--u)*1);padding:calc(var(--u)*2.2) calc(var(--u)*1) calc(var(--u)*1);
  box-shadow:inset 0 0 0 1px var(--edge),0 0 calc(var(--u)*2) color-mix(in srgb,var(--acc) 28%,transparent)}
.sv-phone__island{position:absolute;top:calc(var(--u)*.6);left:50%;width:calc(var(--u)*2.4);height:calc(var(--u)*.7);border-radius:99px;transform:translateX(-50%);background:#000}
.sv-phone__avatar{width:calc(var(--u)*2.6);height:calc(var(--u)*2.6);border-radius:50%;background:var(--acc);box-shadow:0 0 calc(var(--u)*1.2) var(--acc-glow)}
.sv-phone__line{height:calc(var(--u)*.6);border-radius:99px;background:var(--edge)}
.sv-phone__card{height:calc(var(--u)*2.6);border-radius:calc(var(--u)*.6);background:var(--contrast-surface);box-shadow:inset 0 0 0 1px var(--edge)}
.sv-phone__btn{margin-top:auto;height:calc(var(--u)*1.7);border-radius:99px;background:var(--acc);opacity:.9}

/* ---- content ---- */
.sv-content{display:flex;flex-direction:column;width:100%;max-width:580px;padding:8px 16px}
@media (min-width:640px){.sv-content{padding:8px 40px}}
.sv-title{margin:0;max-width:20ch;font-size:clamp(23px,6.4vw,31px);line-height:1.06;letter-spacing:-.035em;font-weight:650;color:var(--text-h);text-wrap:balance}
.sv-subtitle{margin:8px 0 0;font-size:13px;line-height:1.4;font-weight:500;letter-spacing:-.005em;color:var(--text-h);opacity:.72}
.sv-pitch{margin:10px 0 0;max-width:52ch;font-size:12.5px;line-height:1.55;color:var(--text)}
.sv-list{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
@media (min-width:1024px){
  .sv-title{font-size:clamp(34px,3.4vw,50px)}
  .sv-subtitle{margin-top:14px;font-size:16px}
  .sv-pitch{margin-top:18px;font-size:15.5px;line-height:1.65}
  .sv-list{margin-top:34px;gap:10px}}

.sv-row{border:1px solid var(--border);border-radius:18px;overflow:hidden;
  background:color-mix(in srgb,var(--surface) 78%,transparent);
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  transition:border-color .35s,background .35s,box-shadow .45s}
.sv-row:hover{border-color:color-mix(in srgb,var(--accent) 38%,var(--border))}
.sv-row[data-open="true"]{
  border-color:color-mix(in srgb,var(--accent) 62%,var(--border));
  background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 10%,var(--surface)),var(--surface) 72%);
  box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 55%,transparent),0 22px 44px -24px var(--accent-glow),0 2px 8px rgba(0,0,0,.06)}
.sv-row__btn{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:center;gap:14px;cursor:pointer;padding:14px 16px;border-radius:inherit}
@media (min-width:1024px){.sv-row__btn{padding:18px 22px}}
.sv-row__btn:focus-visible{outline:2px solid var(--text-h);outline-offset:-4px}
.sv-row__led{flex:none;width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--muted);opacity:.7;
  transition:background .35s,box-shadow .35s,opacity .35s}
.sv-row[data-open="true"] .sv-row__led{background:var(--accent);opacity:1;box-shadow:0 0 0 4px var(--accent-soft),0 0 14px var(--accent-glow)}
.sv-row__title{flex:1;font-size:14px;line-height:1.3;font-weight:600;letter-spacing:-.012em;color:var(--text);transition:color .3s}
@media (min-width:1024px){.sv-row__title{font-size:16px}}
.sv-row[data-open="true"] .sv-row__title,.sv-row__btn:hover .sv-row__title{color:var(--text-h)}
.sv-row__plus{flex:none;position:relative;width:12px;height:12px;color:var(--muted);transition:color .3s}
.sv-row__plus i{position:absolute;left:0;top:50%;width:100%;height:1.5px;margin-top:-.75px;border-radius:2px;background:currentColor;
  transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.sv-row__plus i:last-child{transform:rotate(90deg)}
.sv-row[data-open="true"] .sv-row__plus{color:var(--text-h)}
.sv-row[data-open="true"] .sv-row__plus i:last-child{transform:rotate(0)}

.sv-row__panel{display:grid;grid-template-rows:0fr;visibility:hidden;
  transition:grid-template-rows .45s cubic-bezier(.2,.8,.2,1),visibility 0s linear .45s}
.sv-row[data-open="true"] .sv-row__panel{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
.sv-row__clip{overflow:hidden;min-height:0}
.sv-row__desc{margin:0;padding:0 18px 16px 38px;font-size:12.5px;line-height:1.6;color:var(--text);
  opacity:0;transform:translateY(-6px);transition:opacity .3s,transform .45s cubic-bezier(.2,.8,.2,1)}
.sv-row[data-open="true"] .sv-row__desc{opacity:1;transform:none;transition-delay:.08s}
@media (min-width:1024px){.sv-row__desc{padding:0 26px 20px 44px;font-size:14.5px;line-height:1.65}}

/* ---- progress rail ---- */
.sv-rail{position:absolute;z-index:5;top:10px;left:50%;transform:translateX(-50%);display:flex;gap:8px;width:min(86vw,320px)}
@media (min-width:1024px){.sv-rail{top:auto;bottom:clamp(18px,4vh,40px);gap:16px;width:min(60vw,560px)}}
.sv-rail__item{all:unset;box-sizing:border-box;flex:1;display:flex;flex-direction:column;gap:10px;padding:8px 0;cursor:pointer;color:var(--muted);transition:color .3s}
.sv-rail__item:focus-visible{outline:2px solid var(--text-h);outline-offset:2px;border-radius:4px}
.sv-rail__item[aria-current="true"]{color:var(--text-h)}
.sv-rail__track{position:relative;height:2px;border-radius:2px;overflow:hidden;background:var(--border)}
.sv-rail__fill{position:absolute;inset:0;background:var(--accent);transform-origin:left;transform:scaleX(var(--p,0))}
.sv-rail__label{display:none;font-size:12.5px;font-weight:500;letter-spacing:.005em}
@media (min-width:1024px){.sv-rail__label{display:block}}

@media (prefers-reduced-motion:reduce){
  .sv-root *,.sv-root *::before,.sv-root *::after{animation:none!important;transition-duration:.01ms!important;transition-delay:0s!important}
  .sv-rig--sway{transform:rotateX(-22deg) rotateY(-29deg)}
  .sv-orb::after{opacity:0}
}
`

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
      <style>{CSS}</style>
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

              return (
                <Fragment key={service.id}>
                  {!isDesktop && (
                    <>
                      {/* ---- Mobile scene ---- */}
                      <div
                        className="absolute inset-x-0 flex lg:hidden justify-center pointer-events-none"
                        style={{ ...mCube, top: "3vh", willChange: "transform, opacity" }}
                      >
                        <div className="pointer-events-auto">
                          {mCube.opacity > 0 && <ServiceScene service={service} />}
                        </div>
                      </div>

                      {/* ---- Mobile content ---- */}
                      <div
                        className="absolute inset-x-0 flex lg:hidden justify-center pointer-events-none"
                        style={{
                          ...mContent,
                          top: "calc(8vh + var(--u) * 48)",
                          pointerEvents: mContent.opacity > 0.1 ? "auto" : "none",
                          willChange: "transform, opacity",
                        }}
                      >
                        <div className="pointer-events-auto w-full max-w-lg px-2">
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
                          pointerEvents: dContent.opacity > 0.1 ? "auto" : "none",
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