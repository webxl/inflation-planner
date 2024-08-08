import dayjs from 'dayjs';

export type SavingsFormData = {
  initialSavingsAmount: number;
  contributionStart: string;
  monthlyContributionAmount: number;
  withdrawalStart: string;
  withdrawalEnd: string;
  withdrawalMonthlyAmount: number;
  projectedInflationRate: number;
  expectedRateOfReturn: number;
  increaseContributionWithInflation?: boolean;
  increaseWithdrawalWithInflation?: boolean;
  adjusted?: boolean;
};

export type SavingsBalanceData = {
  x: Date;
  y: number;
};

export type ShortfallAdjustment = {
  initialSavingsAmount?: number;
  monthlyContributionAmount?: number;
  withdrawalMonthlyAmount?: number;
  withdrawalStart?: string;
  expectedRateOfReturn?: number;
};

export type ShortfallAdjustmentType = keyof ShortfallAdjustment;

export enum breakdownType {
  initial = 'initial',
  contributions = 'contributions',
  withdrawal = 'withdrawal',
  return = 'return',
  inflation = 'inflation'
}

export type BreakdownData = {
  id: breakdownType;
  value: number;
};

export const calculateSavingsBalance = (
  formData: SavingsFormData
): {
  savingsBalanceData: SavingsBalanceData[];
  breakdownData: BreakdownData[];
} => {
  const {
    initialSavingsAmount,
    contributionStart,
    monthlyContributionAmount,
    withdrawalStart,
    withdrawalEnd,
    withdrawalMonthlyAmount,
    projectedInflationRate,
    expectedRateOfReturn,
    increaseContributionWithInflation,
    increaseWithdrawalWithInflation
  } = formData;

  const savingsBalanceData: SavingsBalanceData[] = [];
  const breakdownData: BreakdownData[] = [
    { id: breakdownType.initial, value: initialSavingsAmount }
  ];
  let cumulativeContribution = 0;
  let cumulativeWithdrawal = 0;
  let cumulativeReturn = 0;
  let cumulativeInflation = 0;

  let currentSavings = initialSavingsAmount;
  const contributionStartDate = dayjs(contributionStart).toDate();
  const currentDate = dayjs(contributionStart).toDate();
  const withdrawalStartDate = dayjs(withdrawalStart).toDate();
  const withdrawalEndDate = dayjs(withdrawalEnd).toDate();
  const daysInYear = 365.24;
  const rateMultiplier = 1 + (expectedRateOfReturn - projectedInflationRate) / daysInYear;

  let dailyReturn = 0,
    dailyInflation = 0;

  while (currentDate < withdrawalStartDate) {
    const adjustedMonthlyContributionAmount =
      (monthlyContributionAmount *
        (increaseContributionWithInflation
          ? Math.pow(
              1 + projectedInflationRate,
              currentDate.getFullYear() - contributionStartDate.getFullYear()
            )
          : 1)) /
      (daysInYear / 12);
    currentSavings += adjustedMonthlyContributionAmount;
    cumulativeContribution += adjustedMonthlyContributionAmount;

    dailyReturn = (currentSavings * expectedRateOfReturn) / daysInYear;
    dailyInflation = (currentSavings * projectedInflationRate) / daysInYear;

    cumulativeReturn += dailyReturn;
    cumulativeInflation += dailyInflation;
    currentSavings *= rateMultiplier;

    savingsBalanceData.push({ x: new Date(currentDate), y: currentSavings });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  while (currentDate < withdrawalEndDate) {
    // adjust withdrawal amount for inflation
    const adjustedWithdrawalAmount =
      withdrawalMonthlyAmount *
      (increaseWithdrawalWithInflation
        ? Math.pow(
            1 + projectedInflationRate,
            currentDate.getFullYear() - withdrawalStartDate.getFullYear() // todo: should this be the contribution start?
          )
        : 1);

    currentSavings -= (12 * adjustedWithdrawalAmount) / daysInYear;
    cumulativeWithdrawal += (12 * adjustedWithdrawalAmount) / daysInYear;

    dailyReturn = currentSavings > 0 ? (currentSavings * expectedRateOfReturn) / daysInYear : 0;
    dailyInflation =
      currentSavings > 0 ? (currentSavings * projectedInflationRate) / daysInYear : 0;
    cumulativeReturn += dailyReturn;

    cumulativeInflation += dailyInflation;
    currentSavings *= rateMultiplier;

    savingsBalanceData.push({ x: new Date(currentDate), y: currentSavings });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  breakdownData.push({ id: breakdownType.contributions, value: cumulativeContribution });
  breakdownData.push({ id: breakdownType.withdrawal, value: cumulativeWithdrawal });
  breakdownData.push({ id: breakdownType.return, value: cumulativeReturn });
  breakdownData.push({ id: breakdownType.inflation, value: cumulativeInflation });

  return { savingsBalanceData, breakdownData };
};

export default calculateSavingsBalance;

export function calculateShortfallAdjustment(
  type: ShortfallAdjustmentType,
  parameters: SavingsFormData
): ShortfallAdjustment {
  let low = 0;
  let high = 100;
  let lowDate = new Date(parameters.withdrawalStart);
  let highDate = new Date(parameters.withdrawalEnd);
  let adjustAmount = 0.001;
  let inverseAdjustment = false;
  const tolerance = 100;

  switch (type) {
    case 'initialSavingsAmount':
      low = parameters.initialSavingsAmount;
      high = 100000000;
      adjustAmount = 5;
      break;
    case 'monthlyContributionAmount':
      low = parameters.monthlyContributionAmount;
      high = 10000000;
      break;
    case 'withdrawalMonthlyAmount':
      low = 0;
      high = parameters.withdrawalMonthlyAmount;
      inverseAdjustment = true;
      break;
    case 'expectedRateOfReturn':
      low = 0;
      high = 1;
      adjustAmount = 0.0000001;
      break;
  }

  let guess = (low + high) / 2;
  let dateGuess = new Date((lowDate.getTime() + highDate.getTime()) / 2);
  let closestBalance = Infinity;

  if (type === 'withdrawalStart') {
    let closestDate = lowDate;
    while (lowDate <= highDate) {
      parameters.withdrawalStart = dayjs(dateGuess).format('YYYY-MM-DD');
      const { savingsBalanceData } = calculateSavingsBalance(parameters);

      const balance = savingsBalanceData[savingsBalanceData.length - 1].y;

      if (Math.abs(balance) < Math.abs(closestBalance)) {
        closestBalance = balance;
        closestDate = new Date(dateGuess);
      }

      if (balance < 0) {
        lowDate = new Date(dateGuess);
        lowDate.setDate(dateGuess.getDate() + 1);
      } else {
        highDate = new Date(dateGuess);
        highDate.setDate(dateGuess.getDate() - 1);
      }

      const tmpDate = new Date((lowDate.getTime() + highDate.getTime()) / 2);
      dateGuess = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate());
    }
    return { withdrawalStart: dayjs(closestDate).format('YYYY-MM-DD') };
  } else {
    let closestValue = guess;
    while (low <= high) {
      parameters[type] = guess;
      const { savingsBalanceData } = calculateSavingsBalance(parameters);

      const balance = savingsBalanceData[savingsBalanceData.length - 1].y;

      if (Math.abs(balance) < Math.abs(closestBalance)) {
        closestBalance = balance;
        closestValue = guess;
      }

      if (balance > 0 && balance <= tolerance) {
        if (type !== 'expectedRateOfReturn') guess = Math.round(guess * 100) / 100;

        return { [type]: guess };
      } else if ((!inverseAdjustment && balance < 0) || (inverseAdjustment && balance > 0)) {
        low = guess + adjustAmount;
      } else {
        high = guess - adjustAmount;
      }
      guess = (low + high) / 2;
    }
    if (type !== 'expectedRateOfReturn') closestValue = Math.round(closestValue * 100) / 100;
    return { [type]: closestValue };
  }

  return {};
}
