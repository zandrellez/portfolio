export type TechFace = {
  name: string
  short: string
}

export type ServiceSlot = {
  title: string
  description: string
}

export type Service = {
  id: string
  title: string
  subtitle: string
  pitch: string
  cube: TechFace[]
  slots: ServiceSlot[]
}

export const services: Service[] = [
  {
    id: "web-mobile",
    title: "Full-Stack Applications",
    subtitle: "Built for scale, secured by design",
    pitch:
      "I don't just build websites; I build tailored digital products that adapt to your users. Whether you need a customer-facing mobile app or a complex internal dashboard, I develop secure, role-based systems ensuring the right people see the right data at the right time.",
    cube: [
      { name: "JavaScript", short: "JS" },
      { name: "React", short: "RE" },
      { name: "PHP", short: "PHP" },
      { name: "MySQL", short: "SQL" },
      { name: "HTML / CSS", short: "WEB" },
      { name: "Git", short: "GIT" },
    ],
    slots: [
      {
        title: "Scalable Foundations",
        description:
          "Apps architected to handle 10 users or 10,000 without performance drops.",
      },
      {
        title: "Bulletproof Access Control",
        description:
          "Role-based permissions (Admin, Manager, User) that protect sensitive data and ensure compliance.",
      },
      {
        title: "Frictionless User Experience",
        description:
          "Fast, responsive interfaces that work seamlessly across web, iOS, and Android, keeping your users engaged.",
      },
    ],
  },
  {
    id: "workflow-automation",
    title: "Workflow Automation",
    subtitle: "Turning manual chaos into background magic",
    pitch:
      "I connect your existing tools, databases, and AI models to eliminate repetitive, manual tasks. Instead of your team copying data between spreadsheets or manually routing requests, I build smart systems that do the heavy lifting automatically.",
    cube: [
      { name: "Python", short: "PY" },
      { name: "OpenAI", short: "AI" },
      { name: "n8n", short: "N8N" },
      { name: "APIs", short: "API" },
      { name: "ChatGPT", short: "GPT" },
      { name: "Claude", short: "CL" },
    ],
    slots: [
      {
        title: "Hours Reclaimed Weekly",
        description:
          "Freeing your team from busywork so they can focus on high-value, strategic tasks.",
      },
      {
        title: "Near-Zero Human Error",
        description:
          "Automated data syncing and routing mean no more costly copy-paste mistakes or dropped leads.",
      },
      {
        title: "Proactive Operations",
        description:
          "By weaving in AI (like auto-categorizing incoming requests or drafting smart responses), your workflows don't just run—they think.",
      },
    ],
  },
  {
    id: "ai-integration",
    title: "AI Integration",
    subtitle: "Making your existing apps smarter",
    pitch:
      "Already have an app or website? I can embed intelligent features directly into your existing stack. From document parsing to smart search, I bridge the gap between standard software and cutting-edge AI.",
    cube: [
      { name: "Vector Search", short: "VEC" },
      { name: "OCR / Parsing", short: "OCR" },
      { name: "Voice AI", short: "STT" },
      { name: "LLM Integration", short: "LLM" },
      { name: "RAG Pipelines", short: "RAG" },
      { name: "Smart Search", short: "AI" },
    ],
    slots: [
      {
        title: "Instant Insights",
        description:
          "Vector search and OCR integrations that let users find exactly what they need in seconds, not hours.",
      },
      {
        title: "Enhanced Accessibility",
        description:
          "Voice-to-text (STT) and text-to-speech (TTS) features that make your product usable for everyone.",
      },
      {
        title: "Competitive Edge",
        description:
          "Modernizing your legacy tools with AI capabilities that impress users and stakeholders alike.",
      },
    ],
  },
]