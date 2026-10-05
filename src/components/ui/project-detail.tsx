"use client"

import * as React from "react"
import { useParams, Link, Navigate } from "react-router-dom"
import { projects } from "../../data/projects"

// Native SVGs to avoid lucide-react export issues
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17l9.2-9.2M17 17V7H7"/>
  </svg>
)

const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
)

export default function ProjectDetail() {
  // Grab the slug from the URL (e.g., /works/bazaarx -> slug = "bazaarx")
  const { slug } = useParams<{ slug: string }>()
  
  // Find the matching project in your data
  const project = projects.find(p => p.slug === slug)

  // Automatically scroll to top when the page loads
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // If someone types a random URL, redirect them back to all works
  if (!project) {
    return <Navigate to="/all-works" replace />
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--bg)] pb-32">
      
      {/* 1. TOP NAVIGATION */}
      <div className="w-full border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/all-works" 
            className="group flex items-center gap-2 text-sm font-mono text-[var(--muted)] hover:text-[var(--text-h)] transition-colors"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
              <ArrowLeftIcon />
            </span>
            Back to Directory
          </Link>
          
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--muted)] hidden sm:block">
            Project Case Study
          </span>
        </div>
      </div>

      {/* 2. PROJECT HERO HEADER */}
      <header className="max-w-6xl mx-auto px-6 pt-20 md:pt-32 pb-12">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
            project.status === 'Completed' 
              ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]' 
              : 'bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-[var(--warning)] border-[var(--warning)]'
          }`}>
            {project.status}
          </span>
          {project.categories.map(cat => (
            <span key={cat} className="px-3 py-1 rounded-full text-xs font-mono border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
              {cat}
            </span>
          ))}
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-[var(--text-h)] tracking-tighter mb-8 max-w-4xl leading-[1.05]">
          {project.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          {project.links?.live && project.links.live !== "#" && (
            <a 
              href={project.links.live} 
              target="_blank" 
              rel="noreferrer"
              className="group flex items-center gap-2 bg-[var(--text-h)] text-[var(--bg)] px-6 py-3 rounded-full text-sm font-bold hover:bg-[var(--accent)] transition-colors shadow-lg"
            >
              Visit Live Site
              <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <ExternalLinkIcon />
              </span>
            </a>
          )}
          
          {project.links?.github && project.links.github !== "#" && (
            <a 
              href={project.links.github} 
              target="_blank" 
              rel="noreferrer"
              className="group flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-h)] px-6 py-3 rounded-full text-sm font-bold hover:border-[var(--accent)] transition-colors"
            >
              View Repository
              <GithubIcon />
            </a>
          )}
        </div>
      </header>

      {/* 3. HERO IMAGE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 md:mb-32">
        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl p-2 md:p-4">
          <img 
            src={project.image} 
            alt={`${project.title} preview`} 
            className="w-full h-full object-cover rounded-xl md:rounded-[1.5rem]"
          />
        </div>
      </div>

      {/* 4. CONTENT SPLIT (Overview & Tech Stack) */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
        
        {/* Left Column: The Story / Overview */}
        <div className="md:col-span-8 flex flex-col gap-8">
          <div>
            <h2 className="text-xs font-mono tracking-[0.25em] uppercase text-[var(--accent)] mb-6 flex items-center gap-4">
              <span className="w-8 h-px bg-[var(--accent)]"></span>
              Project Overview
            </h2>
            <p className="text-lg md:text-2xl text-[var(--text-h)] leading-relaxed font-medium">
              {project.description}
            </p>
          </div>

          {/* Optional: If you ever add a 'longDescription' to your projects.ts, put it here! */}
          {/* <p className="text-base text-[var(--text)] leading-loose">
            {project.longDescription}
          </p> */}
        </div>

        {/* Right Column: Meta Details & Tech Stack */}
        <div className="md:col-span-4 flex flex-col gap-10">
          
          {/* Tech Stack */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
            <h3 className="text-xs font-mono tracking-widest uppercase text-[var(--muted)] mb-6">
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
                <span 
                  key={tech} 
                  className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] px-3 py-1.5 rounded-lg text-xs font-mono font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Stats / Meta */}
          <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-8">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono tracking-widest uppercase text-[var(--muted)]">Role</span>
              <span className="text-sm font-medium text-[var(--text-h)]">Full-Stack Dev</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono tracking-widest uppercase text-[var(--muted)]">Type</span>
              <span className="text-sm font-medium text-[var(--text-h)]">{project.categories[0]}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}