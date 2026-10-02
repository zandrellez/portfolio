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
      "Designing and building reliable digital products from database to interface.",

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
        title: "Frontend Development",
        description:
          "Responsive, accessible interfaces built around clear interactions, reusable components, and maintainable UI architecture.",
      },
      {
        title: "Backend & APIs",
        description:
          "Structured backend systems, REST APIs, authentication, business logic, and database-driven workflows.",
      },
      {
        title: "System Integration",
        description:
          "Connecting frontend, backend, third-party services, and external APIs into one cohesive product.",
      },
    ],
  },

  {
    id: "ai-automation",
    title: "AI Automation",
    subtitle:
      "Turning repetitive processes into intelligent workflows that save time and reduce manual work.",

    cube: [
      { name: "Python", short: "PY" },
      { name: "OpenAI", short: "AI" },
      { name: "n8n", short: "N8N" },
      { name: "OCR", short: "OCR" },
      { name: "APIs", short: "API" },
      { name: "Supabase", short: "SB" },
    ],

    slots: [
      {
        title: "Workflow Automation",
        description:
          "Automating repetitive processes with connected triggers, actions, APIs, databases, and intelligent decision points.",
      },
      {
        title: "AI-Powered Processing",
        description:
          "Using LLMs, OCR, and structured data pipelines to extract information and turn unstructured input into useful data.",
      },
      {
        title: "Intelligent Integrations",
        description:
          "Connecting AI services with existing applications to create practical automation instead of isolated AI features.",
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