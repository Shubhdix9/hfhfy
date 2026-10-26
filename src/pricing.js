// src/pricing.js
// Verified single source of truth for machinery and equipment rental calculations
// Preserves existing rules:
// - Daily: Base daily rate
// - Weekly: 7 days with 15% discount (Rate = dailyRate * 7 * 0.85)
// - Monthly: 30 days with 25% discount (Rate = dailyRate * 30 * 0.75)

export const RENTAL_DISCOUNTS = {
  DAILY: 0.0,
  WEEKLY: 0.15, // 15% discount
  MONTHLY: 0.25 // 25% discount
};

export function calculateRentalRates(dailyRate) {
  const rate = Number(dailyRate) || 0;
  const weeklyTotal = Math.round(rate * 7 * (1 - RENTAL_DISCOUNTS.WEEKLY));
  const monthlyTotal = Math.round(rate * 30 * (1 - RENTAL_DISCOUNTS.MONTHLY));

  return {
    dailyRate: rate,
    weeklyRate: weeklyTotal,
    monthlyRate: monthlyTotal,
    weeklySavings: Math.round(rate * 7 * RENTAL_DISCOUNTS.WEEKLY),
    monthlySavings: Math.round(rate * 30 * RENTAL_DISCOUNTS.MONTHLY),
  };
}

export function calculateRentalCost(dailyRate, period = 'daily', units = 1) {
  const baseRates = calculateRentalRates(dailyRate);
  const qty = Math.max(1, parseInt(units, 10) || 1);

  let costPerUnit = 0;
  if (period === 'daily') {
    costPerUnit = baseRates.dailyRate;
  } else if (period === 'weekly') {
    costPerUnit = baseRates.weeklyRate;
  } else if (period === 'monthly') {
    costPerUnit = baseRates.monthlyRate;
  } else {
    costPerUnit = baseRates.dailyRate;
  }

  return {
    period,
    units: qty,
    unitPrice: costPerUnit,
    totalCost: costPerUnit * qty,
    rates: baseRates
  };
}
