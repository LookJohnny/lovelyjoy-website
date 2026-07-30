"use client";

import { useEffect } from "react";

export const LEAD_ATTRIBUTION_KEY = "lovelyjoy:first-touch";

export interface LeadAttribution {
  source: string;
  medium: string;
  campaign: string;
  landingPath: string;
  referrer: string;
  capturedAt: string;
}

function cleanReferrer(value: string): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

function inferSource(referrer: string): string {
  if (!referrer) return "direct";

  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("chatgpt.com") || host.includes("openai.com")) return "chatgpt";
    if (host.includes("perplexity.ai")) return "perplexity";
    if (host.includes("copilot.microsoft.com")) return "microsoft-copilot";
    if (host.includes("bing.com")) return "bing";
    if (host.includes("google.")) return "google";
    if (host.includes("claude.ai")) return "claude";
    return host.replace(/^www\./, "") || "referral";
  } catch {
    return "referral";
  }
}

export default function LeadAttributionCapture() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(LEAD_ATTRIBUTION_KEY)) return;

      const search = new URLSearchParams(window.location.search);
      const referrer = cleanReferrer(document.referrer);
      const attribution: LeadAttribution = {
        source: search.get("utm_source")?.slice(0, 100) || inferSource(referrer),
        medium: search.get("utm_medium")?.slice(0, 100) || "",
        campaign: search.get("utm_campaign")?.slice(0, 150) || "",
        landingPath: window.location.pathname.slice(0, 300),
        referrer,
        capturedAt: new Date().toISOString(),
      };

      window.sessionStorage.setItem(
        LEAD_ATTRIBUTION_KEY,
        JSON.stringify(attribution),
      );
    } catch {
      // Attribution is optional. Storage restrictions must never block the site.
    }
  }, []);

  return null;
}
