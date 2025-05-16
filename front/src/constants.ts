export const INDEX_NAME = "sample-index";

interface Model {
  name: string;
  desc: string;
}

export const MODEL = {
  "gpt-4.1": {
    name: "gpt-4.1",
    desc: "A highly capable model with strong reasoning abilities.",
  },
  "gpt-4.1-mini": {
    name: "gpt-4.1-mini",
    desc: "A smaller, faster, and more cost-effective version of gpt-4.1.",
  },
  "o3-mini": {
    name: "o3-mini",
    desc: "An advanced reasoning model, optimized for performance, cost, and STEM applications.",
  },
  // "claude-3-opus-20240229": {
  //   name: "claude-3-opus-20240229",
  //   desc: "Anthropic's most powerful model, excelling at complex reasoning and analysis.",
  // },
  // "claude-3-sonnet-20240229": {
  //   name: "claude-3-sonnet-20240229",
  //   desc: "A balanced model from Anthropic, ideal for enterprise workloads and scaled AI deployments.",
  // },
} as const;

export const NICKNAME = process.env.NEXT_PUBLIC_NICKNAME;
