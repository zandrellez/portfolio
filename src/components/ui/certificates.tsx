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
      className="relative bg-[#0a0a0a] px-6 py-24 sm:px-12 lg:px-20 border-t border-white/[0.06] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="mx-auto max-w-7xl">
        
        {/* TOP / LEFT HEADER LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Title & Intro */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Certificates
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/50 sm:text-base">
              Here's a list of some certificates and credentials that I've earned so far!
            </p>
          </div>

          {/* Right Column: Certificate List */}
          <div className="lg:col-span-7 divide-y divide-white/10 border-t border-b border-white/10">
            {certificatesData.map((cert) => (
              <div
                key={cert.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between py-8 transition-colors duration-300 hover:bg-white/[0.02] px-4 cursor-pointer"
                onMouseEnter={() => setHoveredCert(cert)}
                onMouseLeave={() => setHoveredCert(null)}
              >
                {/* Left side: Number & Title */}
                <div className="flex items-start sm:items-center gap-6 sm:gap-10">
                  <span className="font-mono text-xs tracking-widest text-white/30 pt-1 sm:pt-0">
                    {cert.number}
                  </span>
                  <h3 className="text-xl font-medium tracking-tight text-white transition-colors duration-300 group-hover:text-[#5fb57a] sm:text-3xl">
                    {cert.title}
                  </h3>
                </div>

                {/* Right side: Date & Issuer */}
                <div className="mt-4 sm:mt-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1 pl-12 sm:pl-0">
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

      {/* Floating Hover Preview Image */}
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