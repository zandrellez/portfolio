"use client"

import * as React from "react"

export default function ProjectsSection() {
  const [activeTab, setActiveTab] = React.useState(0)
  const [openedTabs, setOpenedTabs] = React.useState(1)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const projects = [
    {
      id: "01",
      slug: "bazaar-x",
      title: "BazaarX Marketplace",
      badge: "WEB & MOBILE",
      description: "High-performance full-stack ecosystem engineered with scalable microservices and real-time synchronization.",
    },
    {
      id: "02",
      slug: "echo-wear",
      title: "EchoWear Translation",
      badge: "AI & AUTOMATION",
      description: "Intelligent pipeline processing vector embeddings and automated workflow routing via n8n and LLM integrations.",
    },
    {
      id: "03",
      slug: "veloxity-logistics",
      title: "Veloxity Core",
      badge: "SYSTEMS & IOT",
      description: "Low-latency embedded hardware integration coupled with custom machine learning models running on edge devices.",
    },
  ]

  // Reveal each project as its scroll stage enters the pinned viewport.
  React.useEffect(() => {
    const handleScroll = () => {
      const section = containerRef.current
      if (!section) return

      const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1)
      const scrolledDistance = Math.min(
        Math.max(-section.getBoundingClientRect().top, 0),
        scrollableDistance,
      )
      const progress = scrolledDistance / scrollableDistance
      const currentIdx = Math.min(
        projects.length - 1,
        Math.floor(progress * projects.length),
      )

      setActiveTab(currentIdx)
      setOpenedTabs((count) => Math.max(count, currentIdx + 1))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [projects.length])

  const activeProject = projects[activeTab]

  const scrollToTab = (idx: number) => {
    const section = containerRef.current
    if (!section) return

    const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1)
    const stageProgress = (idx + 0.1) / projects.length
    const sectionTop = window.scrollY + section.getBoundingClientRect().top

    window.scrollTo({
      top: sectionTop + scrollableDistance * stageProgress,
      behavior: "smooth",
    })
  }

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full bg-[#111111]"
      style={{ height: `${(projects.length + 1) * 100}svh` }}
    >
      {/* Pinned Viewport - Sticks to screen while scrolling */}
      <div className="sticky top-0 h-svh w-full flex flex-col justify-center py-12 overflow-hidden">
        
        <div className="w-full">
          
          {/* Section Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#5fb57a] uppercase mb-2 block">
                // SELECTED ARCHIVE
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#ebebea]">
                Featured Works
              </h2>
            </div>
            <p className="text-sm font-mono text-white/50 mt-4 md:mt-0">
              [ SCROLL TO OPEN TABS // {activeTab + 1} OF {projects.length} ]
            </p>
          </div>

          {/* Browser Window Frame */}
          <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117] font-sans">
            
            {/* Browser Tab Bar (Only shows tabs as you scroll to them) */}
            <div className="flex items-end bg-[#202124] px-2 pt-2 gap-1 overflow-x-auto no-scrollbar">
              {projects.slice(0, openedTabs).map((proj, idx) => {
                const isActive = activeTab === idx
                return (
                  <button
                    key={proj.id}
                    onClick={() => scrollToTab(idx)}
                    className={`min-w-[180px] max-w-[240px] flex-1 px-4 py-2.5 rounded-t-lg flex items-center gap-3 text-xs transition-colors border-r border-white/5 animate-in slide-in-from-left-4 fade-in duration-300 ${
                      isActive 
                        ? "bg-[#35363a] text-white" 
                        : "bg-transparent text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#5fb57a]' : 'bg-white/20'}`} />
                    <span className="truncate font-medium">FEATURED WORKS {proj.id}</span>
                    {isActive && <span className="ml-auto opacity-50 hover:opacity-100 font-bold">×</span>}
                  </button>
                )
              })}
              {openedTabs < projects.length && (
                <button
                  type="button"
                  onClick={() => scrollToTab(openedTabs)}
                  aria-label="Scroll to next project tab"
                  className="w-8 h-8 ml-1 rounded hover:bg-white/5 flex items-center justify-center text-white/50"
                >
                  +
                </button>
              )}
            </div>

            {/* Browser Address Bar */}
            <div className="bg-[#35363a] px-4 py-2 flex items-center gap-4 border-b border-white/5">
              <div className="flex items-center gap-4 text-white/60 text-lg select-none">
                <span className="cursor-pointer hover:text-white transition-colors">←</span>
                <span className="cursor-pointer hover:text-white transition-colors opacity-40">→</span>
                <span className="cursor-pointer hover:text-white transition-colors text-sm">↻</span>
              </div>
              <div className="flex-1 bg-[#202124] rounded-full px-4 py-1.5 flex items-center gap-3 text-sm text-white/80 border border-white/5 transition-all">
                <span className="text-xs">🔒</span>
                <span className="font-mono opacity-60">github.com/zandrellez/</span>
                <span className="font-mono text-white transition-all duration-300">{activeProject.slug}</span>
              </div>
            </div>

            {/* GitHub Repository Content Area */}
            <div className="relative overflow-hidden min-h-[600px] bg-[#0d1117]">
              {projects.map((proj, idx) => {
                const isActive = activeTab === idx
                if (!isActive) return null

                return (
                  <div key={proj.id} className="absolute inset-0 p-6 md:p-8 flex flex-col gap-6 text-[#e6edf3] animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* Repo Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xl">
                        <span className="text-[#8b949e]">zandrellez</span>
                        <span className="text-[#8b949e]">/</span>
                        <span className="font-bold text-[#2f81f7]">{proj.slug}</span>
                        <span className="border border-[#30363d] rounded-full px-2.5 py-0.5 text-xs text-[#8b949e] ml-2 font-medium">
                          Public
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-3 py-1 rounded-md text-xs font-semibold hover:bg-[#30363d] transition-colors cursor-pointer">
                          ⭐ Star 12
                        </button>
                        <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-3 py-1 rounded-md text-xs font-semibold hover:bg-[#30363d] transition-colors cursor-pointer">
                          🍴 Fork
                        </button>
                      </div>
                    </div>

                    {/* Code File Explorer Placeholder */}
                    <div className="border border-[#30363d] rounded-md overflow-hidden bg-[#161b22]">
                      <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-[#30363d] flex items-center justify-center text-[10px] font-bold">Z</span>
                        <span className="font-bold text-[#e6edf3]">zandrellez</span> 
                        <span className="text-[#8b949e]">Initial core architecture commit</span>
                      </div>
                      <div className="px-4 py-2 border-b border-[#30363d] flex justify-between items-center text-sm hover:bg-[#1f242c] transition-colors cursor-pointer">
                        <span className="flex items-center gap-3 text-[#e6edf3]">
                          <span className="text-[#8b949e]">📁</span> src
                        </span> 
                        <span className="text-[#8b949e] truncate max-w-[50%]">Setup microservices & DB schema</span>
                      </div>
                      <div className="px-4 py-2 border-b border-[#30363d] flex justify-between items-center text-sm hover:bg-[#1f242c] transition-colors cursor-pointer">
                        <span className="flex items-center gap-3 text-[#e6edf3]">
                          <span className="text-[#8b949e]">📄</span> package.json
                        </span> 
                        <span className="text-[#8b949e] truncate max-w-[50%]">Bump core dependencies</span>
                      </div>
                      <div className="px-4 py-2 flex justify-between items-center text-sm hover:bg-[#1f242c] transition-colors cursor-pointer">
                        <span className="flex items-center gap-3 text-[#e6edf3]">
                          <span className="text-[#8b949e]">📄</span> README.md
                        </span> 
                        <span className="text-[#8b949e] truncate max-w-[50%]">Update project documentation</span>
                      </div>
                    </div>

                    {/* Fake Readme Markdown Rendering */}
                    <div className="border border-[#30363d] rounded-md overflow-hidden mt-2">
                      <div className="px-4 py-3 border-b border-[#30363d] font-semibold text-sm bg-[#0d1117] flex items-center gap-2 text-[#e6edf3]">
                        <span className="text-[#8b949e]">☰</span> README.md
                      </div>
                      <div className="p-8 bg-[#0d1117]">
                        <h1 className="text-3xl font-bold border-b border-[#30363d] pb-2 mb-6">
                          {proj.title}
                        </h1>
                        
                        <div className="flex gap-2 mb-6">
                          <span className="bg-[#2f81f7]/10 text-[#2f81f7] border border-[#2f81f7]/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                            {proj.badge}
                          </span>
                          <span className="bg-[#238636]/10 text-[#238636] border border-[#238636]/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                            build: passing
                          </span>
                        </div>

                        <p className="text-[#8b949e] text-base leading-relaxed mb-8 max-w-3xl">
                          {proj.description}
                        </p>

                        <h2 className="text-xl font-semibold border-b border-[#30363d] pb-2 mb-4 mt-8">
                          Deployment & Links
                        </h2>
                        
                        <div className="flex gap-4">
                          <button className="bg-[#238636] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#2ea043] transition-colors border border-white/10 cursor-pointer">
                            Live Preview ↗
                          </button>
                          <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#30363d] transition-colors cursor-pointer">
                            View Full Source
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}