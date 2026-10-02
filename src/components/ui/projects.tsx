"use client"

import * as React from "react"

export default function ProjectsSection() {
  const [activeTab, setActiveTab] = React.useState(0)

  // Placeholder data for the 3 browser tabs + See All card
  const projects = [
    {
      id: "01",
      title: "PROJECT_01",
      accentColor: "#ff3300", // Bright red tab style from your reference
      badge: "WEB & MOBILE",
      description: "High-performance full-stack ecosystem engineered with scalable microservices and real-time synchronization.",
    },
    {
      id: "02",
      title: "PROJECT_02",
      accentColor: "#ff8800", // Vibrant orange tab style
      badge: "AI & AUTOMATION",
      description: "Intelligent pipeline processing vector embeddings and automated workflow routing via n8n and LLM integrations.",
    },
    {
      id: "03",
      title: "PROJECT_03",
      accentColor: "#ccff00", // Acid lime tab style
      badge: "SYSTEMS & IOT",
      description: "Low-latency embedded hardware integration coupled with custom machine learning models running on edge devices.",
    },
  ]

  return (
    <section id="projects" className="relative w-full bg-[#111111] text-[#ebebea] py-24 px-8 md:px-16 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5fb57a] uppercase mb-2 block">
            // SELECTED ARCHIVE
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter font-sans">
            Featured Works
          </h2>
        </div>
        <p className="text-sm font-mono opacity-60 mt-4 md:mt-0">
          [ 03 CORE SYSTEMS ENGINEERED ]
        </p>
      </div>

      {/* Tabs Navigation Header (Internet Tab Bar layout) */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-white/10 pb-4">
        {projects.map((proj, idx) => (
          <button
            key={proj.id}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all clip-tab flex items-center gap-3 ${
              activeTab === idx
                ? "bg-white text-black translate-y-[-2px]"
                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            }`}
            style={{
              borderTop: activeTab === idx ? `3px solid ${proj.accentColor}` : "3px solid transparent",
            }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: proj.accentColor }}
            />
            {proj.title}
          </button>
        ))}

        {/* Fourth element: See All Works (Always visible / static) */}
        <a
          href="#all-works"
          className="ml-auto px-6 py-3 bg-[#222222] text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 hover:bg-white hover:text-black transition-all flex items-center gap-2 group"
        >
          <span>SEE ALL WORKS</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      {/* Stacked / Sliding Tab Content Cards */}
      <div className="relative min-h-[450px] w-full flex flex-col gap-8">
        {projects.map((proj, idx) => {
          const isActive = activeTab === idx
          return (
            <div
              key={proj.id}
              className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive
                  ? "opacity-100 translate-y-0 relative z-10 pointer-events-auto"
                  : "opacity-0 translate-y-12 absolute inset-0 pointer-events-none"
              }`}
            >
              <div className="w-full bg-[#18181a] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Tab Window Controls Decorator */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-black/40 border-b border-white/5 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                    SESSION // {proj.title}
                  </span>
                </div>

                {/* Left Side: Info */}
                <div className="lg:col-span-7 pt-6">
                  <span
                    className="inline-block px-3 py-1 text-[10px] font-mono font-bold tracking-widest rounded-full mb-4 text-black"
                    style={{ backgroundColor: proj.accentColor }}
                  >
                    {proj.badge}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-4 text-white">
                    {proj.title} ARCHITECTURE
                  </h3>
                  <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                    {proj.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#5fb57a] hover:text-white transition-colors">
                      VIEW SOURCE // DOCS
                    </button>
                    <button className="px-6 py-3 bg-transparent border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg hover:border-white transition-colors">
                      LIVE PREVIEW ↗
                    </button>
                  </div>
                </div>

                {/* Right Side: Visual Mockup Box */}
                <div className="lg:col-span-5 pt-6">
                  <div className="w-full aspect-[16/10] bg-black/60 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/5 opacity-50" />
                    <span className="font-mono text-xs text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">
                      [ INTERACTIVE MOCKUP PREVIEW ]
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}