"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { projects } from "../../data/projects"

export default function AllWorksSection() {
  const [view, setView] = React.useState<"list" | "grid">("list")
  const [filterCat, setFilterCat] = React.useState("All")
  const [filterStatus, setFilterStatus] = React.useState("All")
  
  // Floating image preview state for List View
  const [hoveredImage, setHoveredImage] = React.useState<string | null>(null)
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 })

  // --- DYNAMIC STATS CALCULATION ---
  const totalProjects = projects.length
  // Automatically updates every year starting from 2025
  const yearsExperience = Math.max(1, new Date().getFullYear() - 2025)
  // Extracts all unique tech stack entries across all projects
  const uniqueTechs = new Set(projects.flatMap(p => p.techStack)).size
  // Counts completed projects or those with active live links
  const activeDeployments = projects.filter(
    p => p.status === "Completed" || (p.links.live && p.links.live !== "#")
  ).length

  // --- FILTER ENGINE ---
  const categories = ["All", "Web", "Mobile", "Automation", "Systems & IoT"]
  const statuses = ["All", "Completed", "In Progress"]

  const filteredProjects = projects.filter(p => {
    const matchCat = filterCat === "All" || p.categories.includes(filterCat)
    const matchStatus = filterStatus === "All" || p.status === filterStatus
    return matchCat && matchStatus
  })

  // Track mouse movement for the floating image preview
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <section id="all-works" className="relative w-full bg-[var(--bg)] text-[var(--text-h)] py-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-[var(--muted)] hover:text-[var(--text-h)] transition-colors"
        >
          <span aria-hidden="true">←</span>
          Back to portfolio
        </Link>
      </div>
      
      {/* 1. DYNAMIC IMPACT STATS */}
      <div className="max-w-6xl mx-auto px-6 mb-32 flex flex-col items-center">
        <span className="bg-[var(--accent-soft)] border border-[var(--border)] text-[var(--text)] px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-6 flex items-center gap-2">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <span className="text-5xl md:text-7xl font-black">{totalProjects}+</span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Projects Built</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-5xl md:text-7xl font-black">{yearsExperience}+</span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Years Experience</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-5xl md:text-7xl font-black">{uniqueTechs}+</span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Tech Stack</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-5xl md:text-7xl font-black">{activeDeployments}</span>
            <span className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase">Active Deployments</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER ENGINE & VIEW CONTROLS */}
      <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border)] pb-6">
        
        <div className="flex flex-wrap gap-6">
          {/* Categories */}
          <div className="flex items-center gap-2 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterCat === cat ? "bg-[var(--surface-raised)] text-[var(--text-h)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text-h)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]">
            {statuses.map(stat => (
              <button
                key={stat}
                onClick={() => setFilterStatus(stat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === stat ? "bg-[var(--surface-raised)] text-[var(--text-h)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text-h)]"
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)] shrink-0">
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md transition-colors ${view === "list" ? "bg-[var(--surface-raised)] text-[var(--text-h)]" : "text-[var(--muted)] hover:text-[var(--text-h)]"}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-md transition-colors ${view === "grid" ? "bg-[var(--surface-raised)] text-[var(--text-h)]" : "text-[var(--muted)] hover:text-[var(--text-h)]"}`}
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

      {/* 3. PROJECT DIRECTORY */}
      <div 
        className="max-w-6xl mx-auto px-6 relative"
        onMouseMove={view === "list" ? handleMouseMove : undefined}
        onMouseLeave={() => setHoveredImage(null)}
      >
        
        {/* LIST VIEW */}
        {view === "list" && (
          <div className="flex flex-col border-t border-[var(--border)]">
            {filteredProjects.map((proj, idx) => (
              <a
                key={proj.id}
                href={`/works/${proj.slug}`}
                className="group flex items-center justify-between py-8 border-b border-[var(--border)] hover:bg-[var(--accent-soft)] transition-colors px-4 -mx-4 rounded-xl"
                onMouseEnter={() => setHoveredImage(proj.image)}
              >
                <div className="flex items-center gap-6 md:gap-12 w-full">
                  <span className="text-4xl md:text-6xl font-black text-[var(--border)] transition-colors shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  
                  <div className="flex flex-col gap-2 flex-1">
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
              </a>
            ))}
          </div>
        )}

        {/* Floating Hover Image for List View */}
        {view === "list" && hoveredImage && (
          <div 
            className="fixed pointer-events-none z-50 w-72 md:w-96 rounded-xl overflow-hidden shadow-2xl transition-opacity duration-200"
            style={{
              left: `${mousePos.x + 20}px`,
              top: `${mousePos.y + 20}px`,
            }}
          >
            <div className="w-full aspect-[16/10] bg-[var(--surface-raised)] p-2">
              <img src={hoveredImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => (
              <a 
                key={proj.id} 
                href={`/works/${proj.slug}`}
                className="group flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--accent)] transition-all hover:-translate-y-1"
              >
                <div className="w-full aspect-[16/10] bg-[var(--surface-raised)] p-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src={proj.image} 
                    alt={proj.title} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-1 relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold font-sans text-[var(--text-h)] group-hover:text-[var(--accent)] transition-colors pr-8">
                      {proj.title}
                    </h3>
                    <span className="bg-[var(--accent-soft)] text-[var(--muted)] px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase border border-[var(--border)] shrink-0 mt-1">
                      {proj.categories[0]}
                    </span>
                  </div>
                  
                  <p className="text-[var(--text)] text-sm leading-relaxed mb-8 flex-1">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[var(--border)] mt-auto pr-12">
                    {proj.techStack.map((tech, i) => (
                      <span key={i} className="text-[var(--text)] text-[10px] font-mono flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[var(--accent)]"></span>
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Circle Arrow Button */}
                  <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center shadow-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <svg className="w-5 h-5 -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}