export type ActiveTab =
  | 'diagnosis'
  | 'ads_telemetry'
  | 'preview'
  | 'commercial'
  | 'audit_matrix';

export type PreviewDevice = 'ad_search' | 'maps';

export interface TelemetryData {
  views: number;
  viewsGrowth: number;
  interactions: number;
  interactionsGrowth: number;
  calls: number;
  directions: number;
  websiteClicks: number;
  bookings: number;
  monthlySearches: number;
  adCredit: number;
  monthlyHistory: { month: string; interactions: number }[];
}

export interface BusinessProfile {
  id: string;
  name: string;
  city: string;
  category: string;
  url: string;
  phone: string;
  address: string;
  website: string;
  adHeadline?: string;
  adDescription?: string;
  targetKeyword?: string;
  hasWebsite: boolean;
  hasWhatsapp: boolean;
  reviewsCount: number;
  rating: number;
  responseRate: number;
  photosCount: number;
  hasProfessionalPhotos: boolean;
  hasRegularHours: boolean;
  hasSpecialHours: boolean;
  hasServicesList: boolean;
  hasRecentPosts: boolean;
  hasOptimizedDescription: boolean;
  hasNapConsistency: boolean;
  image: string;
  telemetry?: TelemetryData;
}

export interface AnalysisHistoryItem {
  id: string;
  name: string;
  city: string;
  category: string;
  score: number;
  analyzedAt: string;
  timestamp: number;
  url: string;
  profile: BusinessProfile;
}

export interface RegionalReference {
  regionId: string;
  regionLabel: string;
  category: string;
  averageScore: number;
  averageRating: number;
  averageReviews: number;
  averageInteractions: number;
  averageViews: number;
  averageWebsiteClicks: number;
  averageBookings: number;
  cityCount: number;
  representativeCities: string[];
  profileCount: number;
}

export type IssueImpact = 'CRÍTICO' | 'ALTO' | 'MÉDIO';

export interface AuditIssue {
  title: string;
  desc: string;
  impact: IssueImpact;
  service: string;
}

export interface PassedPoint {
  title: string;
  desc: string;
}

export interface PillarScore {
  earned: number;
  max: number;
  label: string;
}

export interface AuditClassification {
  level: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badge: string;
  summary: string;
  urgency: string;
}

export interface AuditAnalysis {
  score: number;
  pillars: {
    reputation: PillarScore;
    visual: PillarScore;
    completeness: PillarScore;
    localSeo: PillarScore;
  };
  criticalIssues: AuditIssue[];
  passedPoints: PassedPoint[];
  classification: AuditClassification;
}

export interface ConversionTier {
  rate: number;
  label: string;
  rateDisplay: string;
  bookings: number;
  monthlyRev: number;
  annualRev: number;
  isCurrent: boolean;
  isTarget?: boolean;
}

export interface TimelinePoint {
  month: string;
  current: number;
  scenario2: number;
  target: number;
  scenario8: number;
}

export interface ConversionMetrics {
  totalInteractions: number;
  currentBookings: number;
  currentConversionRate: number;
  averageMonthlyInteractions: number;
  targetRate: number;
  additionalMonthlyBookings: number;
  additionalMonthlyRevenue: number;
  additionalAnnualRevenue: number;
  missedAccumulatedBookings: number;
  missedAccumulatedRevenue: number;
  tiers: ConversionTier[];
  timelineData: TimelinePoint[];
}

export interface RegionalStrength {
  label: string;
  value: string;
  delta: number;
  positive: boolean;
}

export interface RegionalComparison {
  region: RegionalReference;
  currentScore: number;
  scoreDelta: number;
  ratingDelta: number;
  reviewsDelta: number;
  interactionsDelta: number;
  viewsDelta: number;
  websiteClicksDelta: number;
  bookingsDelta: number;
  isAboveScore: boolean;
  isAboveRating: boolean;
  isAboveReviews: boolean;
  isAboveInteractions: boolean;
  isAboveViews: boolean;
  isAboveWebsite: boolean;
  isAboveBookings: boolean;
  strengthsCount: number;
  strengths: RegionalStrength[];
}

export interface PrintSections {
  overview: boolean;
  telemetry: boolean;
  diagnosis: boolean;
  financialStudy: boolean;
  commercialScript: boolean;
  pillars: boolean;
  consultantFooter: boolean;
}

export type PrintPreset =
  | 'all'
  | 'client'
  | 'diagnosis_financial'
  | 'commercial'
  | 'technical';

export interface AnalysisNotification {
  type: 'success' | 'error';
  message: string;
}
