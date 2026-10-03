"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { projects } from "../../data/projects"

export default function ProjectsSection() {
  const [activeTab, setActiveTab] = React.useState(0)
  const [openedTabs, setOpenedTabs] = React.useState(1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const [scrollAnim, setScrollAnim] = React.useState({
    introOpacity: 1,
    introY: 0,
    browserY: 100, 
  })

  const featuredProjects = projects.slice(0, 3)
  const totalScrollStages = featuredProjects.length + 1 

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
      const currentStage = progress * totalScrollStages

      if (currentStage <= 1) {
        setScrollAnim({
          introOpacity: Math.max(0, 1 - currentStage * 1.5), 
          introY: currentStage * -100, 
          browserY: 100 - (currentStage * 100), 
        })
        setActiveTab(0)
      } 
      else {
        setScrollAnim({ introOpacity: 0, introY: -100, browserY: 0 })
        
        const tabIdx = Math.min(
          featuredProjects.length - 1,
          Math.floor(currentStage - 1 + 0.05) 
        )
        setActiveTab(tabIdx)
        setOpenedTabs((count) => Math.max(count, tabIdx + 1))
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)
    handleScroll() 
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [featuredProjects.length, totalScrollStages])

  const activeProject = featuredProjects[activeTab]

  const scrollToTab = (idx: number) => {
    const section = containerRef.current
    if (!section) return

    const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1)
    const targetStage = idx + 1 + 0.1 
    const progress = targetStage / totalScrollStages
    const sectionTop = window.scrollY + section.getBoundingClientRect().top

    window.scrollTo({
      top: sectionTop + scrollableDistance * progress,
      behavior: "smooth",
    })
  }

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full bg-[#fdfdf5] text-[#1a211b]"
      style={{ height: `${totalScrollStages * 100}svh` }}
    >
      <div className="sticky top-0 h-svh w-full flex items-center justify-center overflow-hidden">
        
        {/* PHASE 1: Dramatic Intro Overlay */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0"
          style={{ 
            opacity: scrollAnim.introOpacity, 
            transform: `translateY(${scrollAnim.introY}px)`,
          }}
        >
          <div className="flex flex-col items-center font-sans tracking-tight">
            <div className="bg-[#93ab92]/20 px-4 md:px-6 py-1 md:py-2 text-3xl md:text-6xl font-medium text-[#1a211b] mb-1">
              Discover my latest work and
            </div>
            <div className="bg-[#93ab92]/20 px-4 md:px-6 py-1 md:py-2 text-3xl md:text-6xl font-medium text-[#1a211b] mb-1 -ml-8 md:-ml-12">
              creative solutions
            </div>
            <div className="bg-[#93ab92]/20 px-4 md:px-6 py-1 md:py-2 text-3xl md:text-6xl font-medium text-[#1a211b] ml-8 md:ml-12">
              that bring ideas to life
            </div>
          </div>
          <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-60">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#1a211b]">Scroll to explore</span>
            <svg className="w-4 h-4 text-[#1a211b] animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* PHASE 2: The Browser Window */}
        <div 
          className="relative z-10 w-[95%] md:w-[90%] max-w-[1400px] h-[85vh] flex flex-col rounded-xl overflow-hidden border border-[#30363d] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0d1117] font-sans"
          style={{ transform: `translateY(${scrollAnim.browserY}vh)` }}
        >
          
          <div className="flex items-end bg-[#010409] px-2 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0 border-b border-[#30363d]">
            
            {/* DESKTOP Tabs */}
            <div className="hidden md:flex items-end gap-1 flex-1">
              {featuredProjects.slice(0, openedTabs).map((proj, idx) => {
                const isActive = activeTab === idx
                return (
                  <button
                    key={proj.id}
                    onClick={() => scrollToTab(idx)}
                    className={`min-w-[140px] max-w-[200px] flex-1 px-4 py-2 rounded-t-lg flex items-center gap-3 text-xs transition-colors border-r border-[#30363d] ${
                      isActive 
                        ? "bg-[#161b22] text-[#e6edf3] font-medium border-t border-x border-[#30363d]" 
                        : "bg-transparent text-[#7d8590] hover:bg-[#161b22]/50 hover:text-[#c9d1d9]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#93ab92]' : 'bg-[#30363d]'}`} />
                    <span className="truncate font-medium">WORKS {proj.id}</span>
                    {isActive && <span className="ml-auto opacity-50 hover:opacity-100 font-bold">×</span>}
                  </button>
                )
              })}
            </div>

            {/* MOBILE Tab */}
            <div className="flex md:hidden items-end flex-1">
              <button className="w-full max-w-[200px] px-4 py-2 rounded-t-lg flex items-center gap-3 text-xs bg-[#161b22] text-[#e6edf3] border-r border-t border-x border-[#30363d]">
                <span className="w-2 h-2 rounded-full bg-[#93ab92]" />
                <span className="truncate font-medium">WORKS {activeProject?.id || activeTab + 1}</span>
              </button>
            </div>
            
            <div className="ml-auto flex items-center pr-2 pb-1">
              <Link to="/all-works" className="text-[10px] font-mono font-bold text-[#93ab92] hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 bg-[#93ab92]/10 rounded-md hover:bg-[#93ab92]/20 border border-[#93ab92]/30 whitespace-nowrap">
                [ VIEW ALL ↗ ]
              </Link>
            </div>
          </div>

          {/* Browser Address Bar */}
          <div className="bg-[#161b22] px-4 py-2 flex items-center gap-4 border-b border-[#30363d] shrink-0">
            <div className="flex items-center gap-4 text-[#7d8590] text-lg select-none hidden md:flex">
              <span className="cursor-pointer hover:text-[#c9d1d9] transition-colors">←</span>
              <span className="cursor-pointer hover:text-[#c9d1d9] transition-colors opacity-40">→</span>
              <span className="cursor-pointer hover:text-[#c9d1d9] transition-colors text-sm">↻</span>
            </div>
            <div className="flex-1 bg-[#0d1117] rounded-full px-4 py-1.5 flex items-center gap-3 text-sm text-[#e6edf3] border border-[#30363d] transition-all">
              <span className="text-xs">🔒</span>
              <span className="font-mono opacity-60 sm:inline">github.com/zandrellez/</span>
              <span className="font-mono font-medium text-white transition-all duration-300">{activeProject?.slug}</span>
            </div>
          </div>

          {/* GitHub Repository Content Area */}
          <div className="relative flex-1 bg-[#0d1117] overflow-hidden flex">
            {featuredProjects.map((proj, idx) => {
              const isActive = activeTab === idx
              if (!isActive) return null

              return (
                <div key={proj.id} className="absolute inset-0 flex flex-col text-[#e6edf3] animate-in fade-in zoom-in-95 duration-300">
                  
                  {/* Repo Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 shrink-0">
                    <div className="flex items-center gap-2 text-lg md:text-xl">
                      <span className="text-[#8b949e]">zandrellez</span>
                      <span className="text-[#8b949e]">/</span>
                      <span className="font-bold text-[#2f81f7]">{proj.slug}</span>
                      <span className="border border-[#30363d] rounded-full px-2 py-0.5 text-[10px] text-[#8b949e] ml-2 font-medium">
                        Public
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={proj.links.live} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#30363d] hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <span>Live</span>
                        <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17l9.2-9.2M17 17V7H7"/>
                        </svg>
                      </a>
                      <a 
                        href={proj.links.github || `https://github.com/zandrellez/${proj.slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#30363d] hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <span>GitHub</span>
                        <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                          <path d="M9 18c-4.51 2-5-2-7-2"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col mx-4 md:mx-6 mb-4 md:mb-6 rounded-md bg-[#0a0d13]">
                    <div className="px-4 py-2 border-b border-[#30363d] font-semibold text-xs bg-[#161b22] flex flex-wrap items-center justify-between gap-4 text-[#e6edf3] shrink-0 rounded-t-md">
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

                    {/* Readme Body */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col justify-center my-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        
                        {/* COLUMN 1 (Left): Clickable Image Preview */}
                        <div className="lg:col-span-5 w-full">
                          <Link 
                            to={`/works/${proj.slug}`}
                            className="group relative block aspect-[16/10] rounded-lg overflow-hidden bg-black/40 border border-white/10 shadow-lg transition-all duration-300 hover:border-[#2f81f7]"
                          >
                            <img 
                              src={proj.image} 
                              alt={proj.title} 
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-xs font-mono font-medium text-white flex items-center gap-1.5 bg-[#2f81f7] px-3 py-1.5 rounded-md shadow">
                                View Case Study 
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                              </span>
                            </div>
                          </Link>
                        </div>
                        
                        {/* COLUMN 2 (Right): Description */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono tracking-widest text-[#8b949e] uppercase">
                                PROJECT OVERVIEW
                              </span>
                            </div>
                            
                            <Link 
                              to={`/works/${proj.slug}`}
                              className="group inline-flex items-center gap-2 text-2xl md:text-3xl font-bold text-white hover:text-[#2f81f7] transition-colors w-fit"
                            >
                              <span className="relative pb-0.5 border-b border-transparent group-hover:border-[#2f81f7] transition-all">
                                {proj.title}
                              </span>
                              <svg className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#2f81f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </Link>
                          </div>

                          <p className="text-[#c9d1d9] text-sm md:text-base leading-relaxed">
                            {proj.description}
                          </p>

                          {/* Tech Stack Tags */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {proj.techStack.map((tech, i) => (
                              <span key={i} className="bg-white/5 border border-white/5 text-[#c9d1d9] px-2.5 py-1 rounded-md text-xs font-mono">
                                {tech}
                              </span>
                            ))}
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
    </section>
  )
}