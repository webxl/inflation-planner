import SavingsChart, { SavingsBalanceData } from './charts/Savings.tsx';
import Parameters from './sections/parameters';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/icons';
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
import { Summary } from './sections/Summary.tsx';
import { formatCurrencyWithCents, formatPercentage } from './utils.ts';
import { WelcomeModal } from './WelcomeModal.tsx';
import { InflationData } from './InflationData.tsx';
import { AlertTriangle, GitHub, Sliders } from 'react-feather';
import { Header } from './sections/Header.tsx';

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
    const breakpointValue = useBreakpointValue({
      base: 'base',
      md: 'md'
    });

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

    const { colorMode } = useColorMode();
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
    const withdrawalStartAmount =
      savingsBalanceData.find(b => dayjs(b.x).format('YYYY-MM-DD') === parameters.withdrawalStart)
        ?.y || 0;
    if (!parameters?.adjusted) {
      if (withdrawalStartAmount <= 0) {
        setAlertTitle('Error!');
        setAlertDescription(
          'You need at least a starting balance or a monthly contribution amount.'
        );
        setAlertStatus('error');
      } else if (endingBalance < 0) {
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
  }, [
    parameters?.adjusted,
    parameters.withdrawalStart,
    savingsBalanceData,
    shortfallAdjustmentType,
    shortfallAdjustmentValue
  ]);

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

  const [alertOpen, setAlertOpen] = useState(true);

  const handleKeepReset = useCallback(
    (isKeep: boolean) => {
      if (isKeep) {
        handleKeepAdjustment();
      } else {
        handleAdjustmentReset();
      }
    },
    [handleKeepAdjustment, handleAdjustmentReset]
  );

    const {
      isOpen: isDrawerOpen,
      onOpen: setDrawerOpen,
      onClose: setDrawerClosed
    } = useDisclosure({ defaultIsOpen: breakpointValue === 'base' });

    const parametersSection = (
      <Parameters
        onChange={handleParameterUpdate}
        shortfallAdjustmentType={shortfallAdjustmentType}
        shortfallAdjustmentValue={shortfallAdjustmentValue}
        preserveAdjustment={preserveAdjustment}
        handleKeepReset={handleKeepReset}
        parameters={initialParameters}
        onDrawerClose={breakpointValue === 'base' ? setDrawerClosed : undefined}
      />
    );
    return (
      <>
        <InflationData open={showInflationData} onClose={() => setShowInflationData(false)} />
        <Header
          onClickStats={() => setShowInflationData(true)}
          onClickHelp={() => setShowWelcomeModal(true)}
        />
        {breakpointValue === 'base' && (
          <HStack justifyContent={'space-between'} w={'100%'} mt={'55px'}>
            <Button onClick={setDrawerOpen} variant={'ghost'} alignSelf={'center'}>
              <Icon as={Sliders} mr={1} /> Parameters
            </Button>
            <Drawer isOpen={isDrawerOpen} onClose={setDrawerClosed} placement="left">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Adjustments</DrawerHeader>
                <DrawerBody>{parametersSection}</DrawerBody>
              </DrawerContent>
            </Drawer>
          </HStack>
        )}
        <WelcomeModal
          open={showWelcomeModal}
          onClose={handleClose}
          value={initialAge}
          onChange={setInitialAge}
        />
        <HStack
          alignItems={'stretch'}
          justifyItems={'stretch'}
          p={0}
          gap={0}
          mt={breakpointValue !== 'base' ? '50px' : 0}
          height={'100%'}
        >
          {breakpointValue !== 'base' && (
            <Box
              backgroundColor={colorMode === 'light' ? 'gray.50' : 'gray.700'}
              borderRight={`1px solid ${colorMode === 'light' ? '#eee' : '#555'}`}
              w={'300px'}
              minHeight={'calc(100vh - 50px)'}
              px={5}
              pt={2}
            >
              {parametersSection}
            </Box>
          )}
          <VStack
            alignItems={'stretch'}
            flexGrow={1}
            minW={0}
            p={0}
            position={'relative'}
            w={'100%'}
            overflowY={'auto'}
          >
            {alertOpen ? (
              <Box>
                <Alert status={alertStatus} variant="subtle" w={'auto'}>
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
                  <CloseButton alignSelf="flex-end" onClick={() => setAlertOpen(false)} />
                </Alert>
              </Box>
            ) : (
              <Alert
                status={alertStatus}
                variant="transparent"
                w={'auto'}
                position={'absolute'}
                zIndex={1}
                top={'10px'}
                mr={-1}
                alignSelf="flex-end"
              >
                <AlertIcon onClick={() => setAlertOpen(true)} />
              </Alert>
            )}
            <Box mt={0} px={2}>
              <SavingsChart savingsBalanceData={savingsBalanceData} parameters={parameters} />
              <Summary
                savingsBalanceData={savingsBalanceData}
                breakdownData={breakdownData}
                parameters={parameters}
                handleShortfallAdjustment={handleShortfallAdjustment}
              />
              <VStack mt={24} w={'100%'} alignContent={'center'} gap={10}>
                <Text fontSize={'xs'} maxW={760} textAlign={'center'} color={'gray.500'}>
                  This tool is for illustrative purposes only. It is not intended to provide
                  investment advice or financial planning services. The results are based on the
                  information you provide and are not guaranteed. Actual results will definitely
                  vary. Please consult a qualified professional for personalized advice, or just buy
                  some{' '}
                  <Link isExternal href={'https://www.swanbitcoin.com/motherway'}>
                    ₿itcoin
                  </Link>
                  .
                </Text>
                <HStack maxW={760} justifyContent={'center'} alignItems={'flex-start'}>
                  <Link fontSize={'xs'} color={'gray.500'} isExternal href={'https://webxl.net'}>
                    webXL
                  </Link>
                  <Link
                    color={'gray.500'}
                    isExternal
                    href={'https://github.com/webxl/inflation-planner'}
                  >
                    {' '}
                    <Icon as={GitHub} />{' '}
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </HStack>
      </>
    );
}

export default App;
