export const siteConfig = {
  name: "Good Soil Harvest",
  tagline: "Grow Food. Raise Animals. Preserve the Harvest. Live Simply.",
  description:
    "Practical guides for vegetable gardening, homestead animals, food preservation, frugal living, and faith-rooted homesteading.",
  url: "https://goodsoilharvest.com",
  handle: "@goodsoilharvest",
  locale: "en_US",
};

export const niches = [
  {
    slug: "vegetable-garden",
    title: "Vegetable Garden",
    shortTitle: "Gardening",
    description:
      "From first seeds to harvest — practical guides for growing food at home.",
    icon: "🥦",
    color: "sage",
  },
  {
    slug: "homestead-animals",
    title: "Homestead Animals",
    shortTitle: "Animals",
    description:
      "Chickens, goats, rabbits, and more — raising animals for eggs, milk, and meat.",
    icon: "🐓",
    color: "harvest",
  },
  {
    slug: "food-preservation",
    title: "Food Preservation",
    shortTitle: "Preservation",
    description:
      "Canning, fermenting, dehydrating, and freezing your harvest for year-round use.",
    icon: "🫙",
    color: "soil",
  },
  {
    slug: "frugal-living",
    title: "Frugal Living",
    shortTitle: "Frugal Living",
    description:
      "Stretch every dollar — budgeting, DIY projects, and cutting costs without cutting quality.",
    icon: "💰",
    color: "sage",
  },
  {
    slug: "deep-roots",
    title: "Deep Roots",
    shortTitle: "Deep Roots",
    description:
      "Faith, family, and the values that make a homestead more than just a property.",
    icon: "🌱",
    color: "soil",
  },
] as const;

export type NicheSlug = (typeof niches)[number]["slug"];
