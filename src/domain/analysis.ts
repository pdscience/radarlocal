import type { AuditAnalysis, BusinessProfile, TelemetryData } from '../types';

export type PublicSignals = {
  hasWebsite: boolean | null;
  hasPhone: boolean | null;
  hasAddress: boolean | null;
  hasHours: boolean | null;
  hasPhotos: boolean | null;
  rating: number | null;
  reviewsCount: number | null;
};

export type NormalizedPublicProfile = {
  businessName: string;
  city: string | null;
  category: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  rating: number | null;
  reviewsCount: number | null;
  photosCount: number | null;
  signals: PublicSignals;
};

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function computeScore(p: NormalizedPublicProfile): {
  score: number;
  audit: AuditAnalysis;
} {
  const s = {
    reputation: { earned: 0, max: 32, label: 'Reputação e Avaliações' } as AuditAnalysis['pillars']['reputation'],
    visual: { earned: 0, max: 20, label: 'Mídia e Fotos' } as AuditAnalysis['pillars']['visual'],
    completeness: { earned: 0, max: 28, label: 'Completude' } as AuditAnalysis['pillars']['completeness'],
    localSeo: { earned: 0, max: 20, label: 'Sinais Locais' } as AuditAnalysis['pillars']['localSeo'],
  };

  const criticalIssues: AuditAnalysis['criticalIssues'] = [];
  const passedPoints: AuditAnalysis['passedPoints'] = [];

  const rating = p.rating;
  if (rating === null || rating === undefined) {
    s.reputation.earned += 2;
    criticalIssues.push({
      title: 'Avaliação não verificada',
      desc: 'Não foi possível confirmar a nota pública. Sem importação manual, esse dado fica não verificado.',
      impact: 'MÉDIO',
      service: 'Verificação manual de dados públicos',
    });
  } else if (rating >= 4.9) {
    s.reputation.earned += 14;
    passedPoints.push({ title: `Nota pública ${rating.toFixed(1)} ★`, desc: 'Boa reputação pública.' });
  } else if (rating >= 4.5) {
    s.reputation.earned += 11;
    passedPoints.push({ title: `Nota pública ${rating.toFixed(1)} ★`, desc: 'Reputação competitiva.' });
  } else {
    s.reputation.earned += 5;
    criticalIssues.push({
      title: 'Média pública abaixo da concorrência',
      desc: `Nota pública ${rating.toFixed(1)}. Pode exigir trabalho de reputação.`,
      impact: 'ALTO',
      service: 'Recuperação de reputação',
    });
  }

  const reviews = p.reviewsCount;
  if (reviews === null || reviews === undefined) {
    s.reputation.earned += 2;
    criticalIssues.push({
      title: 'Quantidade de avaliações não verificada',
      desc: 'Volume de avaliações não foi confirmado. Informe via importação se tiver esses dados.',
      impact: 'MÉDIO',
      service: 'Verificação manual',
    });
  } else if (reviews >= 90) {
    s.reputation.earned += 10;
    passedPoints.push({ title: `${reviews} avaliações públicas`, desc: 'Volume relevante.' });
  } else if (reviews >= 40) {
    s.reputation.earned += 7;
  } else {
    s.reputation.earned += 3;
    criticalIssues.push({
      title: 'Poucas avaliações públicas',
      desc: `${reviews} avaliações. Pode impactar a confiança.`,
      impact: 'MÉDIO',
      service: 'Estratégia de coleta de avaliações',
    });
  }
  s.reputation.earned += 0;

  const photos = p.photosCount;
  if (photos === null || photos === undefined) {
    s.visual.earned += 2;
  } else if (photos >= 20) {
    s.visual.earned += 10;
    passedPoints.push({ title: `${photos} fotos públicas`, desc: 'Galeria razoável.' });
  } else {
    s.visual.earned += 4;
    criticalIssues.push({
      title: 'Poucas fotos públicas',
      desc: 'Adicionar fotos aumenta a confiança e cliques.',
      impact: 'MÉDIO',
      service: 'Atualização de mídia',
    });
  }
  if (p.signals.hasPhotos) s.visual.earned += 4; else s.visual.earned += 0;

  if (p.signals.hasWebsite === true) {
    s.completeness.earned += 8;
    passedPoints.push({ title: 'Site público identificado', desc: 'Presença web encontrada.' });
  } else if (p.signals.hasWebsite === false) {
    s.completeness.earned += 1;
    criticalIssues.push({
      title: 'Site não identificado',
      desc: 'Sem site público detectado. Pode ser oportunidade.',
      impact: 'ALTO',
      service: 'Presença web e landing page',
    });
  } else {
    s.completeness.earned += 2;
    criticalIssues.push({
      title: 'Site não verificado',
      desc: 'Status do site não pôde ser confirmado.',
      impact: 'MÉDIO',
      service: 'Verificação manual',
    });
  }

  if (p.signals.hasPhone === true) {
    s.completeness.earned += 6;
    passedPoints.push({ title: 'Telefone público', desc: 'Contato direto disponível.' });
  } else if (p.signals.hasPhone === false) {
    s.completeness.earned += 1;
    criticalIssues.push({
      title: 'Telefone não identificado',
      desc: 'Sem telefone público confirmado.',
      impact: 'ALTO',
      service: 'Atualização de contato',
    });
  } else {
    s.completeness.earned += 2;
  }

  if (p.signals.hasHours === true) {
    s.completeness.earned += 6;
    passedPoints.push({ title: 'Horários públicos', desc: 'Informações de horário encontradas.' });
  } else if (p.signals.hasHours === false) {
    s.completeness.earned += 2;
    criticalIssues.push({
      title: 'Horários não identificados',
      desc: 'Horários podem não estar completos publicamente.',
      impact: 'MÉDIO',
      service: 'Completar horários',
    });
  } else {
    s.completeness.earned += 2;
  }
  if (p.signals.hasAddress === true) s.completeness.earned += 3; else if (p.signals.hasAddress === null) s.completeness.earned += 1;

  if (p.category) {
    s.localSeo.earned += 6;
    passedPoints.push({ title: 'Categoria definida', desc: `Categoria: ${p.category}` });
  } else {
    s.localSeo.earned += 2;
    criticalIssues.push({
      title: 'Categoria não verificada',
      desc: 'Categoria pública não identificada com clareza.',
      impact: 'MÉDIO',
      service: 'Otimização de categoria',
    });
  }

  if (p.signals.hasWebsite === true && p.website) {
    s.localSeo.earned += 7;
  } else {
    s.localSeo.earned += 2;
  }

  if (reviews !== null && reviews !== undefined && reviews >= 50) {
    s.localSeo.earned += 7;
  } else if (reviews !== null && reviews !== undefined) {
    s.localSeo.earned += 3;
  } else {
    s.localSeo.earned += 1;
  }

  const score =
    s.reputation.earned + s.visual.earned + s.completeness.earned + s.localSeo.earned;
  const clamped = clamp(Math.round(score), 0, 100);

  let classification: AuditAnalysis['classification'];
  if (clamped >= 85 && criticalIssues.length === 0) {
    classification = {
      level: 'Presença pública sólida',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badge: 'Bem posicionado',
      summary: 'Base pública consistente. Foque em conversão e em dados que faltam ser validados.',
      urgency: 'Manutenção',
    };
  } else if (clamped >= 70) {
    classification = {
      level: 'Presença pública boa',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      badge: 'Oportunidades identificadas',
      summary: 'Há bons sinais públicos, mas faltam validações e ajustes.',
      urgency: 'Oportunidade de melhoria',
    };
  } else {
    classification = {
      level: 'Presença pública a fortalecer',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      badge: 'Gargalos identificados',
      summary: 'Vários sinais não foram verificados ou precisam de atenção.',
      urgency: 'Prioritário',
    };
  }

  const audit: AuditAnalysis = {
    score: clamped,
    pillars: s,
    criticalIssues,
    passedPoints,
    classification,
  };

  return { score: clamped, audit };
}

export function buildPreview(audit: AuditAnalysis) {
  return {
    score: audit.score,
    classification: audit.classification,
    topIssues: audit.criticalIssues.slice(0, 3),
  };
}

export function telemetryIsSimulation(t?: TelemetryData | null): boolean {
  if (!t) return true;
  return true;
}

export function isDemoProfile(p: Partial<BusinessProfile>): boolean {
  return Boolean((p as any).id && String((p as any).id).includes('demo'));
}
