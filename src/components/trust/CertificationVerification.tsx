import { certifications } from "@/data/certifications";
import { ShieldCheck, FileCheck2, ExternalLink } from "lucide-react";

// SSR-rendered certification trust module. Shows issuer / scope / market for
// every standard, and surfaces certificate number, validity, PDF and verify
// link ONLY when the business has supplied them (see src/data/certifications.ts).
// Until then it renders an honest "available on request" note instead of an
// invented number.
export default function CertificationVerification({ locale }: { locale: string }) {
  const isZh = locale === "zh";

  return (
    <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
      {certifications.map((c) => (
        <div key={c.id} className="rounded-2xl border border-brown/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-brand/10">
              <ShieldCheck className="h-5 w-5 text-sky-brand" />
            </span>
            <div>
              <h3 className="font-bold text-brown">{c.name}</h3>
              <p className="text-xs text-brown/50">{c.issuer}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="shrink-0 text-brown/50">{isZh ? "范围" : "Scope"}:</dt>
              <dd className="text-brown/80">{isZh ? c.scopeZh : c.scopeEn}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-brown/50">{isZh ? "市场" : "Market"}:</dt>
              <dd className="text-brown/80">{isZh ? c.marketZh : c.marketEn}</dd>
            </div>
            {c.certificateNumber && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-brown/50">{isZh ? "证书编号" : "Cert No."}:</dt>
                <dd className="font-mono text-brown/80">{c.certificateNumber}</dd>
              </div>
            )}
            {c.validUntil && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-brown/50">{isZh ? "有效期至" : "Valid until"}:</dt>
                <dd className="text-brown/80">{c.validUntil}</dd>
              </div>
            )}
          </dl>

          <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium">
            {c.pdfUrl ? (
              <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-brand hover:underline">
                <FileCheck2 className="h-4 w-4" /> {isZh ? "下载证书 (PDF)" : "Download certificate (PDF)"}
              </a>
            ) : (
              <span className="text-xs text-brown/40">{isZh ? "证书可应需提供" : "Certificate available on request"}</span>
            )}
            {c.verifyUrl && (
              <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-brand hover:underline">
                <ExternalLink className="h-4 w-4" /> {isZh ? "在线核验" : "Verify online"}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
