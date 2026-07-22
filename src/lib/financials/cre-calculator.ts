/**
 * Calculates Net Operating Income (NOI).
 */
export function calculateNOI(grossRent: number, operatingExpenses: number, vacancyRate: number): number {
  const effectiveGrossIncome = grossRent * (1 - vacancyRate);
  return effectiveGrossIncome - operatingExpenses;
}

/**
 * Calculates Capitalization Rate (Cap Rate).
 */
export function calculateCapRate(noi: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0;
  return noi / purchasePrice;
}

/**
 * Calculates annual debt service using a standard amortization formula.
 */
export function calculateDebtService(loanAmount: number, interestRate: number, amortizationYears: number): number {
  if (loanAmount <= 0) return 0;
  if (interestRate === 0) return loanAmount / amortizationYears;

  const monthlyRate = interestRate / 12;
  const numPayments = amortizationYears * 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1);
  return monthlyPayment * 12;
}

/**
 * Calculates Cash-on-Cash Return.
 */
export function calculateCashOnCash(noi: number, debtService: number, initialEquity: number): number {
  if (initialEquity === 0) return 0;
  return (noi - debtService) / initialEquity;
}

/**
 * Calculates Debt Coverage Ratio (DCR / DSCR).
 */
export function calculateDCR(noi: number, debtService: number): number {
  if (debtService === 0) return 0;
  return noi / debtService;
}

export interface ProFormaYear {
  year: number;
  grossRevenue: number;
  operatingExpenses: number;
  noi: number;
  debtService: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

/**
 * Generates a multi-year Pro-Forma projection.
 */
export function generateProForma(
  purchasePrice: number,
  initialGrossRent: number,
  initialExpenses: number,
  vacancyRate: number,
  rentGrowthRate: number,
  expenseGrowthRate: number,
  debtService: number,
  holdingYears: number = 5
): ProFormaYear[] {
  const projections: ProFormaYear[] = [];
  let currentGrossRent = initialGrossRent;
  let currentExpenses = initialExpenses;
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= holdingYears; year++) {
    const noi = calculateNOI(currentGrossRent, currentExpenses, vacancyRate);
    const netCashFlow = noi - debtService;
    cumulativeCashFlow += netCashFlow;

    projections.push({
      year,
      grossRevenue: currentGrossRent * (1 - vacancyRate),
      operatingExpenses: currentExpenses,
      noi,
      debtService,
      netCashFlow,
      cumulativeCashFlow
    });

    // Apply growth for the next year
    currentGrossRent *= (1 + rentGrowthRate);
    currentExpenses *= (1 + expenseGrowthRate);
  }

  return projections;
}
