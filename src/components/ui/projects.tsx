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

  // Decoder text animation state
  const targetLines = [
    "From concept to code—",
    "featured projects engineered",
    "to solve real friction."
  ]
  const [decodedLines, setDecodedLines] = React.useState(targetLines)

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

      // Decoder scramble logic (decodes quickly)
      const scrambleProgress = Math.min(Math.max(currentStage * 2.8, 0), 1)
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*"
      
      const newLines = targetLines.map((line) => {
        const length = line.length
        const resolvedCount = Math.floor(length * scrambleProgress)
        return line
          .split("")
          .map((char, i) => {
            if (char === " ") return " "
            if (i < resolvedCount) return char
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join("")
      })
      setDecodedLines(newLines)

      if (currentStage <= 1) {
        // Creates a dead-zone/lock effect before browser slides up
        const delayedBrowserY = currentStage < 0.4 ? 100 : 100 - ((currentStage - 0.4) / 0.6) * 100;

        setScrollAnim({
          introOpacity: currentStage < 0.7 ? 1 : Math.max(0, 1 - (currentStage - 0.7) * 3), 
          introY: 0, 
          browserY: Math.max(0, delayedBrowserY), 
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
      className="relative w-full bg-[var(--bg)] text-[var(--text-h)]"
      style={{ height: `${totalScrollStages * 100}svh` }}
    >
      <div className="sticky top-0 h-svh w-full flex items-center justify-center overflow-hidden">
        
        {/* PHASE 1: Decoder Animation Overlay */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 px-4"
          style={{ 
            opacity: scrollAnim.introOpacity, 
            transform: `translateY(${scrollAnim.introY}px)`,
          }}
        >
          <div className="flex flex-col items-center font-mono tracking-tight text-center">
            <div className="bg-[var(--accent-soft)] px-4 md:px-6 py-1 md:py-2 text-2xl md:text-5xl font-bold text-[var(--text-h)] mb-1">
              {decodedLines[0]}
            </div>
            <div className="bg-[var(--accent-soft)] px-4 md:px-6 py-1 md:py-2 text-2xl md:text-5xl font-bold text-[var(--text-h)] mb-1">
              {decodedLines[1]}
            </div>
            <div className="bg-[var(--accent-soft)] px-4 md:px-6 py-1 md:py-2 text-2xl md:text-5xl font-bold text-[var(--text-h)]">
              {decodedLines[2]}
            </div>
          </div>
          <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-60">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--text-h)]">Scroll to decode & explore</span>
            <svg className="w-4 h-4 text-[var(--text-h)] animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* PHASE 2: The Browser Window */}
        <div 
          className="relative z-10 w-[98%] md:w-[90%] max-w-[1400px] h-[90vh] md:h-[85vh] flex flex-col rounded-xl overflow-hidden border border-[var(--contrast-border)] shadow-[var(--contrast-shadow)] bg-[var(--contrast-surface)] font-sans"
          style={{ transform: `translateY(${scrollAnim.browserY}vh)` }}
        >
          
          <div className="flex items-end bg-[var(--contrast-bg)] px-2 pt-2 gap-1 overflow-x-auto no-scrollbar shrink-0 border-b border-[var(--contrast-border)]">
            
            {/* DESKTOP Tabs */}
            <div className="hidden md:flex items-end gap-1 flex-1">
              {/* Pinned View All Tab (Narrow) */}
              <Link
                to="/all-works"
                className="min-w-[100px] max-w-[120px] px-3 py-2 rounded-t-lg flex items-center gap-2 text-xs transition-colors border-r border-[var(--contrast-border)] bg-[var(--contrast-surface-raised)] text-[var(--contrast-accent)] hover:bg-[var(--contrast-surface)]"
              >
                <span>📁</span>
                <span className="truncate font-medium">VIEW ALL</span>
              </Link>

              {/* Project Tabs (Wider) */}
              {featuredProjects.slice(0, openedTabs).map((proj, idx) => {
                const isActive = activeTab === idx
                return (
                  <button
                    key={proj.id}
                    onClick={() => scrollToTab(idx)}
                    className={`min-w-[180px] max-w-[260px] flex-1 px-5 py-2.5 rounded-t-lg flex items-center gap-3 text-xs transition-colors border-r border-[var(--contrast-border)] ${
                      isActive 
                        ? "bg-[var(--contrast-surface)] text-[var(--contrast-text-h)] font-medium border-t border-x border-[var(--contrast-border)]"
                        : "bg-transparent text-[var(--contrast-muted)] hover:bg-[var(--contrast-surface)] hover:text-[var(--contrast-text-h)]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--contrast-accent)]' : 'bg-[var(--contrast-border)]'}`} />
                    <span className="truncate font-medium tracking-wide">WORKS {proj.id}</span>
                    {isActive && <span className="ml-auto opacity-50 hover:opacity-100 font-bold">×</span>}
                  </button>
                )
              })}
            </div>

            {/* MOBILE Tabs (Pinned View All + Wider Active Tab) */}
            <div className="flex md:hidden items-end flex-1 gap-1">
              <Link
                to="/all-works"
                className="min-w-[90px] px-3 py-2 rounded-t-lg flex items-center gap-1.5 text-xs bg-[var(--contrast-surface-raised)] text-[var(--contrast-accent)] border-t border-x border-[var(--contrast-border)]"
              >
                <span>📁</span>
                <span className="font-medium">View All</span>
              </Link>
              
              <button className="min-w-[180px] px-3 py-2 rounded-t-lg flex items-center justify-center gap-2 text-xs bg-[var(--contrast-surface)] text-[var(--contrast-text-h)] border-t border-x border-[var(--contrast-border)]">
                <span className="w-2 h-2 rounded-full bg-[var(--contrast-accent)]" />
                <span className="font-medium">WORKS {activeProject?.id || activeTab + 1}</span>
              </button>
            </div>
            
          </div>

          {/* Browser Address Bar (Restored navigation arrows for mobile & desktop) */}
          <div className="bg-[var(--contrast-surface-raised)] px-4 py-2 flex items-center gap-4 border-b border-[var(--contrast-border)] shrink-0">
            <div className="flex items-center gap-3 text-[var(--contrast-muted)] text-base select-none flex">
              <span className="cursor-pointer hover:text-[var(--contrast-text-h)] transition-colors">←</span>
              <span className="cursor-pointer hover:text-[var(--contrast-text-h)] transition-colors opacity-40">→</span>
              <span className="cursor-pointer hover:text-[var(--contrast-text-h)] transition-colors text-sm">↻</span>
            </div>
            <div className="flex-1 bg-[var(--contrast-bg)] rounded-full px-4 py-1.5 flex items-center gap-2 text-sm text-[var(--contrast-text)] border border-[var(--contrast-border)] transition-all">
              <span className="text-xs">🔒</span>
              <span className="font-mono opacity-60 sm:inline">github.com/zandrellez/</span>
              <span className="font-mono hidden sm:inline font-medium text-[var(--contrast-text-h)] transition-all duration-300 truncate">{activeProject?.slug}</span>
            </div>
          </div>

          {/* GitHub Repository Content Area */}
          <div className="relative flex-1 bg-[var(--contrast-surface)] overflow-y-auto overflow-x-hidden flex">
            {featuredProjects.map((proj, idx) => {
              const isActive = activeTab === idx
              if (!isActive) return null

              return (
                <div key={proj.id} className="absolute inset-0 flex flex-col text-[var(--contrast-text-h)] animate-in fade-in zoom-in-95 duration-300">
                  
                  {/* Repo Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 md:p-6 shrink-0">
                    <div className="flex items-center gap-1.5 md:gap-2 text-sm md:text-xl truncate">
                      <span className="text-[var(--contrast-muted)] hidden sm:inline">zandrellez /</span>
                      <span className="font-bold text-[var(--contrast-accent)] truncate">{proj.slug}</span>
                      <span className="border border-[var(--contrast-border)] rounded-full px-2 py-0.5 text-[9px] text-[var(--contrast-muted)] ml-1 font-medium hidden sm:inline">
                        Public
                      </span>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-2">
                      <a 
                        href={proj.links.live} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[var(--contrast-surface-raised)] border border-[var(--contrast-border)] text-[var(--contrast-text)] px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-xs font-semibold hover:bg-[var(--contrast-accent-soft)] hover:text-[var(--contrast-text-h)] transition-colors flex items-center gap-1"
                      >
                        <span>Live</span>
                        <svg className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17l9.2-9.2M17 17V7H7"/>
                        </svg>
                      </a>
                      <a 
                        href={proj.links.github || `https://github.com/zandrellez/${proj.slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[var(--contrast-surface-raised)] border border-[var(--contrast-border)] text-[var(--contrast-text)] px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-xs font-semibold hover:bg-[var(--contrast-accent-soft)] hover:text-[var(--contrast-text-h)] transition-colors flex items-center gap-1"
                      >
                        <span>GitHub</span>
                        <svg className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                          <path d="M9 18c-4.51 2-5-2-7-2"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col mx-3 md:mx-6 mb-3 md:mb-6 rounded-md bg-[var(--contrast-bg)] overflow-hidden">
                    
                    {/* Readme Title Bar */}
                    <div className="px-4 py-2 border-b border-[var(--contrast-border)] font-semibold text-xs bg-[var(--contrast-surface-raised)] flex items-center justify-between text-[var(--contrast-text-h)] shrink-0 rounded-t-md">
                      <div className="flex items-center gap-2">
                         <span className="text-[var(--contrast-muted)]">☰</span> README.md
                      </div>
                      
                      {/* Desktop Badges Only */}
                      <div className="hidden md:flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${proj.status === 'Completed' ? 'bg-[var(--contrast-accent-soft)] text-[var(--contrast-accent)] border-[var(--contrast-accent)]' : 'bg-[color-mix(in_srgb,var(--contrast-warning)_12%,transparent)] text-[var(--contrast-warning)] border-[var(--contrast-warning)]'}`}>
                           {proj.status}
                        </span>
                        {proj.categories.map((cat, i) => (
                          <span key={i} className="bg-[var(--contrast-accent-soft)] text-[var(--contrast-accent)] border border-[var(--contrast-border)] px-2 py-0.5 rounded-full text-[10px] font-mono">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Readme Body */}
                    <div className="flex-1 p-4 md:p-10 flex flex-col justify-center my-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
                        
                        {/* COLUMN 1 (Left): Clickable Image Preview */}
                        <div className="lg:col-span-5 w-full">
                          <Link 
                            to={`/works/${proj.slug}`}
                            className="group relative block aspect-[16/10] rounded-lg overflow-hidden bg-[var(--contrast-surface-raised)] border border-[var(--contrast-border)] shadow-lg transition-all duration-300 hover:border-[var(--contrast-accent)]"
                          >
                            <img 
                              src={proj.image} 
                              alt={proj.title} 
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-xs font-mono font-medium text-[var(--contrast-bg)] flex items-center gap-1.5 bg-[var(--contrast-accent)] px-3 py-1.5 rounded-md shadow">
                                View Case Study 
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                              </span>
                            </div>
                          </Link>
                        </div>
                        
                        {/* COLUMN 2 (Right): Description */}
                        <div className="lg:col-span-7 flex flex-col gap-3 md:gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] md:text-[11px] font-mono tracking-widest text-[var(--contrast-muted)] uppercase">
                              PROJECT OVERVIEW
                            </span>
                            
                            <Link 
                              to={`/works/${proj.slug}`}
                              className="group inline-flex items-center gap-2 text-xl md:text-3xl font-bold text-[var(--contrast-text-h)] hover:text-[var(--contrast-accent)] transition-colors w-fit"
                            >
                              <span className="relative pb-0.5 border-b border-transparent group-hover:border-[var(--contrast-accent)] transition-all">
                                {proj.title}
                              </span>
                              <svg className="w-4 h-4 md:w-5 md:h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--contrast-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </Link>
                          </div>

                          <p
                            className="text-xs md:text-base leading-relaxed line-clamp-3 md:line-clamp-none"
                            style={{ color: "var(--contrast-text)" }}
                          >
                            {proj.description}
                          </p>

                          {/* Tech Stack Tags */}
                          <div className="flex flex-wrap gap-1.5 md:gap-2 pt-1">
                            {proj.techStack.map((tech, i) => (
                              <span key={i} className="bg-[var(--contrast-surface-raised)] border border-[var(--contrast-border)] text-[var(--contrast-text)] px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[11px] md:text-xs font-mono">
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