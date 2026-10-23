import { computed, type ComputedRef, type Ref } from 'vue';
import { REGIONS_DATA } from '../data/presets';
import type { BusinessProfile, RegionalComparison, RegionalStrength } from '../types';

export function useRegionalComparison(
  profile: Ref<BusinessProfile>,
  currentScore: Ref<number>,
  regionFilter: Ref<string>
): ComputedRef<RegionalComparison> {
  return computed<RegionalComparison>(() => {
    const region = REGIONS_DATA[regionFilter.value] || REGIONS_DATA['dentista-dourados'];
    const p = profile.value;
    const telemetry = p.telemetry;

    const scoreDelta = currentScore.value - region.averageScore;
    const ratingDelta = p.rating - region.averageRating;
    const reviewsDelta = p.reviewsCount - region.averageReviews;
    const interactionsDelta = (telemetry?.interactions || 0) - region.averageInteractions;
    const viewsDelta = (telemetry?.views || 0) - region.averageViews;
    const websiteClicksDelta = (telemetry?.websiteClicks || 0) - region.averageWebsiteClicks;
    const bookingsDelta = (telemetry?.bookings || 0) - region.averageBookings;

    const isAboveScore = scoreDelta >= 0;
    const isAboveRating = ratingDelta >= 0;
    const isAboveReviews = reviewsDelta >= 0;
    const isAboveInteractions = interactionsDelta >= 0;
    const isAboveViews = viewsDelta >= 0;
    const isAboveWebsite = websiteClicksDelta >= 0;
    const isAboveBookings = bookingsDelta >= 0;

    const strengthsCount =
      (isAboveScore ? 1 : 0) +
      (isAboveRating ? 1 : 0) +
      (isAboveReviews ? 1 : 0) +
      (isAboveInteractions ? 1 : 0) +
      (isAboveViews ? 1 : 0) +
      (isAboveWebsite ? 1 : 0) +
      (isAboveBookings ? 1 : 0);

    const strengths: RegionalStrength[] = [
      {
        label: 'Score Radar Local',
        value: `${currentScore.value}/100`,
        delta: scoreDelta,
        positive: isAboveScore,
      },
      {
        label: 'Avaliação no Google',
        value: `${p.rating.toFixed(1)} ★`,
        delta: ratingDelta,
        positive: isAboveRating,
      },
      {
        label: 'Volume de Avaliações',
        value: `${p.reviewsCount}`,
        delta: reviewsDelta,
        positive: isAboveReviews,
      },
      {
        label: 'Visualizações',
        value: (telemetry?.views || 0).toLocaleString('pt-BR'),
        delta: viewsDelta,
        positive: isAboveViews,
      },
      {
        label: 'Interações',
        value: String(telemetry?.interactions || 0),
        delta: interactionsDelta,
        positive: isAboveInteractions,
      },
      {
        label: 'Cliques no Website',
        value: String(telemetry?.websiteClicks || 0),
        delta: websiteClicksDelta,
        positive: isAboveWebsite,
      },
      {
        label: 'Agendamentos',
        value: String(telemetry?.bookings || 0),
        delta: bookingsDelta,
        positive: isAboveBookings,
      },
    ];

    return {
      region,
      currentScore: currentScore.value,
      scoreDelta,
      ratingDelta,
      reviewsDelta,
      interactionsDelta,
      viewsDelta,
      websiteClicksDelta,
      bookingsDelta,
      isAboveScore,
      isAboveRating,
      isAboveReviews,
      isAboveInteractions,
      isAboveViews,
      isAboveWebsite,
      isAboveBookings,
      strengthsCount,
      strengths,
    };
  });
}
