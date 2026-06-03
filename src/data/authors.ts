// ─── Author data model ──────────────────────────────────────
//
// E-E-A-T: a NAMED HUMAN author with verifiable experience is the strongest
// "Experience/Expertise" signal for blog content. We scaffold the full system
// (author pages, visible byline, Article author schema) here, but we do NOT
// invent a fake person. Until the business supplies a real author, the default
// stays an Organization-typed editorial entity.
//
// TO ACTIVATE A REAL AUTHOR (flips byline + schema to Person automatically):
//   1. Set `type: "Person"`
//   2. Replace `name` with the real full name
//   3. Fill role/bio/expertise (and optionally image + sameAs)

export interface Author {
  slug: string;
  type: "Person" | "Organization";
  name: string;
  roleEn: string;
  roleZh: string;
  bioEn: string;
  bioZh: string;
  expertiseEn: string[];
  expertiseZh: string[];
  image: string | null; // e.g. "/images/authors/<slug>.jpg"
  sameAs: string[]; // LinkedIn / professional profiles
}

export const authors: Author[] = [
  {
    slug: "lovelyjoy-editorial",
    // TODO(business): replace with a real named person (e.g. head of sourcing /
    // senior product designer) and set type to "Person" for full E-E-A-T credit.
    type: "Organization",
    name: "LovelyJoy Editorial Team",
    roleEn: "Sourcing & Production Team, LovelyJoy",
    roleZh: "爱儿采采购与生产团队",
    bioEn:
      "The LovelyJoy editorial team writes from 20+ years of hands-on plush toy manufacturing in Yiwu, China — covering OEM/ODM production, material selection, toy-safety compliance (ASTM F963, EN 71, GB 6675), MOQ planning, and export logistics for international buyers.",
    bioZh:
      "爱儿采编辑团队基于义乌 20+ 年毛绒玩具制造一线经验撰稿，内容涵盖 OEM/ODM 生产、材料选择、玩具安全合规（ASTM F963、EN 71、GB 6675）、MOQ 规划与出口物流。",
    expertiseEn: [
      "Plush toy OEM/ODM manufacturing",
      "Toy safety compliance",
      "Sourcing & MOQ planning",
      "Export logistics",
    ],
    expertiseZh: ["毛绒玩具 OEM/ODM 制造", "玩具安全合规", "采购与 MOQ 规划", "出口物流"],
    image: null,
    sameAs: [], // TODO(business): add author's LinkedIn / professional profile
  },
];

const DEFAULT_AUTHOR_SLUG = "lovelyjoy-editorial";

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

// Resolve the author for a post. `authorSlug` is optional on BlogPost; until
// posts are individually attributed, everything falls back to the default.
export function getPostAuthor(authorSlug?: string): Author {
  return (
    (authorSlug && getAuthorBySlug(authorSlug)) ||
    getAuthorBySlug(DEFAULT_AUTHOR_SLUG)!
  );
}
