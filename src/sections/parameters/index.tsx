import { Button, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { SavingsFormData, ShortfallAdjustmentType } from '../../savings.ts';
import { CheckboxInput, DateInput, DollarAmountInput, PercentageAmountInput } from './inputs.tsx';
import parametersReducer from './reducer.ts';

const Parameters = ({
  onChange,
  shortfallAdjustmentType,
  shortfallAdjustmentValue,
  preserveAdjustment,
  handleKeepReset,
  parameters,
  onDrawerClose,
  resetToDefaults
}: {
  onChange: (params: SavingsFormData) => void;
  shortfallAdjustmentType?: ShortfallAdjustmentType;
  shortfallAdjustmentValue: string | number;
  preserveAdjustment?: boolean;
  handleKeepReset: (isKeeping: boolean) => void;
  parameters: SavingsFormData;
  onDrawerClose?: (() => void) | undefined;
  resetToDefaults: () => void;
}) => {
  const [state, dispatch] = useReducer(parametersReducer, { ...parameters, overrides: {} });

  const useOverrideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetOverrides = () => {
    dispatch({ type: 'resetOverrides' });
  };

  const handleInitialSavingsAmountChange = useCallback((value: string | number) => {
    dispatch({ type: 'initialSavingsAmount', value: value, isDirty: true });
  }, []);

  const handleMonthlyContributionAmountChange = useCallback((value: string | number) => {
    dispatch({ type: 'monthlyContributionAmount', value: value, isDirty: true });
  }, []);

  const handleWithdrawalMonthlyAmountChange = useCallback((value: string | number) => {
    dispatch({ type: 'withdrawalMonthlyAmount', value: value, isDirty: true });
  }, []);

  const handleProjectedInflationRateChange = useCallback((value: string | number) => {
    dispatch({ type: 'projectedInflationRate', value: value, isDirty: true });
  }, []);

  const handleExpectedRateOfReturnChange = useCallback((value: string | number) => {
    dispatch({ type: 'expectedRateOfReturn', value: value, isDirty: true });
  }, []);

  const handleContributionStartChange = useCallback((startDate: string | number) => {
    dispatch({ type: 'contributionStart', value: startDate, isDirty: true });
  }, []);

  const handleWithdrawalStartChange = useCallback((startDate: string | number) => {
    dispatch({ type: 'withdrawalStart', value: startDate, isDirty: true });
  }, []);

  const handleWithdrawalEndChange = useCallback((endDate: string | number) => {
    dispatch({ type: 'withdrawalEnd', value: endDate, isDirty: true });
  }, []);

  const handleIncreaseContributionWithInflationCheck = useCallback((checked: boolean) => {
    dispatch({
      type: 'increaseContributionWithInflation',
      value: checked,
      isDirty: true
    });
  }, []);

  const handleIncreaseWithdrawalWithInflationCheck = useCallback((checked: boolean) => {
    dispatch({ type: 'increaseWithdrawalWithInflation', value: checked, isDirty: true });
  }, []);

  const [currentAdjustmentType, setCurrentAdjustmentType] = useState<
    ShortfallAdjustmentType | undefined
  >();
  const [adjustmentRestoreValue, setAdjustmentRestoreValue] = useState<
    number | string | undefined
  >();

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (state.isDirty || isDirty) {
      onChange({
        ...state,
        adjusted: !!adjustmentRestoreValue
      });
      setIsDirty(false);
      dispatch({ type: 'isDirty', value: false });
    }
  }, [isDirty, adjustmentRestoreValue, onChange, state]);

  useEffect(() => {
    if (
      shortfallAdjustmentType &&
      shortfallAdjustmentValue &&
      adjustmentRestoreValue === undefined
    ) {
      setAdjustmentRestoreValue(state[shortfallAdjustmentType]);
      setCurrentAdjustmentType(shortfallAdjustmentType);
      dispatch({
        type: shortfallAdjustmentType,
        value: shortfallAdjustmentValue,
        setOverride: true
      });
    } else if (
      shortfallAdjustmentType === undefined &&
      adjustmentRestoreValue !== undefined &&
      !preserveAdjustment &&
      currentAdjustmentType
    ) {
      dispatch({ type: currentAdjustmentType, value: adjustmentRestoreValue, setOverride: true });
      setAdjustmentRestoreValue(undefined);
      useOverrideTimeoutRef.current = setTimeout(resetOverrides, 500);
    }

    if (preserveAdjustment && !shortfallAdjustmentType && adjustmentRestoreValue !== undefined) {
      setAdjustmentRestoreValue(undefined);
      useOverrideTimeoutRef.current = setTimeout(resetOverrides, 1500);
    }
    if (!shortfallAdjustmentType && currentAdjustmentType) {
      setCurrentAdjustmentType(undefined);
    }
  }, [
    adjustmentRestoreValue,
    currentAdjustmentType,
    shortfallAdjustmentType,
    state,
    preserveAdjustment,
    shortfallAdjustmentValue
  ]);

  useEffect(() => {
    if (!currentAdjustmentType && !preserveAdjustment && !state.isDirty) {
      if (
        dayjs(parameters.withdrawalStart).format('L') !== dayjs(state.withdrawalStart).format('L')
      ) {
        dispatch({ type: 'withdrawalStart', value: parameters.withdrawalStart, setOverride: true });
        useOverrideTimeoutRef.current = setTimeout(resetOverrides, 500);
      }
      if (dayjs(parameters.withdrawalEnd).format('L') !== dayjs(state.withdrawalEnd).format('L')) {
        dispatch({ type: 'withdrawalEnd', value: parameters.withdrawalEnd, setOverride: true });
        useOverrideTimeoutRef.current = setTimeout(resetOverrides, 500);
      }
    }
  }, [
    adjustmentRestoreValue,
    currentAdjustmentType,
    onChange,
    parameters,
    state,
    isDirty,
    preserveAdjustment
  ]);

  useEffect(() => {
    return () => {
      if (useOverrideTimeoutRef.current) {
        clearTimeout(useOverrideTimeoutRef.current);
      }
    };
  }, []);

  const _resetToDefaults = useCallback(() => {
    resetToDefaults();
    dispatch({ type: 'overrideAll' });
    useOverrideTimeoutRef.current = setTimeout(resetOverrides, 500);
  }, [resetToDefaults]);

  useEffect(() => {
    if (state.overrideAll) {
      dispatch({ type: 'setParameters', value: parameters });
    }
  }, [parameters, state.overrideAll]);

  return (
    <VStack alignItems={'flex-start'} minW={180}>
      <DollarAmountInput
        label={'Initial Savings Balance'}
        onChange={handleInitialSavingsAmountChange}
        value={state.initialSavingsAmount}
        step={10000}
        isDisabled={!!shortfallAdjustmentType}
        highlight={currentAdjustmentType === 'initialSavingsAmount'}
        useOverride={state.overrides.initialSavingsAmount}
        handleKeepReset={handleKeepReset}
      />
      <DateInput
        label={'Contribution Start'}
        value={state.contributionStart}
        onChange={handleContributionStartChange}
        isDisabled={!!shortfallAdjustmentType}
        handleKeepReset={handleKeepReset}
      />
      <DollarAmountInput
        label={'Monthly Contribution'}
        value={state.monthlyContributionAmount}
        onChange={handleMonthlyContributionAmountChange}
        step={100}
        isDisabled={!!shortfallAdjustmentType}
        highlight={currentAdjustmentType === 'monthlyContributionAmount'}
        useOverride={state.overrides.monthlyContributionAmount}
        tooltip={
          'The amount you plan to contribute each month until retirement. In order to offset the effects of inflation' +
          'prior to retirement, check the "Increase with inflation" box below '
        }
        handleKeepReset={handleKeepReset}
      />
      <CheckboxInput
        isChecked={state.increaseContributionWithInflation}
        onChange={handleIncreaseContributionWithInflationCheck}
        useOverride={state.overrides.increaseContributionWithInflation}
        isDisabled={!!shortfallAdjustmentType}
        label={'Increase with inflation'}
      />

      <DateInput
        label={'Withdrawal Start'}
        value={state.withdrawalStart}
        onChange={handleWithdrawalStartChange}
        tooltip={
          'This is the date you stop making contributions and start making withdrawals. Hint: click on the year and use up & down arrow keys to change the year to see what a difference a year can make in your savings.'
        }
        isDisabled={!!shortfallAdjustmentType}
        highlight={currentAdjustmentType === 'withdrawalStart'}
        useOverride={state.overrides.withdrawalStart}
        handleKeepReset={handleKeepReset}
      />
      <DollarAmountInput
        label={'Monthly Withdrawal'}
        value={state.withdrawalMonthlyAmount}
        onChange={handleWithdrawalMonthlyAmountChange}
        tooltip={
          'The amount you plan to withdraw each month during retirement. You can adjust this for expected inflation ' +
          "using the checkbox below so this amount represents the purchasing power you expect to have in today's dollars."
        }
        step={500}
        isDisabled={!!shortfallAdjustmentType}
        highlight={currentAdjustmentType === 'withdrawalMonthlyAmount'}
        useOverride={state.overrides.withdrawalMonthlyAmount}
        handleKeepReset={handleKeepReset}
      />
      <CheckboxInput
        isChecked={state.increaseWithdrawalWithInflation}
        onChange={handleIncreaseWithdrawalWithInflationCheck}
        isDisabled={!!shortfallAdjustmentType}
        useOverride={state.overrides.increaseWithdrawalWithInflation}
        label={'Increase with inflation'}
      />
      <DateInput
        label={'Withdrawal End Date'}
        value={state.withdrawalEnd}
        onChange={handleWithdrawalEndChange}
        isDisabled={!!shortfallAdjustmentType}
        useOverride={state.overrides.withdrawalEnd}
        handleKeepReset={handleKeepReset}
      />

      <PercentageAmountInput
        label={'Expected Inflation Rate'}
        value={state.projectedInflationRate}
        onChange={handleProjectedInflationRateChange}
        tooltip={
          'The average annual rate of inflation you expect going forward. Note: the average rate of inflation in the US since 1913 is 3.22% and since 1990 is 2.61%.'
        }
        isDisabled={!!shortfallAdjustmentType}
        useOverride={state.overrides.projectedInflationRate}
        handleKeepReset={handleKeepReset}
      />
      <PercentageAmountInput
        label={'Expected Rate of Return'}
        value={state.expectedRateOfReturn}
        onChange={handleExpectedRateOfReturnChange}
        tooltip={
          'The average annual rate of return you expect to earn on your investments and in interest. Be sure to account ' +
          'for offsetting factors such as capital gains tax.'
        }
        isDisabled={!!shortfallAdjustmentType}
        highlight={currentAdjustmentType === 'expectedRateOfReturn'}
        useOverride={state.overrides.expectedRateOfReturn}
        handleKeepReset={handleKeepReset}
      />
      {onDrawerClose && (
        <Button onClick={onDrawerClose} aria-label={'Apply'} alignSelf={'center'}>
          Apply
        </Button>
      )}
      <Button mt={5} variant={'link'} onClick={_resetToDefaults} alignSelf={'center'}>
        Reset to defaults
      </Button>
    </VStack>
  );
};

export default Parameters;
