export type ProcessPhase = {
  /** Shown after the auto-generated phase number, e.g. "01 - DISCOVERY". */
  title: string;
  description: string;
};

export const processMeta = {
  title: "PROCESS",
  periodLabel: "How I transform raw problems into production-ready software.",
  imageUrl:
    "https://cdn.21st.dev/assets/mirror/b0/b0c41784074f76ac5fb6b447da87780c901135841317a096241371f24bc13ddd.jpg",
  imageAlt: "Developer workspace",
};

export const processPhases: ProcessPhase[] = [
  {
    title: "DISCOVER",
    description:
      "Uncovering core operational bottlenecks and defining the exact user value, branding, and outcome the project must achieve.",
  },
  {
    title: "MAP",
    description:
      "Transforming requirements into structured user flows, wireframes, and database schemas before writing a single line of code.",
  },
  {
    title: "BUILD",
    description:
      "Rapidly engineering full-stack components and automation pipelines using modern AI workflows to ship production-grade code fast.",
  },
  {
    title: "TEST",
    description:
      "Rigorously auditing user interface polish, edge cases, API reliability, and system performance to ensure zero friction.",
  },  
  {
    title: "SHIP",
    description:
      "Launching production-ready systems paired with clean documentation and handover guides for seamless long-term maintenance.",
  },
];