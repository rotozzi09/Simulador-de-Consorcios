import {
  ConsorcioParams,
  ConsorcioSimulationResult,
  FinancingParams,
  FinancingSimulationResult,
  ComparisonMetrics,
  MonthInstallment,
} from '../types/consorcio';

/**
 * Format currency to Brazilian Real (BRL)
 */
export function formatBRL(value: number): string {
  if (isNaN(value) || !isFinite(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0,00%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}

/**
 * Calculate full Consórcio simulation with amortization schedule and bid impacts
 */
export function calculateConsorcio(params: ConsorcioParams): ConsorcioSimulationResult {
  const {
    creditValue,
    termMonths,
    adminFeePercent,
    reserveFundPercent,
    insuranceMonthlyPercent,
    annualReadjustmentRate,
    readjustmentIndex,
    halfInstallmentUntilContemplation,
    reducedInstallmentPercent,
    bidEnabled,
    bidMonth,
    bidOwnResourcesPercent,
    bidEmbeddedPercent,
    postBidOption,
    groupTotalMembers,
  } = params;

  // Monthly readjustment rate from annual rate (compound interest formula)
  const monthlyReadjustmentRate =
    readjustmentIndex !== 'NENHUM' && annualReadjustmentRate > 0
      ? Math.pow(1 + annualReadjustmentRate / 100, 1 / 12) - 1
      : 0;

  // Base percentages over full term
  const fcMonthlyPercent = 100 / termMonths; // Fundo comum % per month
  const taMonthlyPercent = adminFeePercent / termMonths; // Taxa de adm % per month
  const frMonthlyPercent = reserveFundPercent / termMonths; // Fundo de reserva % per month
  const insuranceMonthly = (insuranceMonthlyPercent || 0) / 100;

  const baseRegularInstallment =
    creditValue * ((fcMonthlyPercent + taMonthlyPercent + frMonthlyPercent) / 100) +
    creditValue * insuranceMonthly;

  const initialInstallment = halfInstallmentUntilContemplation
    ? baseRegularInstallment * (reducedInstallmentPercent / 100)
    : baseRegularInstallment;

  // Total Bid calculation
  const totalBidPercent = bidEnabled ? bidOwnResourcesPercent + bidEmbeddedPercent : 0;
  const totalBidAmount = creditValue * (totalBidPercent / 100);
  const bidFromOwnPocket = creditValue * (bidOwnResourcesPercent / 100);
  const bidFromEmbedded = creditValue * (bidEmbeddedPercent / 100);
  const netCreditReceived = creditValue - bidFromEmbedded;

  // Simulation schedule
  const schedule: MonthInstallment[] = [];
  let accumulatedPaid = 0;
  let remainingDebt = creditValue * (1 + (adminFeePercent + reserveFundPercent) / 100);
  let currentCreditValue = creditValue;
  let isContemplated = false;
  let postContemplationInstallment = baseRegularInstallment;
  let effectiveTermMonths = termMonths;

  // Under-paid backlog if half installment is active
  let halfInstallmentShortfall = 0;

  // Bid deduction calculations
  let bidPaidProcessed = false;
  let remainingMonthsCount = termMonths;

  for (let m = 1; m <= termMonths; m++) {
    // Annual readjustment applied every 12 months (month 13, 25, 37...)
    if (m > 1 && (m - 1) % 12 === 0 && readjustmentIndex !== 'NENHUM' && annualReadjustmentRate > 0) {
      const yearMultiplier = 1 + annualReadjustmentRate / 100;
      currentCreditValue *= yearMultiplier;
      // Re-adjust remaining debt proportionally
      remainingDebt *= yearMultiplier;
    }

    const currentFundoComum = currentCreditValue * (fcMonthlyPercent / 100);
    const currentAdminFee = currentCreditValue * (taMonthlyPercent / 100);
    const currentReserveFund = currentCreditValue * (frMonthlyPercent / 100);
    const currentInsurance = currentCreditValue * insuranceMonthly;

    let baseMonthly = currentFundoComum + currentAdminFee + currentReserveFund + currentInsurance;

    let bidPaidInThisMonth = 0;

    // Check contemplation trigger
    if (bidEnabled && m === bidMonth && !bidPaidProcessed) {
      isContemplated = true;
      bidPaidProcessed = true;
      bidPaidInThisMonth = bidFromOwnPocket; // only out-of-pocket cash is paid now, embedded reduces credit

      // Amortize remaining debt with total bid (own + embedded)
      remainingDebt -= totalBidAmount;
      accumulatedPaid += bidFromOwnPocket;

      if (postBidOption === 'reduce_term') {
        // Reduce number of future months
        const monthsReduced = Math.floor(totalBidAmount / baseMonthly);
        effectiveTermMonths = Math.max(m, termMonths - monthsReduced);
      }
    }

    // Check if within effective term
    if (m > effectiveTermMonths && remainingDebt <= 0) {
      break;
    }

    let actualInstallment = baseMonthly;

    if (!isContemplated && halfInstallmentUntilContemplation) {
      actualInstallment = baseMonthly * (reducedInstallmentPercent / 100);
      halfInstallmentShortfall += baseMonthly - actualInstallment;
    } else if (isContemplated) {
      if (postBidOption === 'reduce_installment') {
        const remainingMonths = Math.max(1, termMonths - m + 1);
        // Dilute remaining debt over remaining months + shortfall if any
        actualInstallment = Math.max(0, (remainingDebt + halfInstallmentShortfall) / remainingMonths);
        postContemplationInstallment = actualInstallment;
      } else {
        // Term reduction: installment continues normal (or with shortfall added)
        const remainingMonths = Math.max(1, effectiveTermMonths - m + 1);
        if (halfInstallmentShortfall > 0) {
          actualInstallment = baseMonthly + halfInstallmentShortfall / remainingMonths;
        }
      }
    }

    accumulatedPaid += actualInstallment;
    remainingDebt = Math.max(0, remainingDebt - actualInstallment);

    schedule.push({
      month: m,
      fundoComum: currentFundoComum,
      adminFee: currentAdminFee,
      reserveFund: currentReserveFund,
      insurance: currentInsurance,
      adjustment: currentCreditValue - creditValue,
      totalInstallment: actualInstallment,
      bidPaid: bidPaidInThisMonth,
      accumulatedPaid,
      remainingDebt,
      isContemplated,
      creditAvailableValue: isContemplated ? currentCreditValue - bidFromEmbedded : 0,
    });

    if (remainingDebt <= 0 && m >= (bidEnabled ? bidMonth : termMonths)) {
      effectiveTermMonths = m;
      break;
    }
  }

  const totalAdminFee = creditValue * (adminFeePercent / 100);
  const totalReserveFund = creditValue * (reserveFundPercent / 100);
  const totalInsurance = creditValue * insuranceMonthly * effectiveTermMonths;
  const totalPaid = accumulatedPaid;
  const effectiveCostPercent = (totalPaid / (netCreditReceived || 1) - 1) * 100;

  // Probability calculations
  const drawOddsMonthlyPercent = 100 / Math.max(10, groupTotalMembers || 500);
  
  // Statistical bid odds based on Brazilian market percent distribution
  // High tier: >= 45% -> ~85% chance; 35-44% -> ~60% chance; 25-34% -> ~35% chance; <25% -> ~15% chance
  let bidOddsEstimatedPercent = 10;
  if (totalBidPercent >= 50) bidOddsEstimatedPercent = 92;
  else if (totalBidPercent >= 40) bidOddsEstimatedPercent = 78;
  else if (totalBidPercent >= 30) bidOddsEstimatedPercent = 54;
  else if (totalBidPercent >= 20) bidOddsEstimatedPercent = 32;
  else if (totalBidPercent >= 10) bidOddsEstimatedPercent = 18;

  return {
    params,
    initialInstallment,
    regularInstallment: baseRegularInstallment,
    postContemplationInstallment,
    totalPaid,
    totalAdminFee,
    totalReserveFund,
    totalInsurance,
    netCreditReceived,
    totalBidAmount,
    bidFromOwnPocket,
    bidFromEmbedded,
    effectiveTermMonths,
    effectiveCostPercent,
    schedule,
    drawOddsMonthlyPercent,
    bidOddsEstimatedPercent,
  };
}

/**
 * Calculate Bank Financing simulation (SAC and PRICE)
 */
export function calculateFinancing(
  creditValue: number,
  params: FinancingParams
): FinancingSimulationResult {
  const { annualInterestRate, downPaymentPercent, system, termMonths, administrativeCostsPercent } =
    params;

  const downPaymentAmount = creditValue * (downPaymentPercent / 100);
  const financedAmount = creditValue - downPaymentAmount;
  const adminFees = financedAmount * (administrativeCostsPercent / 100);
  const principal = financedAmount + adminFees;

  // Monthly interest rate from annual rate (compound interest standard)
  const monthlyRate = Math.pow(1 + annualInterestRate / 100, 1 / 12) - 1;

  const schedule: FinancingSimulationResult['schedule'] = [];
  let remainingDebt = principal;
  let totalInterestPaid = 0;
  let accumulatedPaid = downPaymentAmount;

  if (system === 'SAC') {
    // Constant Amortization System
    const constantAmortization = principal / termMonths;

    for (let m = 1; m <= termMonths; m++) {
      const interest = remainingDebt * monthlyRate;
      const installment = constantAmortization + interest;
      totalInterestPaid += interest;
      accumulatedPaid += installment;
      remainingDebt = Math.max(0, remainingDebt - constantAmortization);

      schedule.push({
        month: m,
        amortization: constantAmortization,
        interest,
        installment,
        remainingDebt,
        accumulatedPaid,
      });
    }
  } else {
    // PRICE System (French Amortization - Constant Installments)
    const factor = Math.pow(1 + monthlyRate, termMonths);
    const constantInstallment =
      monthlyRate > 0 ? (principal * (monthlyRate * factor)) / (factor - 1) : principal / termMonths;

    for (let m = 1; m <= termMonths; m++) {
      const interest = remainingDebt * monthlyRate;
      const amortization = constantInstallment - interest;
      totalInterestPaid += interest;
      accumulatedPaid += constantInstallment;
      remainingDebt = Math.max(0, remainingDebt - amortization);

      schedule.push({
        month: m,
        amortization,
        interest,
        installment: constantInstallment,
        remainingDebt,
        accumulatedPaid,
      });
    }
  }

  const firstInstallment = schedule[0]?.installment || 0;
  const lastInstallment = schedule[schedule.length - 1]?.installment || 0;
  const totalPaid = accumulatedPaid;
  const averageInstallment = (totalPaid - downPaymentAmount) / termMonths;

  // Total Effective Cost (CET) approximate
  const cetAnnualPercent =
    annualInterestRate + (administrativeCostsPercent * 12) / termMonths;

  return {
    financedAmount,
    downPaymentAmount,
    totalInterestPaid,
    totalPaid,
    firstInstallment,
    lastInstallment,
    averageInstallment,
    cetAnnualPercent,
    schedule,
  };
}

/**
 * Compare Consórcio vs Financing
 */
export function compareConsorcioWithFinancing(
  consorcio: ConsorcioSimulationResult,
  financing: FinancingSimulationResult
): ComparisonMetrics {
  const absoluteEconomy = financing.totalPaid - consorcio.totalPaid;
  const relativeEconomyPercent =
    financing.totalPaid > 0 ? (absoluteEconomy / financing.totalPaid) * 100 : 0;

  const monthlyDifferenceFirst = financing.firstInstallment - consorcio.initialInstallment;
  const monthlyDifferenceAverage = financing.averageInstallment - consorcio.regularInstallment;

  // Find break even month where consorcio cumulative paid is lower than financing
  let breakEvenMonths = 1;
  const maxLen = Math.min(consorcio.schedule.length, financing.schedule.length);
  for (let i = 0; i < maxLen; i++) {
    if (consorcio.schedule[i].accumulatedPaid < financing.schedule[i].accumulatedPaid) {
      breakEvenMonths = i + 1;
      break;
    }
  }

  // Opportunity Cost: if difference in down payment + monthly savings were invested in 100% CDI
  const downPaymentSaved = financing.downPaymentAmount - consorcio.bidFromOwnPocket;
  const cdiMonthlyRate = Math.pow(1 + 0.1075, 1 / 12) - 1; // 10.75% a.a. default
  let investedBalance = Math.max(0, downPaymentSaved);

  for (let m = 0; m < maxLen; m++) {
    investedBalance *= 1 + cdiMonthlyRate;
    const monthlySaving =
      (financing.schedule[m]?.installment || 0) -
      (consorcio.schedule[m]?.totalInstallment || 0);
    if (monthlySaving > 0) {
      investedBalance += monthlySaving;
    }
  }

  return {
    consorcioTotalPaid: consorcio.totalPaid,
    financingTotalPaid: financing.totalPaid,
    absoluteEconomy,
    relativeEconomyPercent,
    monthlyDifferenceFirst,
    monthlyDifferenceAverage,
    breakEvenMonths,
    opportunityCostInvestmentBalance: investedBalance,
  };
}

/**
 * Reverse Calculator: Given a desired monthly installment, calculate max credit
 */
export function calculateMaxCreditFromInstallment(
  targetMonthlyInstallment: number,
  termMonths: number,
  adminFeePercent: number,
  reserveFundPercent: number,
  insuranceMonthlyPercent: number
): number {
  if (targetMonthlyInstallment <= 0 || termMonths <= 0) return 0;
  const fcMonthly = 1 / termMonths;
  const taMonthly = adminFeePercent / 100 / termMonths;
  const frMonthly = reserveFundPercent / 100 / termMonths;
  const insMonthly = (insuranceMonthlyPercent || 0) / 100;

  const totalMonthlyRate = fcMonthly + taMonthly + frMonthly + insMonthly;
  return targetMonthlyInstallment / totalMonthlyRate;
}
