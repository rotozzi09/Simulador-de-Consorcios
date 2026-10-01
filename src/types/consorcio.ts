export type ConsorcioCategory = 'imovel' | 'auto' | 'pesados' | 'servicos';

export type ReadjustmentIndex = 'INCC' | 'IPCA' | 'IGPM' | 'FIPE' | 'NENHUM';

export type BidType = 'livre' | 'fixo' | 'embutido' | 'fgts' | 'combinado';

export type PostBidOption = 'reduce_installment' | 'reduce_term';

export type FinancingSystem = 'SAC' | 'PRICE';

export interface ConsorcioParams {
  category: ConsorcioCategory;
  creditValue: number;
  termMonths: number;
  adminFeePercent: number; // Total over the term, e.g. 16%
  reserveFundPercent: number; // Total over the term, e.g. 2%
  insuranceMonthlyPercent: number; // Monthly insurance rate, e.g. 0.038%
  annualReadjustmentRate: number; // e.g. 4.0%
  readjustmentIndex: ReadjustmentIndex;
  halfInstallmentUntilContemplation: boolean; // Option for 50% or 75% reduced installment until drawn
  reducedInstallmentPercent: number; // e.g. 70% or 50% of regular installment

  // Bid settings
  bidEnabled: boolean;
  bidMonth: number; // Month in which bid is placed/contemplated (e.g. month 3)
  bidType: BidType;
  bidOwnResourcesPercent: number; // % from own cash or FGTS
  bidEmbeddedPercent: number; // % from credit itself (e.g. up to 30%)
  postBidOption: PostBidOption;

  // Group context for statistical estimation
  groupTotalMembers: number; // e.g. 500 members
  historicalAvgBidPercent: number; // e.g. 35%
}

export interface FinancingParams {
  annualInterestRate: number; // e.g. 11.5% a.a.
  downPaymentPercent: number; // e.g. 20%
  system: FinancingSystem;
  termMonths: number; // e.g. same or longer
  administrativeCostsPercent: number; // IOF, valuation, appraisal (e.g. 2.5%)
}

export interface InvestmentParams {
  annualCdiRate: number; // e.g. 10.75% a.a.
  incomeTaxRate: number; // e.g. 15% (long term)
  realEstateAppreciationRate: number; // e.g. 5.5% a.a.
  monthlyRentalYield: number; // e.g. 0.45%
}

export interface MonthInstallment {
  month: number;
  fundoComum: number;
  adminFee: number;
  reserveFund: number;
  insurance: number;
  adjustment: number;
  totalInstallment: number;
  bidPaid: number;
  accumulatedPaid: number;
  remainingDebt: number;
  isContemplated: boolean;
  creditAvailableValue: number;
}

export interface ConsorcioSimulationResult {
  params: ConsorcioParams;
  initialInstallment: number;
  regularInstallment: number;
  postContemplationInstallment: number;
  totalPaid: number;
  totalAdminFee: number;
  totalReserveFund: number;
  totalInsurance: number;
  netCreditReceived: number;
  totalBidAmount: number;
  bidFromOwnPocket: number;
  bidFromEmbedded: number;
  effectiveTermMonths: number;
  effectiveCostPercent: number; // Total Cost / Credit
  schedule: MonthInstallment[];
  drawOddsMonthlyPercent: number;
  bidOddsEstimatedPercent: number;
}

export interface FinancingSimulationResult {
  financedAmount: number;
  downPaymentAmount: number;
  totalInterestPaid: number;
  totalPaid: number;
  firstInstallment: number;
  lastInstallment: number;
  averageInstallment: number;
  cetAnnualPercent: number;
  schedule: {
    month: number;
    amortization: number;
    interest: number;
    installment: number;
    remainingDebt: number;
    accumulatedPaid: number;
  }[];
}

export interface ComparisonMetrics {
  consorcioTotalPaid: number;
  financingTotalPaid: number;
  absoluteEconomy: number;
  relativeEconomyPercent: number;
  monthlyDifferenceFirst: number;
  monthlyDifferenceAverage: number;
  breakEvenMonths: number;
  opportunityCostInvestmentBalance: number;
}

export interface SavedSimulation {
  id: string;
  name: string;
  createdAt: string;
  category: ConsorcioCategory;
  creditValue: number;
  termMonths: number;
  monthlyInstallment: number;
  totalPaid: number;
  netCredit: number;
  params: ConsorcioParams;
}
