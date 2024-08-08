import { SavingsBalanceData } from './charts/Savings.tsx';
import {
  BreakdownData,
  breakdownType,
  SavingsFormData,
  ShortfallAdjustmentType
} from './savings.ts';
import dayjs from 'dayjs';
import { formatCurrency } from './utils.ts';
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
  Box
} from '@chakra-ui/react';
import BreakdownChart from './charts/Breakdown.tsx';
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

  return (
    <Box /*overflowY="auto" height="80vh" overflowX="scroll"*/ width={'100%'}>
      <Table width={'100%'}>
        <Thead>
          <Tr>
            <Th colSpan={2} width={'50%'}>
              Projections
            </Th>
            <Th colSpan={2} minW={{ xl: 460 }}></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Th>Withdrawal Start</Th>
            <Td>{balanceAtWithdrawalStart}</Td>
            <Th>Contributions</Th>
            <Td>{totalContributions}</Td>
          </Tr>
          <Tr>
            <Th>Withdrawal End</Th>
            <Td>{formatCurrency(savingsBalanceData[savingsBalanceData.length - 1]?.y)}</Td>
            <Th>Inflation</Th>
            <Td>
              {totalInflation !== '$0' ? '-' : ''}
              {totalInflation}
            </Td>
          </Tr>
          {(exd || exhaustedDate || shortfallAdjustmentType) && (
            <Tr>
              <Th color={shortfallAdjustmentType ? '#888' : 'inherit'}>Balance exhausted</Th>
              <Td color={shortfallAdjustmentType ? '#888' : '#b0413e'}>{exhaustedDate}</Td>
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
            </Tr>
          )}
        </Tbody>
      </Table>
      <BreakdownChart breakdownData={breakdownData} />
      {/* </Flex>*/}
    </Box>
  );
};
