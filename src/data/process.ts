export type ProcessPhase = {
  /** Step heading. The step number (01, 02, ...) is generated from the order. */
  title: string;
  description: string;
  /** Optional small chips shown under the description. */
  tags?: string[];
};

export const processMeta = {
  /** Small mono label above the title. */
  periodLabel: "HOW I WORK",
  title: "DEVELOPMENT PROCESS",
  /** Optional line under the title. Set to "" to hide it. */
  intro: "From the first conversation to a live product, every project moves through the same four steps.",
};

/**
 * Add, remove or reorder steps freely. Numbering, the winding line, spacing
 * and animations adapt to the count.
 */
export const processPhases: ProcessPhase[] = [
  {
    title: "Discover & Align",
    description:
      "I start by listening. We’ll define your core pain points, project goals, and the exact brand value you want to deliver to your users.",
    tags: ["Pain points", "Goals", "Brand value"],
  },
  {
    title: "Architect & Map",
    description:
      "Before writing code, I build the blueprint. I map out the features, user flows, wireframes, and database schemas so we have a clear, shared vision.",
    tags: ["Features", "User flows", "Wireframes", "Schemas"],
  },
  {
    title: "Build & Automate",
    description:
      "I develop your app or workflow using modern, scalable tech. I leverage AI tools strategically to code efficiently, integrate smart automations, and deliver features faster.",
    tags: ["Scalable tech", "AI-assisted", "Automations"],
  },
  {
    title: "Test, Polish & Deploy",
    description:
      "I rigorously test for bugs, performance, and UI consistency. Finally, I provide clean documentation and handle the deployment, giving you a reliable, ready-to-use product.",
    tags: ["Testing", "Documentation", "Deployment"],
  },
];