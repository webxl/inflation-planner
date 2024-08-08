import { SavingsBalanceData } from '../charts/Savings.tsx';
import {
  BreakdownData,
  breakdownType,
  SavingsFormData,
  ShortfallAdjustmentType
} from '../savings.ts';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils.ts';
import {
  Button,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Box,
  useBreakpointValue
} from '@chakra-ui/react';
import BreakdownChart from '../charts/Breakdown.tsx';
import { ChevronDownIcon, Icon } from '@chakra-ui/icons';
import { useCallback, useEffect, useState } from 'react';
import { XCircle } from 'react-feather';

export const Summary = ({
  savingsBalanceData,
  breakdownData,
  parameters,
  handleShortfallAdjustment
}: {
  savingsBalanceData: SavingsBalanceData[];
  breakdownData: BreakdownData[];
  parameters?: SavingsFormData;
  handleShortfallAdjustment: (type: ShortfallAdjustmentType | undefined) => void;
}) => {
  const [shortfallAdjustmentType, setShortfallAdjustmentType] = useState<
    ShortfallAdjustmentType | undefined
  >();
  const [isResetting, setIsResetting] = useState(false);
  const withdrawalStartMonth = dayjs(parameters?.withdrawalStart).format('YYYY-MM');
  const balanceAtWithdrawalStart = formatCurrency(
    savingsBalanceData.find(b => dayjs(b.x).format('YYYY-MM') === withdrawalStartMonth)?.y || 0
  );

  const [exhaustedDate, setExhaustedDate] = useState<string | undefined>();
  const [exd, setExd] = useState<Date | undefined>();
  const [exdRestore, setExdRestore] = useState<Date | undefined>();

  useEffect(() => {
    const bal =
      savingsBalanceData.find(b => dayjs(b.x).format('YYYY-MM') === withdrawalStartMonth)?.y || 0;
    if (!parameters?.adjusted && bal > 0) {
      const _exd = savingsBalanceData.slice(1).find(b => b.y <= 0)?.x;
      setExdRestore(exd);
      setExd(_exd);
    }
  }, [exd, parameters?.adjusted, savingsBalanceData, withdrawalStartMonth]);

  useEffect(() => {
    setExhaustedDate(exd ? dayjs(exd).format('L') : undefined);
  }, [exd]);

  useEffect(() => {
    if (isResetting) {
      if (exdRestore) {
        setExd(exdRestore);
      }
      setIsResetting(false);
    }
  }, [exd, exdRestore, isResetting]);

  useEffect(() => {
    if (!parameters?.adjusted) {
      setShortfallAdjustmentType(undefined);
    }
  }, [parameters?.adjusted]);

  const totalContributions = formatCurrency(
    breakdownData.find(b => b.id === breakdownType.contributions)?.value as number
  );

  const totalInflation = formatCurrency(
    breakdownData.find(b => b.id === breakdownType.inflation)?.value as number
  );

  const setShortfallAdjustment = useCallback(
    (type: ShortfallAdjustmentType | undefined) => {
      setShortfallAdjustmentType(type);
      handleShortfallAdjustment(type);
    },
    [handleShortfallAdjustment]
  );

  const menuItems = {
    monthlyContributionAmount: 'Save More',
    withdrawalMonthlyAmount: 'Spend Less',
    expectedRateOfReturn: 'Increase Investment Return',
    withdrawalStart: 'Delay Retirement',
    initialSavingsAmount: 'Increase Initial Savings'
  };

  const breakpoint = useBreakpointValue({
    base: 'base',
    md: 'md'
  });

  const WithdrawalStart = (
    <>
      <Th>Withdrawal Start</Th>
      <Td>{balanceAtWithdrawalStart}</Td>
    </>
  );
  const Contributions = (
    <>
      <Th>Contributions</Th>
      <Td>{totalContributions}</Td>
    </>
  );
  const WithdrawalEnd = (
    <>
      <Th>Withdrawal End</Th>
      <Td>{formatCurrency(savingsBalanceData[savingsBalanceData.length - 1]?.y)}</Td>
    </>
  );
  const TotalInflation = (
    <>
      <Th>Inflation</Th>
      <Td>
        {totalInflation !== '$0' ? '-' : ''}
        {totalInflation}
      </Td>
    </>
  );
  const BalanceExhausted = (
    <>
      <Th color={shortfallAdjustmentType ? '#888' : 'inherit'}>Balance exhausted</Th>
      <Td color={shortfallAdjustmentType ? '#888' : '#b0413e'}>{exhaustedDate}</Td>
    </>
  );
  const Correction = (
    <>
      <Th>Correction</Th>
      <Td py={0}>
        {' '}
        {shortfallAdjustmentType ? (
          <>
            <HStack whiteSpace={'nowrap'}>
              <Text>{menuItems[shortfallAdjustmentType]}</Text>
              <IconButton
                icon={<Icon as={XCircle} />}
                onClick={() => {
                  setIsResetting(true);
                  setShortfallAdjustment(undefined);
                }}
                aria-label="Clear correction"
                variant="ghost"
                height={0}
              />
            </HStack>
          </>
        ) : (
          <Menu>
            <MenuButton as={Button} size={'sm'} rightIcon={<ChevronDownIcon />}>
              {'Select Adjustment'}
            </MenuButton>
            <MenuList>
              {Object.entries(menuItems).map(([type, label]) => (
                <MenuItem
                  key={type}
                  onClick={() => setShortfallAdjustment(type as ShortfallAdjustmentType)}
                >
                  {label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
      </Td>
    </>
  );
  return (
    <Box width={'100%'}>
      <Table width={'100%'}>
        <Thead>
          <Tr>
            <Th colSpan={2} width={{ md: '50%' }}>
              Projections
            </Th>
            {breakpoint === 'md' && <Th colSpan={2} minW={{ xl: 460 }}></Th>}
          </Tr>
        </Thead>
        <Tbody>
          {breakpoint === 'base' ? (
            <>
              <Tr>{WithdrawalStart}</Tr>
              <Tr>{WithdrawalEnd}</Tr>
              <Tr>{Contributions}</Tr>
              <Tr>{TotalInflation}</Tr>
              {(exd || exhaustedDate || shortfallAdjustmentType) && (
                <>
                  <Tr>{BalanceExhausted}</Tr>
                  <Tr>{Correction}</Tr>
                </>
              )}
            </>
          ) : (
            <>
              <Tr>
                {WithdrawalStart}
                {Contributions}
              </Tr>
              <Tr>
                {WithdrawalEnd}
                {TotalInflation}
              </Tr>

              {(exd || exhaustedDate || shortfallAdjustmentType) && (
                <Tr>
                  {BalanceExhausted}
                  {Correction}
                </Tr>
              )}
            </>
          )}
        </Tbody>
      </Table>
      <BreakdownChart breakdownData={breakdownData} />
    </Box>
  );
};
