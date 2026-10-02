import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import MascotHero from './components/ui/mascot-portfolio-hero'
import ImmersiveFullscreenNav from './components/ui/immersive-full-screen-nav'
import AboutMe from './components/ui/about-me'
import ProjectsSection from './components/ui/projects'
import AllWorksSection from './components/ui/all-works'
import ServicesAndTools from './components/ui/services'
import Processes from './components/ui/process'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function HomePage() {
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
        services={[]}
      />
      <AboutMe />
      <ProjectsSection />
      <ServicesAndTools />
      <Processes />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
              { label: "Home", href: "/" },
              { label: "Work", href: "/all-works" },
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
            ],
          }}
        />
      </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/all-works"
            element={
              <main className="w-full">
                <AllWorksSection />
              </main>
            }
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App