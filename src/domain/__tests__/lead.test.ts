import { describe, expect, it } from 'vitest';
import { isValidWhatsApp, normalizeWhatsApp, validateLead } from '../lead';

describe('domain/lead', () => {
  it('normalizes and validates whatsapp', () => {
    expect(normalizeWhatsApp('(11) 99999-8888')).toBe('11999998888');
    expect(isValidWhatsApp('11999998888')).toBe(true);
    expect(isValidWhatsApp('123')).toBe(false);
  });

  it('requires consent', () => {
    const res = validateLead({
      name: 'João Silva',
      whatsapp: '(11) 99999-8888',
      consent: false,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.join(' ')).toMatch(/consent/i);
  });

  it('accepts valid lead', () => {
    const res = validateLead({
      name: 'João Silva',
      whatsapp: '+55 11 99999-8888',
      email: 'joao@exemplo.com.br',
      consent: true,
    });
    expect(res.valid).toBe(true);
    expect(res.normalized?.whatsapp).toBe('5511999998888');
    expect(res.normalized?.email).toBe('joao@exemplo.com.br');
  });
});
