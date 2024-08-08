import { SavingsFormData } from '../../savings.ts';
import dayjs from 'dayjs';

type reducerState = SavingsFormData & { isDirty?: boolean; overrides: { [key: string]: boolean } };
const parametersReducer = (
  state: reducerState,
  action: {
    type: string;
    value?: string | number | Date | dayjs.Dayjs | null | boolean;
    isDirty?: boolean;
    setOverride?: boolean;
  }
): reducerState => {
  const wrapState = (curState: reducerState) => {
    return {
      ...curState,
      isDirty: action.isDirty ?? false,
      overrides: { ...curState.overrides, [action.type]: action.setOverride ?? false }
    };
  };

  switch (action.type) {
    case 'initialSavingsAmount':
      return { ...wrapState(state), initialSavingsAmount: action.value as number };
    case 'contributionStart':
      if (dayjs(action.value as string).toDate() <= dayjs(state.withdrawalStart).toDate()) {
        return {
          ...wrapState(state),
          contributionStart: action.value as string
        };
      } else
        return {
          ...wrapState(state),
          contributionStart: state.withdrawalStart
        };

    case 'withdrawalStart':
      if (dayjs(action.value as string).toDate() >= dayjs(state.contributionStart).toDate()) {
        return {
          ...wrapState(state),
          withdrawalStart: action.value as string
        };
      } else return { ...state, withdrawalStart: state.contributionStart };

    case 'withdrawalEnd':
      if (dayjs(action.value as string).toDate() >= dayjs(state.withdrawalStart).toDate()) {
        return {
          ...wrapState(state),
          withdrawalEnd: action.value as string
        };
      } else return { ...state, withdrawalEnd: state.withdrawalEnd };

    case 'monthlyContributionAmount':
      return { ...wrapState(state), monthlyContributionAmount: action.value as number };
    case 'withdrawalMonthlyAmount':
      return { ...wrapState(state), withdrawalMonthlyAmount: action.value as number };
    case 'projectedInflationRate':
      return { ...wrapState(state), projectedInflationRate: action.value as number };
    case 'expectedRateOfReturn':
      return { ...wrapState(state), expectedRateOfReturn: action.value as number };
    case 'increaseContributionWithInflation':
      return {
        ...wrapState(state),
        increaseContributionWithInflation: action.value as boolean
      };
    case 'increaseWithdrawalWithInflation':
      return { ...wrapState(state), increaseWithdrawalWithInflation: action.value as boolean };
    case 'isDirty':
      return { ...state, isDirty: false };
    case 'resetOverrides':
      return { ...state, overrides: {} };
    default:
      break;
  }
  return state;
};

export default parametersReducer;
