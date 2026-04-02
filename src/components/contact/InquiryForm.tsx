"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const SUBJECT_KEYS = ["oem", "odm", "wholesale", "sample", "other"] as const;

export default function InquiryForm() {
  const t = useTranslations("contact");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) {
      errs.name = t("errors.nameRequired");
    }
    if (!formData.email.trim()) {
      errs.email = t("errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = t("errors.emailInvalid");
    }
    if (!formData.message.trim()) {
      errs.message = t("errors.messageRequired");
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch {
      // silently handle for now
      console.error("Failed to submit contact form");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(
    field: keyof FormData,
    value: string,
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  if (isSuccess) {
    return (
      <ScrollReveal>
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="mt-6 text-center text-lg font-medium text-brown">
            {t("success")}
          </p>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal>
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-8 shadow-sm"
        noValidate
      >
        <div className="space-y-6">
          {/* Name */}
          <FloatingInput
            id="name"
            label={t("form.name")}
            value={formData.name}
            onChange={(v) => handleChange("name", v)}
            error={errors.name}
            required
          />

          {/* Email */}
          <FloatingInput
            id="email"
            label={t("form.email")}
            type="email"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
            error={errors.email}
            required
          />

          {/* Company */}
          <FloatingInput
            id="company"
            label={t("form.company")}
            value={formData.company}
            onChange={(v) => handleChange("company", v)}
          />

          {/* Phone */}
          <FloatingInput
            id="phone"
            label={t("form.phone")}
            type="tel"
            value={formData.phone}
            onChange={(v) => handleChange("phone", v)}
          />

          {/* Subject */}
          <div className="relative">
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className={cn(
                "peer w-full rounded-xl border border-brown/20 bg-transparent px-4 pb-2.5 pt-5 text-brown outline-none transition-colors focus:border-sky-brand focus:ring-1 focus:ring-sky-brand",
                !formData.subject && "text-brown-light",
              )}
            >
              <option value="">&nbsp;</option>
              {SUBJECT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`form.subjects.${key}`)}
                </option>
              ))}
            </select>
            <label
              htmlFor="subject"
              className="pointer-events-none absolute left-4 top-2 text-xs text-brown-light transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base"
            >
              {t("form.subject")}
            </label>
          </div>

          {/* Message */}
          <div className="relative">
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              rows={5}
              placeholder=" "
              className={cn(
                "peer w-full resize-none rounded-xl border bg-transparent px-4 pb-3 pt-6 text-brown outline-none transition-colors focus:border-sky-brand focus:ring-1 focus:ring-sky-brand",
                errors.message
                  ? "border-red-400"
                  : "border-brown/20",
              )}
            />
            <label
              htmlFor="message"
              className="pointer-events-none absolute left-4 top-2 origin-left text-xs text-brown-light transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base"
            >
              {t("form.message")} *
            </label>
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </div>
      </form>
    </ScrollReveal>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className={cn(
          "peer w-full rounded-xl border bg-transparent px-4 pb-2.5 pt-5 text-brown outline-none transition-colors focus:border-sky-brand focus:ring-1 focus:ring-sky-brand",
          error ? "border-red-400" : "border-brown/20",
        )}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 origin-left text-xs text-brown-light transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base"
      >
        {label} {required && "*"}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
