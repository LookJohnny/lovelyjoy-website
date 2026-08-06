/**
 * Public company facts used across metadata, JSON-LD and buyer-facing pages.
 *
 * Keep quantitative company claims here so new pages do not introduce a second
 * version of the truth. Supporting documents (business registration, factory
 * records, audit reports and certificates) remain business-controlled and are
 * shared with qualified buyers where publication is permitted.
 */
export const COMPANY_FACTS = {
  foundedYear: 2003,
  factoryAreaSqm: 20_000,
  skilledWorkers: 300,
  designTeam: 50,
  monthlyCapacity: 800_000,
  exportMarkets: 70,
  /** Size-tiered MOQ (pieces per design, by finished product size). */
  moqTiers: [
    { size: "under 20 cm", pcs: 3600 },
    { size: "20–35 cm", pcs: 2400 },
    { size: "35–50 cm", pcs: 1200 },
    { size: "over 50 cm", pcs: 800 },
  ],
  sampleLeadTime: "7–15 working days",
  productionLeadTime: "30–45 days after sample approval",
} as const;
