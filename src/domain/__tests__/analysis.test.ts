import { describe, expect, it } from 'vitest';
import { buildPreview, computeScore } from '../analysis';

describe('domain/analysis', () => {
  it('returns preview without full report details', () => {
    const { audit } = computeScore({
      businessName: 'Teste',
      city: 'SP',
      category: 'Serviços',
      website: null,
      phone: null,
      address: null,
      rating: null,
      reviewsCount: null,
      photosCount: null,
      signals: {
        hasWebsite: null,
        hasPhone: null,
        hasAddress: null,
        hasHours: null,
        hasPhotos: null,
        rating: null,
        reviewsCount: null,
      },
    });
    const preview = buildPreview(audit);
    expect(preview).toHaveProperty('score');
    expect(preview).toHaveProperty('classification');
    expect(Array.isArray(preview.topIssues)).toBe(true);
    expect((preview as any).report).toBeUndefined();
  });

  it('does not invent false numbers when data missing', () => {
    const { score, audit } = computeScore({
      businessName: 'X',
      city: null,
      category: null,
      website: null,
      phone: null,
      address: null,
      rating: null,
      reviewsCount: null,
      photosCount: null,
      signals: {
        hasWebsite: null,
        hasPhone: null,
        hasAddress: null,
        hasHours: null,
        hasPhotos: null,
        rating: null,
        reviewsCount: null,
      },
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(audit.criticalIssues.some((i) => i.title.toLowerCase().includes('não'))).toBe(true);
  });

  it('rewards verified public signals', () => {
    const { score } = computeScore({
      businessName: 'Bom',
      city: 'BH',
      category: 'Oficina',
      website: 'https://ex.com',
      phone: '+5531999999999',
      address: 'Rua A',
      rating: 4.9,
      reviewsCount: 120,
      photosCount: 40,
      signals: {
        hasWebsite: true,
        hasPhone: true,
        hasAddress: true,
        hasHours: true,
      hasPhotos: true,
      rating: 4.9,
      reviewsCount: 120,
      },
    });
    expect(score).toBeGreaterThan(70);
  });
});
