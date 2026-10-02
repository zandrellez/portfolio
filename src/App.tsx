import { useState, useEffect } from 'react'
import MascotHero from './components/ui/mascot-portfolio-hero'
import ImmersiveFullscreenNav from './components/ui/immersive-full-screen-nav'
import ProjectsSection from './components/ui/projects'
import AllWorksSection from './components/ui/all-works'

function App() {
  // Live clock for the "discipline" slot
  const [timeStr, setTimeStr] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-screen w-full m-0 p-0 bg-[#ebebea] overflow-x-clip">
      {/* Global Immersive Navigation pinned to the absolute top-right of the window */}
      <div className="fixed top-0 right-0 z-50 p-6">
        <ImmersiveFullscreenNav 
          navConfig={{
            brand: "", // Removed stray branding line
            overlayBg: "#101014",
            clipOrigin: "right",
          }}
          navContent={{
            tagline: "Engineering Clarity Out Of Complexity.",
            location: "Rodriguez, Rizal",
            links: [
              { label: "Home", href: "#" },
              { label: "Work", href: "#" },
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
            ],
          }}
        />
      </div>

      {/* Full-Screen Hero Component */}
      <main className="w-full">
        <MascotHero 
          index="GMT+8"
          discipline={timeStr || "1:56 PM"}
          tagline="engineering clarity out of complexity"
          initials="ph"
          year="2026"
          badge="Open to Work"
          line2="software"
          line3="systems"
          word="data"
          verticalTag="Secure"
          bracketed="AI"
          seekingLabel="Focus"
          seeking="Full-Stack & Automation"
          services={[
            // "Full-Stack Software Engineer",
            // "AI Automation Specialist",
            // "Web & Mobile APplications",
            // "AI Solutions",
            // "Workflow Automation"
          ]}
        />
        
        <ProjectsSection />
        <AllWorksSection />
      </main>
    </div>
  )
}

export default App