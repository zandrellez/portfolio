"use client";

import * as React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { projects } from "../../data/projects";
import "../styles/project-details.css";

// Helper to resolve images on both local dev and GitHub Pages base paths
function resolveAssetUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `${import.meta.env.BASE_URL}${url.replace(/^\//, "")}`;
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();

  // Find project by slug
  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const project = projects[projectIndex];

  // Scroll to top upon project change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // If project is not found, safely redirect back to all-works
  if (!project) {
    return <Navigate to="/all-works" replace />;
  }

  // Calculate circular Previous and Next projects
  const prevProject =
    projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <article className="pd-section">
      <div className="pd-container">
        
        {/* 1. TOP BREADCRUMBS BAR (Aligned with /all-works) */}
        <nav className="pd-nav-bar" aria-label="Breadcrumb navigation">
          <div className="pd-breadcrumbs">
            <Link to="/works" className="pd-back-link">
              <span aria-hidden="true">←</span> Works
            </Link>
            <span className="pd-crumb-sep" aria-hidden="true">/</span>
            <span className="pd-crumb-current">{project.title}</span>
          </div>

          <div className="pd-quick-actions">
            {project.links?.live && project.links.live !== "#" && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-action-btn pd-action-btn--primary"
              >
                <span>Live Demo</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.links?.github && project.links.github !== "#" && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-action-btn"
              >
                <span>GitHub</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </nav>

        {/* 2. HERO HEADLINE & PITCH */}
        <header className="pd-hero-head">
          <div className="pd-meta-row">
            <span className="pd-category-badge">
              {project.categories[0] ?? "System"}
            </span>
            <span
              className={`pd-status-badge ${
                project.status === "Completed"
                  ? "pd-status-badge--done"
                  : "pd-status-badge--progress"
              }`}
            >
              {project.status}
            </span>
          </div>

          <h1 className="pd-title">{project.title}</h1>
          <p className="pd-lead-text">{project.description}</p>
        </header>

        {/* 3. AT-A-GLANCE (SPEC GRID) */}
        <section className="pd-specs-grid" aria-label="Project details summary">
          <div className="pd-spec-item">
            <span className="pd-spec-label">Role</span>
            <span className="pd-spec-value">
              {project.role ?? "Full-Stack Development"}
            </span>
          </div>
          <div className="pd-spec-item">
            <span className="pd-spec-label">Timeline</span>
            <span className="pd-spec-value">
              {project.timeline ?? "2025 – 2026"}
            </span>
          </div>
          <div className="pd-spec-item">
            <span className="pd-spec-label">Platform</span>
            <span className="pd-spec-value">
              {project.categories.slice(0, 2).join(" · ")}
            </span>
          </div>
          <div className="pd-spec-item">
            <span className="pd-spec-label">
              {project.metric?.label ?? "Core Metric"}
            </span>
            <span className="pd-spec-value pd-spec-value--accent">
              {project.metric?.value ?? "Production Ready"}
            </span>
          </div>
        </section>

        {/* 4. MOCKUP HERO SHOWCASE */}
        <div className="pd-mockup-wrapper">
          <div className="pd-mockup-frame">
            <div className="pd-browser-bar">
              <div className="pd-browser-dots" aria-hidden="true">
                <span className="pd-browser-dot" />
                <span className="pd-browser-dot" />
                <span className="pd-browser-dot" />
              </div>
              <span className="pd-browser-url">
                github.com/zandrellez/{project.slug}
              </span>
              <div style={{ width: 40 }} aria-hidden="true" />
            </div>

            <div className="pd-mockup-body">
              <img
                src={resolveAssetUrl(project.image)}
                alt={`${project.title} preview screenshot`}
                className="pd-mockup-img"
              />
            </div>
          </div>
        </div>

        {/* 5. EDITORIAL TWO-COLUMN BREAKDOWN */}
        <div className="pd-editorial-grid">
          
          {/* Left Column (Sticky Sidebar Context) */}
          <aside className="pd-sidebar">
            <div className="pd-sidebar-block">
              <span className="pd-sidebar-label">Technologies</span>
              <div className="pd-stack-pills">
                {project.techStack.map((tech) => (
                  <span key={tech} className="pd-stack-pill">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pd-sidebar-block">
              <span className="pd-sidebar-label">Domains</span>
              <div className="pd-stack-pills">
                {project.categories.map((cat) => (
                  <span key={cat} className="pd-stack-pill">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column (Narrative Case Study) */}
          <main className="pd-narrative">
            {/* The Challenge / Friction */}
            <section className="pd-block">
              <h3>The Challenge</h3>
              <p>
                {project.problem ??
                  "Repetitive, manual steps and inefficient data processing often compromise the user experience. The goal was to eliminate this friction through intuitive design and reliable background engineering."}
              </p>
            </section>

            {/* The Architecture / Solution */}
            <section className="pd-block">
              <h3>The Solution & Architecture</h3>
              <p>
                {project.solution ??
                  "Engineered a resilient full-stack architecture that automates dense tasks and delivers predictable performance. Every layer is structured to minimize latency and provide effortless user interactions."}
              </p>
            </section>

            {/* Key Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <section className="pd-block">
                <h3>Key Highlights</h3>
                <ul className="pd-highlights-list">
                  {project.highlights.map((highlight, idx) => (
                    <li key={idx} className="pd-highlight-item">
                      <span className="pd-highlight-dot" aria-hidden="true" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Architecture List */}
            {project.architecture && project.architecture.length > 0 && (
              <section className="pd-block">
                <h3>Technical Breakdown</h3>
                <div className="pd-arch-list">
                  {project.architecture.map((arch, idx) => (
                    <div key={idx} className="pd-arch-card">
                      {arch}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>

        {/* 6. PREVIOUS / NEXT PROJECT RAIL */}
        <footer className="pd-bottom-rail">
          <Link to={`/works/${prevProject.slug}`} className="pd-rail-card">
            <span className="pd-rail-direction">← Previous Project</span>
            <span className="pd-rail-title">{prevProject.title}</span>
          </Link>

          <Link
            to={`/works/${nextProject.slug}`}
            className="pd-rail-card"
            style={{ textAlign: "right", alignItems: "flex-end" }}
          >
            <span className="pd-rail-direction">Next Project →</span>
            <span className="pd-rail-title">{nextProject.title}</span>
          </Link>
        </footer>

      </div>
    </article>
  );
}