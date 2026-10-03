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
      className="relative bg-[#0a0a0a] px-6 py-16 sm:py-24 sm:px-12 lg:px-20 border-t border-white/[0.06] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="mx-auto max-w-7xl">
        
        {/* TOP / LEFT HEADER LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Title & Intro */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Certificates
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/50 sm:text-base">
              Here's a list of some certificates and credentials that I've earned so far!
            </p>
          </div>

          {/* Right Column: Certificate List */}
          <div className="lg:col-span-7 divide-y divide-white/5 border-t border-b border-white/5 mt-4 lg:mt-0">
            {certificatesData.map((cert) => (
              <div
                key={cert.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between py-8 transition-colors duration-300 hover:bg-white/[0.02] cursor-pointer"
                onMouseEnter={() => setHoveredCert(cert)}
                onMouseLeave={() => setHoveredCert(null)}
              >
                
                <div className="flex items-start gap-5 sm:gap-8 flex-1">
                  <span className="font-mono text-xs font-bold tracking-widest text-white/40 pt-1 shrink-0">
                    {cert.number}
                  </span>
                  
                  <div className="flex flex-col gap-3 sm:gap-1 flex-1">
                    <h3 className="text-xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-[#5fb57a] sm:text-3xl leading-snug">
                      {cert.title}
                    </h3>
                    
                    <div className="flex sm:hidden items-center justify-start gap-4 w-full font-mono text-[10px] text-white/50 pt-2">
                      <span className="tracking-wider">{cert.date}</span>
                      <span className="tracking-widest uppercase">{cert.issuer}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 pl-8">
                  <span className="font-mono text-xs text-white/40">
                    {cert.date}
                  </span>
                  <span className="font-mono text-xs tracking-wider text-white/60 uppercase">
                    {cert.issuer}
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

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