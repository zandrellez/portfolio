"use client";

import { useState } from "react";
import { certificatesData, type CertificateItem } from "../../data/certificates";

export default function CertificatesSection() {
  const [hoveredCert, setHoveredCert] = useState<CertificateItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section 
      id="certificates" 
      className="relative px-6 py-16 sm:py-24 sm:px-12 lg:px-20 overflow-hidden"
      style={{ 
        backgroundColor: "#fdfdf5", 
        borderTop: "1px solid rgba(147, 171, 146, 0.2)" 
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="mx-auto max-w-7xl">
        
        {/* TOP / LEFT HEADER LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Title & Intro */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <h2 
              className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-7xl"
              style={{ color: "#1a211b" }}
            >
              Certificates
            </h2>
            <p 
              className="max-w-sm text-sm leading-relaxed sm:text-base"
              style={{ color: "#4b524d" }}
            >
              Here's a list of some certificates and credentials that I've earned so far!
            </p>
          </div>

          {/* Right Column: Certificate List */}
          <div 
            className="lg:col-span-7 flex flex-col mt-4 lg:mt-0"
            style={{ borderTop: "1px solid rgba(147, 171, 146, 0.2)" }}
          >
            {certificatesData.map((cert) => (
              <a
                key={cert.id}
                // Cast to any to accept the new link property in your data file
                href={(cert as any).link || "#"} 
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between py-8 cursor-pointer block transition-colors duration-300"
                style={{ 
                  borderBottom: "1px solid rgba(147, 171, 146, 0.2)",
                  backgroundColor: hoveredCert?.id === cert.id ? "rgba(147, 171, 146, 0.05)" : "transparent"
                }}
                onMouseEnter={() => setHoveredCert(cert)}
                onMouseLeave={() => setHoveredCert(null)}
              >
                
                <div className="flex items-start gap-5 sm:gap-8 flex-1">
                  <span 
                    className="font-mono text-xs font-bold tracking-widest pt-1 shrink-0"
                    style={{ color: "#93ab92" }}
                  >
                    {cert.number}
                  </span>
                  
                  <div className="flex flex-col gap-3 sm:gap-1 flex-1">
                    <h3 
                      className="text-xl font-bold tracking-tight sm:text-3xl leading-snug flex items-center gap-3 transition-colors duration-300"
                      style={{ color: hoveredCert?.id === cert.id ? "#93ab92" : "#1a211b" }}
                    >
                      {cert.title}
                      {/* Animated Arrow */}
                      <svg className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </h3>
                    
                    <div className="flex sm:hidden items-center justify-start gap-4 w-full font-mono text-[10px] pt-2">
                      <span className="tracking-wider" style={{ color: "#4b524d" }}>{cert.date}</span>
                      <span className="tracking-widest uppercase" style={{ color: "#1a211b" }}>{cert.issuer}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 pl-8">
                  <span className="font-mono text-xs" style={{ color: "#4b524d" }}>
                    {cert.date}
                  </span>
                  <span className="font-mono text-xs tracking-wider uppercase" style={{ color: "#1a211b" }}>
                    {cert.issuer}
                  </span>
                </div>

              </a>
            ))}
          </div>

        </div>
      </div>

      {/* Hover Image Preview (Kept dark for a sleek popup contrast) */}
      {hoveredCert && (
        <div 
          className="pointer-events-none fixed z-50 hidden md:block overflow-hidden rounded-xl border border-white/20 bg-[#111] shadow-2xl transition-all duration-150 ease-out"
          style={{
            top: `${mousePos.y - 120}px`,
            left: `${mousePos.x + 30}px`,
            width: "320px",
            height: "200px",
          }}
        >
          <img 
            src={hoveredCert.imageUrl} 
            alt={hoveredCert.title} 
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
            <span className="text-[11px] font-medium text-white truncate">
              {hoveredCert.title}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}