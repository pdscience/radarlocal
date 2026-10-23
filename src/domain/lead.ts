export type LeadInput = {
  name: string;
  whatsapp: string;
  email?: string | null;
  consent: boolean;
  analysisId?: string | null;
  businessName?: string | null;
  city?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  landingPath?: string | null;
};

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export function normalizeWhatsApp(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits;
}

export function isValidWhatsApp(digits: string): boolean {
  if (!/^[1-9][0-9]{9,14}$/.test(digits)) return false;
  return true;
}

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return true;
  const e = normalizeWhitespace(email).toLowerCase();
  if (e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function isValidName(name: string): boolean {
  const n = normalizeWhitespace(name);
  if (n.length < 2 || n.length > 120) return false;
  return true;
}

export function validateLead(input: LeadInput): {
  valid: boolean;
  errors: string[];
  normalized?: {
    name: string;
    whatsapp: string;
    email: string | null;
    consent: true;
  };
} {
  const errors: string[] = [];
  if (!isValidName(input.name)) errors.push('Nome inválido.');
  const wa = normalizeWhatsApp(input.whatsapp || '');
  if (!isValidWhatsApp(wa)) errors.push('WhatsApp inválido.');
  if (input.consent !== true) errors.push('Consentimento obrigatório.');
  if (!isValidEmail(input.email)) errors.push('E-mail inválido.');

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    normalized: {
      name: normalizeWhitespace(input.name),
      whatsapp: wa,
      email: input.email ? normalizeWhitespace(input.email).toLowerCase() : null,
      consent: true,
    },
  };
}
