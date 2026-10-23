import type { BusinessProfile } from '../types';

export function calculateProfileScore(p: BusinessProfile): number {
  let reputation = 0;
  if (p.rating >= 4.9) reputation += 14;
  else if (p.rating >= 4.5) reputation += 11;
  else reputation += 5;

  if (p.reviewsCount >= 90) reputation += 10;
  else if (p.reviewsCount >= 40) reputation += 7;
  else reputation += 3;

  if (p.responseRate >= 70) reputation += 8;
  else reputation += 3;

  let visual = 0;
  if (p.photosCount >= 20) visual += 10;
  else visual += 4;
  if (p.hasProfessionalPhotos) visual += 10;
  else visual += 3;

  let completeness = 0;
  if (p.website.includes('example.com') || (p.telemetry && p.telemetry.websiteClicks <= 5)) {
    completeness += 2;
  } else if (p.hasWebsite) {
    completeness += 8;
  }
  if (p.hasWhatsapp) completeness += 7;
  if (p.hasRegularHours && p.hasSpecialHours) completeness += 7;
  else completeness += 4;
  if (p.hasServicesList) completeness += 6;

  let localSeo = 0;
  if (p.hasOptimizedDescription) localSeo += 7;
  if (p.hasRecentPosts) localSeo += 7;
  if (p.hasNapConsistency) localSeo += 6;

  return Math.min(100, Math.max(0, reputation + visual + completeness + localSeo));
}
