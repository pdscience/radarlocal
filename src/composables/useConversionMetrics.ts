import { computed, type ComputedRef, type Ref } from 'vue';
import type { BusinessProfile, ConversionMetrics, ConversionTier, TimelinePoint } from '../types';

export function useConversionMetrics(
  profile: Ref<BusinessProfile>,
  ticketAverage: Ref<number>,
  targetConversionBoost: Ref<number>
): ComputedRef<ConversionMetrics> {
  return computed<ConversionMetrics>(() => {
    const totalInteractions = profile.value.telemetry?.interactions || 588;
    const currentBookings = profile.value.telemetry?.bookings || 0;
    const currentConversionRate =
      totalInteractions > 0 ? (currentBookings / totalInteractions) * 100 : 0;

    const historyMonths = profile.value.telemetry?.monthlyHistory?.length || 6;
    const averageMonthlyInteractions = Math.round(
      totalInteractions / Math.max(1, historyMonths)
    );

    const boost = targetConversionBoost.value;
    const ticket = ticketAverage.value;

    const targetRate = currentConversionRate + boost;
    const additionalMonthlyBookings = Math.max(
      1,
      Math.round((boost / 100) * averageMonthlyInteractions)
    );
    const additionalMonthlyRevenue = additionalMonthlyBookings * ticket;
    const additionalAnnualRevenue = additionalMonthlyRevenue * 12;

    const missedAccumulatedBookings = Math.round((boost / 100) * totalInteractions);
    const missedAccumulatedRevenue = missedAccumulatedBookings * ticket;

    const scenario2Bookings = Math.max(1, Math.round(0.02 * averageMonthlyInteractions));
    const scenario8Bookings = Math.max(1, Math.round(0.08 * averageMonthlyInteractions));

    const tiers: ConversionTier[] = [
      {
        rate: 0,
        label: 'Cenário Atual',
        rateDisplay: '0,0%',
        bookings: currentBookings,
        monthlyRev: 0,
        annualRev: 0,
        isCurrent: true,
      },
      {
        rate: 2,
        label: 'Cenário Inicial (+2%)',
        rateDisplay: '+2,0%',
        bookings: scenario2Bookings,
        monthlyRev: scenario2Bookings * ticket,
        annualRev: scenario2Bookings * ticket * 12,
        isCurrent: false,
      },
      {
        rate: 5,
        label: 'Meta Recomendada (+5%)',
        rateDisplay: '+5,0%',
        bookings: additionalMonthlyBookings,
        monthlyRev: additionalMonthlyRevenue,
        annualRev: additionalAnnualRevenue,
        isTarget: true,
        isCurrent: false,
      },
      {
        rate: 8,
        label: 'Cenário Otimizado (+8%)',
        rateDisplay: '+8,0%',
        bookings: scenario8Bookings,
        monthlyRev: scenario8Bookings * ticket,
        annualRev: scenario8Bookings * ticket * 12,
        isCurrent: false,
      },
    ];

    const timelineData: TimelinePoint[] = [
      { month: 'Mês 1 (Setup)', factor: 0.85 },
      { month: 'Mês 2 (Ativação)', factor: 0.95 },
      { month: 'Mês 3 (Consolidação)', factor: 1.0 },
      { month: 'Mês 4 (Crescimento)', factor: 1.1 },
      { month: 'Mês 5 (Escala)', factor: 1.2 },
      { month: 'Mês 6 (Liderança)', factor: 1.3 },
    ].map((m) => {
      const base = averageMonthlyInteractions * m.factor;
      return {
        month: m.month,
        current: 0,
        scenario2: Math.round(0.02 * base) * ticket,
        target: Math.round((boost / 100) * base) * ticket,
        scenario8: Math.round(0.08 * base) * ticket,
      };
    });

    return {
      totalInteractions,
      currentBookings,
      currentConversionRate,
      averageMonthlyInteractions,
      targetRate,
      additionalMonthlyBookings,
      additionalMonthlyRevenue,
      additionalAnnualRevenue,
      missedAccumulatedBookings,
      missedAccumulatedRevenue,
      tiers,
      timelineData,
    };
  });
}
