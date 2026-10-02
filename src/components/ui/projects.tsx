"use client"

import * as React from "react"
import { projects } from "../../data/projects"

export default function ProjectsSection() {
  const [activeTab, setActiveTab] = React.useState(0)
  const [openedTabs, setOpenedTabs] = React.useState(1)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const featuredProjects = projects.slice(0, 3)

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
        featuredProjects.length - 1,
        Math.floor(progress * featuredProjects.length),
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
  }, [featuredProjects.length])

  const activeProject = featuredProjects[activeTab]

  const scrollToTab = (idx: number) => {
    const section = containerRef.current
    if (!section) return

    const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1)
    const stageProgress = (idx + 0.1) / featuredProjects.length
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
      style={{ height: `${(featuredProjects.length) * 100}svh` }}
    >
      <div className="sticky top-0 h-svh w-full flex flex-col justify-center py-6 md:py-12 overflow-hidden">
        <div className="w-[90%] md:w-[80%] max-w-5xl mx-auto flex flex-col h-full justify-center">
          
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between shrink-0">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#5fb57a] uppercase mb-1 block">
                // SELECTED ARCHIVE
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#ebebea]">
                Featured Works
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
              <a href="#all-works" className="text-xs font-mono font-bold text-[#5fb57a] hover:text-white transition-colors flex items-center gap-2">
                [ VIEW ALL WORKS ↗ ]
              </a>
            </div>
          </div>

          <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117] font-sans flex flex-col">
            
            <div className="flex items-end bg-[#202124] px-2 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
              {featuredProjects.slice(0, openedTabs).map((proj, idx) => {
                const isActive = activeTab === idx
                return (
                  <button
                    key={proj.id}
                    onClick={() => scrollToTab(idx)}
                    className={`min-w-[160px] max-w-[220px] flex-1 px-4 py-2 rounded-t-lg flex items-center gap-3 text-xs transition-colors border-r border-white/5 animate-in slide-in-from-left-4 fade-in duration-300 ${
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
            </div>

            <div className="bg-[#35363a] px-4 py-2 flex items-center gap-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-4 text-white/60 text-lg select-none hidden md:flex">
                <span className="cursor-pointer hover:text-white transition-colors">←</span>
                <span className="cursor-pointer hover:text-white transition-colors opacity-40">→</span>
                <span className="cursor-pointer hover:text-white transition-colors text-sm">↻</span>
              </div>
              <div className="flex-1 bg-[#202124] rounded-full px-4 py-1 flex items-center gap-3 text-sm text-white/80 border border-white/5 transition-all">
                <span className="text-xs">🔒</span>
                <span className="font-mono opacity-60 hidden sm:inline">github.com/zandrellez/</span>
                <span className="font-mono text-white transition-all duration-300">{activeProject?.slug}</span>
              </div>
            </div>

            <div className="relative overflow-hidden flex-1 bg-[#0d1117] min-h-[400px]">
              {featuredProjects.map((proj, idx) => {
                const isActive = activeTab === idx
                if (!isActive) return null

                return (
                  <div key={proj.id} className="absolute inset-0 p-4 md:p-6 flex flex-col gap-4 text-[#e6edf3] animate-in fade-in zoom-in-95 duration-300 overflow-y-auto no-scrollbar">
                    
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-lg md:text-xl">
                        <span className="text-[#8b949e]">zandrellez</span>
                        <span className="text-[#8b949e]">/</span>
                        <span className="font-bold text-[#2f81f7]">{proj.slug}</span>
                        <span className="border border-[#30363d] rounded-full px-2 py-0.5 text-[10px] text-[#8b949e] ml-2 font-medium">
                          Public
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-[#30363d] transition-colors cursor-pointer">
                          ⭐ Star
                        </button>
                        <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-[#30363d] transition-colors cursor-pointer hidden sm:block">
                          🍴 Fork
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#30363d] rounded-md overflow-hidden mt-2">
                      <div className="px-4 py-3 border-b border-[#30363d] font-semibold text-xs bg-[#161b22] flex flex-wrap items-center justify-between gap-4 text-[#e6edf3]">
                        <div className="flex items-center gap-2">
                           <span className="text-[#8b949e]">☰</span> README.md
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${proj.status === 'Completed' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' : 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/30'}`}>
                             {proj.status}
                          </span>
                          {proj.categories.map((cat, i) => (
                            <span key={i} className="bg-[#2f81f7]/10 text-[#2f81f7] border border-[#2f81f7]/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 md:p-6 bg-[#0d1117]">
                        
                        {/* Two-Column Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
                          
                          {/* Column 1 (Left): Challenge, Pitch, Tech Stack */}
                          <div className="flex flex-col gap-6">

                            {/* Pitch / Description */}
                            <p className="text-[#c9d1d9] text-base md:text-lg font-medium leading-relaxed">
                              {proj.description}
                            </p>

                            {/* Tech Stack Badges */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              {proj.techStack.map((tech, i) => (
                                <span key={i} className="bg-[#238636]/10 text-[#3fb950] border border-[#2ea043]/30 px-2.5 py-1 rounded-md text-xs font-mono font-semibold">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Column 2 (Right): Project Access / CTAs */}
                          <div className="bg-[#040d21]/20 border border-[#30363d] rounded-xl p-5 h-fit shrink-0 flex flex-col">
                            <h4 className="text-[10px] font-bold text-[#8b949e] tracking-[0.15em] mb-4 uppercase">Project Access</h4>
                            
                            <div className="flex flex-col gap-3">
                              {/* Live Demo Button */}
                              <a 
                                href={proj.links.live} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full bg-[#f8f9fa] text-[#0d1117] py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-[#e6e8eb] transition-colors flex justify-center items-center gap-2 group shadow-sm"
                              >
                                Live Demo
                                <svg className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M7 17l9.2-9.2M17 17V7H7"/>
                                </svg>
                              </a>

                              {/* Read More Button */}
                              <a 
                                href={`/works/${proj.slug}`} 
                                className="w-full bg-transparent border border-transparent text-[#e6edf3] py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-[#161b22] hover:border-[#30363d] transition-all flex justify-center items-center gap-2 group"
                              >
                                <svg className="w-4 h-4 text-[#8b949e] group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                                Read More
                              </a>
                            </div>
                          </div>
                          
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