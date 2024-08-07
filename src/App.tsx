import SavingsChart, { SavingsBalanceData } from './charts/Savings.tsx';
import Parameters from './parameters';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  AlertTitle,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Text,
  VStack,
  Portal
} from '@chakra-ui/react';
import { MoonIcon, QuestionIcon, SunIcon } from '@chakra-ui/icons';
import calculateSavingsBalance, {
  BreakdownData,
  calculateShortfallAdjustment,
  SavingsFormData,
  ShortfallAdjustmentType
} from './savings.ts';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { useColorMode } from '@chakra-ui/system';
import { Summary } from './Summary.tsx';
import { formatCurrencyWithCents, formatPercentage } from './utils.ts';
import { WelcomeModal } from './WelcomeModal.tsx';
import { InflationData } from './InflationData.tsx';
import { appName } from './const.ts';
import { AlertTriangle } from 'react-feather';

dayjs.extend(LocalizedFormat);

const initialState = {
  initialSavingsAmount: 200000,
  contributionStart: dayjs().format('YYYY-MM-DD'),
  withdrawalStart: dayjs().add(30, 'year').format('YYYY-MM-DD'),
  withdrawalEnd: dayjs().add(55, 'year').format('YYYY-MM-DD'),
  monthlyContributionAmount: 1000,
  withdrawalMonthlyAmount: 6000,
  projectedInflationRate: 0.03,
  expectedRateOfReturn: 0.07,
  increaseContributionWithInflation: false,
  increaseWithdrawalWithInflation: false
};

