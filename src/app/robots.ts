import type { MetadataRoute } from "next";

// Major search + AI/answer-engine crawlers are explicitly welcomed. Naming them
// (rather than relying only on the `*` wildcard) is a clear opt-in signal that
// AI search platforms reward, and it future-proofs against any tightening of
// default policies. All share the same allow/disallow as the wildcard rule.
const ALLOWED_BOTS = [
  "Googlebot",
  "Bingbot",
  "Google-Extended", // Google Gemini / AI training + AI Overviews grounding
  "GPTBot", // OpenAI / ChatGPT
  "OAI-SearchBot", // ChatGPT Search
  "ChatGPT-User", // ChatGPT live browsing on user request
  "ClaudeBot", // Anthropic Claude
  "Claude-Web",
  "PerplexityBot", // Perplexity
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...ALLOWED_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: "/api/",
      })),
    ],
    sitemap: "https://lovelyjoy.cn/sitemap.xml",
    host: "https://lovelyjoy.cn",
  };
}
