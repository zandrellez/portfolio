export type ProcessPhase = {
  /** Shown after the auto-generated phase number, e.g. "01 - DISCOVERY". */
  title: string;
  description: string;
};

export const processMeta = {
  title: "DEVELOPMENT PROCESS",
  periodLabel: "HOW I WORK",
  imageUrl:
    "https://cdn.21st.dev/assets/mirror/b0/b0c41784074f76ac5fb6b447da87780c901135841317a096241371f24bc13ddd.jpg",
  imageAlt: "Developer workspace",
};

export const processPhases: ProcessPhase[] = [
  {
    title: "DISCOVERY",
    description:
      "I start by listening: goals, users, constraints, and what success looks like.",
  },
  {
    title: "PLANNING",
    description:
      "Requirements become a scoped roadmap, a tech stack, and milestones you can track.",
  },
  {
    title: "DESIGN",
    description:
      "Wireframes and UI systems are shaped and tested before a line of code ships.",
  },
  {
    title: "DEVELOPMENT",
    description:
      "Clean, typed, component-driven code built in small iterations with regular check-ins.",
  },
];