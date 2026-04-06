export const siteConfig = {
  name: "Good Soil Harvest",
  tagline: "Faith. Finance. Mind. Ideas. Science.",
  description:
    "Thoughtful writing on faith, money, psychology, philosophy, and science — for people who want to think deeply and live well.",
  url: "https://goodsoilharvest.com",
  handle: "@goodsoilharvest",
  locale: "en_US",
};

export const niches = [
  {
    slug: "faith",
    title: "Faith",
    shortTitle: "Faith",
    description:
      "Exploring God, Scripture, theology, and what it means to live a life rooted in faith.",
    icon: "✝️",
    color: "harvest",
  },
  {
    slug: "finance",
    title: "Finance",
    shortTitle: "Finance",
    description:
      "Personal finance, economics, and building a life of generosity and financial freedom.",
    icon: "📈",
    color: "sage",
  },
  {
    slug: "psychology",
    title: "Psychology",
    shortTitle: "Psychology",
    description:
      "The science of the mind — habits, behavior, mental health, and human nature.",
    icon: "🧠",
    color: "soil",
  },
  {
    slug: "philosophy",
    title: "Philosophy",
    shortTitle: "Philosophy",
    description:
      "Big questions, ancient wisdom, and the ideas that have shaped how we think and live.",
    icon: "📜",
    color: "sage",
  },
  {
    slug: "science",
    title: "Science & Technology",
    shortTitle: "Science",
    description:
      "Discoveries, innovations, and the big ideas reshaping our understanding of the world.",
    icon: "🔬",
    color: "soil",
  },
] as const;

export type NicheSlug = (typeof niches)[number]["slug"];
