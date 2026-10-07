import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import ImmersiveFullscreenNav from './components/ui/immersive-full-screen-nav'
import AboutMe from './components/ui/about-me'
import ProjectsSection from './components/ui/projects'
import AllWorksSection from './components/ui/all-works'
import ProjectDetail from "./components/ui/project-detail"
import ServicesAndTools from './components/ui/services'
import Processes from './components/ui/process'
import CertificatesSection from './components/ui/certificates'
import ContactSection from './components/ui/contact'
import Hero from './components/ui/hero'
import Tools from './components/ui/tools'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function HomePage() {
  return (
    <main className="w-full">
      <Hero />
      <AboutMe />
      <ProjectsSection />
      <ServicesAndTools />
      <Processes />
      <Tools />
      <CertificatesSection />
      <ContactSection />
    </main>
  )
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = window.localStorage.getItem("theme")
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="relative min-h-screen w-full m-0 p-0 bg-[var(--bg)] text-[var(--text)] overflow-x-clip">
      <div className="fixed top-0 right-0 z-50 p-6">
        <ImmersiveFullscreenNav 
          theme={theme}
          onThemeToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          navConfig={{
            brand: "",
            overlayBg: "var(--nav-bg)",
            linkColor: "var(--nav-text)",
            linkHoverColor: "var(--accent)",
            clipOrigin: "right",
            headerOpenColor: "var(--nav-text)",
            headerClosedColor: "var(--text-h)",
          }}
          navContent={{
            tagline: "Engineering Clarity Out Of Complexity.",
            location: "Rodriguez, Rizal",
            links: [
              { label: "Home", href: "/" },
              { label: "Work", href: "/all-works" },
              { label: "About", href: "#" },
              { label: "Resume", href: "#" },
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
          <Route path="/works/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App