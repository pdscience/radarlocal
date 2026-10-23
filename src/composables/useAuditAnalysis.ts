import { computed, type ComputedRef, type Ref } from 'vue';
import type {
  AuditAnalysis,
  AuditClassification,
  AuditIssue,
  BusinessProfile,
  PassedPoint,
  PillarScore,
} from '../types';

export function useAuditAnalysis(profile: Ref<BusinessProfile>): ComputedRef<AuditAnalysis> {
  return computed<AuditAnalysis>(() => {
    const p = profile.value;
    const telemetry = p.telemetry;

    const pillars = {
      reputation: { earned: 0, max: 32, label: 'Reputação e Avaliações (Prova Social)' } as PillarScore,
      visual: { earned: 0, max: 20, label: 'Mídia e Fotos do Local' } as PillarScore,
      completeness: { earned: 0, max: 28, label: 'Completude Cadastral e Conversão' } as PillarScore,
      localSeo: { earned: 0, max: 20, label: 'Sinais Ativos de SEO e Tráfego' } as PillarScore,
    };

    const criticalIssues: AuditIssue[] = [];
    const passedPoints: PassedPoint[] = [];

    if (p.rating >= 4.9) {
      pillars.reputation.earned += 14;
      passedPoints.push({
        title: `Nota Máxima no Google (${p.rating.toFixed(1)} ★)`,
        desc: 'Reputação perfeita que inspira confiança imediata e converte 3x mais que a média.',
      });
    } else if (p.rating >= 4.5) {
      pillars.reputation.earned += 11;
      passedPoints.push({
        title: 'Boa Média de Estrelas',
        desc: `Nota ${p.rating.toFixed(1)} competitiva no mercado.`,
      });
    } else {
      pillars.reputation.earned += 5;
      criticalIssues.push({
        title: 'Média de Avaliações Subótima',
        desc: `Nota atual de ${p.rating.toFixed(1)} gera insegurança na decisão de agendamento.`,
        impact: 'ALTO',
        service: 'Campanha de Recuperação de Reputação e Resposta a Reviews',
      });
    }

    if (p.reviewsCount >= 90) {
      pillars.reputation.earned += 10;
      passedPoints.push({
        title: `Volume Consistente de Avaliações (${p.reviewsCount} reviews)`,
        desc: 'Mais de 90 depoimentos garantem grande peso de relevância e relevância orgânica.',
      });
    } else if (p.reviewsCount >= 40) {
      pillars.reputation.earned += 7;
    } else {
      pillars.reputation.earned += 3;
      criticalIssues.push({
        title: 'Volume Baixo de Avaliações',
        desc: `Possui apenas ${p.reviewsCount} avaliações. Empresas de destaque local superam 80 avaliações.`,
        impact: 'MÉDIO',
        service: 'Automação de Coleta de Avaliações no Pós-Atendimento',
      });
    }

    if (p.responseRate >= 70) {
      pillars.reputation.earned += 8;
      passedPoints.push({
        title: `Boa Taxa de Resposta aos Clientes (${p.responseRate}%)`,
        desc: 'Interação ativa do proprietário humaniza a marca.',
      });
    } else {
      pillars.reputation.earned += 3;
      criticalIssues.push({
        title: 'Avaliações de Clientes Sem Resposta',
        desc: `Taxa de resposta de ${p.responseRate}%. Clientes ficam sem devolutiva pública.`,
        impact: 'MÉDIO',
        service: 'Gestão Mensal de Respostas Humanizadas com SEO',
      });
    }

    if (p.photosCount >= 20) {
      pillars.visual.earned += 10;
      passedPoints.push({
        title: `Boa Galeria de Fotos (${p.photosCount} fotos)`,
        desc: 'Facilita a identificação da clínica e recepção.',
      });
    } else {
      pillars.visual.earned += 4;
      criticalIssues.push({
        title: 'Poucas Fotos do Local Cadastradas',
        desc: 'Menos de 20 fotos no perfil. Perfis com 40+ fotos têm 42% mais pedidos de rota.',
        impact: 'MÉDIO',
        service: 'Ensaio Fotográfico Profissional de Fachada e Estrutura',
      });
    }

    if (p.hasProfessionalPhotos) {
      pillars.visual.earned += 10;
      passedPoints.push({
        title: 'Fotos Profissionais da Fachada e Consultório',
        desc: 'Ambiente estéril, moderno e acolhedor registrado com nitidez.',
      });
    } else {
      pillars.visual.earned += 3;
    }

    const bookings = telemetry?.bookings ?? 0;
    const websiteClicks = telemetry?.websiteClicks ?? 0;
    const views = telemetry?.views ?? 0;
    const interactions = telemetry?.interactions ?? 0;
    const websiteLabel = p.website.replace(/^https?:\/\//, '');
    const websiteLeak = p.website.includes('example.com') || (telemetry !== undefined && websiteClicks <= 5);

    if (telemetry && bookings === 0) {
      criticalIssues.push({
        title: '🚨 FALHA GRAVE: 0 Agendamentos Online Registrados!',
        desc: `A empresa teve ${views.toLocaleString('pt-BR')} visualizações e ${interactions} interações, mas ZERO agendamentos diretos. O botão de agendamento online está ausente no perfil!`,
        impact: 'CRÍTICO',
        service: 'Configuração e Integração de Botão de Agendamento Online no Perfil',
      });
    }

    if (websiteLeak) {
      criticalIssues.push({
        title: `🚨 FALHA GRAVE NO ANÚNCIO: Apenas ${websiteClicks} Cliques no Site & Link "${websiteLabel}"`,
        desc: `O anúncio no Google está configurado com URL fictícia ("${websiteLabel}")! De ${views.toLocaleString('pt-BR')} pessoas que visualizaram, apenas ${websiteClicks} clicaram no site, gerando perda massiva de pacientes.`,
        impact: 'CRÍTICO',
        service: 'Criação de Landing Page de Alta Conversão com Botão WhatsApp Direto',
      });
      pillars.completeness.earned += 2;
    } else if (p.hasWebsite) {
      pillars.completeness.earned += 8;
      passedPoints.push({ title: 'Website Próprio Ativo', desc: 'Canal digital estabelecido.' });
    }

    if (p.hasWhatsapp) {
      pillars.completeness.earned += 7;
      passedPoints.push({ title: 'Botão WhatsApp Integrado', desc: 'Atendimento ágil.' });
    } else {
      criticalIssues.push({
        title: 'Sem Canal Direto de WhatsApp no Perfil / Anúncio',
        desc: 'Pacientes particulares com dor ou urgência preferem WhatsApp instantâneo a ligar.',
        impact: 'ALTO',
        service: 'Implementação de Link Direto para WhatsApp Comercial',
      });
    }

    if (p.hasRegularHours && p.hasSpecialHours) {
      pillars.completeness.earned += 7;
      passedPoints.push({
        title: 'Horários Completos (Padrão e Feriados)',
        desc: 'Evita a mensagem de incerteza do Google.',
      });
    } else {
      pillars.completeness.earned += 4;
      criticalIssues.push({
        title: 'Falta Preenchimento de Horários de Feriados',
        desc: 'O perfil exibe aviso amarelo em datas sazonais sugerindo que a empresa pode estar fechada.',
        impact: 'MÉDIO',
        service: 'Auditoria de Horários Especiais e Feriados',
      });
    }

    if (p.hasServicesList) {
      pillars.completeness.earned += 6;
      passedPoints.push({
        title: 'Lista de Especialidades / Tratamentos Cadastrados',
        desc: 'Ajuda a ranquear em buscas de serviços específicos (limpeza, implante, clareamento).',
      });
    }

    if (p.hasOptimizedDescription) {
      pillars.localSeo.earned += 7;
      passedPoints.push({
        title: 'Descrição com Slogan e SEO Local',
        desc: 'Transmite acolhimento e destaca a especialidade na cidade.',
      });
    }

    if (p.hasRecentPosts) {
      pillars.localSeo.earned += 7;
      passedPoints.push({
        title: 'Publicações Ativas nos Últimos 30 Dias',
        desc: 'Sinal de relevância frequente para o algoritmo.',
      });
    } else {
      criticalIssues.push({
        title: 'Sem Postagens Recentes no Perfil (Google Updates)',
        desc: 'Nenhuma publicação nos últimos 30 dias. Postar novidades mantém o perfil no radar do algoritmo.',
        impact: 'MÉDIO',
        service: 'Gestão de 4 Publicações Mensais no Google Meu Negócio',
      });
    }

    if (p.hasNapConsistency) {
      pillars.localSeo.earned += 6;
      passedPoints.push({
        title: `Consistência de Nome e Cidade ("${p.name}")`,
        desc: 'Identidade clara e sem conflitos de listagem.',
      });
    }

    const score =
      pillars.reputation.earned +
      pillars.visual.earned +
      pillars.completeness.earned +
      pillars.localSeo.earned;

    const hasConversionLeak = Boolean(telemetry && bookings === 0);

    let classification: AuditClassification;

    if (score >= 85 && !hasConversionLeak) {
      classification = {
        level: 'Excelente Presença Local',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        badge: 'Perfil Dominante na Região',
        summary: `A empresa domina os sinais de SEO Local com nota ${p.rating.toFixed(1)} ★ e ${p.reviewsCount} avaliações. O foco agora é manter a autoridade e escalar os canais de conversão.`,
        urgency: 'Oportunidade de Manutenção e Escala',
      };
    } else if (websiteLeak) {
      classification = {
        level: 'Bom com Gargalos Críticos de Conversão',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        badge: `Reputação ${p.rating.toFixed(1)} com Fuga de Clientes no Anúncio`,
        summary: `A empresa tem reputação estelar (${p.rating.toFixed(1)} ★ e ${p.reviewsCount} avaliações), mas está desperdiçando centenas de potenciais pacientes por falta de botão de agendamento e anúncio com link ${websiteLabel}!`,
        urgency: 'Urgente: Oportunidade Imediata de Fechamento de Consultoria',
      };
    } else if (hasConversionLeak) {
      classification = {
        level: 'Bom com Gargalos Críticos de Conversão',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        badge: `Reputação ${p.rating.toFixed(1)} com 0 Agendamentos`,
        summary: `A empresa tem reputação ${p.rating.toFixed(1)} ★ e ${p.reviewsCount} avaliações, mas não registra agendamentos online. O tráfego do Google está pronto para ser convertido com um canal direto.`,
        urgency: 'Urgente: Oportunidade Imediata de Fechamento de Consultoria',
      };
    } else if (score >= 70) {
      classification = {
        level: 'Bom com Oportunidades de Otimização',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        badge: 'Perfil Competitivo',
        summary: `A empresa possui boa presença local (${p.rating.toFixed(1)} ★ e ${p.reviewsCount} avaliações). Ainda há espaço para melhorar a completude e a relevância no algoritmo.`,
        urgency: 'Oportunidade de Otimização Contínua',
      };
    } else {
      classification = {
        level: 'Presença Local Frágil',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30',
        badge: 'Perfil com Gargalos Estruturais',
        summary: `A empresa precisa reforçar reputação, mídia e completude cadastral para competir no Google Maps em ${p.city}.`,
        urgency: 'Prioridade Alta: Recuperação de Presença Local',
      };
    }

    return {
      score,
      pillars,
      criticalIssues,
      passedPoints,
      classification,
    };
  });
}
