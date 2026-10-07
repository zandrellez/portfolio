/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MarqueeTool {
  name: string;
  /** Simple Icons slug → https://cdn.simpleicons.org/<slug> */
  slug: string;
  /** Brand hex (no #) shown on hover. Omit to fall back to the theme accent. */
  color?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Floater {
  name: string;
  /** Simple Icons slug */
  slug: string;
}

export interface ToolCategory {
  id: string;
  /** Emoji used as the icon under the marquee */
  icon: string;
  /** Short label under the icon */
  title: string;
  /** Eyebrow shown inside the panel */
  tagline: string;
  /** Conversational description (shown below the icon on hover/tap) */
  description: string;
  /** Mockup image shown inside the panel. Drop files into /public/mockups */
  mockup: string;
  groups: SkillGroup[];
  /** Up to 5 logos that float outside the panel */
  floaters: Floater[];
}

/* -------------------------------------------------------------------------- */
/* Section copy                                                               */
/* -------------------------------------------------------------------------- */

export const toolsSection = {
  eyebrow: "My Toolkit",
  title: "The stack behind clarity",
  description: "The tools I use, and how each one fits into the bigger picture.",
};

/* -------------------------------------------------------------------------- /
/ Tier 1 — the marquee (everyday, fluent tools)                              /
/ -------------------------------------------------------------------------- */
export const marqueeToolsRow1: MarqueeTool[] = [
  { name: "JavaScript", slug: "javascript", color: "F7DF1E" },
  { name: "TypeScript", slug: "typescript", color: "3178C6" },
  { name: "React.js", slug: "react", color: "61DAFB" },
  { name: "React Native", slug: "react", color: "61DAFB" },
  { name: "Node.js", slug: "nodedotjs", color: "5FA04E" },
  { name: "Next.js", slug: "nextdotjs", color: "000000" },
  { name: "Tailwind CSS", slug: "tailwindcss", color: "06B6D4" },
];

export const marqueeToolsRow2: MarqueeTool[] = [
  { name: "PHP", slug: "php", color: "777BB4" },
  { name: "Python", slug: "python", color: "3776AB" },
  { name: "SQL", slug: "mysql", color: "4479A1" },
  { name: "GitHub", slug: "github" },
  { name: "Figma", slug: "figma", color: "F24E1E" },
  { name: "Docker", slug: "docker", color: "2496ED" },
  { name: "Vercel", slug: "vercel", color: "000000" },
];


/* -------------------------------------------------------------------------- */
/* Tier 2 — conversational skill groups                                       */
/* -------------------------------------------------------------------------- */

export const toolCategories: ToolCategory[] = [
  {
    id: "frontend",
    icon: "🎨",
    title: "Frontend & Mobile",
    tagline: "Crafting the experience",
    description:
      "I build interfaces that are fast, responsive, and feel great to use, whether on the web or in a user's pocket.",
    mockup: "/mockups/frontend.png",
    groups: [
      {
        label: "Core",
        items: ["React.js", "Next.js", "React Native", "TypeScript", "Tailwind CSS"],
      },
      {
        label: "Mobile & 3D",
        items: ["Flutter", "Dart", "Ionic Framework", "Three.js"],
      },
      {
        label: "Design handoff",
        items: ["Figma", "Canva", "Vite"],
      },
    ],
    floaters: [
      { name: "React", slug: "react" },
      { name: "Next.js", slug: "nextdotjs" },
      { name: "Flutter", slug: "flutter" },
      { name: "Tailwind CSS", slug: "tailwindcss" },
      { name: "Figma", slug: "figma" },
    ],
  },
  {
    id: "backend",
    icon: "⚙️",
    title: "Backend & Infrastructure",
    tagline: "Building the engine",
    description:
      "A pretty UI is nothing without a reliable backbone. I design APIs and databases that scale securely.",
    mockup: "/mockups/backend.png",
    groups: [
      {
        label: "Languages & runtimes",
        items: ["Node.js", "PHP", "Python"],
      },
      {
        label: "Databases",
        items: ["PostgreSQL", "MySQL", "Supabase"],
      },
      {
        label: "Deployment & DevOps",
        items: ["Docker", "Vercel", "Render", "Git"],
      },
    ],
    floaters: [
      { name: "Node.js", slug: "nodedotjs" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "Docker", slug: "docker" },
      { name: "Supabase", slug: "supabase" },
      { name: "Vercel", slug: "vercel" },
    ],
  },
  {
    id: "ai",
    icon: "🧠",
    title: "AI & Automation",
    tagline: "Adding the intelligence",
    description:
      "This is where I bridge the gap between standard web apps and intelligent systems. I don't just call an API; I design workflows that save real time.",
    mockup: "/mockups/ai.png",
    groups: [
      {
        label: "Proven integrations",
        items: [
          "Vector Embeddings",
          "OCR",
          "TTS / STT APIs",
          "Hugging Face",
          "TensorFlow Lite",
          "SMTP",
          "Google OAuth",
          "Maps Integration",
        ],
      },
      {
        label: "LLMs & AI tools",
        items: [
          "Claude",
          "ChatGPT",
          "Gemini",
          "Qwen AI",
          "Jina AI",
          "Microsoft Copilot",
          "Lovable",
        ],
      },
      {
        label: "Workflow automation",
        items: ["n8n", "Google Apps Script", "Google Colab", "Google Workspace"],
      },
    ],
    floaters: [
      { name: "Claude", slug: "claude" },
      { name: "Gemini", slug: "googlegemini" },
      { name: "Hugging Face", slug: "huggingface" },
      { name: "TensorFlow", slug: "tensorflow" },
      { name: "n8n", slug: "n8n" },
    ],
  },
  {
    id: "workflow",
    icon: "🤝",
    title: "Workflow & Collaboration",
    tagline: "Shipping reliably",
    description:
      "Great code is a team sport. I stay organized, communicate clearly, and keep projects moving forward.",
    mockup: "/mockups/workflow.png",
    groups: [
      {
        label: "Methodologies",
        items: ["Agile / Scrum"],
      },
      {
        label: "Tools",
        items: ["Jira", "Trello", "Notion", "RESTful API design"],
      },
    ],
    floaters: [
      { name: "Jira", slug: "jira" },
      { name: "Trello", slug: "trello" },
      { name: "Notion", slug: "notion" },
      { name: "GitHub", slug: "github" },
    ],
  },
  {
    id: "expanding",
    icon: "🌱",
    title: "Currently Expanding",
    tagline: "Currently expanding my toolkit",
    description:
      "The tech landscape moves fast, and so do I. I'm actively building side projects to master these platforms.",
    mockup: "/mockups/expanding.png",
    groups: [
      {
        label: "No-code / e-commerce / CRM",
        items: ["Make.com", "Zapier", "GoHighLevel", "WordPress", "Shopify"],
      },
    ],
    floaters: [
      { name: "Make", slug: "make" },
      { name: "Zapier", slug: "zapier" },
      { name: "WordPress", slug: "wordpress" },
      { name: "Shopify", slug: "shopify" },
    ],
  },
];