export interface Project {
  id: string | number;
  slug: string;
  title: string;
  description: string;
  image: string;
  status: "Completed" | "In Progress" | string;
  categories: string[];
  techStack: string[];
  links: {
    live?: string;
    github?: string;
  };
  // Optional Deep-Dive Fields
  role?: string;
  timeline?: string;
  metric?: {
    value: string;
    label: string;
  };
  problem?: string;
  solution?: string;
  highlights?: string[];
  architecture?: string[];
  gallery?: string[];
}

export const projects: Project[] = [
  {
    id: "01",
    slug: "bazaarx",
    title: "BazaarX",
    description: "A multi-platform e-commerce ecosystem featuring vector-based visual search, POS inventory sync, and real-time flash sales.",
    image: "assets/bazaarx.png",
    status: "Completed",
    categories: ["Full-Stack", "E-Commerce", "AI"],
    techStack: ["React", "React Native", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS"],
    links: {
      live: "https://bazaarx.example.com",
      github: "https://github.com/zandrellez/bazaarx",
    },
    role: "Project Lead & Full-Stack Architect",
    timeline: "Jan 2026 – Apr 2026",
    metric: {
      value: "<120ms",
      label: "Vector Query Latency",
    },
    problem: "Traditional text searches consistently failed users searching with non-standard keywords, while disjointed POS inventory tracking led to frequent overselling during peak flash sale campaigns.",
    solution: "Engineered a unified multi-platform system connecting React web clients and Expo mobile apps with a Supabase PostgreSQL backend. Implemented high-dimensional vector embeddings for visual semantic discovery and row-level database locks for guaranteed atomic flash-sale checkouts.",
    highlights: [
      "Vector visual search pipeline indexing catalog images in real time.",
      "POS Lite synchronized inventory engine preventing overselling.",
      "Atomic cart reservation and optimistic state updates with Zustand.",
      "Automated quality assurance and merchant compliance workflow."
    ],
    architecture: [
      "Client Layer: React (Web) and React Native / Expo (Mobile) with shared TypeScript schemas",
      "State & Sync: Zustand client caching and optimistic UI updates",
      "Database & Engine: Supabase PostgreSQL with pgvector indexing",
      "Deployment: Continuous CI/CD pipelines via Vercel and Render"
    ]
  },
  {
    id: "02",
    slug: "echowear",
    title: "EchoWear",
    description: "An assistive wearable smart glove and mobile system translating Filipino Sign Language (FSL) gestures into real-time speech and text.",
    image: "assets/echowear.png",
    status: "Completed",
    categories: ["IoT & Mobile", "Machine Learning", "Accessibility"],
    techStack: ["React Native", "TensorFlow Lite", "Python", "Bluetooth LE", "ESP32", "C++"],
    links: {
      live: "#",
      github: "https://github.com/zandrellez/echowear",
    },
    role: "Core Developer & ML Engineer",
    timeline: "Jun 2025 – Apr 2026",
    metric: {
      value: "96.4%",
      label: "Gesture Accuracy",
    },
    problem: "Filipino Sign Language (FSL) speakers face daily communication barriers in service, healthcare, and educational environments where non-signers lack real-time translation tools.",
    solution: "Built a dual-hardware wearable using flex sensors, an MPU6050 IMU, and an ESP32 microcontroller. Serial sensor streams transmit over low-latency Bluetooth LE to a React Native mobile application running an offline TensorFlow Lite LSTM model that produces immediate text and speech outputs.",
    highlights: [
      "Custom dataset recording suite calibrated across diverse signers.",
      "Edge LSTM neural network optimized for offline mobile inference.",
      "Low-energy Bluetooth transmission pipeline with packet smoothing.",
      "Auditory speech feedback paired with high-contrast visual display."
    ],
    architecture: [
      "Sensory Hardware: Flex resistor array and MPU6050 6-axis gyro on ESP32",
      "Inference Engine: TensorFlow Lite LSTM running locally on-device",
      "Application: React Native mobile client handling BLE communication",
      "Speech Synthesis: Native platform text-to-speech bridge"
    ]
  },
  {
    id: "03",
    slug: "pockethive",
    title: "PocketHive",
    description: "An automated receipt parsing and expense intelligence engine leveraging OCR and LLM pipelines to structure unstructured financial records.",
    image: "assets/pockethive.png",
    status: "Completed",
    categories: ["AI Automation", "Full-Stack", "Fintech"],
    techStack: ["Python", "OpenAI API", "React", "PostgreSQL", "FastAPI", "Tailwind CSS"],
    links: {
      live: "https://pockethive.example.com",
      github: "https://github.com/zandrellez/pockethive",
    },
    role: "Solo Developer",
    timeline: "Jan 2025 – May 2025",
    metric: {
      value: "98.2%",
      label: "Parsing Precision",
    },
    problem: "Manual expense recording from wrinkled, low-contrast thermal receipts consumes hours of tedious human work and routinely introduces accounting errors.",
    solution: "Constructed an automated processing engine that applies threshold filtering and OpenCV preprocessing before running OCR and an LLM schema validator. Receipts are mapped directly into structured SQL schemas in under three seconds.",
    highlights: [
      "Image contrast normalization and deskewing preprocessing pipeline.",
      "Deterministic schema extraction from thermal receipts and digital invoices.",
      "Interactive correction dashboard with split-screen visual validation.",
      "Automated CSV and accounting software export feeds."
    ],
    architecture: [
      "Processing: OpenCV image cleaning and Tesseract OCR integration",
      "Intelligence: OpenAI API structured JSON mode extraction",
      "API: Python FastAPI service with asynchronous job queues",
      "Interface: React dashboard with live inline validation"
    ]
  }
];