function App() {
  const [initialParameters, setInitialParameters] = useState<SavingsFormData>({ ...initialState });

  const [savingsBalanceData, setSavingsBalanceData] = useState<SavingsBalanceData[]>([]);
  const [breakdownData, setBreakdownData] = useState<BreakdownData[]>([]);
  const [parameters, setParameters] = useState<SavingsFormData>({ ...initialState });
  const [shortfallAdjustmentType, setShortfallAdjustmentType] = useState<
    ShortfallAdjustmentType | undefined
  >();
  const [shortfallAdjustmentValue, setShortfallAdjustmentValue] = useState<string | number>('');

  const handleParameterUpdate = useCallback((formData: SavingsFormData) => {
    setParameters({ ...formData });
    setInitialParameters({ ...formData });
    const { savingsBalanceData, breakdownData } = calculateSavingsBalance(formData);
    setSavingsBalanceData(savingsBalanceData);
    setBreakdownData(breakdownData);
  }, []);

  useEffect(() => {
    handleParameterUpdate(initialState);
  }, [handleParameterUpdate]);

  const handleShortfallAdjustment = useCallback(
    (type: ShortfallAdjustmentType | undefined) => {
      if (!type) {
        setShortfallAdjustmentType(undefined);
        handleParameterUpdate({ ...initialParameters, adjusted: false });
        return;
      }

      const adjustment = calculateShortfallAdjustment(type, parameters);
      setPreserveAdjustment(false);
      setShortfallAdjustmentType(type);
      setShortfallAdjustmentValue(adjustment[type] ?? '');

      const adjustedParameters = { ...parameters, ...adjustment, adjusted: !!type };
      setParameters(adjustedParameters);

      const { savingsBalanceData, breakdownData } = calculateSavingsBalance(adjustedParameters);
      setSavingsBalanceData(savingsBalanceData);
      setBreakdownData(breakdownData);
    },
    [parameters, handleParameterUpdate, initialParameters]
  );

  const { colorMode, toggleColorMode } = useColorMode();
  const [alertTitle, setAlertTitle] = useState('Congratulations!');
  const [alertDescription, setAlertDescription] = useState<ReactNode>(
    'You have saved enough to retire!'
  );
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('info');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showInflationData, setShowInflationData] = useState(false);
  const [initialAge, setInitialAge] = useState(37);

  useEffect(() => {
    if (!savingsBalanceData.length) return;

    const lastPoint = savingsBalanceData[savingsBalanceData.length - 1];
    const endingBalance = lastPoint.y;

    if (!parameters?.adjusted) {
      if (endingBalance < 0) {
        setAlertTitle('Insufficient Funds!');
        setAlertDescription(
          'You will run out of savings before the end of the withdrawal period. Choose a correction below.'
        );
        setAlertStatus('warning');
      } else {
        setAlertTitle('Congratulations!');
        setAlertDescription(
          <>
            You will have saved {endingBalance < 10000 ? <strong>just barely</strong> : ''} enough
            to retire!
          </>
        );
        setAlertStatus('success');
      }
    } else {
      let description: ReactNode = '';

      if (shortfallAdjustmentType) {
        setAlertTitle('Adjustment applied');
        setAlertStatus('info');
        switch (shortfallAdjustmentType) {
          case 'monthlyContributionAmount':
            description = `Your monthly contribution amount has been adjusted to ${formatCurrencyWithCents((shortfallAdjustmentValue as number) ?? 0)}`;
            break;
          case 'withdrawalMonthlyAmount':
            description = `Your monthly withdrawal amount has been adjusted to ${formatCurrencyWithCents((shortfallAdjustmentValue as number) ?? 0)}`;
            break;
          case 'withdrawalStart':
            description = `Your withdrawal start date has been adjusted to ${dayjs(shortfallAdjustmentValue).format('L')}.`;
            break;
          case 'expectedRateOfReturn':
            description = `Your expected rate of return has been adjusted to ${formatPercentage((shortfallAdjustmentValue as number) ?? 0)}`;
            break;
          case 'initialSavingsAmount':
            description = `Your initial savings amount has been adjusted to ${formatCurrencyWithCents((shortfallAdjustmentValue as number) ?? 0)}`;
            break;
        }
        setAlertDescription(
          <HStack>
            <Text>{description} </Text>
            {endingBalance < 0 && (
              <Popover trigger="hover" size={'xl'}>
                <PopoverTrigger>
                  <IconButton
                    icon={<AlertTriangle stroke={'orange'} strokeWidth={1.5} />}
                    variant={'none'}
                    aria-label={'warning'}
                  />
                </PopoverTrigger>
                <Portal>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody>
                      <strong>Note: This adjustment did not prevent a shortfall. </strong>
                      Adjust other parameters until the shortfall is resolved.
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            )}
          </HStack>
        );
      }
    }
  }, [parameters?.adjusted, savingsBalanceData, shortfallAdjustmentType, shortfallAdjustmentValue]);

  const handleAdjustmentReset = useCallback(() => {
    handleShortfallAdjustment(undefined);
  }, [handleShortfallAdjustment]);
  const [preserveAdjustment, setPreserveAdjustment] = useState(false);

  const handleKeepAdjustment = useCallback(() => {
    setPreserveAdjustment(true);

    handleParameterUpdate({
      ...parameters,
      ...{ [shortfallAdjustmentType as string]: shortfallAdjustmentValue },
      adjusted: false
    });

    setShortfallAdjustmentType(undefined);
  }, [handleParameterUpdate, parameters, shortfallAdjustmentType, shortfallAdjustmentValue]);

  useEffect(() => {
    setPreserveAdjustment(false);
  }, [preserveAdjustment]);

  useEffect(() => {
    if (!showWelcomeModal) return;
    const adjustedWithdrawalStartDate = dayjs(initialParameters.contributionStart)
      .startOf('day')
      .toDate();
    const year = adjustedWithdrawalStartDate.getFullYear() + 67 - initialAge;

    adjustedWithdrawalStartDate.setFullYear(year);
    const adjustedWithdrawalStart = dayjs(adjustedWithdrawalStartDate).format('YYYY-MM-DD');

    if (adjustedWithdrawalStart !== initialParameters.withdrawalStart) {
      handleParameterUpdate({
        ...initialParameters,
        ...parameters,
        withdrawalStart: adjustedWithdrawalStart,
        withdrawalEnd: dayjs(adjustedWithdrawalStartDate).add(25, 'year').format('YYYY-MM-DD')
      });
    }
  }, [
    parameters,
    initialAge,
    initialParameters,
    handleParameterUpdate,
    showInflationData,
    showWelcomeModal
  ]);

  const handleClose = useCallback(() => {
    setShowWelcomeModal(false);
  }, []);

  return (
    <>
      <WelcomeModal
        open={showWelcomeModal}
        onClose={handleClose}
        value={initialAge}
        onChange={setInitialAge}
      />
      <InflationData open={showInflationData} onClose={() => setShowInflationData(false)} />
      <HStack
        w={'100%'}
        borderBottom={`1px solid`}
        borderBottomColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        justifyContent={'space-between'}
        height={'50px'}
        px={5}
      >
        <Heading size={'lg'} as={'h1'} fontWeight={400}>
          {appName}
        </Heading>
        <HStack>
          <Button variant={'ghost'} onClick={() => setShowInflationData(true)}>
            Inflation Stats
          </Button>
          <IconButton
            aria-label={'help'}
            icon={<QuestionIcon />}
            variant={'ghost'}
            onClick={() => setShowWelcomeModal(true)}
          />
          <IconButton
            aria-label="Toggle Dark Mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant={'ghost'}
          />
        </HStack>
      </HStack>
      <HStack alignItems={'stretch'} justifyItems={'stretch'} p={0} gap={5} height={'100%'}>
        <Box
          backgroundColor={colorMode === 'light' ? 'gray.50' : 'gray.700'}
          borderRight={`1px solid ${colorMode === 'light' ? '#eee' : '#555'}`}
          w={'300px'}
          minHeight={'calc(100vh - 50px)'}
          px={5}
          pt={2}
        >
          <Parameters
            onChange={handleParameterUpdate}
            shortfallAdjustmentType={shortfallAdjustmentType}
            shortfallAdjustmentValue={shortfallAdjustmentValue}
            preserveAdjustment={preserveAdjustment}
            parameters={initialParameters}
          />
        </Box>
        <VStack alignItems={'stretch'} flexGrow={1}>
          <Alert status={alertStatus} variant="subtle" ml={'-5'} mr={'-5'} w={'auto'}>
            <AlertIcon />
            <AlertTitle whiteSpace={'nowrap'}>{alertTitle}</AlertTitle>
            <AlertDescription w={'100%'} px={2}>
              <HStack justifyContent={'space-between'}>
                <Text maxW={'700px'}>{alertDescription}</Text>
                {shortfallAdjustmentType && (
                  <Box pr={5}>
                    <Button
                      size={'xs'}
                      variant={'link'}
                      color={colorMode === 'light' ? '#333' : 'inherit'}
                      onClick={handleKeepAdjustment}
                      mr={5}
                    >
                      Keep
                    </Button>
                    <Button
                      size={'xs'}
                      variant={'link'}
                      color={'#b0413e'}
                      onClick={handleAdjustmentReset}
                    >
                      Reset
                    </Button>
                  </Box>
                )}
              </HStack>
            </AlertDescription>
          </Alert>
          <SavingsChart savingsBalanceData={savingsBalanceData} parameters={parameters} />
          <Summary
            savingsBalanceData={savingsBalanceData}
            breakdownData={breakdownData}
            parameters={parameters}
            handleShortfallAdjustment={handleShortfallAdjustment}
          />
        </VStack>
      </HStack>
    </>
  );
}

export default App;
