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
      className="relative w-full bg-[#111111]"
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
            <div className="bg-[#333333] px-4 md:px-6 py-1 md:py-2 text-3xl md:text-6xl font-medium text-[#ebebea] mb-1">
              Discover my latest work and
            </div>
            <div className="bg-[#333333] px-4 md:px-6 py-1 md:py-2 text-3xl md:text-6xl font-medium text-[#ebebea] mb-1 -ml-8 md:-ml-12">
              creative solutions
            </div>
            <div className="bg-[#333333] px-4 md:px-6 py-1 md:py-2 text-3xl md:text-6xl font-medium text-[#ebebea] ml-8 md:ml-12">
              that bring ideas to life
            </div>
          </div>
          <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-40">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white">Scroll to explore</span>
            <svg className="w-4 h-4 text-white animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* PHASE 2: The Browser Window */}
        <div 
          className="relative z-10 w-[95%] md:w-[90%] max-w-[1400px] h-[85vh] flex flex-col rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#0d1117] font-sans"
          style={{ transform: `translateY(${scrollAnim.browserY}vh)` }}
        >
          
          {/* Browser Tab Bar */}
          <div className="flex items-end bg-[#202124] px-2 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
            {featuredProjects.slice(0, openedTabs).map((proj, idx) => {
              const isActive = activeTab === idx
              return (
                <button
                  key={proj.id}
                  onClick={() => scrollToTab(idx)}
                  className={`min-w-[140px] max-w-[200px] flex-1 px-4 py-2 rounded-t-lg flex items-center gap-3 text-xs transition-colors border-r border-white/5 animate-in slide-in-from-left-4 fade-in duration-300 ${
                    isActive 
                      ? "bg-[#35363a] text-white" 
                      : "bg-transparent text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#5fb57a]' : 'bg-white/20'}`} />
                  <span className="truncate font-medium">WORKS {proj.id}</span>
                  {isActive && <span className="ml-auto opacity-50 hover:opacity-100 font-bold">×</span>}
                </button>
              )
            })}
            
            <div className="ml-auto flex items-center pr-2 pb-1">
              <Link to="/all-works" className="text-[10px] font-mono font-bold text-[#5fb57a] hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 border border-white/5 whitespace-nowrap">
                [ VIEW ALL ↗ ]
              </Link>
            </div>
          </div>

          {/* Browser Address Bar */}
          <div className="bg-[#35363a] px-4 py-2 flex items-center gap-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-4 text-white/60 text-lg select-none hidden md:flex">
              <span className="cursor-pointer hover:text-white transition-colors">←</span>
              <span className="cursor-pointer hover:text-white transition-colors opacity-40">→</span>
              <span className="cursor-pointer hover:text-white transition-colors text-sm">↻</span>
            </div>
            <div className="flex-1 bg-[#202124] rounded-full px-4 py-1.5 flex items-center gap-3 text-sm text-white/80 border border-white/5 transition-all">
              <span className="text-xs">🔒</span>
              <span className="font-mono opacity-60 hidden sm:inline">github.com/zandrellez/</span>
              <span className="font-mono text-white transition-all duration-300">{activeProject?.slug}</span>
            </div>
          </div>

          {/* GitHub Repository Content Area - Removed internal scrolling */}
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
                      <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#30363d] transition-colors cursor-pointer">
                        ⭐ Star
                      </button>
                      <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#30363d] transition-colors cursor-pointer hidden sm:block">
                        🍴 Fork
                      </button>
                    </div>
                  </div>

                  {/* README Card - Stretches to the bottom, borders removed */}
                  <div className="flex-1 flex flex-col mx-4 md:mx-6 mb-4 md:mb-6 rounded-md bg-[#0a0d13]">
                    
                    {/* Readme Header */}
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

                    {/* Readme Body - 3-Column Dashboard Layout */}
                    <div className="flex-1 p-4 md:p-8 flex flex-col justify-center">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                        
                        {/* COLUMN 1 (Left - ~33%): The Media - Border removed */}
                        <div className="lg:col-span-4 w-full aspect-[4/3] rounded-lg overflow-hidden flex items-center justify-center">
                          <img 
                            src={proj.image} 
                            alt={proj.title} 
                            className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-500" 
                          />
                        </div>
                        
                        {/* COLUMN 2 (Center - ~42%): The Narrative */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                          <div className="border-l-2 border-[#30363d] pl-4 py-1">
                            <h3 className="text-[11px] font-bold text-[#8b949e] tracking-wider mb-2">CORE ENGINEERING CHALLENGE</h3>
                            <p className="text-[#e6edf3] text-sm md:text-base leading-relaxed">
                              {proj.challenges}
                            </p>
                          </div>
                          <p className="text-[#c9d1d9] text-base md:text-lg font-medium leading-relaxed">
                            {proj.description}
                          </p>
                        </div>

                        {/* COLUMN 3 (Right - ~25%): The Actions */}
                        <div className="lg:col-span-3 flex flex-col gap-5">
                          
                          {/* Project Access CTA */}
                          <div className="bg-[#040d21]/20 border border-[#30363d] rounded-xl p-5 flex flex-col">
                            <h4 className="text-[10px] font-bold text-[#8b949e] tracking-[0.15em] mb-4 uppercase">Project Access</h4>
                            <div className="flex flex-col gap-3">
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
                              <a 
                                href={`/works/${proj.slug}`} 
                                className="w-full bg-transparent border border-[#30363d] text-[#e6edf3] py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-[#161b22] hover:border-[#8b949e] transition-all flex justify-center items-center gap-2 group"
                              >
                                <svg className="w-4 h-4 text-[#8b949e] group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                                Read More
                              </a>
                            </div>
                          </div>

                          {/* Tech Stack - Smaller font, no green border, tighter spacing */}
                          <div className="flex flex-col pl-1">
                            <h4 className="text-[10px] font-bold text-[#8b949e] tracking-[0.15em] mb-2 uppercase">Technologies</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {proj.techStack.map((tech, i) => (
                                <span key={i} className="bg-white/5 text-[#8b949e] px-2 py-1 rounded text-[9px] md:text-[10px] font-mono">
                                  {tech}
                                </span>
                              ))}
                            </div>
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