// services.ts

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
  cube: TechFace[]
  slots: ServiceSlot[]
}

export const services: Service[] = [
  {
    id: "full-stack",
    title: "Full-Stack Engineering",
    subtitle:
      "Outcome-driven digital products that scale smoothly and feel effortless to use.",

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
        title: "User-Centric Web Apps",
        description:
          "High-converting web and mobile interfaces that feel effortless to navigate, built around modular UI components and accessible design systems.",
      },
      {
        title: "High-Performance Backend Systems",
        description:
          "Zero-downtime application logic and data structures, engineered through structured API endpoints, secure authentication, and optimized schemas.",
      },
      {
        title: "Third-Party Integrations",
        description:
          "Unified software ecosystems with zero data silos, created by connecting your core application directly to external services and platform APIs.",
      },
    ],
  },

  {
    id: "ai-automation",
    title: "AI Automation",
    subtitle:
      "Intelligent automation pipelines that eliminate manual tasks and save hours of work.",

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
        title: "Automated Workflows",
        description:
          "Hours of repetitive operational work saved daily, delivered through custom event-driven automation pipelines connecting your entire software stack.",
      },
      {
        title: "Smart Data Extraction",
        description:
          "Instant conversion of messy files, emails, and PDFs into structured database records, powered by intelligent document parsing and language processing.",
      },
      {
        title: "Embedded AI Features",
        description:
          "Smart, context-aware capabilities built into your web applications, enabled by integrating tailored language models and custom knowledge bases.",
      },
    ],
  },
]

export const marqueeTools = {
  row1: [
    "JavaScript",
    "React",
    "PHP",
    "MySQL",
    "Python",
    "Supabase",
    "Node.js",
    "REST APIs",
    "Zapier"
  ],

  row2: [
    "n8n",
    "OpenAI API",
    "Git",
    "GitHub",
    "HTML5",
    "CSS3",
    "OCR",
    "Figma",
  ],
}