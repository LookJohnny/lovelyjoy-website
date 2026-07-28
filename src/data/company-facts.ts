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
  standardMoq: 500,
  trialMoq: 200,
  sampleLeadTime: "7–15 working days",
  productionLeadTime: "30–45 days after sample approval",
} as const;
