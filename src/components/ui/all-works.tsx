"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { projects } from "../../data/projects"

// --- SMOOTH ANIMATED COUNTER ---
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)
  const [hasStarted, setHasStarted] = React.useState(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!hasStarted) return
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    let startTime: number | null = null
    // Use a slightly snappier duration for low numbers so single-digit counts don't feel stalled
    const duration = value <= 5 ? 750 : 1200
    let frameId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Cubic ease-out: starts with swift momentum, decelerates smoothly
      const easeOut = 1 - Math.pow(1 - progress, 3)

      // Math.round ensures single-digit counts (like 1, 2, 4) tick up naturally rather than waiting until 100%
      const current = Math.round(easeOut * value)
      setDisplayValue(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [hasStarted, value])

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  )
}

export default function AllWorksSection() {
  const [view, setView] = React.useState<"list" | "grid">("list")
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const filterDropdownRef = React.useRef<HTMLDivElement>(null)
  
  // Floating image preview state for List View
  const [hoveredImage, setHoveredImage] = React.useState<string | null>(null)
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 })

  // --- DYNAMIC STATS CALCULATION ---
  const totalProjects = projects.length
  
  // Dynamic calculation from May 2024 to present date
  const yearsExperience = React.useMemo(() => {
    const startDate = new Date(2024, 4, 1)
    const diff = new Date().getTime() - startDate.getTime()
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)))
  }, [])

  const uniqueTechs = React.useMemo(
    () => new Set(projects.flatMap(p => p.techStack)).size,
    []
  )

  const activeDeployments = React.useMemo(
    () =>
      projects.filter(
        p => p.status === "Completed" || (p.links?.live && p.links.live !== "#")
      ).length,
    []
  )

  // --- FILTER EXTRACTION ---
  const dynamicCategories = React.useMemo(
    () => Array.from(new Set(projects.flatMap(p => p.categories))),
    []
  )
  
  const dynamicStatuses = React.useMemo(
    () => Array.from(new Set(projects.map(p => p.status))),
    []
  )

  // Close filter dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isFilterOpen])

  // Lock body scroll on small screens when the bottom sheet modal is open
  React.useEffect(() => {
    if (isFilterOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFilterOpen])

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    )
  }

  const clearAllFilters = () => {
    setSelectedFilters([])
  }

  // --- MULTI-SELECT FILTER ENGINE ---
  const filteredProjects = projects.filter(p => {
    const selectedCategories = selectedFilters.filter(f => dynamicCategories.includes(f))
    const selectedStatuses = selectedFilters.filter(f => dynamicStatuses.includes(f))

    const matchCategory =
      selectedCategories.length === 0 ||
      p.categories.some(cat => selectedCategories.includes(cat))

    const matchStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(p.status)

    const query = searchQuery.toLowerCase().trim()
    const matchSearch =
      query === "" ||
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.techStack.some(tech => tech.toLowerCase().includes(query))

    return matchCategory && matchStatus && matchSearch
  })

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <section id="all-works" className="relative w-full bg-[var(--bg)] text-[var(--text-h)] py-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 text-sm font-mono text-[var(--muted)] hover:text-[var(--text-h)] transition-colors"
        >
          <span aria-hidden="true">←</span>
          Back to portfolio
        </Link>
      </div>
      
      {/* 1. DYNAMIC IMPACT STATS */}
      <div className="max-w-6xl mx-auto px-6 mb-24 flex flex-col items-center">
        <span className="bg-[var(--accent-soft)] border border-[var(--border)] text-[var(--text)] px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-6 flex items-center gap-2">
          <svg className="w-3 h-3 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Project Impact
        </span>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-center">
          Building The Future
        </h2>
        <p className="text-[var(--text)] text-base md:text-lg text-center max-w-2xl mb-16">
          Transforming ideas into production-ready solutions that drive real-world impact.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-8 md:gap-4 text-center divide-x-0 md:divide-x divide-[var(--border)]">
          <div className="flex flex-col gap-2">
            <span className="text-5xl md:text-7xl font-black">
              <AnimatedCounter value={totalProjects} suffix="+" />
            </span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Projects Built</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-5xl md:text-7xl font-black">
              <AnimatedCounter value={yearsExperience} suffix="+" />
            </span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Years Experience</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-5xl md:text-7xl font-black">
              <AnimatedCounter value={uniqueTechs} suffix="+" />
            </span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Tech Stack</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-5xl md:text-7xl font-black">
              <AnimatedCounter value={activeDeployments} />
            </span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Active Deployments</span>
          </div>
        </div>
      </div>

      {/* 2. EXTENDED SEARCH & ADJACENT FILTER CONTROLS */}
      <div className="max-w-6xl mx-auto px-6 mb-10 border-b border-[var(--border)] pb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          
          {/* Extended Search Input (Fills all space right up to the filter button) */}
          <div className="relative flex-1 min-w-0">
            <input 
              type="text" 
              placeholder="Search by title, stack, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-h)] text-sm rounded-lg pl-10 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)] focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text-h)] p-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: Filter Trigger + View Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end">
            
            {/* Multi-Select Dropdown Container */}
            <div className="relative flex-1 sm:flex-initial" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  selectedFilters.length > 0
                    ? "bg-[var(--surface-raised)] border-[var(--accent)] text-[var(--text-h)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-h)] hover:border-[var(--muted)]"
                }`}
                aria-expanded={isFilterOpen}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>Filter</span>
                  {selectedFilters.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--bg)] text-[10px] font-bold flex items-center justify-center">
                      {selectedFilters.length}
                    </span>
                  )}
                </div>
                <svg className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Mobile Backdrop Overlay */}
              {isFilterOpen && (
                <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
                  onClick={() => setIsFilterOpen(false)}
                  aria-hidden="true"
                />
              )}

              {/* Responsive Dropdown Menu (Bottom-sheet modal on mobile, clean popover on desktop) */}
              {isFilterOpen && (
                <div className="fixed inset-x-4 bottom-6 top-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-xl shadow-2xl z-50 p-4 max-h-[82vh] sm:max-h-[32rem] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">Filter Works</span>
                      {selectedFilters.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          {selectedFilters.length} active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedFilters.length > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-[var(--accent)] hover:underline font-medium"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="sm:hidden text-xs text-[var(--muted)] hover:text-[var(--text-h)] p-1"
                        aria-label="Close filters"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Filter Lists */}
                  <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-4">
                    {/* Categories Group */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[var(--muted)] tracking-wider block mb-2 font-bold">
                        Categories
                      </span>
                      <div className="flex flex-col gap-1">
                        {dynamicCategories.map(cat => {
                          const isChecked = selectedFilters.includes(cat)
                          return (
                            <label
                              key={cat}
                              className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[var(--surface-raised)] cursor-pointer text-sm text-[var(--text-h)] select-none transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFilter(cat)}
                                className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
                              />
                              <span className="flex-1">{cat}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Status Group */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[var(--muted)] tracking-wider block mb-2 font-bold">
                        Status
                      </span>
                      <div className="flex flex-col gap-1">
                        {dynamicStatuses.map(stat => {
                          const isChecked = selectedFilters.includes(stat)
                          return (
                            <label
                              key={stat}
                              className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[var(--surface-raised)] cursor-pointer text-sm text-[var(--text-h)] select-none transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFilter(stat)}
                                className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
                              />
                              <span className="flex-1">{stat}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Apply Footer Button */}
                  <div className="pt-3 border-t border-[var(--border)] mt-3 sm:hidden">
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full py-2.5 bg-[var(--text-h)] text-[var(--bg)] font-semibold rounded-lg text-sm text-center"
                    >
                      Apply Filters ({selectedFilters.length})
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* View Switcher Toggle */}
            <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)] shrink-0">
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-md transition-colors ${view === "list" ? "bg-[var(--surface-raised)] text-[var(--text-h)]" : "text-[var(--muted)] hover:text-[var(--text-h)]"}`}
                aria-label="List view"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
              </button>
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-md transition-colors ${view === "grid" ? "bg-[var(--surface-raised)] text-[var(--text-h)]" : "text-[var(--muted)] hover:text-[var(--text-h)]"}`}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER BADGES ROW */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]/60">
            <span className="text-xs font-mono uppercase text-[var(--muted)]">Active:</span>
            {selectedFilters.map(filter => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[var(--surface-raised)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-h)] transition-colors group cursor-pointer"
                title={`Remove ${filter}`}
              >
                <span>{filter}</span>
                <span className="text-[var(--muted)] group-hover:text-[var(--accent)] font-bold">×</span>
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] underline ml-2 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* 3. PROJECT DIRECTORY */}
      <div 
        className="max-w-6xl mx-auto px-6 relative"
        onMouseMove={view === "list" ? handleMouseMove : undefined}
        onMouseLeave={() => setHoveredImage(null)}
      >
        
        {/* LIST VIEW */}
        {view === "list" && (
          <div className="flex flex-col border-t border-[var(--border)]">
            {filteredProjects.length === 0 ? (
              <div className="py-16 text-center text-[var(--muted)]">No projects match your selected filters.</div>
            ) : (
              filteredProjects.map((proj, idx) => (
                <Link
                  key={proj.id}
                  to={`/works/${proj.slug}`}
                  className="group flex items-center justify-between py-8 border-b border-[var(--border)] hover:bg-[var(--accent-soft)] transition-colors px-4 -mx-4 rounded-xl"
                  onMouseEnter={() => setHoveredImage(proj.image)}
                >
                  <div className="flex items-center gap-6 md:gap-12 w-full">
                    <span className="text-4xl md:text-6xl font-black text-[var(--border)] transition-colors shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <h3 className="text-xl md:text-3xl font-bold tracking-tight text-[var(--text-h)] group-hover:text-[var(--accent)] transition-colors">
                          {proj.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          proj.status === 'Completed'
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                            : 'bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-[var(--warning)]'
                        }`}>
                          {proj.status === 'Completed' ? 'Done' : 'In Progress'}
                        </span>
                      </div>
                      <p className="text-[var(--text)] text-sm md:text-base line-clamp-1 max-w-2xl">
                        {proj.description}
                      </p>
                    </div>

                    <span className="hidden md:flex items-center gap-2 text-sm text-[var(--muted)] group-hover:text-[var(--text-h)] transition-colors shrink-0">
                      view <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Floating Hover Image for List View */}
        {view === "list" && hoveredImage && (
          <div 
            className="fixed pointer-events-none z-50 w-72 md:w-96 shadow-2xl transition-opacity duration-200"
            style={{
              left: `${mousePos.x + 20}px`,
              top: `${mousePos.y + 20}px`,
            }}
          >
            <img 
              src={hoveredImage} 
              alt="Preview" 
              className="w-full h-auto object-cover rounded-lg shadow-xl border border-[var(--border)]" 
            />
          </div>
        )}

        {/* GRID VIEW (3 COLUMNS ON DESKTOP) */}
        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="py-16 text-center text-[var(--muted)] col-span-1 sm:col-span-2 lg:col-span-3">
                No projects match your selected filters.
              </div>
            ) : (
              filteredProjects.map((proj) => (
                <Link 
                  key={proj.id} 
                  to={`/works/${proj.slug}`}
                  className="group flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--accent)] transition-all hover:-translate-y-1"
                >
                  <div className="w-full aspect-16/10 bg-[var(--surface-raised)] p-4 flex items-center justify-center overflow-hidden">
                    <img 
                      src={proj.image} 
                      alt={proj.title} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-5 md:p-6 flex flex-col flex-1 relative">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="text-xl font-bold font-sans text-[var(--text-h)] group-hover:text-[var(--accent)] transition-colors pr-2">
                        {proj.title}
                      </h3>
                      <span className="bg-[var(--accent-soft)] text-[var(--muted)] px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase border border-[var(--border)] shrink-0 mt-0.5">
                        {proj.categories[0]}
                      </span>
                    </div>
                    
                    <p className="text-[var(--text)] text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[var(--border)] mt-auto pr-10">
                      {proj.techStack.slice(0, 4).map((tech, i) => (
                        <span key={i} className="text-[var(--text)] text-[10px] font-mono flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[var(--accent)]"></span>
                          {tech}
                        </span>
                      ))}
                      {proj.techStack.length > 4 && (
                        <span className="text-[var(--muted)] text-[10px] font-mono">
                          +{proj.techStack.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Circle Arrow Button */}
                    <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <svg className="w-4 h-4 -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

      </div>
    </section>
  )
}